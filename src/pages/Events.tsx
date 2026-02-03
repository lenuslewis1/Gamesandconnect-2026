import { useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useSupabaseData";
import { Calendar, MapPin, Clock, Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ui/ScrollReveal";

const Events = () => {
    const { data: events = [], isLoading, error } = useEvents();


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort events: Upcoming first (ascending), then Past (descending)
    const sortedEvents = [...events].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);

        const isPastA = dateA < today;
        const isPastB = dateB < today;

        if (isPastA && !isPastB) return 1;
        if (!isPastA && isPastB) return -1;

        // If both are upcoming, sort by date ascending
        if (!isPastA && !isPastB) return dateA.getTime() - dateB.getTime();

        // If both are past, sort by date descending (most recent first)
        return dateB.getTime() - dateA.getTime();
    });


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const parsePrice = (price: string | null): number => {
        if (!price) return 0;
        const cleaned = price.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    };

    return (
        <Layout>
            <PageHeader
                title="Vibes & Ventures Events"
                subtitle="Join us for games, parties, trivia nights, and travel adventures"
            />


            <section className="py-16 md:py-24">
                <div className="container">


                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <div className="text-center py-20">
                            <p className="text-destructive text-lg">
                                Failed to load events. Please try again later.
                            </p>
                        </div>
                    )}

                    {/* Events Grid */}
                    {!isLoading && !error && (
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {sortedEvents.map((event, index) => {
                                const priceNum = parsePrice(event.price);
                                const eventDate = new Date(event.date);
                                const isPast = eventDate < today;

                                return (
                                    <ScrollReveal key={event.id} delay={index * 0.1} width="100%" className="h-full">
                                        <Link to={`/events/${event.id}`} className="group block h-full">
                                            <Card className={`h-full overflow-hidden border-border/60 hover:shadow-lg transition-all duration-300 flex flex-col ${isPast ? "opacity-90 saturate-50" : ""}`}>
                                                <div className="relative aspect-[16/10] overflow-hidden">
                                                    <img
                                                        src={event.image_url || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"}
                                                        alt={event.title}
                                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                                                    {isPast && (
                                                        <Badge
                                                            className="absolute right-4 top-4 bg-muted-foreground/80 text-white border-none px-3 py-1 backdrop-blur-sm"
                                                        >
                                                            Completed
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardContent className="flex-1 p-6">
                                                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-3">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            <span>{formatDate(event.date)}</span>
                                                        </div>
                                                        <div className="h-1 w-1 rounded-full bg-border" />
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            <span>{event.time_range}</span>
                                                        </div>
                                                    </div>
                                                    <h3 className="font-serif text-2xl font-medium mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                                                        {event.description}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-auto">
                                                        <MapPin className="h-4 w-4 text-primary" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-border/40 mt-auto bg-muted/5 group-hover:bg-muted/20 transition-colors">
                                                    <span className="text-lg font-bold text-foreground">
                                                        {priceNum === 0 ? "Free Entry" : `GH₵${priceNum}`}
                                                    </span>
                                                    <span className="text-sm font-medium text-primary flex items-center group-hover:translate-x-1 transition-transform">
                                                        {isPast ? "View Story" : "View Details"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                                    </span>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    </ScrollReveal>
                                );
                            })}
                        </div>
                    )}


                    {!isLoading && !error && sortedEvents.length === 0 && (
                        <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
                            <h3 className="font-serif text-xl font-medium mb-2">No events found</h3>
                            <p className="text-muted-foreground">
                                We couldn't find any events. Please check back later!
                            </p>
                        </div>
                    )}

                </div>
            </section>
        </Layout>
    );
};

export default Events;
