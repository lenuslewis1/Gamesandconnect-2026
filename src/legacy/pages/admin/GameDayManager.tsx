import { useState, useRef } from "react";
import {
    useGameDayGallery,
    useGameDayScoreboards,
    useGameDayEvents,
    useAddGameDayImage,
    useDeleteGameDayImage,
    useUpdateScoreboard,
    useAddGameDayEvent,
    useUpdateGameDayEvent,
    useDeleteGameDayEvent
} from "@/hooks/useSupabaseData";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
    Trophy,
    Plus,
    Trash2,
    Image as ImageIcon,
    Loader2,
    Upload,
    Search,
    Edit,
    Save,
    X,
    Calendar,
    MapPin,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";

const galleryCategories = ["general", "tug_of_war", "sack_race", "dodgeball", "egg_spoon"];

const GameDayManager = () => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Game Day Manager</h2>
                <p className="text-muted-foreground">Manage scoreboards, gallery, and events for Game Day</p>
            </div>

            <Tabs defaultValue="scoreboards" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="scoreboards">Scoreboards</TabsTrigger>
                    <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="scoreboards" className="space-y-6">
                    <ScoreboardsTab />
                </TabsContent>

                <TabsContent value="gallery" className="space-y-6">
                    <GalleryTab />
                </TabsContent>

                <TabsContent value="events" className="space-y-6">
                    <EventsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
};

