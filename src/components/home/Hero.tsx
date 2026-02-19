import { useState, useEffect, useCallback } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useGalleryImages } from "@/hooks/useSupabaseData";

const slides = [
    {
        tagline: "Ghana's #1 Youth Community",
        headline: "Play. Travel.",
        highlight: "Connect.",
        subtitle: "Epic game nights, road trips & experiences for young people",
    },
    {
        tagline: "Create Unforgettable Memories",
        headline: "Adventure",
        highlight: "Awaits.",
        subtitle: "Weekend getaways, scenic trips & outdoor fun across Ghana",
    },
    {
        tagline: "Level Up Your Social Life",
        headline: "Game On.",
        highlight: "Win Big.",
        subtitle: "Compete, laugh & connect at our legendary game day events",
    },
    {
        tagline: "Built for Connection",
        headline: "Your Tribe.",
        highlight: "Your Vibe.",
        subtitle: "Meet like-minded people who love fun, travel & good energy",
    },
];

const FALLBACK_IMAGE =
    "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg";

const Hero = () => {
    const { data: galleryImages = [] } = useGalleryImages();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const totalSlides = Math.max(galleryImages.length, slides.length, 1);

    const goToSlide = useCallback(
        (index: number) => {
            if (isTransitioning) return;
            setIsTransitioning(true);
            setCurrentIndex(index);
            setTimeout(() => setIsTransitioning(false), 800);
        },
        [isTransitioning]
    );

    const goNext = useCallback(() => {
        goToSlide((currentIndex + 1) % totalSlides);
    }, [currentIndex, totalSlides, goToSlide]);

    const goPrev = useCallback(() => {
        goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
    }, [currentIndex, totalSlides, goToSlide]);

    // Auto-advance every 6 seconds
    useEffect(() => {
        if (totalSlides <= 1) return;
        const interval = setInterval(goNext, 6000);
        return () => clearInterval(interval);
    }, [totalSlides, goNext]);

    // Get current slide copy (wraps around if fewer copy entries than images)
    const currentSlide = slides[currentIndex % slides.length];

    return (
        <section className="relative h-screen overflow-hidden bg-black">
            {/* Background Images */}
            <div className="absolute inset-0 z-0">
                {galleryImages.length > 0 ? (
                    galleryImages.map((image, index) => (
                        <img
                            key={image.id}
                            src={image.image_url}
                            alt="Hero Background"
                            className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-in-out ${index === currentIndex
                                    ? "opacity-100 scale-100"
                                    : "opacity-0 scale-105"
                                }`}
                        />
                    ))
                ) : (
                    <img
                        src={FALLBACK_IMAGE}
                        alt="Hero Background"
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10 z-10" />
            </div>

            {/* Slide Copy — Bottom Left */}
            <div className="absolute bottom-0 left-0 z-20 px-8 md:px-16 pb-20 md:pb-28 max-w-2xl">
                <p
                    key={`tagline-${currentIndex}`}
                    className="text-[11px] md:text-xs tracking-[0.3em] uppercase text-white/70 mb-4 font-medium animate-fade-in-up"
                >
                    {currentSlide.tagline}
                </p>

                <h1
                    key={`headline-${currentIndex}`}
                    className="font-serif text-4xl md:text-6xl lg:text-[5.5rem] font-medium text-white leading-[1.05] mb-5 animate-fade-in-up"
                    style={{ animationDelay: "0.1s" }}
                >
                    {currentSlide.headline}
                    <br />
                    <span className="text-primary">{currentSlide.highlight}</span>
                </h1>

                <p
                    key={`subtitle-${currentIndex}`}
                    className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-white/60 mb-0 font-light animate-fade-in-up"
                    style={{ animationDelay: "0.2s" }}
                >
                    {currentSlide.subtitle}
                </p>

                {/* Lime Green CTA Button */}
                <Link
                    to="/events"
                    className="inline-flex items-center mt-8 px-7 py-3 rounded-full bg-primary text-primary-foreground font-medium text-sm tracking-wide hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl group animate-fade-in-up"
                    style={{ animationDelay: "0.3s" }}
                >
                    Explore Events
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
            </div>

            {/* Navigation Arrows */}
            {totalSlides > 1 && (
                <div className="absolute bottom-8 right-8 md:right-16 z-20 flex items-center gap-3">
                    <button
                        onClick={goPrev}
                        disabled={isTransitioning}
                        className="h-10 w-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-40"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Dots */}
                    <div className="flex gap-2 mx-2">
                        {Array.from({ length: Math.min(totalSlides, 5) }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goToSlide(i)}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentIndex
                                        ? "w-8 bg-primary"
                                        : "w-2 bg-white/40 hover:bg-white/60"
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={goNext}
                        disabled={isTransitioning}
                        className="h-10 w-10 rounded-full border border-white/30 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white transition-all duration-300 disabled:opacity-40"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </section>
    );
};

export default Hero;
