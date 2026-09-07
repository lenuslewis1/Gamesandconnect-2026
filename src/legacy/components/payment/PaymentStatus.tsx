import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, Loader2, RefreshCw, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface PaymentStatusProps {
    registrationId: string;
    transactionReference: string;
    eventTitle: string;
    onRetry: () => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLLS = 60; // 5 minutes max

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

const PaymentStatus = ({
    registrationId,
    transactionReference,
    eventTitle,
    onRetry,
}: PaymentStatusProps) => {
    const [status, setStatus] = useState<"pending" | "confirmed" | "failed">("pending");
    const [message, setMessage] = useState("Waiting for payment confirmation...");
    const [pollCount, setPollCount] = useState(0);
    const [isPolling, setIsPolling] = useState(true);

    useEffect(() => {
        if (!isPolling || status !== "pending") return;

        const checkPaymentStatus = async () => {
            try {
                const response = await fetch(`${SUPABASE_URL}/functions/v1/verify-payment`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    },
                    body: JSON.stringify({
                        registration_id: registrationId,
                        transaction_reference: transactionReference,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    setStatus("failed");
                    setMessage(data?.error || data?.message || `Payment verification failed (${response.status}).`);
                    setIsPolling(false);
                    return;
                }

                const { isConfirmed, isFailed } = getPaymentResult(data);

                if (isConfirmed) {
                    setStatus("confirmed");
                    setMessage("Payment successful!");
                    setIsPolling(false);
                } else if (isFailed) {
                    setStatus("failed");
                    setMessage(data.message || "Payment failed. Please try again.");
                    setIsPolling(false);
                } else {
                    setPollCount((prev) => prev + 1);
                    if (pollCount >= MAX_POLLS) {
                        setIsPolling(false);
                        setMessage("Payment verification timed out. Please check your transaction history.");
                    }
                }
            } catch (error) {
                console.error("Verification error:", error);
                // Don't stop polling on network errors
            }
        };

        const interval = setInterval(checkPaymentStatus, POLL_INTERVAL);

        // Initial check
        checkPaymentStatus();

        return () => clearInterval(interval);
    }, [isPolling, status, registrationId, transactionReference, pollCount]);

    const handleManualCheck = () => {
        setIsPolling(true);
        setPollCount(0);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-center">Payment Status</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
                {/* Status Icon */}
                <div className="flex justify-center">
                    {status === "pending" && (
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                {isPolling ? (
                                    <Loader2 className="h-12 w-12 text-yellow-600 animate-spin" />
                                ) : (
                                    <Clock className="h-12 w-12 text-yellow-600" />
                                )}
                            </div>
                        </div>
                    )}
                    {status === "confirmed" && (
                        <div className="h-24 w-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        </div>
                    )}
                    {status === "failed" && (
                        <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <XCircle className="h-12 w-12 text-red-600" />
                        </div>
                    )}
                </div>

                {/* Status Message */}
                <div>
                    <h3 className="text-xl font-semibold mb-2">
                        {status === "pending" && "Processing Payment"}
                        {status === "confirmed" && "Payment Successful!"}
                        {status === "failed" && "Payment Failed"}
                    </h3>
                    <p className="text-muted-foreground">{message}</p>
                </div>

                {/* Pending Info */}
                {status === "pending" && (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-muted p-4 text-left">
                            <h4 className="font-medium mb-2">What's happening?</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• A payment prompt has been sent to your phone</li>
                                <li>• Enter your Mobile Money PIN to authorize</li>
                                <li>• This page will update automatically</li>
                            </ul>
                        </div>

                        {!isPolling && (
                            <Button onClick={handleManualCheck} variant="outline" className="gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Check Payment Status
                            </Button>
                        )}
                    </div>
                )}

                {/* Success Info */}
                {status === "confirmed" && (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-left">
                            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                                Registration Complete!
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                You're registered for <strong>{eventTitle}</strong>.
                                A confirmation has been sent to your email.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button asChild>
                                <Link to="/events">Browse More Events</Link>
                            </Button>
                            <Button variant="outline" asChild>
                                <Link to="/">Go Home</Link>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Failed Info */}
                {status === "failed" && (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-left">
                            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                                Payment was not completed
                            </h4>
                            <p className="text-sm text-red-700 dark:text-red-300">
                                The payment could not be processed. This could be due to insufficient funds,
                                cancelled transaction, or network issues.
                            </p>
                        </div>

                        <Button onClick={onRetry} className="gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Button>
                    </div>
                )}

                {/* Reference Info */}
                <div className="pt-4 border-t text-xs text-muted-foreground">
                    <p>Reference: {transactionReference || registrationId}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentStatus;
