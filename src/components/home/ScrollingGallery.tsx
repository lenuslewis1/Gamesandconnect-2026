import { useRef, useEffect } from "react";
import { useGalleryImages } from "@/hooks/useSupabaseData";

const defaultRow1 = [
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1344_y4iq2a.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1679_ovnanp.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg", // Red
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg", // Green
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1414_ij80mu.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg", // Blue
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915401/_MG_2185_rqpdrv.jpg", // Yellow
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1656_yoiklo.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915388/_MG_2318_kszvtt.jpg", // Red
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915389/_MG_2356_nlkxwl.jpg", // Green
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1758_mj5kho.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915400/_MG_2284_njl6kn.jpg", // Blue
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915388/_MG_2118_gi8okx.jpg", // Yellow
];

const defaultRow2 = [
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1684_pv0ohb.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1424_f0harp.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918852/_MG_2075_i2peyk.jpg", // Red
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2214_zq4dzb.jpg", // Green
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1623_olhksw.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915395/_MG_2305_z4ozhb.jpg", // Blue
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915393/_MG_2181_oohsbh.jpg", // Yellow
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1677_v8n5nu.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915382/_MG_2210_swxpme.jpg", // Green
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1776_eob5jv.jpg",
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915383/_MG_2106_epgam5.jpg", // Blue
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918852/_MG_2336_mxnylu.jpg", // Green
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/back_k2fwpf.jpg",
];

const ScrollingGallery = () => {
    const { data: dbImages = [] } = useGalleryImages();

    // Split DB images into two rows if they exist, otherwise use defaults
    const displayRow1 = dbImages.length > 0
        ? dbImages.filter((_, i) => i % 2 === 0).map(img => img.image_url)
        : defaultRow1;

    const displayRow2 = dbImages.length > 0
        ? dbImages.filter((_, i) => i % 2 !== 0).map(img => img.image_url)
        : defaultRow2;

    // Duplicate images for infinite scroll effect (3x ensures smooth loop)
    const row1 = [...displayRow1, ...displayRow1, ...displayRow1];
    const row2 = [...displayRow2, ...displayRow2, ...displayRow2];

    return (
        <section className="py-24 overflow-hidden bg-background">
            <div className="container mb-12 text-center">
                <h2 className="font-serif text-4xl md:text-6xl font-medium mb-4">Captured Moments</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                    Snapshots from our favorite adventures, game nights, and community gatherings.
                </p>
            </div>

            <div className="space-y-8">
                {/* Row 1: Left Scroll */}
                <div className="relative w-full overflow-hidden">
                    <div className="flex gap-6 animate-scroll-left w-fit hover:pause-on-hover">
                        {row1.map((src, i) => (
                            <div key={`row1-${i}`} className="relative h-[250px] md:h-[350px] aspect-[4/3] rounded-[2rem] overflow-hidden shrink-0 select-none shadow-sm">
                                <img
                                    src={src}
                                    alt="Gallery"
                                    className="h-full w-full object-cover pointer-events-none"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Row 2: Right Scroll */}
                <div className="relative w-full overflow-hidden">
                    <div className="flex gap-6 animate-scroll-right w-fit hover:pause-on-hover" style={{ transform: 'translateX(-50%)' }}>
                        {row2.map((src, i) => (
                            <div key={`row2-${i}`} className="relative h-[250px] md:h-[350px] aspect-[4/3] rounded-[2rem] overflow-hidden shrink-0 select-none shadow-sm">
                                <img
                                    src={src}
                                    alt="Gallery"
                                    className="h-full w-full object-cover pointer-events-none"
                                    loading="lazy"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ScrollingGallery;
