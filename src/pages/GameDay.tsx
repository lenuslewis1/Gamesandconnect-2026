import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Trophy, Users, Timer, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TextMotion from "@/components/ui/TextMotion";
import { useGameDayScoreboards, useUpcomingGameDayEvent, useGameDayGallery } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

const games = [
    { title: "Tug of War", type: "Strength", players: "All Team" },
    { title: "Sack Race", type: "Speed", players: "4 per team" },
    { title: "Egg & Spoon", type: "Balance", players: "2 per team" },
    { title: "Dodgeball", type: "Agility", players: "6 per team" },
];

const GameDay = () => {
    const { data: scoreboards = [], isLoading: loadingScoreboards } = useGameDayScoreboards();
    const { data: upcomingEvent } = useUpcomingGameDayEvent();
    const { data: galleryImages = [], isLoading: loadingGallery } = useGameDayGallery();

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Get unique categories from gallery images
    const categories = ["all", ...Array.from(new Set(galleryImages.map(img => img.category).filter(Boolean)))];

    // Filter gallery images by category
    const filteredGallery = selectedCategory === "all"
        ? galleryImages
        : galleryImages.filter(img => img.category === selectedCategory);

    // Calculate max points for leaderboard percentage
    const maxPoints = Math.max(...scoreboards.map(s => s.season_points), 1);

    // Find current image index for navigation in lightbox
    const currentImageIndex = selectedImage ? filteredGallery.findIndex(img => img.image_url === selectedImage) : -1;

    const handleNextImage = () => {
        if (currentImageIndex < filteredGallery.length - 1) {
            setSelectedImage(filteredGallery[currentImageIndex + 1].image_url);
        }
    };

    const handlePrevImage = () => {
        if (currentImageIndex > 0) {
            setSelectedImage(filteredGallery[currentImageIndex - 1].image_url);
        }
    };

    return (
        <Layout>
            <PageHeader
                title="Game Day"
                subtitle="High energy, fierce competition, and endless vibes"
            />

            {/* Next Event Banner */}
            {upcomingEvent && (
                <section className="bg-primary text-primary-foreground py-12">
                    <div className="container">
                        <ScrollReveal>
                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl bg-primary-foreground/10 p-8 border border-primary-foreground/20 backdrop-blur-sm">
                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20 text-primary-foreground animate-bounce-slow">
                                        <Trophy className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <Badge className="bg-team-yellow text-black hover:bg-team-yellow/90 mb-2">Upcoming</Badge>
                                        <TextMotion text={upcomingEvent.title} variant="word" className="text-2xl font-bold block" />
                                        <div className="flex gap-4 mt-2 text-primary-foreground/80 text-sm">
                                            <span className="flex items-center gap-1">
                                                <Timer className="h-4 w-4" />
                                                {format(new Date(upcomingEvent.event_date), 'E, MMM dd')} • {upcomingEvent.event_time}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Users className="h-4 w-4" /> {upcomingEvent.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button size="lg" className="w-full md:w-auto bg-white text-primary hover:bg-white/90 font-bold px-8 rounded-full shadow-lg" asChild>
                                    <Link to={upcomingEvent.registration_link || "/events"}>Register Now</Link>
                                </Button>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            )}

            {/* The Teams */}
            <section className="py-20">
                <div className="container">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <TextMotion text="The Four Houses" variant="word" className="text-3xl font-bold md:text-5xl font-serif mb-4" />
                            <p className="mx-auto max-w-xl text-muted-foreground text-lg">
                                Pick your team, wear your colors, and fight for glory.
                            </p>
                        </div>
                    </ScrollReveal>

                    {loadingScoreboards ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {scoreboards.map((team, index) => (
                                <ScrollReveal key={team.id} delay={index * 0.1} variant="scale-up">
                                    <Card className="overflow-hidden border-none text-white transition-all hover:scale-105 hover:shadow-xl group h-full">
                                        <div className={`h-full p-8 flex flex-col items-center text-center ${team.team_color}`}>
                                            <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                                <Trophy className="h-10 w-10 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">{team.team_name}</h3>
                                            <p className="text-white/80 mb-6">{team.description}</p>
                                            <div className="mt-auto pt-6 border-t border-white/20 w-full">
                                                <p className="text-3xl font-black">{team.wins}</p>
                                                <p className="text-xs uppercase tracking-widest text-white/70">WINS</p>
                                            </div>
                                        </div>
                                    </Card>
                                </ScrollReveal>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-muted/40">
                <div className="container">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <ScrollReveal variant="slide-in-left">
                            <div className="relative">
                                <div className="absolute -left-4 -top-4 w-24 h-24 bg-team-yellow/20 rounded-full blur-2xl"></div>
                                <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3">
                                    <img
                                        src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1679_ovnanp.jpg"
                                        alt="Game Day action"
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            </div>
                        </ScrollReveal>

                        <div className="space-y-8">
                            <ScrollReveal>
                                <TextMotion text="How It Works" variant="word" className="text-3xl font-bold md:text-4xl font-serif" />
                            </ScrollReveal>
                            <div className="space-y-6">
                                {[
                                    { step: "01", title: "Register & Pick a Team", desc: "Join as an individual or bring your squad. You'll be assigned to Red, Yellow, Green, or Blue." },
                                    { step: "02", title: "Compete in Games", desc: "From tug-of-war to sack races, participate in classic childhood games with a twist." },
                                    { step: "03", title: "Win Points & Prizes", desc: "Every win earns points for your team. The team with the most points takes the cup!" }
                                ].map((item, i) => (
                                    <ScrollReveal key={i} delay={i * 0.1} variant="fade-up">
                                        <div className="flex gap-6 p-4 rounded-xl hover:bg-white transition-colors duration-300">
                                            <span className="text-4xl font-black text-muted-foreground/20 font-serif">{item.step}</span>
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                                            </div>
                                        </div>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Games */}
            <section className="py-20">
                <div className="container">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <TextMotion text="Featured Games" variant="word" className="text-3xl font-bold md:text-4xl font-serif mb-4" />
                            <p className="text-muted-foreground">What you'll be competing in</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {games.map((game, index) => (
                            <ScrollReveal key={game.title} delay={index * 0.1}>
                                <Card className="hover:shadow-md transition-all group border-muted bg-muted/20">
                                    <CardContent className="p-6">
                                        <Badge variant="outline" className="mb-4 bg-background">{game.type}</Badge>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{game.title}</h3>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Users className="h-4 w-4 mr-2" />
                                            {game.players}
                                        </div>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Game Day Gallery Section - NEW */}
            {!loadingGallery && galleryImages.length > 0 && (
                <section className="py-20 bg-muted/40">
                    <div className="container">
                        <ScrollReveal>
                            <div className="text-center mb-12">
                                <TextMotion text="Game Day Moments" variant="word" className="text-3xl font-bold md:text-4xl font-serif mb-4" />
                                <p className="text-muted-foreground max-w-xl mx-auto">
                                    Relive the excitement, laughter, and fierce competition from our game days
                                </p>
                            </div>
                        </ScrollReveal>

                        {/* Category Filter */}
                        <ScrollReveal>
                            <div className="flex flex-wrap justify-center gap-3 mb-12">
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        variant={selectedCategory === category ? "default" : "outline"}
                                        onClick={() => setSelectedCategory(category)}
                                        className="rounded-full capitalize"
                                    >
                                        {category.replace(/_/g, ' ')}
                                    </Button>
                                ))}
                            </div>
                        </ScrollReveal>

                        {/* Gallery Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredGallery.map((image, index) => (
                                <ScrollReveal key={image.id} delay={index * 0.05} variant="scale-up">
                                    <div
                                        className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-muted shadow-lg hover:shadow-2xl transition-all duration-300"
                                        onClick={() => setSelectedImage(image.image_url)}
                                    >
                                        <img
                                            src={image.image_url}
                                            alt={image.caption || "Game day moment"}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                {image.caption && (
                                                    <p className="text-white text-sm font-medium line-clamp-2">
                                                        {image.caption}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {image.category && (
                                            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm text-xs text-white rounded-full">
                                                {image.category.replace(/_/g, ' ')}
                                            </div>
                                        )}
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>

                        {/* Image Lightbox */}
                        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                            <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
                                <div className="relative">
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                    >
                                        <X className="h-6 w-6" />
                                    </button>

                                    {currentImageIndex > 0 && (
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </button>
                                    )}

                                    {currentImageIndex < filteredGallery.length - 1 && (
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                    )}

                                    {selectedImage && (
                                        <img
                                            src={selectedImage}
                                            alt="Game day moment"
                                            className="w-full h-auto max-h-[85vh] object-contain"
                                        />
                                    )}

                                    {selectedImage && filteredGallery[currentImageIndex]?.caption && (
                                        <div className="p-6 text-white">
                                            <p className="text-center text-lg">
                                                {filteredGallery[currentImageIndex].caption}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </section>
            )}

            {/* Leaderboard */}
            <section className="py-20 bg-background">
                <div className="container">
                    <ScrollReveal>
                        <Card className="overflow-hidden border-2 bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl">
                            <div className="p-8 md:p-12 text-center">
                                <Trophy className="h-16 w-16 mx-auto text-yellow-400 mb-6 animate-pulse" />
                                <TextMotion text="Season Leaderboard" variant="word" className="text-3xl md:text-5xl font-serif font-bold mb-4" />
                                <p className="text-gray-300 mb-12 max-w-lg mx-auto">
                                    The battle for the annual championship trophy is heating up. Every game day counts!
                                </p>

                                {loadingScoreboards ? (
                                    <div className="space-y-4 max-w-3xl mx-auto">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid gap-4 max-w-3xl mx-auto">
                                        {scoreboards.map((team, i) => {
                                            const widthPercent = (team.season_points / maxPoints) * 100;
                                            const colorMap: Record<string, string> = {
                                                'bg-team-blue': 'bg-blue-500',
                                                'bg-team-red': 'bg-red-500',
                                                'bg-team-green': 'bg-green-500',
                                                'bg-team-yellow': 'bg-yellow-500',
                                            };
                                            const barColor = colorMap[team.team_color] || 'bg-primary';

                                            return (
                                                <ScrollReveal key={team.id} delay={i * 0.1} width="100%">
                                                    <div className="relative h-16 bg-white/5 rounded-xl overflow-hidden flex items-center px-6 group">
                                                        <div
                                                            className={`absolute top-0 left-0 bottom-0 ${barColor} opacity-20 transition-all duration-1000 group-hover:opacity-30`}
                                                            style={{ width: `${widthPercent}%` }}
                                                        ></div>
                                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-white/0 via-white/50 to-white/0"></div>
                                                        <span className="font-bold text-lg relative z-10">{i + 1}. {team.team_name}</span>
                                                        <span className="ml-auto font-mono text-xl font-bold relative z-10">{team.season_points} pts</span>
                                                    </div>
                                                </ScrollReveal>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </ScrollReveal>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-muted/30">
                <div className="container text-center">
                    <ScrollReveal>
                        <h2 className="text-4xl font-serif font-bold mb-6">Ready to Play?</h2>
                        <p className="mx-auto max-w-xl text-muted-foreground text-lg mb-8">
                            Don't miss the next Game Day. Tickets sell out fast!
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl hover:translate-y-[-2px] transition-all" asChild>
                                <Link to="/events">Get Tickets</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-2 bg-background" asChild>
                                <Link to="/contact">Join Community</Link>
                            </Button>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </Layout>
    );
};

export default GameDay;
