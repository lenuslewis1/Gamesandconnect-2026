import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useGalleryImages } from "@/hooks/useSupabaseData";

const Hero = () => {
    const { data: galleryImages = [] } = useGalleryImages();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (galleryImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [galleryImages.length]);

    return (
        <section className="relative h-screen overflow-hidden bg-black">
            {/* Background Carousel */}
            <div className="absolute inset-0 z-0">
                {galleryImages.length > 0 ? (
                    galleryImages.map((image, index) => (
                        <img
                            key={image.id}
                            src={image.image_url}
                            alt="Hero Background"
                            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                                }`}
                        />
                    ))
                ) : (
                    <img
                        src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg"
                        alt="Hero Background"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}
                {/* Subtle bottom gradient only */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />
            </div>

            {/* Bottom-left text content */}
            <div className="absolute bottom-0 left-0 z-20 px-8 md:px-16 pb-14 md:pb-20 max-w-2xl">
                <p className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-white/70 mb-4 font-medium">
                    Ghana's #1 Youth Community
                </p>

                <h1 className="font-serif text-4xl md:text-6xl lg:text-[5.5rem] font-medium text-white leading-[1.05] mb-5">
                    Play. Travel.
                    <br />
                    <span className="text-primary">Connect.</span>
                </h1>

                <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-white/60 mb-0 font-light">
                    Epic game nights, road trips & experiences for young people
                </p>

                <Link
                    to="/events"
                    className="inline-flex items-center mt-8 text-xs tracking-[0.2em] uppercase text-white/80 hover:text-primary transition-colors duration-300 group"
                >
                    Explore Events
                    <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
            </div>
        </section>
    );
};


export default Hero;
