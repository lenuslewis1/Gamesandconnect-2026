import { useEffect, useId, useState } from "react";
import { ArrowDown, ArrowUp, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type EventImageDraft = string | File;

function isValidImage(file: File) {
    return file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024;
}

interface ImageFieldProps {
    label: string;
    image?: EventImageDraft | null;
    onSelect: (file: File) => void;
    onRemove?: () => void;
    moveUp?: () => void;
    moveDown?: () => void;
    flyer?: boolean;
}

function ImageField({ label, image, onSelect, onRemove, moveUp, moveDown, flyer }: ImageFieldProps) {
    const id = useId();
    const [filePreview, setFilePreview] = useState<string>();
    const [previewFailed, setPreviewFailed] = useState(false);
    const source = typeof image === "string" ? image : filePreview;

    useEffect(() => {
        setPreviewFailed(false);
        if (!(image instanceof File)) {
            setFilePreview(undefined);
            return;
        }
        const url = URL.createObjectURL(image);
        setFilePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    return (
        <div className="flex items-start gap-3 rounded-lg border bg-background p-3">
            {source && !previewFailed ? (
                <img src={source} alt={label + " preview"} onError={() => setPreviewFailed(true)}
                    className={"h-20 w-20 shrink-0 rounded-md bg-muted " + (flyer ? "object-contain" : "object-cover")} />
            ) : (
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground">
                    <ImageIcon className="h-6 w-6" aria-hidden="true" />
                </div>
            )}
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                    <Label htmlFor={id}>{label}</Label>
                    <div className="flex gap-1">
                        {moveUp && <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={moveUp} aria-label={"Move " + label + " up"}><ArrowUp aria-hidden="true" className="h-4 w-4" /></Button>}
                        {moveDown && <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={moveDown} aria-label={"Move " + label + " down"}><ArrowDown aria-hidden="true" className="h-4 w-4" /></Button>}
                        {image && onRemove && <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={onRemove} aria-label={"Remove " + label}><X aria-hidden="true" className="h-4 w-4" /></Button>}
                    </div>
                </div>
                {previewFailed && <p className="text-xs text-muted-foreground">Preview unavailable. Choose a replacement image if needed.</p>}
                <Input
                    id={id}
                    type="file"
                    accept="image/*"
                    className="cursor-pointer text-sm"
                    onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        event.currentTarget.value = "";
                        if (!file) return;
                        if (!isValidImage(file)) {
                            toast.error("Choose an image file no larger than 5 MB.");
                            return;
                        }
                        onSelect(file);
                    }}
                />
            </div>
        </div>
    );
}

const photoLabel = (index: number) => (
    ["Hero photo", "Supporting photo 1", "Supporting photo 2"][index] || "Additional photo " + (index - 2)
);

interface EventMediaFieldsProps {
    flyer: EventImageDraft | null;
    gallery: EventImageDraft[];
    onFlyerChange: (value: EventImageDraft | null) => void;
    onGalleryChange: (value: EventImageDraft[]) => void;
}

export default function EventMediaFields({ flyer, gallery, onFlyerChange, onGalleryChange }: EventMediaFieldsProps) {
    const galleryInputId = useId();
    const movePhoto = (from: number, to: number) => {
        const reordered = [...gallery];
        [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
        onGalleryChange(reordered);
    };

    return (
        <section className="space-y-4 rounded-lg border bg-muted/30 p-4" aria-labelledby="event-media-heading">
            <div>
                <h3 id="event-media-heading" className="font-semibold">Event page images</h3>
                <p className="mt-1 text-sm text-muted-foreground">The flyer appears beside the event details.</p>
            </div>
            <ImageField label="Event flyer" image={flyer} flyer onSelect={onFlyerChange} onRemove={() => onFlyerChange(null)} />
            <div className="space-y-2">
                <Label htmlFor={galleryInputId}>Upload gallery photos</Label>
                <Input
                    id={galleryInputId}
                    type="file"
                    accept="image/*"
                    multiple
                    aria-describedby={`${galleryInputId}-help`}
                    className="cursor-pointer text-sm"
                    onChange={event => {
                        const files = Array.from(event.currentTarget.files || []);
                        event.currentTarget.value = "";
                        const validFiles = files.filter(isValidImage);
                        if (validFiles.length < files.length) toast.error("Skipped files that are not images or exceed 5 MB.");
                        if (validFiles.length > 0) onGalleryChange([...gallery, ...validFiles]);
                    }}
                />
                <p id={`${galleryInputId}-help`} className="text-xs text-muted-foreground">
                    The first photo is the hero. The next two appear beside it. Reorder photos to choose which ones appear.
                </p>
                {gallery.map((photo, index) => (
                    <ImageField
                        key={index}
                        label={photoLabel(index)}
                        image={photo}
                        onSelect={file => onGalleryChange(gallery.map((item, photoIndex) => photoIndex === index ? file : item))}
                        onRemove={() => onGalleryChange(gallery.filter((_, photoIndex) => photoIndex !== index))}
                        moveUp={index > 0 ? () => movePhoto(index, index - 1) : undefined}
                        moveDown={index < gallery.length - 1 ? () => movePhoto(index, index + 1) : undefined}
                    />
                ))}
            </div>
            <p className="text-xs text-muted-foreground">Images up to 5 MB. An event without photos uses a Games &amp; Connect cover photo.</p>
        </section>
    );
}