// Scoreboards Tab Component
const ScoreboardsTab = () => {
    const { data: scoreboards = [], isLoading } = useGameDayScoreboards();
    const updateMutation = useUpdateScoreboard();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState<any>({});

    const handleEdit = (scoreboard: any) => {
        setEditingId(scoreboard.id);
        setEditValues({
            wins: scoreboard.wins,
            season_points: scoreboard.season_points,
            description: scoreboard.description
        });
    };

    const handleSave = async (id: string) => {
        try {
            await updateMutation.mutateAsync({
                id,
                ...editValues
            });
            toast.success("Scoreboard updated successfully");
            setEditingId(null);
        } catch (error) {
            toast.error("Failed to update scoreboard");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[#4d7c0f]" />
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {scoreboards.map((scoreboard) => {
                const isEditing = editingId === scoreboard.id;

                return (
                    <Card key={scoreboard.id} className="overflow-hidden">
                        <div className={`h-2 ${scoreboard.team_color}`} />
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-12 w-12 rounded-full ${scoreboard.team_color} flex items-center justify-center`}>
                                        <Trophy className="h-6 w-6 text-white" />
                                    </div>
                                    <CardTitle>{scoreboard.team_name}</CardTitle>
                                </div>
                                {!isEditing ? (
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(scoreboard)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleSave(scoreboard.id)}>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Wins</label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editValues.wins}
                                            onChange={(e) => setEditValues({ ...editValues, wins: parseInt(e.target.value) })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-3xl font-bold mt-1">{scoreboard.wins}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Season Points</label>
                                    {isEditing ? (
                                        <Input
                                            type="number"
                                            value={editValues.season_points}
                                            onChange={(e) => setEditValues({ ...editValues, season_points: parseInt(e.target.value) })}
                                            className="mt-1"
                                        />
                                    ) : (
                                        <p className="text-3xl font-bold mt-1">{scoreboard.season_points}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Description</label>
                                {isEditing ? (
                                    <Input
                                        value={editValues.description}
                                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                        className="mt-1"
                                    />
                                ) : (
                                    <p className="text-sm mt-1">{scoreboard.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
};

// Gallery Tab Component
const GalleryTab = () => {
    const { data: images = [], isLoading } = useGameDayGallery();
    const addImageMutation = useAddGameDayImage();
    const deleteImageMutation = useDeleteGameDayImage();

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [category, setCategory] = useState("");
    const [eventDate, setEventDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const imageUrl = await uploadToCloudinary(selectedFile, "games-and-connect/game-day");
            await addImageMutation.mutateAsync({
                image_url: imageUrl,
                caption,
                category,
                event_date: eventDate || undefined
            });
            toast.success("Image uploaded successfully");
            handleCloseUpload();
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const handleCloseUpload = () => {
        setIsUploadOpen(false);
        setSelectedFile(null);
        setPreviewUrl(null);
        setCaption("");
        setCategory("");
        setEventDate("");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this image?")) {
            try {
                await deleteImageMutation.mutateAsync(id);
                toast.success("Image deleted");
            } catch (error) {
                toast.error("Failed to delete image");
            }
        }
    };

    const filteredImages = images.filter(img =>
    (img.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.category?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Game Day Gallery</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Manage photos from game day events</p>
                    </div>
                    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Add Photo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Upload Game Day Photo</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed rounded-xl aspect-[16/9] flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden group relative"
                                >
                                    {previewUrl ? (
                                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <>
                                            <Upload className="h-10 w-10 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                                            <p className="text-sm text-muted-foreground text-center px-4">
                                                Click to select or drag and drop<br />
                                                (JPG, PNG or WEBP)
                                            </p>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Caption (Optional)</label>
                                    <Input
                                        placeholder="Enter a brief description..."
                                        value={caption}
                                        onChange={(e) => setCaption(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category</label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {galleryCategories.map(cat => (
                                                <SelectItem key={cat} value={cat}>
                                                    {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Event Date (Optional)</label>
                                    <Input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={handleCloseUpload}>Cancel</Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={!selectedFile || uploading}
                                    className="gap-2"
                                >
                                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                    {uploading ? "Uploading..." : "Upload Photo"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by caption or category..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-[#4d7c0f]" />
                    </div>
                ) : filteredImages.length === 0 ? (
                    <div className="text-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed">
                        <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No images found</h3>
                        <p className="text-muted-foreground">Upload your first photo to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.map((image) => (
                            <div key={image.id} className="group relative aspect-square rounded-xl overflow-hidden bg-muted">
                                <img
                                    src={image.image_url}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    alt={image.caption || "Gallery image"}
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                    <p className="text-white text-xs text-center font-medium line-clamp-2">
                                        {image.caption || "No caption"}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleDelete(image.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                {image.category && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm text-[10px] text-white rounded-full uppercase tracking-wider">
                                        {image.category.replace(/_/g, ' ')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Events Tab Component
const EventsTab = () => {
    const { data: events = [], isLoading } = useGameDayEvents();
    const addMutation = useAddGameDayEvent();
    const updateMutation = useUpdateGameDayEvent();
    const deleteMutation = useDeleteGameDayEvent();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        event_date: "",
        event_time: "",
        location: "",
        description: "",
        is_upcoming: false,
        registration_link: ""
    });

    const handleOpenForm = (event?: any) => {
        if (event) {
            setEditingEvent(event);
            setFormData({
                title: event.title,
                event_date: event.event_date,
                event_time: event.event_time,
                location: event.location,
                description: event.description || "",
                is_upcoming: event.is_upcoming,
                registration_link: event.registration_link || ""
            });
        } else {
            setEditingEvent(null);
            setFormData({
                title: "",
                event_date: "",
                event_time: "",
                location: "",
                description: "",
                is_upcoming: false,
                registration_link: ""
            });
        }
        setIsFormOpen(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingEvent) {
                await updateMutation.mutateAsync({
                    id: editingEvent.id,
                    ...formData
                });
                toast.success("Event updated successfully");
            } else {
                await addMutation.mutateAsync(formData);
                toast.success("Event created successfully");
            }
            setIsFormOpen(false);
        } catch (error) {
            toast.error(`Failed to ${editingEvent ? 'update' : 'create'} event`);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success("Event deleted");
            } catch (error) {
                toast.error("Failed to delete event");
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Game Day Events</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Manage upcoming and past game day events</p>
                    </div>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenForm()} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Event Title</label>
                                    <Input
                                        placeholder="e.g., November Game Day"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Date</label>
                                        <Input
                                            type="date"
                                            value={formData.event_date}
                                            onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Time</label>
                                        <Input
                                            placeholder="e.g., 2:00 PM"
                                            value={formData.event_time}
                                            onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input
                                        placeholder="e.g., Legon Botanical Gardens"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description (Optional)</label>
                                    <Textarea
                                        placeholder="Event description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Registration Link (Optional)</label>
                                    <Input
                                        placeholder="https://..."
                                        value={formData.registration_link}
                                        onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="is_upcoming"
                                        checked={formData.is_upcoming}
                                        onChange={(e) => setFormData({ ...formData, is_upcoming: e.target.checked })}
                                        className="rounded"
                                    />
                                    <label htmlFor="is_upcoming" className="text-sm font-medium">
                                        Mark as upcoming event
                                    </label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                                <Button onClick={handleSubmit}>
                                    {editingEvent ? 'Update Event' : 'Create Event'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 animate-spin text-[#4d7c0f]" />
                    </div>
                ) : events.length === 0 ? (
                    <div className="text-center py-24 bg-muted/20 rounded-2xl border-2 border-dashed">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No events found</h3>
                        <p className="text-muted-foreground">Create your first event to get started</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <Card key={event.id} className="overflow-hidden">
                                {event.is_upcoming && (
                                    <div className="h-1 bg-primary" />
                                )}
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-3 flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold">{event.title}</h3>
                                                {event.is_upcoming && (
                                                    <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                                                        Upcoming
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {format(new Date(event.event_date), 'MMM dd, yyyy')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" />
                                                    {event.event_time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {event.location}
                                                </span>
                                            </div>
                                            {event.description && (
                                                <p className="text-sm text-muted-foreground">{event.description}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <Button size="sm" variant="outline" onClick={() => handleOpenForm(event)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default GameDayManager;
