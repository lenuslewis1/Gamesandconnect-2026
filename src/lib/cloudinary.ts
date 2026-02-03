import { supabase } from "./supabase";

export interface CloudinaryUploadResult {
    url: string;
    public_id: string;
    width?: number;
    height?: number;
}

/**
 * Converts a File to a base64 data URL
 */
async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Uploads an image to Cloudinary via the Edge Function
 * @param file - The image file to upload
 * @param folder - Optional folder path in Cloudinary (default: "games-and-connect/events")
 * @returns The Cloudinary URL of the uploaded image
 */
export async function uploadToCloudinary(
    file: File,
    folder: string = "games-and-connect/events"
): Promise<string> {
    // Convert file to base64
    const base64Data = await fileToBase64(file);

    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke<CloudinaryUploadResult>(
        "cloudinary-upload",
        {
            body: {
                imageData: base64Data,
                folder,
            },
        }
    );

    if (error) {
        console.error("Cloudinary upload error:", error);
        throw new Error(error.message || "Failed to upload image");
    }

    if (!data?.url) {
        throw new Error("No URL returned from upload");
    }

    return data.url;
}
