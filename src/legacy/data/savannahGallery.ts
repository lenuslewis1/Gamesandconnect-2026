import type { DbGalleryImage } from "@/lib/supabase";

const photos = [
  "6282", "6283", "6290", "6292", "6300", "6301", "6305", "6311", "6317", "6319",
  "6323", "6325", "6326", "6329", "6330", "6333", "6335", "6341", "6343", "6346",
  "6347", "6352", "6357", "6360", "6363",
];

export const savannahGallery: DbGalleryImage[] = [
  ...photos.map((photo, index) => ({
    id: `savannah-${photo}`,
    image_url: `/assets/games-connect/savannah-recap/jtn_${photo}.webp`,
    caption: `The Savannah Experience · Photo ${index + 1}`,
    category: "travel",
    created_at: "2026-09-18T00:00:00Z",
  })),
  ...[
    ["6397", "Travelers and their safari guide"],
    ["6411", "Friends ready for the Savannah adventure"],
    ["6478", "Friends together on the road"],
    ["6568", "The group at Mole National Park"],
    ["6606", "A group moment at the park"],
    ["6608", "The Savannah travelers together"],
    ["6766", "Friends exploring a rock shelter"],
    ["6780", "The group on the Savannah journey"],
  ].map(([photo, caption]) => ({
    id: `savannah-${photo}`,
    image_url: `/assets/games-connect/savannah/JTN_${photo}.webp`,
    caption: `The Savannah Experience · ${caption}`,
    category: "travel",
    created_at: "2026-09-18T00:00:00Z",
  })),
];

// A shorter, curated set for the past-event recap: people, wildlife, and landscape.
export const savannahRecapPhotos = [
  savannahGallery[7],
  savannahGallery[8],
  savannahGallery[14],
  savannahGallery[18],
  savannahGallery[19],
  savannahGallery[20],
  savannahGallery[21],
  savannahGallery[22],
  savannahGallery[23],
  savannahGallery[24],
];
