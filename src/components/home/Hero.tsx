import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TextMotion from "@/components/ui/TextMotion";
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
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Background Carousel */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10" />
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
            </div>

            <div className="container relative z-20 flex flex-col items-center justify-center text-center max-w-4xl mx-auto px-4 mt-10">
                <ScrollReveal delay={0.1} className="w-full flex justify-center">
                    <div className="inline-flex items-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-4 py-2 text-sm font-medium text-white mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Join the #1 Youth Community in Ghana
                    </div>
                </ScrollReveal>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-lg text-center w-full">
                    <TextMotion text="Play. Travel." variant="word" delay={0.2} />
                    <br />
                    <TextMotion text="Connect." variant="word" delay={0.6} className="text-primary" />
                </h1>

                <TextMotion
                    text="Looking for your squad? We curate epic game nights, road trips, and experiences designed to help you meet new people and make lifelong friends."
                    variant="word"
                    delay={0.8}
                    stagger={0.02}
                    className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow-md block"
                />

                <ScrollReveal delay={0.4} className="w-full flex justify-center">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 bg-primary text-white hover:bg-primary/90" asChild>
                            <Link to="/events">
                                Find an Event <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-2 border-white text-white hover:bg-white/20 hover:text-white bg-transparent backdrop-blur-sm" asChild>
                            <Link to="/about">
                                Our Story
                            </Link>
                        </Button>
                    </div>
                </ScrollReveal>


            </div>
        </section>
    );
};


export default Hero;
