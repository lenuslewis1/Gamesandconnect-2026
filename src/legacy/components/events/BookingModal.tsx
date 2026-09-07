import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Loader2, Ticket, ArrowLeft, CheckCircle2, XCircle, Smartphone, Clock, RefreshCw } from "lucide-react";

interface TicketTier {
    id: number;
    event_id: number;
    name: string;
    description: string | null;
    price: number;
    capacity: number | null;
    sort_order: number;
}

const formSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    ticket_count: z.coerce.number().min(1, "At least 1 ticket required").max(10, "Maximum 10 tickets per booking"),
});

type FormValues = z.infer<typeof formSchema>;

type Step = "payment-choice" | "details" | "payment" | "processing" | "waiting" | "success" | "failed";

const NETWORKS = [
    { id: "300591", name: "MTN Mobile Money", color: "bg-yellow-400" },
    { id: "300592", name: "AirtelTigo Money", color: "bg-red-500" },
    { id: "300594", name: "Telecel Cash", color: "bg-blue-500" },
];

const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_TIME = 120000; // 2 minutes

const normalizeStatus = (value?: string) => value?.toLowerCase().trim();

const getPaymentResult = (payload: any) => {
    const status =
        normalizeStatus(payload?.status) ||
        normalizeStatus(payload?.payment_status) ||
        normalizeStatus(payload?.paymentStatus) ||
        normalizeStatus(payload?.data?.status) ||
        "";

    const isConfirmed =
        payload?.is_confirmed === true ||
        payload?.is_confirmed === "true" ||
        ["success", "successful", "confirmed", "paid", "completed"].includes(status);

    const isFailed =
        payload?.is_failed === true ||
        payload?.is_failed === "true" ||
        ["failed", "declined", "cancelled", "canceled", "error"].includes(status);

    return { isConfirmed, isFailed, status };
};

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: {
        id: number;
        title: string;
        price: string | null;
        date: string;
        time_range: string;
        location: string;
    };
}

