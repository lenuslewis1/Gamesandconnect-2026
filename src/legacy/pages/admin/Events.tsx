
import { useEffect, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase, type DbEvent } from "@/lib/supabase";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Loader2, Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import EventMediaFields, { type EventImageDraft } from "@/components/admin/EventMediaFields";
import { eventPhotos } from "@/data/eventPhotos";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface Event extends DbEvent {
    organizer: string | null;
}

interface TicketTier {
    id?: number;
    event_id?: number;
    name: string;
    description: string;
    price: number;
    capacity: number | null;
    sort_order: number;
}

const initialFormState = {
    title: "",
    date: "",
    time_range: "",
    location: "",
    description: "",
    capacity: 0,
    category: "",
    organizer: "",
};

const createDefaultTier = (): TicketTier => ({
    name: "Standard",
    description: "",
    price: 0,
    capacity: null,
    sort_order: 0,
});

const Events = () => {
    const queryClient = useQueryClient();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([createDefaultTier()]);
    const [originalTierIds, setOriginalTierIds] = useState<number[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [flyer, setFlyer] = useState<EventImageDraft | null>(null);
    const [gallery, setGallery] = useState<EventImageDraft[]>([]);
    const saving = useRef(false);
    const [loadingEditor, setLoadingEditor] = useState(false);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data, error } = await supabase
                .from("events")
                .select("*")
                .order("date", { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error("Error fetching events:", error);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const fetchTicketTiers = async (eventId: number) => {
        const { data, error } = await supabase
            .from("ticket_tiers")
            .select("*")
            .eq("event_id", eventId)
            .order("sort_order");

        if (error) throw error;
        return (data || []).map((tier) => ({
            ...tier,
            description: tier.description || "",
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "capacity" ? parseInt(value) || 0 : value,
        }));
    };

    const handleTierChange = (index: number, field: keyof TicketTier, value: any) => {
        setTicketTiers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addTier = () => {
        setTicketTiers(prev => [
            ...prev,
            { ...createDefaultTier(), sort_order: prev.length },
        ]);
    };

    const removeTier = (index: number) => {
        if (ticketTiers.length <= 1) {
            toast.error("At least one ticket tier is required");
            return;
        }
        setTicketTiers(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        setFormData(initialFormState);
        setTicketTiers([createDefaultTier()]);
        setOriginalTierIds([]);
        setIsEditing(false);
        setEditingEventId(null);
        setFlyer(null);
        setGallery([]);
    };

    const openEditDialog = async (event: Event) => {
        setLoadingEditor(true);
        setFormData({
            title: event.title,
            date: event.date,
            time_range: event.time_range,
            location: event.location,
            description: event.description,
            capacity: event.capacity,
            category: event.category || "",
            organizer: event.organizer || "",
        });
        setFlyer(event.image_url);
        setGallery(eventPhotos(event).map(photo => photo.src));
        setIsEditing(true);
        setEditingEventId(event.id);

        try {
            const existingTiers = await fetchTicketTiers(event.id);
            if (existingTiers.length > 0) {
                setTicketTiers(existingTiers);
                setOriginalTierIds(existingTiers.flatMap((tier) => tier.id === undefined ? [] : [tier.id]));
            } else {
                const legacyPrice = parseFloat(event.price?.replace(/[^0-9.]/g, '') || "0");
                setTicketTiers([{ ...createDefaultTier(), price: legacyPrice }]);
                setOriginalTierIds([]);
            }
            setIsDialogOpen(true);
        } catch (error) {
            console.error("Error loading tickets for event editor:", error);
            toast.error("Could not load this event's ticket tiers. Try opening the editor again.");
            resetForm();
        } finally {
            setLoadingEditor(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving.current) return;
        saving.current = true;
        setSubmitting(true);

        const uploaded = new Map<File, string>();
        const resolveImage = async (image: EventImageDraft) => {
            if (typeof image === "string") return image;
            const previous = uploaded.get(image);
            if (previous) return previous;
            try {
                const url = await uploadToCloudinary(image);
                uploaded.set(image, url);
                return url;
            } catch {
                throw new Error(`Could not upload "${image.name}". Please try again or choose a different image.`);
            }
        };

        try {
            const imageUrl = flyer ? await resolveImage(flyer) : null;
            const galleryUrls: string[] = [];
            for (const photo of gallery) galleryUrls.push(await resolveImage(photo));

            // Calculate min price from tiers for legacy compatibility
            const minPrice = Math.min(...ticketTiers.map(t => t.price));
            const priceDisplay = ticketTiers.length > 1
                ? `From GHS ${minPrice}`
                : `GHS ${minPrice}`;

            const eventData = {
                ...formData,
                image_url: imageUrl,
                gallery: galleryUrls,
                price: priceDisplay,
            };

            let eventId = editingEventId;

            if (isEditing && editingEventId !== null) {
                const { data: updatedEvent, error } = await supabase
                    .from("events")
                    .update(eventData)
                    .eq("id", editingEventId)
                    .select()
                    .single();

                if (error) throw error;
                if (!updatedEvent) throw new Error("The event was not updated. Please check your admin permissions.");

            } else {
                const { data, error } = await supabase
                    .from("events")
                    .insert([eventData])
                    .select()
                    .single();

                if (error) throw error;
                eventId = data.id;
            }

            // Preserve existing tier IDs because registrations may reference them.
            if (eventId !== null) {
                for (const [index, tier] of ticketTiers.entries()) {
                    const tierData = {
                        event_id: eventId,
                        name: tier.name,
                        description: tier.description || null,
                        price: tier.price,
                        capacity: tier.capacity,
                        sort_order: index,
                    };

                    if (isEditing && tier.id !== undefined) {
                        const { data: updatedTier, error: tierError } = await supabase
                            .from("ticket_tiers")
                            .update(tierData)
                            .eq("id", tier.id)
                            .eq("event_id", eventId)
                            .select("id")
                            .single();

                        if (tierError) throw tierError;
                        if (!updatedTier) throw new Error(`Ticket tier "${tier.name}" was not updated.`);
                    } else {
                        const { error: tierError } = await supabase
                            .from("ticket_tiers")
                            .insert(tierData);

                        if (tierError) throw tierError;
                    }
                }

                if (isEditing) {
                    const retainedTierIds = new Set(
                        ticketTiers.flatMap((tier) => tier.id === undefined ? [] : [tier.id]),
                    );
                    const removedTierIds = originalTierIds.filter((id) => !retainedTierIds.has(id));

                    if (removedTierIds.length > 0) {
                        const { data: deletedTiers, error: deleteTiersError } = await supabase
                            .from("ticket_tiers")
                            .delete()
                            .eq("event_id", eventId)
                            .in("id", removedTierIds)
                            .select("id");

                        if (deleteTiersError) throw deleteTiersError;
                        if ((deletedTiers || []).length !== removedTierIds.length) {
                            throw new Error("One or more removed ticket tiers could not be deleted.");
                        }
                    }
                }
            }

            await queryClient.invalidateQueries({ queryKey: ["events"] });
            await fetchEvents();
            toast.success(isEditing ? "Event updated successfully!" : "Event created successfully!");
            setIsDialogOpen(false);
            resetForm();
        } catch (error: any) {
            // Keep URLs from completed uploads if a later upload or the save failed.
            const keepUpload = (image: EventImageDraft) => typeof image === "string" ? image : uploaded.get(image) || image;
            setFlyer(current => current && keepUpload(current));
            setGallery(current => current.map(keepUpload));
            console.error("Error saving event:", error);
            toast.error(error.message || "Failed to save event");
        } finally {
            saving.current = false;
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const { data: deletedEvent, error } = await supabase
                .from("events")
                .delete()
                .eq("id", id)
                .select("id")
                .single();
            if (error) throw error;
            if (!deletedEvent) throw new Error("The event was not deleted. Please check your admin permissions.");
            await queryClient.invalidateQueries({ queryKey: ["events"] });
            await fetchEvents();
            toast.success("Event deleted successfully!");
        } catch (error: any) {
            console.error("Error deleting event:", error);
            toast.error(error.message || "Failed to delete event");
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
                <h2 className="text-3xl font-bold tracking-tight">Events</h2>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (saving.current) return;
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button disabled={loadingEditor}>
                            <Plus className="mr-2 h-4 w-4" /> Add Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{isEditing ? "Edit Event" : "Create New Event"}</DialogTitle>
                            <DialogDescription>
                                {isEditing ? "Update the event details below." : "Fill in the details for the new event."}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                          <fieldset disabled={submitting} className="min-w-0 space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title *</Label>
                                    <Input id="title" name="title" value={formData.title} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">Date *</Label>
                                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="time_range">Time Range *</Label>
                                    <Input id="time_range" name="time_range" placeholder="e.g., 10:00 AM - 4:00 PM" value={formData.time_range} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location *</Label>
                                    <Input id="location" name="location" value={formData.location} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea id="description" name="description" rows={3} value={formData.description} onChange={handleInputChange} required />
                            </div>

                            <EventMediaFields flyer={flyer} gallery={gallery} onFlyerChange={setFlyer} onGalleryChange={setGallery} />

                            {/* Ticket Tiers Section */}
                            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Ticket Tiers</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addTier}>
                                        <Plus className="mr-1 h-3 w-3" /> Add Tier
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {ticketTiers.map((tier, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-md bg-background">
                                            <div className="col-span-4 space-y-1">
                                                <Label className="text-xs">Tier Name *</Label>
                                                <Input
                                                    placeholder="e.g., Standard, VIP, Double"
                                                    value={tier.name}
                                                    onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-3 space-y-1">
                                                <Label className="text-xs">Price (GHS) *</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={tier.price}
                                                    onChange={(e) => handleTierChange(index, 'price', parseFloat(e.target.value) || 0)}
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <Label className="text-xs">Capacity</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    placeholder="∞"
                                                    value={tier.capacity || ''}
                                                    onChange={(e) => handleTierChange(index, 'capacity', e.target.value ? parseInt(e.target.value) : null)}
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-1">
                                                <Label className="text-xs">Description</Label>
                                                <Input
                                                    placeholder="Optional"
                                                    value={tier.description}
                                                    onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => removeTier(index)}
                                                    disabled={ticketTiers.length <= 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="capacity">Total Capacity *</Label>
                                    <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Input id="category" name="category" placeholder="e.g., Game Day" value={formData.category} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="organizer">Organizer</Label>
                                <Input id="organizer" name="organizer" value={formData.organizer} onChange={handleInputChange} />
                            </div>

                            <DialogFooter>
                                <Button type="submit">
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {submitting ? "Saving…" : isEditing ? "Save Changes" : "Create Event"}
                                </Button>
                            </DialogFooter>
                          </fieldset>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Events</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-16">Flyer</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        No events found. Create one to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                events.map((event) => (
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            {event.image_url ? (
                                                <img
                                                    src={event.image_url}
                                                    alt={event.title}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{format(new Date(event.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="font-medium">{event.title}</TableCell>
                                        <TableCell>{event.location}</TableCell>
                                        <TableCell>{event.capacity}</TableCell>
                                        <TableCell>
                                            {event.category ? <Badge variant="secondary">{event.category}</Badge> : "-"}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" aria-label={"Edit " + event.title} disabled={loadingEditor} onClick={() => openEditDialog(event)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the event "{event.title}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-red-500 hover:bg-red-600">
                                                            Delete
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

export default Events;
