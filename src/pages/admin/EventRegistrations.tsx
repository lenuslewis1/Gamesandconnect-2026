import { useEffect, useState } from "react";
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
import { Loader2, Trash2 } from "lucide-react";
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
                                    <TableRow key={registration.id}>
                                        <TableCell>{format(new Date(registration.created_at), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="font-medium">{registration.full_name}</TableCell>
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
