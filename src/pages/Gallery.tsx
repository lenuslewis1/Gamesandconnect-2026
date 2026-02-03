import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockGalleryImages, GalleryImage } from "@/data/mockData";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Camera, X, ArrowRight } from "lucide-react";

const categoryLabels: Record<GalleryImage["category"] | "all", string> = {
    all: "All Moments",
    games: "Game Days",
    travel: "Travel",
    parties: "Parties",
    trivia: "Trivia",
    "team-red": "Team Red",
    "team-green": "Team Green",
    "team-blue": "Team Blue",
    "team-yellow": "Team Yellow",
};

const Gallery = () => {
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

    const filteredImages =
        activeCategory === "all"
            ? mockGalleryImages
            : mockGalleryImages.filter((img) => img.category === activeCategory);

    return (
        <Layout>
            <PageHeader
                title="Captured Moments"
                subtitle="Relive the vibes from our unforgettable events and adventures"
            >
                <div className="mt-8 flex justify-center gap-3 text-muted-foreground bg-muted/30 w-fit mx-auto px-6 py-2 rounded-full border border-border/50">
                    <Camera className="h-5 w-5" />
                    <span className="font-medium">{mockGalleryImages.length}+ photos sharing our story</span>
                </div>
            </PageHeader>

            <section className="py-16 md:py-24">
                <div className="container">
                    {/* Category Filter */}
                    <div className="flex justify-center mb-16">
                        <Tabs
                            value={activeCategory}
                            onValueChange={setActiveCategory}
                            className="w-full max-w-3xl"
                        >
                            <TabsList className="w-full justify-center bg-transparent border-b border-border p-0 h-auto rounded-none gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                    <TabsTrigger
                                        key={key}
                                        value={key}
                                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground pb-4 px-4 font-serif text-lg font-medium text-muted-foreground transition-all hover:text-foreground whitespace-nowrap"
                                    >
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Gallery Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {filteredImages.map((image) => (
                            <Dialog key={image.id}>
                                <DialogTrigger asChild>
                                    <button
                                        className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                        onClick={() => setSelectedImage(image)}
                                    >
                                        <img
                                            src={image.src}
                                            alt={image.alt}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/30" />

                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4">
                                            <div className="transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                                                <span className="inline-flex items-center justify-center rounded-full bg-white/90 px-6 py-2 text-sm font-medium text-black backdrop-blur-sm shadow-lg">
                                                    View Photo
                                                </span>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            <span className="text-white font-medium capitalize tracking-wide text-sm">
                                                {categoryLabels[image.category as keyof typeof categoryLabels]}
                                            </span>
                                        </div>
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-2xl">
                                    <div className="relative overflow-hidden rounded-2xl bg-black/90">
                                        <button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-white hover:text-black backdrop-blur-sm ring-1 ring-white/10"
                                        >
                                            <X className="h-5 w-5" />
                                            <span className="sr-only">Close</span>
                                        </button>

                                        <div className="relative aspect-[16/10] md:aspect-[16/9] w-full bg-black">
                                            <img
                                                src={image.src}
                                                alt={image.alt}
                                                className="h-full w-full object-contain"
                                            />
                                        </div>

                                        <div className="p-6 text-center text-white bg-black/50 backdrop-blur-xl border-t border-white/10">
                                            <p className="font-serif text-xl font-medium tracking-wide">
                                                {image.alt}
                                            </p>
                                            <p className="mt-2 text-sm text-white/60 capitalize">
                                                In {categoryLabels[image.category as keyof typeof categoryLabels]} Collection
                                            </p>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>

                    {filteredImages.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-6">
                                <Camera className="h-10 w-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="font-serif text-xl font-medium mb-2">No photos found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                We haven't uploaded any photos for this category yet. Check back soon!
                            </p>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-muted/30 border-t border-border/50">
                <div className="container">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
                            Be Part of the Story
                        </h2>
                        <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                            These aren't just photos—they're memories of new friendships, loud laughs,
                            and unforgettable adventures. Join us at our next event.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="rounded-full h-12 px-8 text-base">
                                <Link to="/events">
                                    View Upcoming Events <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 text-base bg-transparent border-primary/20 hover:bg-primary/5">
                                <Link to="/community">Join Community</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Gallery;
