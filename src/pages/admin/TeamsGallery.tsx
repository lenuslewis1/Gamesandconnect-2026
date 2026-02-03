import { useState, useRef } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
    Plus,
    Trash2,
    Loader2,
    Upload,
    X,
    Search,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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

// Team configuration
const teams = [
    { id: "red", name: "Team Red", color: "bg-red-500", borderColor: "border-red-500" },
    { id: "green", name: "Team Green", color: "bg-green-500", borderColor: "border-green-500" },
    { id: "blue", name: "Team Blue", color: "bg-blue-500", borderColor: "border-blue-500" },
    { id: "yellow", name: "Team Yellow", color: "bg-yellow-500", borderColor: "border-yellow-500" },
];

// Local storage key for team images
const STORAGE_KEY = "vibes_ventures_team_images";

interface TeamImage {
    id: string;
    teamId: string;
    imageUrl: string;
    caption?: string;
    createdAt: string;
}

// Simple local storage persistence for team images
// This can be migrated to Supabase later
const getStoredImages = (): TeamImage[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch {
            return [];
        }
    }
    // Initialize with default images if none stored
    const defaultImages: TeamImage[] = [
        // Team Red
        { id: "red-1", teamId: "red", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg", createdAt: new Date().toISOString() },
        { id: "red-2", teamId: "red", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918852/_MG_2075_i2peyk.jpg", createdAt: new Date().toISOString() },
        { id: "red-3", teamId: "red", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915388/_MG_2318_kszvtt.jpg", createdAt: new Date().toISOString() },
        // Team Green
        { id: "green-1", teamId: "green", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg", createdAt: new Date().toISOString() },
        { id: "green-2", teamId: "green", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2214_zq4dzb.jpg", createdAt: new Date().toISOString() },
        { id: "green-3", teamId: "green", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915389/_MG_2356_nlkxwl.jpg", createdAt: new Date().toISOString() },
        { id: "green-4", teamId: "green", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915382/_MG_2210_swxpme.jpg", createdAt: new Date().toISOString() },
        { id: "green-5", teamId: "green", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918852/_MG_2336_mxnylu.jpg", createdAt: new Date().toISOString() },
        // Team Blue
        { id: "blue-1", teamId: "blue", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg", createdAt: new Date().toISOString() },
        { id: "blue-2", teamId: "blue", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915400/_MG_2284_njl6kn.jpg", createdAt: new Date().toISOString() },
        { id: "blue-3", teamId: "blue", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915395/_MG_2305_z4ozhb.jpg", createdAt: new Date().toISOString() },
        { id: "blue-4", teamId: "blue", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915383/_MG_2106_epgam5.jpg", createdAt: new Date().toISOString() },
        // Team Yellow
        { id: "yellow-1", teamId: "yellow", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915401/_MG_2185_rqpdrv.jpg", createdAt: new Date().toISOString() },
        { id: "yellow-2", teamId: "yellow", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915388/_MG_2118_gi8okx.jpg", createdAt: new Date().toISOString() },
        { id: "yellow-3", teamId: "yellow", imageUrl: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915393/_MG_2181_oohsbh.jpg", createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultImages));
    return defaultImages;
};

const saveImages = (images: TeamImage[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
};

const TeamsGallery = () => {
    const [images, setImages] = useState<TeamImage[]>(() => getStoredImages());
    const [selectedTeam, setSelectedTeam] = useState("red");
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [uploadTeam, setUploadTeam] = useState("red");

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
            const imageUrl = await uploadToCloudinary(selectedFile, `games-and-connect/teams/${uploadTeam}`);
            const newImage: TeamImage = {
                id: `${uploadTeam}-${Date.now()}`,
                teamId: uploadTeam,
                imageUrl,
                caption,
                createdAt: new Date().toISOString()
            };
            const updatedImages = [...images, newImage];
            setImages(updatedImages);
            saveImages(updatedImages);
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
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this image?")) {
            const updatedImages = images.filter(img => img.id !== id);
            setImages(updatedImages);
            saveImages(updatedImages);
            toast.success("Image deleted");
        }
    };

    const getTeamImages = (teamId: string) => {
        return images.filter(img => img.teamId === teamId);
    };

    const currentTeam = teams.find(t => t.id === selectedTeam);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Teams Gallery</h2>
                    <p className="text-muted-foreground">Manage photos for each team</p>
                </div>
                <Button className="gap-2" onClick={() => {
                    setUploadTeam(selectedTeam);
                    setIsUploadOpen(true);
                }}>
                    <Plus className="h-4 w-4" /> Add Photo
                </Button>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {teams.map(team => (
                    <Card key={team.id} className={`cursor-pointer transition-all hover:shadow-md ${selectedTeam === team.id ? `ring-2 ring-offset-2 ${team.borderColor}` : ''}`}
                        onClick={() => setSelectedTeam(team.id)}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`${team.color} h-10 w-10 rounded-full flex items-center justify-center text-white`}>
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">{team.name}</p>
                                <p className="text-sm text-muted-foreground">{getTeamImages(team.id).length} photos</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Team Gallery */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className={`${currentTeam?.color} h-6 w-6 rounded-full`} />
                        {currentTeam?.name} Gallery
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {getTeamImages(selectedTeam).length === 0 ? (
                        <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed">
                            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No images for {currentTeam?.name}</h3>
                            <p className="text-muted-foreground mb-4">Upload photos to display in the team gallery</p>
                            <Button onClick={() => {
                                setUploadTeam(selectedTeam);
                                setIsUploadOpen(true);
                            }}>
                                <Plus className="h-4 w-4 mr-2" /> Add First Photo
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {getTeamImages(selectedTeam).map((image) => (
                                <div key={image.id} className="group relative aspect-square rounded-xl overflow-hidden bg-muted">
                                    <img
                                        src={image.imageUrl}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        alt={image.caption || "Team image"}
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                        {image.caption && (
                                            <p className="text-white text-xs text-center font-medium line-clamp-2">
                                                {image.caption}
                                            </p>
                                        )}
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
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upload Dialog */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Team Photo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Team</label>
                            <Select value={uploadTeam} onValueChange={setUploadTeam}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map(team => (
                                        <SelectItem key={team.id} value={team.id}>
                                            <div className="flex items-center gap-2">
                                                <div className={`${team.color} h-3 w-3 rounded-full`} />
                                                {team.name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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
    );
};

export default TeamsGallery;

// Export function to get team images for use in TeamDetail page
export const getTeamImagesFromStorage = (teamId: string): string[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const images: TeamImage[] = JSON.parse(stored);
            return images.filter(img => img.teamId === teamId).map(img => img.imageUrl);
        } catch {
            return [];
        }
    }
    return [];
};
