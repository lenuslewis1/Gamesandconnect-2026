import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvents } from "@/hooks/useSupabaseData";
import { eventPath } from '@/lib/eventLinks.mjs';
import { Calendar, MapPin, Clock, Loader2, ArrowRight } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SEOHead from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

const Events = () => {
    const { data: events = [], isLoading, error } = useEvents();


    const [params, setParams] = useSearchParams();
    const activeTab = params.get('view') === 'past' ? 'past' : 'upcoming';
    const setActiveTab = (value: string) => setParams(current => {
        const next = new URLSearchParams(current);
        if (value === 'past') next.set('view', 'past');
        else next.delete('view');
        return next;
    });
    // Keep today's events upcoming through the end of the Ghana calendar day.
    const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));
    useEffect(() => {
        const refreshDay = () => setToday(new Date().toISOString().slice(0, 10));
        const timer = window.setInterval(refreshDay, 60000);
        window.addEventListener('focus', refreshDay);
        return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshDay); };
    }, []);
    const startOfToday = Date.parse(`${today}T00:00:00Z`);
    const datedEvents = events.filter(event => Number.isFinite(Date.parse(event.date)));
    const upcomingEvents = datedEvents.filter(event => Date.parse(event.date) >= startOfToday)
        .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const pastEvents = datedEvents.filter(event => Date.parse(event.date) < startOfToday)
        .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    const visibleEvents = activeTab === 'past' ? pastEvents : upcomingEvents;


    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "UTC",
        });
    };

    const parsePrice = (price: string | null): number => {
        if (!price) return 0;
        const cleaned = price.replace(/[^0-9.]/g, '');
        return parseFloat(cleaned) || 0;
    };

    return (
        <Layout>
            <SEOHead
                title="Upcoming Events & Things To Do in Accra"
                description="Discover fun upcoming events in Accra, Ghana. Squad games, travel adventures, trivia nights, and social networking events from Games and Connect. Book your spot today!"
                canonical="/events"
            />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Events", url: "/events" }]} />
            <PageHeader
                title="Games and Connect Events"
                subtitle="Join us for games, parties, trivia nights, and travel adventures"
            />


            <section className="py-16 md:py-24">
                <div className="container">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList aria-label="Events by date" className="mb-10 mx-auto flex w-fit">
                            <TabsTrigger value="upcoming" className="px-6">Upcoming{!isLoading && !error && ` (${upcomingEvents.length})`}</TabsTrigger>
                            <TabsTrigger value="past" className="px-6">Past{!isLoading && !error && ` (${pastEvents.length})`}</TabsTrigger>
                        </TabsList>
                        <TabsContent key={activeTab} value={activeTab}>
                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-[#4d7c0f]" />
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
                            {visibleEvents.map((event, index) => {
                                const priceNum = parsePrice(event.price);
                                const isPast = activeTab === 'past';

                                return (
                                    <ScrollReveal key={event.id} delay={index * 0.1} width="100%" className="h-full">
                                        <Link to={eventPath(event)} className="group block h-full">
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
                                                    <h3 className="font-serif text-2xl font-medium mb-3 group-hover:text-[#4d7c0f] transition-colors line-clamp-2">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                                                        {event.description}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-auto">
                                                        <MapPin className="h-4 w-4 text-[#4d7c0f]" />
                                                        <span>{event.location}</span>
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="p-6 pt-0 flex items-center justify-between border-t border-border/40 mt-auto bg-muted/5 group-hover:bg-muted/20 transition-colors">
                                                    <span className="text-lg font-bold text-foreground">
                                                        {priceNum === 0 ? "Free Entry" : `GH₵${priceNum}`}
                                                    </span>
                                                    <span className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium transition-transform group-hover:scale-105 shadow-sm">
                                                        {isPast ? "View Story" : "Book"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                                    </span>
                                                </CardFooter>
                                            </Card>
                                        </Link>
                                    </ScrollReveal>
                                );
                            })}
                        </div>
                    )}


                    {!isLoading && !error && visibleEvents.length === 0 && (
                        <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border">
                            <h3 className="font-serif text-xl font-medium mb-2">{activeTab === 'past' ? 'No past events yet' : 'No upcoming events yet'}</h3>
                            <p className="text-muted-foreground">
                                {activeTab === 'past' ? 'Our completed events will appear here.' : 'New experiences are on the way. Check back soon for the next event.'}
                            </p>
                            {activeTab === 'upcoming' && pastEvents.length > 0 && <Button variant="outline" className="mt-6" onClick={() => setActiveTab('past')}>Explore past events</Button>}
                        </div>
                    )}
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </Layout>
    );
};

export default Events;
