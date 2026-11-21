import type { DbEvent } from "@/lib/supabase";
import { beachGallery } from "./beachGallery";
import { savannahRecapPhotos } from "./savannahGallery";

export type EventPhoto = { src: string; alt: string; position?: string };

const islandImagePath = "/assets/games-connect/island-camping/";
const bundledPhotos: Record<number, EventPhoto[]> = {
    39: [beachGallery[0], beachGallery[12], beachGallery[26]].map(photo => ({
        src: photo.image_url,
        alt: photo.caption,
    })),
    40: savannahRecapPhotos.map(photo => ({
        src: photo.image_url,
        alt: photo.caption || "Savannah Experience",
    })),
    41: [
        { src: islandImagePath + "lakeside-camp.webp", alt: "Tents by the lake beneath a spreading tree at sunset", position: "50% 76%" },
        { src: islandImagePath + "boat-ride.webp", alt: "Blue boat crossing the lake", position: "50% 61%" },
        { src: islandImagePath + "shoreline-walk.webp", alt: "Group walking along the lake shore", position: "50% 68%" },
    ],
};

export function eventPhotos(event: Pick<DbEvent, "id" | "title" | "gallery" | "image_url">): EventPhoto[] {
    const defaults = bundledPhotos[event.id] || [];
    if (!Array.isArray(event.gallery)) return defaults;

    const urls = event.gallery
        .filter(src => typeof src === "string")
        .map(src => src.trim())
        .filter(src => src && src !== event.image_url);
    return [...new Set(urls)].map((src, index) =>
        defaults.find(photo => photo.src === src) || { src, alt: event.title + " · Photo " + (index + 1) }
    );
}
