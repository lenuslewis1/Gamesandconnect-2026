import { Fragment, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ChevronDown, ChevronRight, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Registration {
    id: number;
    full_name: string;
    email: string;
    phone_number?: string | null;
    location?: string | null;
    ticket_tier_id?: string | number | null;
    event_id: number;
    number_of_participants: number;
    payment_status: string;
    total_amount: number;
    amount_paid: number;
    created_at: string;
}

const EventRegistrations = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const toggleDetails = (id: number) => {
        setExpandedIds((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const { data, error } = await supabase
                .from("registrations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setRegistrations(data || []);
        } catch (error) {
            console.error("Error fetching registrations:", error);
            toast.error("Failed to load event registrations");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (registration: Registration) => {
        try {
            setDeletingId(registration.id);
            const { data: deletedRegistration, error } = await supabase
                .from("registrations")
                .delete()
                .eq("id", registration.id)
                .select("id")
                .single();

            if (error) throw error;
            if (!deletedRegistration) {
                throw new Error("The registration was not deleted. Please check your admin permissions.");
            }

            setRegistrations((current) => current.filter((item) => item.id !== registration.id));
            toast.success(`Registration for ${registration.full_name} deleted`);
        } catch (error: any) {
            console.error("Error deleting registration:", error);
            toast.error(error.message || "Failed to delete registration");
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'success':
            case 'successful':
            case 'completed':
            case 'confirmed':
                return <Badge className="bg-green-500">Paid</Badge>;
            case 'partial':
                return <Badge className="bg-amber-500">Partial</Badge>;
            case 'pay_later':
                return <Badge variant="outline" className="text-blue-600 border-blue-600">Pay Later</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
            case 'failed':
            case 'cancelled':
            case 'canceled':
                return <Badge variant="destructive">{status}</Badge>;
            default:
                return <Badge variant="secondary">{status || 'Unknown'}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#4d7c0f]" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Event Registrations</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Ticket Sales</CardTitle>
                    <p className="text-sm text-muted-foreground">Select a name to view contact and booking details.</p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Participants</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center">
                                        No registrations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                registrations.map((registration) => (
                                    <Fragment key={registration.id}>
                                    <TableRow data-state={expandedIds.has(registration.id) ? "selected" : undefined}>
                                        <TableCell>{format(new Date(registration.created_at), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="font-medium">
                                            <button
                                                type="button"
                                                className="flex min-h-11 items-center gap-2 text-left hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                                                aria-expanded={expandedIds.has(registration.id)}
                                                aria-controls={`registration-details-${registration.id}`}
                                                aria-label={`${expandedIds.has(registration.id) ? 'Hide' : 'Show'} details for ${registration.full_name}`}
                                                onClick={() => toggleDetails(registration.id)}
                                            >
                                                {expandedIds.has(registration.id) ? <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
                                                {registration.full_name}
                                            </button>
                                        </TableCell>
                                        <TableCell>{registration.email}</TableCell>
                                        <TableCell>{registration.number_of_participants}</TableCell>
                                        <TableCell>GH₵{Number(registration.total_amount || 0)}</TableCell>
                                        <TableCell>GH₵{Number(registration.amount_paid || 0)}</TableCell>
                                        <TableCell>
                                            {Number(registration.total_amount || 0) - Number(registration.amount_paid || 0) > 0
                                                ? `GH₵${Number(registration.total_amount || 0) - Number(registration.amount_paid || 0)}`
                                                : '—'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(registration.payment_status)}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                                                        aria-label={`Delete ${registration.full_name}`}
                                                        disabled={deletingId !== null}
                                                    >
                                                        {deletingId === registration.id
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <Trash2 className="h-4 w-4" />}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete registration?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the registration for {registration.full_name}. This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-red-500 hover:bg-red-600"
                                                            onClick={() => handleDelete(registration)}
                                                        >
                                                            Delete Registration
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                    {expandedIds.has(registration.id) && (
                                        <TableRow className="bg-muted/30 hover:bg-muted/30">
                                            <TableCell colSpan={9} className="p-0">
                                                <section id={`registration-details-${registration.id}`} aria-label={`Registration details for ${registration.full_name}`} className="p-5 sm:p-6">
                                                    <h3 className="mb-4 text-base font-semibold">Contact & booking details</h3>
                                                    <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
                                                        <div><dt className="text-xs font-medium text-muted-foreground">Phone number</dt><dd className="mt-1 break-words">{registration.phone_number ? <a className="underline underline-offset-4" href={`tel:${registration.phone_number.replace(/[^\d+]/g, '')}`}>{registration.phone_number}</a> : 'Not provided'}</dd></div>
                                                        <div><dt className="text-xs font-medium text-muted-foreground">Email address</dt><dd className="mt-1 break-all">{registration.email ? <a className="underline underline-offset-4" href={`mailto:${registration.email}`}>{registration.email}</a> : 'Not provided'}</dd></div>
                                                        <div><dt className="text-xs font-medium text-muted-foreground">Location</dt><dd className="mt-1 break-words">{registration.location || 'Not provided'}</dd></div>
                                                        <div><dt className="text-xs font-medium text-muted-foreground">Event</dt><dd className="mt-1"><a className="underline underline-offset-4" href={`/events/${registration.event_id}`}>View event #{registration.event_id}</a></dd></div>
                                                        <div><dt className="text-xs font-medium text-muted-foreground">Registration ID</dt><dd className="mt-1 break-all">{registration.id}</dd></div>
                                                        <div><dt className="text-xs font-medium text-muted-foreground">Ticket tier ID</dt><dd className="mt-1 break-all">{registration.ticket_tier_id ?? 'Not recorded'}</dd></div>
                                                        <div><dt className="text-xs font-medium text-muted-foreground">Participants</dt><dd className="mt-1">{registration.number_of_participants}</dd></div>
                                                        <div><dt className="text-xs font-medium text-muted-foreground">Registered at</dt><dd className="mt-1">{format(new Date(registration.created_at), "MMM d, yyyy 'at' HH:mm")} <span className="text-muted-foreground">(local time)</span></dd></div>
                                                    </dl>
                                                </section>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    </Fragment>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default EventRegistrations;
