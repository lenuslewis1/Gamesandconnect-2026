import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Trophy, Users, Timer, X, ChevronLeft, ChevronRight } from "lucide-react";

import ScrollReveal from "@/components/ui/ScrollReveal";
import TextMotion from "@/components/ui/TextMotion";
import { useGameDayScoreboards, useUpcomingGameDayEvent, useGameDayGallery } from "@/hooks/useSupabaseData";
import { format } from "date-fns";

const GallerySection = () => {
    const { data: images = [] } = useGameDayGallery();

    if (images.length === 0) return null;

    return (
        <section className="py-20 bg-muted/20">
            <div className="container">
                <ScrollReveal>
                    <div className="flex flex-col md:flex-row items-end justify-between gap-4 mb-12">
                        <div>
                            <TextMotion text="Game Day Highlights" variant="word" className="text-3xl font-bold md:text-4xl font-serif mb-4" />
                            <p className="text-muted-foreground">Captured moments from previous events</p>
                        </div>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.slice(0, 8).map((image, index) => (
                        <ScrollReveal key={image.id} delay={index * 0.05}>
                            <div className="relative group aspect-square rounded-2xl overflow-hidden bg-muted">
                                <img
                                    src={image.image_url}
                                    alt={image.caption || "Game Day moment"}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                    {image.caption && (
                                        <p className="text-white font-medium text-sm line-clamp-2">{image.caption}</p>
                                    )}
                                    {image.event_date && (
                                        <p className="text-white/70 text-xs mt-1">{format(new Date(image.event_date), 'MMM d, yyyy')}</p>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

const games = [
    { title: "Tug of War", type: "Strength", players: "All Team" },
    { title: "Sack Race", type: "Speed", players: "4 per team" },
    { title: "Egg & Spoon", type: "Balance", players: "2 per team" },
    { title: "Dodgeball", type: "Agility", players: "6 per team" },
];

const GameDay = () => {
    const { data: scoreboards = [], isLoading: loadingScoreboards } = useGameDayScoreboards();
    const { data: upcomingEvent } = useUpcomingGameDayEvent();

    // Calculate max points for leaderboard percentage
    const maxPoints = Math.max(...scoreboards.map(s => s.season_points), 1);

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




            {/* Leaderboard Section */}
            {scoreboards.length > 0 && (
                <section className="py-20 bg-background relative overflow-hidden">
                    <div className="container relative z-10">
                        <ScrollReveal>
                            <div className="text-center mb-16">
                                <Badge className="bg-primary text-primary-foreground mb-4">Current Standings</Badge>
                                <TextMotion text="Season Leaderboard" variant="word" className="text-3xl font-bold md:text-4xl font-serif mb-4" />
                                <p className="text-muted-foreground">Who will take the cup this season?</p>
                            </div>
                        </ScrollReveal>

                        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {scoreboards.map((team, index) => (
                                <ScrollReveal key={team.id} delay={index * 0.1}>
                                    <div className="relative group">
                                        <div
                                            className="absolute inset-0 -z-10 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl blur-xl"
                                            style={{ backgroundColor: team.team_color ? `${team.team_color}20` : '#cccccc20' }}
                                        />
                                        <Card className="relative overflow-hidden border-2 transition-all hover:-translate-y-1 hover:shadow-lg bg-card/50 backdrop-blur-sm group-hover:border-primary/50">
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-2"
                                                style={{ backgroundColor: team.team_color || '#ccc' }}
                                            />
                                            <CardContent className="p-6 flex items-center gap-6">
                                                <div
                                                    className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg shrink-0"
                                                    style={{ backgroundColor: team.team_color || '#ccc' }}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-end mb-2">
                                                        <h3 className="font-bold text-lg truncate pr-2">{team.team_name}</h3>
                                                        <span className="text-2xl font-black font-serif whitespace-nowrap">{team.season_points} <span className="text-xs font-sans font-normal text-muted-foreground">pts</span></span>
                                                    </div>
                                                    <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                                                            style={{
                                                                width: `${(team.season_points / maxPoints) * 100}%`,
                                                                backgroundColor: team.team_color || '#ccc'
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                                        <span>{team.wins} Wins</span>
                                                        <span className="truncate ml-2">{team.description || 'Contender'}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

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

            {/* Gallery Section */}
            <GallerySection />


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
