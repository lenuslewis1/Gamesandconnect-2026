import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Clock, Loader2, Smartphone, XCircle } from "lucide-react";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { chosenPayment } from "@/lib/chosenPayment.mjs";

interface TicketTier {
    id: number;
    name: string;
    description: string | null;
    price: number;
}

const formSchema = z.object({
    full_name: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().refine(value => {
        const digits = value.replace(/\D/g, "");
        return /^\+?[\d\s().-]+$/.test(value) && digits.length >= 10;
    }, "Enter a valid phone number."),
    ticket_count: z.coerce.number().int().min(1, "Choose at least one ticket.").max(10, "Choose up to 10 tickets."),
});

type FormValues = z.infer<typeof formSchema>;
type Step = "details" | "processing" | "waiting" | "unconfirmed" | "success" | "failed";
type PaymentType = "full" | "part" | "later";

const paymentAttemptSchema = z.object({
    id: z.number().int().positive(),
    amount: z.number().positive(),
    total: z.number().positive(),
    reference: z.string().nullable(),
});
type PaymentAttempt = z.infer<typeof paymentAttemptSchema>;

const paymentStorageKey = (eventId: number) => "event-payment:" + eventId;

function loadPaymentAttempt(eventId: number): PaymentAttempt | null {
    try {
        const result = paymentAttemptSchema.safeParse(JSON.parse(sessionStorage.getItem(paymentStorageKey(eventId)) || "null"));
        return result.success ? result.data : null;
    } catch {
        return null;
    }
}

const NETWORKS = [
    { id: "300591", name: "MTN Mobile Money" },
    { id: "300592", name: "AirtelTigo Money" },
    { id: "300594", name: "Telecel Cash" },
];

const POLL_INTERVAL = 5000;
const MAX_POLL_TIME = 120000;
const selectClass = "block h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const moneyFormatter = new Intl.NumberFormat("en-GH", { maximumFractionDigits: 2 });
const money = (amount: number) => "GHS " + moneyFormatter.format(amount);

const formatPhoneNumberForDb = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (phone.trim().startsWith("+") || /^233\d{9}$/.test(digits)) return "+" + digits;
    return "+233" + digits.replace(/^0/, "");
};

const getPaymentResult = (payload: any) => {
    const status = [payload?.status, payload?.payment_status, payload?.paymentStatus, payload?.data?.status]
        .find(value => typeof value === "string" && value.trim())?.toLowerCase().trim();
    return {
        isConfirmed: payload?.is_confirmed === true || payload?.is_confirmed === "true"
            || ["success", "successful", "confirmed", "paid", "completed"].includes(status),
        isFailed: payload?.is_failed === true || payload?.is_failed === "true"
            || ["failed", "declined", "cancelled", "canceled", "rejected", "error"].includes(status),
    };
};

const paymentRequest = (name: "pay" | "verify-payment", body: object, signal?: AbortSignal) =>
    fetch(import.meta.env.VITE_SUPABASE_URL + "/functions/v1/" + name, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(body),
        signal,
    });

interface BookingFormProps {
    event: {
        id: number;
        title: string;
        price: string | null;
        date: string;
        time_range: string;
        location: string;
    };
}