const BookingModal = ({ isOpen, onClose, event }: BookingModalProps) => {
    const { toast } = useToast();
    const [step, setStep] = useState<Step>("payment-choice");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNetwork, setSelectedNetwork] = useState("300591");
    const [registrationData, setRegistrationData] = useState<FormValues | null>(null);
    const [registrationId, setRegistrationId] = useState<number | null>(null);
    const [transactionRef, setTransactionRef] = useState<string | null>(null);
    const [paymentMessage, setPaymentMessage] = useState<string>("");
    const [pollCount, setPollCount] = useState(0);
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollStartTimeRef = useRef<number>(0);

    // Refs to avoid closure stale state in polling
    const registrationIdRef = useRef<number | null>(null);
    const transactionRefRef = useRef<string | null>(null);
    const pollCountRef = useRef(0);

    // Ticket tiers
    const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([]);
    const [selectedTierId, setSelectedTierId] = useState<number | null>(null);
    const [loadingTiers, setLoadingTiers] = useState(false);
    const [pricingReady, setPricingReady] = useState(false);

    // Payment option
    const [paymentType, setPaymentType] = useState<"full" | "part" | "later">("full");
    const [partPaymentAmount, setPartPaymentAmount] = useState<string>("");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            full_name: "",
            email: "",
            phone: "",
            ticket_count: 1,
        },
    });

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    // Fetch ticket tiers when modal opens
    useEffect(() => {
        if (isOpen && event.id) {
            setPricingReady(false);
            setStep("payment-choice");
            fetchTicketTiers();
        }
    }, [isOpen, event.id]);

    const fetchTicketTiers = async () => {
        setLoadingTiers(true);
        try {
            const { data, error } = await supabase
                .from('ticket_tiers')
                .select('*')
                .eq('event_id', event.id)
                .order('sort_order');

            if (error) throw error;

            if (data && data.length > 0) {
                setTicketTiers(data);
                setSelectedTierId(data[0].id);
                setStep(data.some((tier) => tier.price > 0) ? "payment-choice" : "details");
            } else {
                setTicketTiers([]);
                setSelectedTierId(null);
                const legacyPrice = parseFloat(event.price?.replace(/[^0-9.]/g, '') || "0");
                setStep(legacyPrice > 0 ? "payment-choice" : "details");
            }
        } catch (error) {
            console.error('Error fetching ticket tiers:', error);
            setTicketTiers([]);
            const legacyPrice = parseFloat(event.price?.replace(/[^0-9.]/g, '') || "0");
            setStep(legacyPrice > 0 ? "payment-choice" : "details");
        } finally {
            setLoadingTiers(false);
            setPricingReady(true);
        }
    };

    const ticketCount = form.watch("ticket_count");

    // Calculate price based on selected tier or legacy price
    const selectedTier = ticketTiers.find(t => t.id === selectedTierId);
    const unitPrice = selectedTier
        ? selectedTier.price
        : parseFloat(event.price?.replace(/[^0-9.]/g, '') || "0");
    const totalPrice = unitPrice * (ticketCount || 0);
    const isFreeEvent = totalPrice === 0;

    const minPartPayment = Math.max(Math.ceil(totalPrice * 0.5), Math.min(10, totalPrice));
    const parsedPartAmount = parseFloat(partPaymentAmount) || 0;
    const payingAmount = paymentType === "full" ? totalPrice : paymentType === "part" ? parsedPartAmount : 0;
    const balanceRemaining = totalPrice - payingAmount;
    const isPartAmountValid = paymentType !== "part" || (parsedPartAmount >= minPartPayment && parsedPartAmount < totalPrice);

    const formatPhoneNumberForDb = (phone: string) => {
        return phone.startsWith('0')
            ? `+233${phone.substring(1)}`
            : phone.startsWith('+')
                ? phone
                : `+233${phone}`;
    };

    const sendRegistrationNotifications = async (
        values: FormValues,
        bookingReference: string | number,
        registrationStatus: "confirmed" | "pending",
    ) => {
        const { data, error } = await supabase.functions.invoke('send-confirmation-email', {
            body: {
                to: values.email,
                phone: formatPhoneNumberForDb(values.phone),
                customer_name: values.full_name,
                event_title: event.title,
                event_date: event.date,
                event_time: event.time_range,
                event_location: event.location,
                ticket_count: values.ticket_count,
                ticket_tier: selectedTier?.name || (totalPrice === 0 ? 'Free' : 'Standard'),
                total_amount: totalPrice,
                booking_reference: bookingReference,
                transaction_id: '',
                registration_status: registrationStatus,
            },
        });

        if (error || data?.sms?.success !== true) {
            console.error('Registration SMS notification failed:', error || data?.sms);
            return false;
        }

        return true;
    };

    // Poll for payment status
    const checkPaymentStatus = async () => {
        // Use refs to get current values inside interval
        const currentRegId = registrationIdRef.current;
        const currentTxRef = transactionRefRef.current;

        if (!currentRegId) return;

        try {
            setPollCount(prev => prev + 1);
            pollCountRef.current += 1;
            // console.log(`Polling payment status (attempt ${pollCountRef.current})...`);

            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    registration_id: currentRegId,
                    transaction_reference: currentTxRef,
                }),
            });

            const data = await response.json();
            // console.log('Payment status:', data);

            if (!response.ok) {
                stopPolling();
                setPaymentMessage(data?.error || data?.message || `Payment verification failed (${response.status}).`);
                setStep("failed");
                return;
            }

            const { isConfirmed, isFailed } = getPaymentResult(data);

            if (isConfirmed) {
                // Payment confirmed!
                stopPolling();
                setPaymentMessage("Payment successful!");
                setStep("success");
                toast({
                    title: "Payment Confirmed!",
                    description: "Your booking has been confirmed.",
                });
            } else if (isFailed) {
                // Payment failed
                stopPolling();
                setPaymentMessage(data.message || "Payment was declined or failed.");
                setStep("failed");
            } else {
                // Still pending - check if we've exceeded max poll time
                const elapsed = Date.now() - pollStartTimeRef.current;
                if (elapsed >= MAX_POLL_TIME) {
                    stopPolling();
                    setPaymentMessage("Payment was not confirmed. It may have been declined or the prompt expired. Please try again.");
                    setStep("failed");
                }
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
        }
    };

    const startPolling = () => {
        pollStartTimeRef.current = Date.now();
        setPollCount(0);
        pollCountRef.current = 0;

        // Immediate first check
        checkPaymentStatus();

        // Then poll at intervals
        pollIntervalRef.current = setInterval(checkPaymentStatus, POLL_INTERVAL);
    };

    const stopPolling = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    };

    const handleDetailsSubmit = async (values: FormValues) => {
        setRegistrationData(values);

        if (totalPrice === 0) {
            // Free event - just register
            setIsLoading(true);
            try {
                const { data: registration, error } = await supabase
                    .from('event_registrations')
                    .insert({
                        event_id: event.id,
                        full_name: values.full_name,
                        email: values.email,
                        phone: values.phone,
                        ticket_count: values.ticket_count,
                        status: 'confirmed',
                    })
                    .select('id')
                    .single();

                if (error) throw error;

                const smsSent = await sendRegistrationNotifications(
                    values,
                    registration.id,
                    'confirmed',
                );

                if (!smsSent) {
                    toast({
                        title: "Registration Saved",
                        description: "Your registration was saved, but the confirmation text could not be sent.",
                    });
                }

                setStep("success");
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Registration Failed",
                    description: error.message || "Something went wrong. Please try again.",
                });
            } finally {
                setIsLoading(false);
            }
        } else if (paymentType === "later") {
            await handlePayLaterRegistration(values);
        } else {
            if (paymentType === "part" && !isPartAmountValid) {
                toast({
                    variant: "destructive",
                    title: "Invalid Amount",
                    description: `Part payment must be at least GHS ${minPartPayment} and less than the full total.`,
                });
                return;
            }
            setStep("payment");
        }
    };

    const handlePayLaterRegistration = async (values: FormValues) => {
        setIsLoading(true);

        try {
            const formattedPhone = formatPhoneNumberForDb(values.phone);

            const { data: registration, error: regError } = await supabase
                .from('registrations')
                .insert({
                    event_id: event.id,
                    ticket_tier_id: selectedTierId,
                    full_name: values.full_name,
                    email: values.email,
                    phone_number: formattedPhone,
                    number_of_participants: values.ticket_count,
                    location: 'Accra',
                    total_amount: totalPrice,
                    amount_paid: 0,
                    payment_status: 'pending',
                })
                .select()
                .single();

            if (regError) {
                throw new Error(regError.message || 'Failed to create registration');
            }

            const { error: eventRegError } = await supabase
                .from('event_registrations')
                .insert({
                    event_id: event.id,
                    full_name: values.full_name,
                    email: values.email,
                    phone: values.phone,
                    ticket_count: values.ticket_count,
                    status: 'pending',
                });

            if (eventRegError) {
                console.error('Event registration sync error:', eventRegError);
            }

            setRegistrationId(registration.id);
            registrationIdRef.current = registration.id;

            const smsSent = await sendRegistrationNotifications(
                values,
                registration.id,
                'pending',
            );

            setStep("success");
            toast({
                title: "Registration Saved",
                description: smsSent
                    ? "Your registration has been submitted and a confirmation text was sent."
                    : "Your registration was saved, but the confirmation text could not be sent.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!registrationData) return;

        // Validate required fields
        if (!registrationData.phone || !registrationData.full_name) {
            toast({
                variant: "destructive",
                title: "Invalid Data",
                description: "Please provide valid contact information",
            });
            setStep("details");
            return;
        }

        if (!totalPrice || totalPrice <= 0) {
            toast({
                variant: "destructive",
                title: "Invalid Amount",
                description: "Please select a valid ticket tier",
            });
            setStep("details");
            return;
        }

        setIsLoading(true);
        setStep("processing");

        try {
            // Format phone number
            const formattedPhone = formatPhoneNumberForDb(registrationData.phone);

            const payAccountNumber = formattedPhone.replace(/\D/g, "");

            // Create registration
            const { data: registration, error: regError } = await supabase
                .from('registrations')
                .insert({
                    event_id: event.id,
                    ticket_tier_id: selectedTierId, // Set the selected tier ID
                    full_name: registrationData.full_name,
                    email: registrationData.email,
                    phone_number: formattedPhone,
                    number_of_participants: registrationData.ticket_count,
                    location: 'Accra',
                    payment_status: 'pending',
                })
                .select()
                .single();

            if (regError) {
                throw new Error(regError.message || 'Failed to create registration');
            }

            setRegistrationId(registration.id);
            registrationIdRef.current = registration.id;

            const tierName = selectedTier ? selectedTier.name : 'Standard';
            const isPartPayment = paymentType === "part" && payingAmount < totalPrice;
            const narration = `${event.title} - ${tierName} x${registrationData.ticket_count}${isPartPayment ? ' (Part Payment)' : ''}`;

            // Call pay Edge Function
            const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pay`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    event_id: event.id,
                    registration_id: registration.id,
                    account_number: payAccountNumber,
                    account_name: registrationData.full_name,
                    amount: payingAmount,
                    total_amount: totalPrice,
                    payment_amount: payingAmount,
                    network: selectedNetwork,
                    narration: narration,
                }),
            });

            const data = await response.json();
            // console.log('Payment response:', data);

            if (!response.ok) {
                throw new Error(data?.error || data?.message || `Payment initiation failed (${response.status}).`);
            }

            if (data.success) {
                // Save transaction reference for polling
                const ref =
                    data.transaction_reference ||
                    data.transactionReference ||
                    data.transaction_id ||
                    data.transactionId ||
                    data.collection_transaction_id ||
                    data.collectionTransactionId ||
                    data.data?.transaction_reference ||
                    data.data?.transactionReference ||
                    data.data?.transaction_id ||
                    data.data?.transactionId ||
                    data.data?.collection_transaction_id ||
                    data.data?.collectionTransactionId;

                if (!ref) {
                    throw new Error("Payment initiation did not return a transaction reference. Please try again.");
                }

                setTransactionRef(ref);
                transactionRefRef.current = ref;

                // Create event registration record
                await supabase
                    .from('event_registrations')
                    .insert({
                        event_id: event.id,
                        full_name: registrationData.full_name,
                        email: registrationData.email,
                        phone: registrationData.phone,
                        ticket_count: registrationData.ticket_count,
                        status: 'pending',
                    });

                // Move to waiting step and start polling for callback confirmation
                setStep("waiting");
                startPolling();

                toast({
                    title: "Payment Prompt Sent!",
                    description: "Please approve the payment on your phone.",
                });
            } else {
                throw new Error(data.error || "Payment initiation failed");
            }
        } catch (error: any) {
            console.error("Payment error:", error.message || "Unknown error");
            setStep("payment");
            toast({
                variant: "destructive",
                title: "Payment Failed",
                description: error.message || "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetryPayment = () => {
        setStep("payment");
        setPaymentMessage("");
    };

    const handleClose = () => {
        stopPolling();
        setStep("payment-choice");
        setRegistrationData(null);
        setRegistrationId(null);
        registrationIdRef.current = null;
        setTransactionRef(null);
        transactionRefRef.current = null;
        setPaymentMessage("");
        setPollCount(0);
        pollCountRef.current = 0;
        setSelectedTierId(ticketTiers[0]?.id || null);
        setPaymentType("full");
        setPartPaymentAmount("");
        form.reset();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[480px]">
                {/* Step: Payment Choice */}
                {step === "payment-choice" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">Choose Payment Option</DialogTitle>
                            <DialogDescription>
                                Select how you want to complete your booking for {event.title}.
                            </DialogDescription>
                        </DialogHeader>

                        {!pricingReady ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-[#4d7c0f]" />
                            </div>
                        ) : (
                        <div className="space-y-5 pt-4">
                            <RadioGroup
                                value={paymentType}
                                onValueChange={(val) => setPaymentType(val as "full" | "part" | "later")}
                                className="grid gap-3"
                            >
                                <div>
                                    <RadioGroupItem value="full" id="choice-full" className="peer sr-only" />
                                    <Label
                                        htmlFor="choice-full"
                                        className="flex flex-col gap-1 rounded-xl border-2 p-4 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 border-border hover:border-primary/50"
                                    >
                                        <span className="font-medium">Pay Full Payment</span>
                                        <span className="text-sm text-muted-foreground">Fill your booking details, then pay the full amount by mobile money.</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="part" id="choice-part" className="peer sr-only" />
                                    <Label
                                        htmlFor="choice-part"
                                        className="flex flex-col gap-1 rounded-xl border-2 p-4 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 border-border hover:border-primary/50"
                                    >
                                        <span className="font-medium">Pay Part Payment</span>
                                        <span className="text-sm text-muted-foreground">Fill your booking details, choose a deposit amount, then pay by mobile money.</span>
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="later" id="choice-later" className="peer sr-only" />
                                    <Label
                                        htmlFor="choice-later"
                                        className="flex flex-col gap-1 rounded-xl border-2 p-4 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 border-border hover:border-primary/50"
                                    >
                                        <span className="font-medium">Pay Later</span>
                                        <span className="text-sm text-muted-foreground">Fill your booking details now and submit your registration.</span>
                                    </Label>
                                </div>
                            </RadioGroup>

                            <Button className="w-full h-12 rounded-full text-lg" onClick={() => setStep("details")}>
                                Continue
                            </Button>
                        </div>
                        )}
                    </>
                )}

                {/* Step: Details */}
                {step === "details" && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">{isFreeEvent ? "Register for Your Spot" : "Book Your Spot"}</DialogTitle>
                            <DialogDescription>
                                {isFreeEvent
                                    ? `Fill in your details to register for ${event.title}.`
                                    : paymentType === "later"
                                    ? `Fill in your details to register for ${event.title}.`
                                    : paymentType === "part"
                                        ? `Fill in your details and choose how much you want to pay now for ${event.title}.`
                                        : `Fill in your details to pay the full amount for ${event.title}.`}
                            </DialogDescription>
                        </DialogHeader>

                        {loadingTiers ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-[#4d7c0f]" />
                            </div>
                        ) : (
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleDetailsSubmit)} className="space-y-5 pt-4">
                                    <FormField
                                        control={form.control}
                                        name="full_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email Address</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="john@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone Number</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="024 123 4567" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Ticket Tier Selection */}
                                    {ticketTiers.length > 0 && (
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium">Select Ticket Type</Label>
                                            <RadioGroup
                                                value={selectedTierId?.toString()}
                                                onValueChange={(val) => {
                                                    const id = parseInt(val);
                                                    if (!isNaN(id)) setSelectedTierId(id);
                                                }}
                                                className="grid gap-3"
                                            >
                                                {ticketTiers.map((tier) => (
                                                    <div key={tier.id}>
                                                        <RadioGroupItem
                                                            value={tier.id.toString()}
                                                            id={`tier-${tier.id}`}
                                                            className="peer sr-only"
                                                        />
                                                        <Label
                                                            htmlFor={`tier-${tier.id}`}
                                                            className="flex items-center justify-between rounded-xl border-2 p-4 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 border-border hover:border-primary/50"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                                                                    {selectedTierId === tier.id && (
                                                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-foreground">{tier.name}</p>
                                                                    {tier.description && (
                                                                        <p className="text-xs text-muted-foreground">{tier.description}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {!isFreeEvent && paymentType !== "later" && (
                                                                <span className="font-bold text-[#4d7c0f]">GHS {tier.price}</span>
                                                            )}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    )}

                                    <FormField
                                        control={form.control}
                                        name="ticket_count"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Number of Tickets</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center gap-3">
                                                        <Input type="number" min={1} max={10} {...field} />
                                                        <Ticket className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {!isFreeEvent && paymentType !== "later" && (
                                        <div className="bg-muted/50 p-4 rounded-xl space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>
                                                    {selectedTier ? selectedTier.name : 'Ticket'} x {ticketCount || 0}
                                                </span>
                                                <span>GHS {unitPrice} each</span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                                                <span>Total Amount</span>
                                                <span>GHS {totalPrice}</span>
                                            </div>
                                        </div>
                                    )}

                                    {!isFreeEvent && (
                                        <div className="space-y-3">
                                            {paymentType === "part" && (
                                                <div className="space-y-2 animate-fade-in">
                                                    <Label className="text-sm">Amount to pay now (min GHS {minPartPayment})</Label>
                                                    <Input
                                                        type="number"
                                                        min={minPartPayment}
                                                        max={totalPrice - 1}
                                                        step="0.01"
                                                        placeholder={`e.g. ${minPartPayment}`}
                                                        value={partPaymentAmount}
                                                        onChange={(e) => setPartPaymentAmount(e.target.value)}
                                                        className="text-lg"
                                                    />
                                                    {parsedPartAmount > 0 && parsedPartAmount < minPartPayment && (
                                                        <p className="text-xs text-red-500">Minimum part payment is GHS {minPartPayment}</p>
                                                    )}
                                                    {parsedPartAmount >= totalPrice && (
                                                        <p className="text-xs text-red-500">Use full payment for the full amount.</p>
                                                    )}
                                                    {isPartAmountValid && (
                                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                                                            <p>Paying <strong>GHS {payingAmount}</strong> now</p>
                                                            <p>Balance remaining: <strong>GHS {balanceRemaining}</strong></p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {paymentType === "full" && (
                                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                                                    <p>You will pay the full amount of <strong>GHS {totalPrice}</strong> after submitting your details.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {!isFreeEvent && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => setStep("payment-choice")}
                                        >
                                            <ArrowLeft className="mr-2 h-4 w-4" />
                                            Change Payment Option
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-full text-lg"
                                        disabled={isLoading || (paymentType === "part" && !isPartAmountValid)}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : totalPrice === 0 ? (
                                            "Confirm Registration"
                                        ) : paymentType === "part" && isPartAmountValid ? (
                                            `Continue - Pay GHS ${payingAmount}`
                                        ) : paymentType === "later" ? (
                                            "Register and Pay Later"
                                        ) : (
                                            "Continue to Payment"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        )}
                    </>
                )}

                {/* Step: Payment */}
                {step === "payment" && registrationData && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="font-serif text-2xl">Select Payment Method</DialogTitle>
                            <DialogDescription>
                                Choose your mobile money network
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 pt-4">
                            {/* Order Summary */}
                            <div className="bg-muted/50 p-4 rounded-xl space-y-2">
                                <p className="font-medium">{event.title}</p>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>{selectedTier ? selectedTier.name : 'Ticket'} × {registrationData.ticket_count}</span>
                                    <span className="text-foreground">GHS {totalPrice}</span>
                                </div>
                                {paymentType === "part" && (
                                    <>
                                        <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
                                            <span>Paying Now</span>
                                            <span className="text-[#4d7c0f]">GHS {payingAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            <span>Balance Remaining</span>
                                            <span>GHS {balanceRemaining}</span>
                                        </div>
                                    </>
                                )}
                                {paymentType === "full" && (
                                    <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
                                        <span>Total</span>
                                        <span className="text-[#4d7c0f]">GHS {totalPrice}</span>
                                    </div>
                                )}
                            </div>

                            {/* Network Selection */}
                            <div className="space-y-3">
                                <Label>Choose Network</Label>
                                <RadioGroup
                                    value={selectedNetwork}
                                    onValueChange={setSelectedNetwork}
                                    className="space-y-3"
                                >
                                    {NETWORKS.map((network) => (
                                        <div
                                            key={network.id}
                                            className={`flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${selectedNetwork === network.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                                }`}
                                            onClick={() => setSelectedNetwork(network.id)}
                                        >
                                            <RadioGroupItem value={network.id} id={network.id} />
                                            <div className={`h-3 w-3 rounded-full ${network.color}`} />
                                            <Label htmlFor={network.id} className="cursor-pointer flex-1">
                                                {network.name}
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>

                            {/* Phone Number Display */}
                            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl">
                                <Smartphone className="h-5 w-5 text-[#4d7c0f]" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Payment will be sent to</p>
                                    <p className="font-medium">{registrationData.phone}</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setStep("details")}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    className="flex-1 h-12 rounded-full"
                                    onClick={handlePayment}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        `Pay GHS ${payingAmount}`
                                    )}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {/* Step: Processing */}
                {step === "processing" && (
                    <div className="py-12 text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-[#4d7c0f] mx-auto mb-4" />
                        <h3 className="font-serif text-xl font-medium mb-2">Initiating Payment</h3>
                        <p className="text-muted-foreground">
                            Please wait while we connect to your mobile money...
                        </p>
                    </div>
                )}

                {/* Step: Waiting for Payment */}
                {step === "waiting" && (
                    <div className="py-8 text-center">
                        <div className="relative mx-auto mb-6 w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                            <Smartphone className="absolute inset-0 m-auto h-8 w-8 text-[#4d7c0f]" />
                        </div>
                        <h3 className="font-serif text-2xl font-medium mb-2">Approve Payment</h3>
                        <p className="text-muted-foreground mb-4">
                            A payment prompt has been sent to your phone.<br />
                            Please approve it to complete your booking.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                            <Clock className="h-4 w-4" />
                            <span>Checking status... ({pollCount})</span>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                            <p><strong>Don't see the prompt?</strong></p>
                            <p>Check your phone for a payment request from Mobile Money.</p>
                        </div>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </div>
                )}

                {/* Step: Success */}
                {step === "success" && (
                    <div className="py-8 text-center">
                        <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h3 className="font-serif text-2xl font-medium mb-2">
                            {totalPrice === 0
                                ? "Registration Complete!"
                                : paymentType === "later"
                                    ? "Registration Saved!"
                                    : paymentType === "part"
                                        ? "Part Payment Successful!"
                                    : "Payment Successful!"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                            {totalPrice === 0
                                ? `You're registered for ${event.title}. See you there!`
                                : paymentType === "later"
                                    ? `You're registered for ${event.title}.`
                                    : paymentType === "part"
                                        ? `You've paid GHS ${payingAmount} towards your booking for ${event.title}.`
                                    : `Your booking for ${event.title} has been confirmed. You'll receive a confirmation email shortly.`}
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 space-y-1">
                            <p className="text-green-800 text-sm">
                                <strong>Booking Reference:</strong> #{registrationId}
                            </p>
                            {paymentType === "part" && (
                                <p className="text-green-800 text-sm">
                                    <strong>Balance Remaining:</strong> GHS {balanceRemaining}
                                </p>
                            )}
                        </div>
                        {paymentType === "part" && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800">
                                Please complete the remaining balance of <strong>GHS {balanceRemaining}</strong> before the event date.
                            </div>
                        )}
                        <Button onClick={handleClose} className="rounded-full px-8">
                            Done
                        </Button>
                    </div>
                )}

                {/* Step: Failed */}
                {step === "failed" && (
                    <div className="py-8 text-center">
                        <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>
                        <h3 className="font-serif text-2xl font-medium mb-2">Payment Failed</h3>
                        <p className="text-muted-foreground mb-4">
                            {paymentMessage || "Unfortunately, your payment could not be processed."}
                        </p>
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-800">
                            <p>This could happen if:</p>
                            <ul className="list-disc list-inside mt-2 text-left">
                                <li>The payment was declined</li>
                                <li>Insufficient funds in your account</li>
                                <li>The payment request timed out</li>
                            </ul>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleRetryPayment} className="rounded-full">
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default BookingModal;
