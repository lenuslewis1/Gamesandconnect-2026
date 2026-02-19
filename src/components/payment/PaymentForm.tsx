import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Phone, Smartphone } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface PaymentFormProps {
    eventId: string | number;
    eventTitle: string;
    amount: number;
    registrationData: {
        name: string;
        email: string;
        phone: string;
        participants: number;
    };
    onPaymentInitiated: (data: {
        registrationId: string;
        transactionReference: string;
        collectionTransactionId: string;
    }) => void;
    onError: (error: string) => void;
}

const networks = [
    {
        id: "mtn",
        name: "MTN Mobile Money",
        code: "300591",
        color: "bg-yellow-500",
        logo: "🟡",
    },
    {
        id: "airteltigo",
        name: "AirtelTigo Money",
        code: "300592",
        color: "bg-red-500",
        logo: "🔴",
    },
    {
        id: "telecel",
        name: "Telecel Cash",
        code: "300594",
        color: "bg-blue-500",
        logo: "🔵",
    },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const PaymentForm = ({
    eventId,
    eventTitle,
    amount,
    registrationData,
    onPaymentInitiated,
    onError,
}: PaymentFormProps) => {
    const [selectedNetwork, setSelectedNetwork] = useState("mtn");
    const [phoneNumber, setPhoneNumber] = useState(registrationData.phone);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatPhoneNumber = (value: string) => {
        // Remove non-digits
        const cleaned = value.replace(/\D/g, "");
        // Limit to 10 digits for Ghana numbers
        return cleaned.slice(0, 10);
    };

    const validatePhoneNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, "");
        // Ghana mobile numbers: 10 digits starting with 0
        return cleaned.length === 10 && cleaned.startsWith("0");
    };

    const formatAccountNumber = (phone: string) => {
        // Convert 0XXXXXXXXX to 233XXXXXXXXX
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.startsWith("0")) {
            return `233${cleaned.substring(1)}`;
        }
        return cleaned;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePhoneNumber(phoneNumber)) {
            onError("Please enter a valid Ghana phone number (e.g., 0599975352)");
            return;
        }

        setIsProcessing(true);

        try {
            // Format phone for database constraint: +233XXXXXXXXX
            const formattedPhone = phoneNumber.startsWith('0')
                ? `+233${phoneNumber.substring(1)}`
                : phoneNumber.startsWith('+')
                    ? phoneNumber
                    : `+233${phoneNumber}`;

            // Step 1: Create registration in database
            const { data: registration, error: regError } = await supabase
                .from('registrations')
                .insert({
                    event_id: eventId,
                    full_name: registrationData.name,
                    email: registrationData.email,
                    phone_number: formattedPhone,
                    number_of_participants: registrationData.participants,
                    location: 'Accra',
                    payment_status: 'pending',
                })
                .select()
                .single();

            if (regError) {
                console.error('Registration error:', regError);
                throw new Error(regError.message || 'Failed to create registration. Please try again.');
            }

            const totalAmount = amount * registrationData.participants;

            const networkCode = networks.find((n) => n.id === selectedNetwork)?.code || selectedNetwork;

            // Step 2: Call pay Edge Function
            const response = await fetch(`${SUPABASE_URL}/functions/v1/pay`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({
                    event_id: eventId,
                    registration_id: registration.id,
                    account_number: formatAccountNumber(phoneNumber),
                    account_name: registrationData.name,
                    amount: totalAmount,
                    network: networkCode,
                    narration: `${eventTitle} - ${registrationData.participants} ticket(s)`,
                }),
            });

            const data = await response.json();
            // console.log('Payment response:', data);

            if (!response.ok) {
                throw new Error(data?.error || data?.message || `Payment initiation failed (${response.status}).`);
            }

            if (data.success) {
                const txRef = data.transaction_reference || data.transaction_id || data.collection_transaction_id;

                if (!txRef) {
                    throw new Error("Payment initiation did not return a transaction reference. Please try again.");
                }

                onPaymentInitiated({
                    registrationId: String(registration.id),
                    transactionReference: txRef,
                    collectionTransactionId: data.collection_transaction_id || '',
                });
            } else {
                const errorMsg = data.error_details?.message || data.error || "Payment initiation failed. Please try again.";
                console.error('Payment failed:', data.error_details || data.error);
                onError(errorMsg);
            }
        } catch (error) {
            console.error("Payment error:", error instanceof Error ? error.message : "Unknown error");
            onError(error instanceof Error ? error.message : "Network error. Please check your connection and try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const totalAmount = amount * registrationData.participants;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Mobile Money Payment
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Order Summary */}
                    <div className="rounded-lg bg-muted p-4">
                        <h4 className="font-medium mb-2">Order Summary</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Event</span>
                                <span>{eventTitle}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Tickets</span>
                                <span>{registrationData.participants}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Price per ticket</span>
                                <span>GH₵{amount}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span className="text-[#4d7c0f]">GH₵{totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Network Selection */}
                    <div className="space-y-3">
                        <Label>Select Payment Network</Label>
                        <RadioGroup
                            value={selectedNetwork}
                            onValueChange={setSelectedNetwork}
                            className="grid gap-3"
                        >
                            {networks.map((network) => (
                                <div key={network.id}>
                                    <RadioGroupItem
                                        value={network.id}
                                        id={network.id}
                                        className="peer sr-only"
                                    />
                                    <Label
                                        htmlFor={network.id}
                                        className="flex items-center gap-3 rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                                    >
                                        <span className="text-2xl">{network.logo}</span>
                                        <span className="font-medium">{network.name}</span>
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <Label htmlFor="paymentPhone">
                            <Phone className="inline h-4 w-4 mr-1" />
                            Mobile Money Number
                        </Label>
                        <Input
                            id="paymentPhone"
                            type="tel"
                            placeholder="0599975352"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                            className="text-lg"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter your {networks.find((n) => n.id === selectedNetwork)?.name} number
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Pay GH₵{totalAmount}</>
                        )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                        You will receive a prompt on your phone to authorize this payment
                    </p>
                </form>
            </CardContent>
        </Card>
    );
};

export default PaymentForm;