const BookingForm = ({ event }: BookingFormProps) => {
    const { toast } = useToast();
    const [attempt, setAttempt] = useState(() => loadPaymentAttempt(event.id));
    const [step, setStep] = useState<Step>(() => attempt ? "unconfirmed" : "details");
    const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0].id);
    const [registrationId, setRegistrationId] = useState<number | null>(attempt?.id ?? null);
    const [paymentMessage, setPaymentMessage] = useState("");
    const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
    const [paymentType, setPaymentType] = useState<PaymentType>("full");
    const [partPaymentAmount, setPartPaymentAmount] = useState("");
    const submitting = useRef(false);
    const mounted = useRef(false);
    const hasEventRegistration = useRef(false);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { full_name: "", email: "", phone: "", ticket_count: 1 },
    });

    const pricing = useQuery({
        queryKey: ["event-ticket-tiers", event.id],
        enabled: step === "details",
        retry: false,
        queryFn: async ({ signal }) => {
            const { data, error } = await supabase.from("ticket_tiers").select("id,name,description,price")
                .eq("event_id", event.id).order("sort_order").abortSignal(signal);
            if (error) throw error;
            return (data || []) as TicketTier[];
        },
    });

    const tiers = pricing.data || [];
    const selectedTier = tiers.find(tier => tier.id === selectedTierId) || tiers[0];
    const ticketCount = Number(form.watch("ticket_count"));
    const quantity = Number.isInteger(ticketCount) && ticketCount >= 1 && ticketCount <= 10 ? ticketCount : 0;
    const unitPrice = selectedTier ? Number(selectedTier.price) : parseFloat(event.price?.replace(/[^0-9.]/g, "") || "0") || 0;
    const free = unitPrice === 0;
    const total = Math.round(unitPrice * quantity * 100) / 100;
    const customPayment = chosenPayment(partPaymentAmount, total);
    const payingAmount = paymentType === "full" ? total : paymentType === "part" ? customPayment?.amount ?? 0 : 0;
    const balance = paymentType === "part" ? customPayment?.balance : total;
    const isPartialPayment = !free && paymentType === "part" && payingAmount < total;
    const needsPayment = !free && paymentType !== "later";
    const submitLabel = free ? "Confirm free booking"
        : paymentType === "later" ? "Book and pay later"
        : payingAmount > 0 ? "Pay " + money(payingAmount) : "Pay with Mobile Money";
    const paidBalance = attempt ? Math.round((attempt.total - attempt.amount) * 100) / 100 : 0;

    const storeAttempt = useCallback((payment: PaymentAttempt | null) => {
        setAttempt(payment);
        try {
            if (payment) sessionStorage.setItem(paymentStorageKey(event.id), JSON.stringify(payment));
            else sessionStorage.removeItem(paymentStorageKey(event.id));
        } catch {
            // The current page can still check the payment if browser storage is unavailable.
        }
    }, [event.id]);

    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    useEffect(() => {
        if (step !== "details") headingRef.current?.focus();
    }, [step]);

    useEffect(() => {
        if (step !== "waiting" || !attempt) return;
        const controller = new AbortController();
        let nextCheck: ReturnType<typeof setTimeout>;
        const expiry = setTimeout(() => {
            controller.abort();
            setStep("unconfirmed");
        }, MAX_POLL_TIME);

        const check = async () => {
            try {
                const response = await paymentRequest("verify-payment", {
                    registration_id: attempt.id,
                    transaction_reference: attempt.reference,
                }, controller.signal);
                if (response.ok) {
                    const data = await response.json();
                    if (controller.signal.aborted) return;
                    const result = getPaymentResult(data);
                    if (result.isConfirmed) {
                        setStep("success");
                        return;
                    }
                    if (result.isFailed) {
                        storeAttempt(null);
                        setPaymentMessage(data.message || "The Mobile Money payment was declined.");
                        setStep("failed");
                        return;
                    }
                }
            } catch (error) {
                if (!controller.signal.aborted) console.error("Could not verify payment:", error);
            }

            if (!controller.signal.aborted) nextCheck = setTimeout(check, POLL_INTERVAL);
        };
        void check();

        return () => {
            controller.abort();
            clearTimeout(expiry);
            clearTimeout(nextCheck);
        };
    }, [step, attempt, storeAttempt]);

    const attendee = (values: FormValues, status: "confirmed" | "pending") => ({
        event_id: event.id,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone,
        ticket_count: values.ticket_count,
        status,
    });

    const syncPendingAttendee = async (values: FormValues) => {
        if (hasEventRegistration.current) return;
        try {
            const { error } = await supabase.from("event_registrations").insert(attendee(values, "pending"));
            if (error) throw error;
            hasEventRegistration.current = true;
        } catch (error) {
            console.error("Event registration sync error:", error);
        }
    };

    const notify = async (values: FormValues, id: number, status: "confirmed" | "pending") => {
        try {
            const { data, error } = await supabase.functions.invoke("send-confirmation-email", {
                body: {
                    to: values.email,
                    phone: formatPhoneNumberForDb(values.phone),
                    customer_name: values.full_name,
                    event_title: event.title,
                    event_date: event.date,
                    event_time: event.time_range,
                    event_location: event.location,
                    ticket_count: values.ticket_count,
                    ticket_tier: selectedTier?.name || (free ? "Free" : "Standard"),
                    total_amount: total,
                    booking_reference: id,
                    transaction_id: "",
                    registration_status: status,
                },
            });
            if (!error && data?.sms?.success === true) return;
        } catch (error) {
            console.error("Booking notification failed:", error);
        }
        toast({ title: "Booking saved", description: "We couldn’t send a confirmation text. Keep your booking reference." });
    };

    const submitBooking = async (values: FormValues) => {
        if (submitting.current || !pricing.isSuccess || (needsPayment && payingAmount <= 0)) return;
        submitting.current = true;
        setPaymentMessage("");
        setStep("processing");

        try {
            if (free) {
                const { data, error } = await supabase.from("event_registrations").insert(attendee(values, "confirmed"))
                    .select("id").single();
                if (error) throw error;
                const id: number = data.id;
                setRegistrationId(id);
                await notify(values, id, "confirmed");
                setStep("success");
                return;
            }

            const phone = formatPhoneNumberForDb(values.phone);
            const booking = {
                event_id: event.id,
                ticket_tier_id: selectedTier?.id ?? null,
                full_name: values.full_name,
                email: values.email,
                phone_number: phone,
                number_of_participants: values.ticket_count,
                location: "Accra",
                payment_status: "pending",
                total_amount: total,
            };
            const query = registrationId === null
                ? supabase.from("registrations").insert({ ...booking, amount_paid: 0 })
                : supabase.from("registrations").update(booking).eq("id", registrationId);
            const { data, error } = await query.select("id").single();
            if (error) throw error;
            const id: number = data.id;
            setRegistrationId(id);

            if (paymentType === "later") {
                await syncPendingAttendee(values);
                await notify(values, id, "pending");
                setStep("success");
                return;
            }

            if (!mounted.current) return;
            // Keep enough to verify this payment after a refresh without storing contact details.
            const pendingAttempt: PaymentAttempt = { id, amount: payingAmount, total, reference: null };
            storeAttempt(pendingAttempt);
            const controller = new AbortController();
            const requestTimeout = setTimeout(() => controller.abort(), 25000);
            try {
                const response = await paymentRequest("pay", {
                    event_id: event.id,
                    registration_id: id,
                    account_number: phone.replace(/\D/g, ""),
                    account_name: values.full_name,
                    amount: payingAmount,
                    total_amount: total,
                    payment_amount: payingAmount,
                    network: selectedNetwork,
                    narration: event.title + " - " + (selectedTier?.name || "Standard") + " x" + values.ticket_count
                        + (isPartialPayment ? " (Part Payment)" : ""),
                }, controller.signal);
                const result = await response.json();
                if (response.status < 500 && response.status !== 408 && result.success === false) {
                    storeAttempt(null);
                    setPaymentMessage(result.error || result.message || "We couldn’t send the Mobile Money prompt.");
                    setStep("failed");
                    return;
                }
                if (!response.ok || result.success !== true) {
                    setStep("unconfirmed");
                    return;
                }
                const reference = result.transaction_reference || result.transactionReference
                    || result.transaction_id || result.transactionId
                    || result.collection_transaction_id || result.collectionTransactionId
                    || result.data?.transaction_reference || result.data?.transactionReference
                    || result.data?.transaction_id || result.data?.transactionId
                    || result.data?.collection_transaction_id || result.data?.collectionTransactionId || null;
                if (mounted.current) storeAttempt({ ...pendingAttempt, reference: reference === null ? null : String(reference) });
            } catch (error) {
                console.error("Could not confirm whether the payment request started:", error);
                setStep("unconfirmed");
                return;
            } finally {
                clearTimeout(requestTimeout);
            }

            await syncPendingAttendee(values);
            setStep("waiting");
        } catch (error) {
            console.error("Could not save booking:", error);
            setPaymentMessage("We couldn’t save your booking. Your details are still here. Please try again.");
            setStep("details");
        } finally {
            submitting.current = false;
        }
    };

    const successTitle = attempt ? (paidBalance > 0 ? "Part payment received" : "Payment confirmed")
        : free ? "You’re booked" : "Booking saved";
    const title = {
        details: "Book tickets",
        processing: needsPayment ? "Requesting Mobile Money payment" : "Saving your booking",
        waiting: "Approve the payment on your phone",
        unconfirmed: "Payment status is still unknown",
        failed: "Payment unsuccessful",
        success: successTitle,
    }[step];

    return (
        <section id="booking" tabIndex={-1} className="event-checkout__panel" aria-labelledby="booking-form-title">
                <h2 id="booking-form-title" ref={headingRef} tabIndex={-1}>{title}</h2>

                {step === "details" && (
                    pricing.isPending || pricing.isFetching && !pricing.data ? (
                        <p role="status" className="flex items-center gap-2 py-5 text-sm">
                            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> Loading tickets…
                        </p>
                    ) : pricing.isError ? (
                        <div className="space-y-3 py-2">
                            <p role="alert" className="text-sm">We couldn’t load ticket prices.</p>
                            <Button type="button" variant="outline" onClick={() => void pricing.refetch()}>Reload tickets</Button>
                        </div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(submitBooking)} className="space-y-4">
                                {paymentMessage && <p role="alert" className="rounded-md bg-muted p-3 text-sm text-destructive">{paymentMessage}</p>}
                                <div className="grid grid-cols-[minmax(0,1fr)_6rem] items-start gap-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="booking-tier">Ticket type</Label>
                                        {tiers.length > 1 ? (
                                            <select id="booking-tier" className={selectClass} value={selectedTier?.id}
                                                onChange={event => setSelectedTierId(Number(event.target.value))}>
                                                {tiers.map(tier => (
                                                    <option key={tier.id} value={tier.id}>
                                                        {tier.name} · {Number(tier.price) === 0 ? "Free" : money(Number(tier.price))}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div id="booking-tier" className="flex min-h-10 items-center rounded-md border border-input px-3 text-sm">
                                                {(selectedTier?.name || "Standard") + " · " + (free ? "Free" : money(unitPrice))}
                                            </div>
                                        )}
                                        {selectedTier?.description && <p className="text-xs text-muted-foreground">{selectedTier.description}</p>}
                                    </div>
                                    <FormField control={form.control} name="ticket_count" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tickets</FormLabel>
                                            <FormControl>
                                                <select className={selectClass} {...field}
                                                    onChange={event => field.onChange(Number(event.target.value))}>
                                                    {Array.from({ length: 10 }, (_, index) => <option key={index + 1}>{index + 1}</option>)}
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <FormField control={form.control} name="full_name" render={({ field }) => (
                                        <FormItem className="sm:col-span-2">
                                            <FormLabel>Full name</FormLabel>
                                            <FormControl><Input autoComplete="name" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email address</FormLabel>
                                            <FormControl><Input type="email" autoComplete="email" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone number</FormLabel>
                                            <FormControl><Input type="tel" autoComplete="tel" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                {!free && (
                                    <div className="space-y-3 border-t border-border pt-3">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="booking-payment">Payment option</Label>
                                                <select id="booking-payment" className={selectClass} value={paymentType}
                                                    onChange={event => setPaymentType(event.target.value as PaymentType)}>
                                                    <option value="full">Pay in full</option>
                                                    <option value="part">Pay part now</option>
                                                    <option value="later">Pay later</option>
                                                </select>
                                            </div>
                                            {needsPayment && (
                                                <div className="space-y-2">
                                                    <Label htmlFor="booking-network">Mobile Money network</Label>
                                                    <select id="booking-network" className={selectClass} value={selectedNetwork}
                                                        onChange={event => setSelectedNetwork(event.target.value)}>
                                                        {NETWORKS.map(network => <option key={network.id} value={network.id}>{network.name}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                        {paymentType === "part" && (
                                            <div className="space-y-2">
                                                <Label htmlFor="chosen-payment-amount">Amount to pay now (GHS)</Label>
                                                <Input id="chosen-payment-amount" type="number" min="0.01" max={total}
                                                    step="0.01" inputMode="decimal" value={partPaymentAmount} aria-describedby="amount-hint"
                                                    onChange={event => setPartPaymentAmount(event.target.value)} />
                                                <p id="amount-hint" className="text-xs text-muted-foreground">
                                                    Choose any amount from GHS 0.01 to {money(total)}. Pay the rest before the event.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div aria-live="polite" className="space-y-1 rounded-lg bg-secondary/70 px-3 py-2.5 text-sm">
                                    <div className="flex justify-between gap-3 font-semibold">
                                        <span>Booking total</span><span>{free ? "Free" : money(total)}</span>
                                    </div>
                                    {!free && balance !== undefined && paymentType !== "full" && (
                                        <div className="flex justify-between gap-3 text-muted-foreground">
                                            <span>{paymentType === "later" ? "Due later" : "Remaining balance"}</span>
                                            <span>{money(balance)}</span>
                                        </div>
                                    )}
                                </div>

                                <details className="text-xs leading-relaxed text-muted-foreground">
                                    <summary className="w-fit cursor-pointer font-medium">Booking terms, refunds and photography</summary>
                                    <p className="mt-2">
                                        Read our <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Terms &amp; Conditions (opens in a new tab)</a>.
                                        Customer cancellations received at least 24 hours before the published event start time (Ghana time) receive a 50% refund of the amount paid. Later cancellations and no-shows are not refundable, subject to applicable legal rights.
                                        Event photography may be used in our gallery and event promotions unless you opt out. Email us or tell the host if you do not want your image used. Separate permission will be requested where required.
                                    </p>
                                </details>
                                {needsPayment && <p className="text-xs text-muted-foreground">We’ll send the Mobile Money prompt to the phone number above.</p>}
                                <div className="event-checkout__submit">
                                    <Button type="submit" className="w-full rounded-full" size="lg"
                                        disabled={needsPayment && payingAmount <= 0}>{submitLabel}</Button>
                                </div>
                            </form>
                        </Form>
                    )
                )}

                {step === "processing" && (
                    <p role="status" className="flex items-center gap-2 py-3 text-sm">
                        <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" /> This may take a moment.
                    </p>
                )}

                {step === "waiting" && (
                    <div role="status" className="space-y-3 py-2">
                        <Smartphone aria-hidden="true" className="h-8 w-8 text-foreground" />
                        <p className="text-sm">If prompted, approve {money(attempt?.amount ?? payingAmount)} on your phone. We’re checking for confirmation.</p>
                        <p className="text-xs text-muted-foreground">Booking reference #{registrationId}</p>
                    </div>
                )}

                {step === "unconfirmed" && (
                    <div className="space-y-3 py-2">
                        <Clock aria-hidden="true" className="h-8 w-8 text-foreground" />
                        <p className="text-sm">Check your phone for a prompt or receipt. Checking again here won’t request another payment.</p>
                        <p className="text-xs text-muted-foreground">Booking reference #{registrationId}</p>
                        <Button className="rounded-full" onClick={() => setStep("waiting")}>Check payment status</Button>
                    </div>
                )}

                {step === "failed" && (
                    <div className="space-y-3 py-2">
                        <XCircle aria-hidden="true" className="h-8 w-8 text-destructive" />
                        <p className="text-sm">{paymentMessage}</p>
                        <Button className="rounded-full" onClick={() => {
                            setPaymentMessage("");
                            setStep("details");
                        }}>Return to booking</Button>
                    </div>
                )}

                {step === "success" && (
                    <div className="space-y-3 py-2">
                        <CheckCircle2 aria-hidden="true" className="h-8 w-8 text-foreground" />
                        <p className="text-sm">
                            {attempt ? (paidBalance > 0 ? "You paid " + money(attempt.amount) + " toward your booking." : "Your tickets are confirmed.")
                                : free ? "Your free tickets are confirmed." : "Your booking is saved. Payment is still due."}
                        </p>
                        <div className="space-y-1 rounded-lg bg-secondary/70 p-3 text-sm">
                            <p><strong>Booking reference</strong> #{registrationId}</p>
                            {(attempt ? paidBalance > 0 : !free) && (
                                <p><strong>Balance due</strong> {money(attempt ? paidBalance : total)}</p>
                            )}
                        </div>
                        <Button className="rounded-full" asChild>
                            <a href="#event-details" onClick={() => storeAttempt(null)}>View event details</a>
                        </Button>
                    </div>
                )}
        </section>
    );
};

export default BookingForm;
