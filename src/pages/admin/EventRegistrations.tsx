
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
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Registration {
    id: number;
    full_name: string;
    email: string;
    event_id: number;
    number_of_participants: number;
    payment_status: string;
    created_at: string;
}

const EventRegistrations = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const { data, error } = await supabase
                .from("registrations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                throw error;
            }

            setRegistrations(data || []);
        } catch (error) {
            console.error("Error fetching registrations:", error);
            toast.error("Failed to load event registrations");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'paid':
            case 'success':
            case 'successful':
                return <Badge className="bg-green-500">Paid</Badge>
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
            default:
                return <Badge variant="secondary">{status || 'Unknown'}</Badge>
        }
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">
                                        No registrations found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                registrations.map((reg) => (
                                    <TableRow key={reg.id}>
                                        <TableCell>
                                            {format(new Date(reg.created_at), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="font-medium">{reg.full_name}</TableCell>
                                        <TableCell>{reg.email}</TableCell>
                                        <TableCell>{reg.number_of_participants}</TableCell>
                                        <TableCell>{getStatusBadge(reg.payment_status)}</TableCell>
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
