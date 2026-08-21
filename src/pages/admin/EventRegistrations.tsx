
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
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Registration {
    id: number;
    full_name: string;
    email: string;
    phone_number: string | null;
    event_id: number;
    number_of_participants: number;
    payment_status: string;
    total_amount: number;
    amount_paid: number;
    created_at: string;
}

interface RegistrationFormData {
    full_name: string;
    email: string;
    phone_number: string;
    number_of_participants: number;
    total_amount: number;
    amount_paid: number;
    payment_status: string;
}

const emptyFormData: RegistrationFormData = {
    full_name: "",
    email: "",
    phone_number: "",
    number_of_participants: 1,
    total_amount: 0,
    amount_paid: 0,
    payment_status: "pending",
};

const EventRegistrations = () => {
    const [registrations, setRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
    const [formData, setFormData] = useState<RegistrationFormData>(emptyFormData);
    const [saving, setSaving] = useState(false);

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
            case 'completed':
            case 'confirmed':
                return <Badge className="bg-green-500">Paid</Badge>
            case 'partial':
                return <Badge className="bg-amber-500">Partial</Badge>
            case 'pay_later':
                return <Badge variant="outline" className="text-blue-600 border-blue-600">Pay Later</Badge>
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>
            case 'failed':
            case 'cancelled':
            case 'canceled':
                return <Badge variant="destructive">{status}</Badge>
            default:
                return <Badge variant="secondary">{status || 'Unknown'}</Badge>
        }
    }

    const openEditDialog = (registration: Registration) => {
        setEditingRegistration(registration);
        setFormData({
            full_name: registration.full_name || "",
            email: registration.email || "",
            phone_number: registration.phone_number || "",
            number_of_participants: Number(registration.number_of_participants || 1),
            total_amount: Number(registration.total_amount || 0),
            amount_paid: Number(registration.amount_paid || 0),
            payment_status: registration.payment_status || "pending",
        });
    };

    const closeEditDialog = () => {
        if (saving) return;
        setEditingRegistration(null);
        setFormData(emptyFormData);
    };

    const handleStatusChange = (paymentStatus: string) => {
        setFormData((current) => ({
            ...current,
            payment_status: paymentStatus,
            amount_paid: paymentStatus === 'paid' ? current.total_amount : current.amount_paid,
        }));
    };

    const handleSave = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!editingRegistration) return;

        const totalAmount = Number(formData.total_amount);
        const amountPaid = Number(formData.amount_paid);
        const participants = Number(formData.number_of_participants);

        if (!formData.full_name.trim() || !formData.email.trim()) {
            toast.error("Name and email are required");
            return;
        }
        if (!Number.isFinite(participants) || participants < 1) {
            toast.error("Participants must be at least 1");
            return;
        }
        if (!Number.isFinite(totalAmount) || !Number.isFinite(amountPaid) || totalAmount < 0 || amountPaid < 0) {
            toast.error("Payment amounts cannot be negative");
            return;
        }
        if (totalAmount > 0 && amountPaid > totalAmount) {
            toast.error("Amount paid cannot exceed the registration total");
            return;
        }

        let paymentStatus = formData.payment_status;
        if (totalAmount > 0 && amountPaid >= totalAmount) paymentStatus = 'paid';
        else if (amountPaid > 0) paymentStatus = 'partial';
        else if (paymentStatus === 'paid' || paymentStatus === 'partial') {
            toast.error("Enter the amount paid for this payment status");
            return;
        }

        const updates = {
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            phone_number: formData.phone_number.trim() || null,
            number_of_participants: participants,
            total_amount: totalAmount,
            amount_paid: amountPaid,
            payment_status: paymentStatus,
        };

        try {
            setSaving(true);
            const { data: updatedRegistration, error } = await supabase
                .from("registrations")
                .update(updates)
                .eq("id", editingRegistration.id)
                .select()
                .single();

            if (error) throw error;
            if (!updatedRegistration) throw new Error("The registration was not updated. Please check your admin permissions.");

            setRegistrations((current) => current.map((registration) =>
                registration.id === updatedRegistration.id ? updatedRegistration : registration,
            ));
            toast.success("Registration updated successfully");
            setEditingRegistration(null);
            setFormData(emptyFormData);
        } catch (error: any) {
            console.error("Error updating registration:", error);
            toast.error(error.message || "Failed to update registration");
        } finally {
            setSaving(false);
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
                                registrations.map((reg) => (
                                    <TableRow key={reg.id}>
                                        <TableCell>
                                            {format(new Date(reg.created_at), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="font-medium">{reg.full_name}</TableCell>
                                        <TableCell>{reg.email}</TableCell>
                                        <TableCell>{reg.number_of_participants}</TableCell>
                                        <TableCell>GH₵{Number(reg.total_amount || 0)}</TableCell>
                                        <TableCell>GH₵{Number(reg.amount_paid || 0)}</TableCell>
                                        <TableCell>
                                            {Number(reg.total_amount || 0) - Number(reg.amount_paid || 0) > 0
                                                ? `GH₵${Number(reg.total_amount || 0) - Number(reg.amount_paid || 0)}`
                                                : '—'}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(reg.payment_status)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={`Edit ${reg.full_name}`}
                                                onClick={() => openEditDialog(reg)}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={editingRegistration !== null} onOpenChange={(open) => !open && closeEditDialog()}>
                <DialogContent className="sm:max-w-[640px]">
                    <DialogHeader>
                        <DialogTitle>Edit Registration</DialogTitle>
                        <DialogDescription>
                            Update attendee and payment details for registration #{editingRegistration?.id}.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="registration-name">Full Name</Label>
                                <Input
                                    id="registration-name"
                                    value={formData.full_name}
                                    onChange={(event) => setFormData({ ...formData, full_name: event.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registration-email">Email</Label>
                                <Input
                                    id="registration-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registration-phone">Phone Number</Label>
                                <Input
                                    id="registration-phone"
                                    value={formData.phone_number}
                                    onChange={(event) => setFormData({ ...formData, phone_number: event.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registration-participants">Participants</Label>
                                <Input
                                    id="registration-participants"
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={formData.number_of_participants}
                                    onChange={(event) => setFormData({ ...formData, number_of_participants: Number(event.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registration-total">Total Amount (GHS)</Label>
                                <Input
                                    id="registration-total"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.total_amount}
                                    onChange={(event) => setFormData({ ...formData, total_amount: Number(event.target.value) })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="registration-paid">Amount Paid (GHS)</Label>
                                <Input
                                    id="registration-paid"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.amount_paid}
                                    onChange={(event) => setFormData({ ...formData, amount_paid: Number(event.target.value) })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Payment Status</Label>
                            <Select value={formData.payment_status} onValueChange={handleStatusChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a payment status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="pay_later">Pay Later</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Balance: GHS {Math.max(0, Number(formData.total_amount || 0) - Number(formData.amount_paid || 0)).toFixed(2)}
                            </p>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeEditDialog} disabled={saving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventRegistrations;
