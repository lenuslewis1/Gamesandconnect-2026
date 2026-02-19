
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

interface TeamRegistration {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    team_name: string;
    created_at: string;
}

const TeamRegistrations = () => {
    const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRegistrations();
    }, []);

    const fetchRegistrations = async () => {
        try {
            const { data, error } = await supabase
                .from("team_registrations")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                throw error;
            }

            setRegistrations(data || []);
        } catch (error) {
            console.error("Error fetching team registrations:", error);
            toast.error("Failed to load registrations");
        } finally {
            setLoading(false);
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
                <h2 className="text-3xl font-bold tracking-tight">Team Registrations</h2>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Guest Teams</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead>Team</TableHead>
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
                                        <TableCell>{reg.phone}</TableCell>
                                        <TableCell>{reg.team_name}</TableCell>
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

export default TeamRegistrations;
