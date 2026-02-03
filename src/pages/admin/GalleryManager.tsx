
import { useState, useRef } from "react";
import {
    useGalleryImages,
    useAddGalleryImage,
    useDeleteGalleryImage
} from "@/hooks/useSupabaseData";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
    Plus,
    Trash2,
    Image as ImageIcon,
    Loader2,
    Upload,
    X,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
import { toast } from "sonner";

const categories = ["Games", "Travel", "Parties", "Trivia", "Community"];

const GalleryManager = () => {
    const { data: images = [], isLoading } = useGalleryImages();
    const addImageMutation = useAddGalleryImage();
    const deleteImageMutation = useDeleteGalleryImage();

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [caption, setCaption] = useState("");
    const [category, setCategory] = useState("");
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
            const imageUrl = await uploadToCloudinary(selectedFile, "games-and-connect/gallery");
            await addImageMutation.mutateAsync({
                image_url: imageUrl,
                caption,
                category
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gallery Management</h2>
                    <p className="text-muted-foreground">Manage your website's photo gallery</p>
                </div>
                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Add Photo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Upload New Photo</DialogTitle>
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
                                        {categories.map(cat => (
                                            <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

            <Card>
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
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                                            {image.category}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default GalleryManager;
