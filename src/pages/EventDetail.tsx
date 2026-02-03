import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    CheckCircle2,
    ArrowRight,
    ChevronDown,
    Star,
    Quote,
    Loader2
} from "lucide-react";
import { useEvent, useEvents, useTeamMembers, useTestimonials } from "@/hooks/useSupabaseData";
import BookingModal from "@/components/events/BookingModal";
import ScrollReveal from "@/components/ui/ScrollReveal";

// Helper to format date
const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
};

// Helper to get price number
const parsePrice = (price: string | null): number => {
    if (!price) return 0;
    const cleaned = price.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
};

const EventDetail = () => {
    const { id } = useParams();
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

    const { data: event, isLoading, error } = useEvent(id || "");
    const { data: allEvents = [] } = useEvents();
    const { data: teamMembers = [] } = useTeamMembers();
    const { data: testimonials = [] } = useTestimonials();

    const relatedEvents = allEvents
        .filter(e => e.id.toString() !== id && e.category === event?.category)
        .slice(0, 2);

    const featuredTestimonial = testimonials[0] || {
        content: "Absolutely the best community event I've attended! Made friends I still talk to daily.",
        name: "Kwame A.",
        role: "Game Day Attendee"
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="min-h-[70vh] flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (error || !event) {
        return (
            <Layout>
                <div className="min-h-[70vh] flex flex-col items-center justify-center container text-center">
                    <h2 className="font-serif text-3xl mb-4">Event not found</h2>
                    <p className="text-muted-foreground mb-8">The event you're looking for doesn't exist or has been moved.</p>
                    <Button asChild>
                        <Link to="/events">Back to Events</Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    const priceNum = parsePrice(event.price);
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    const isPastEvent = eventDate < today;


    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src={event.image_url || "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1758_mj5kho.jpg"}
                        alt={event.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>

                <div className="container relative z-10 pb-16 text-white">
                    <ScrollReveal>
                        <Badge className="mb-4 bg-white/20 text-white border-none backdrop-blur-sm">
                            {formatDate(event.date)}
                        </Badge>
                        <h1 className="font-serif text-5xl md:text-7xl font-medium mb-4 max-w-3xl">
                            {event.title}
                        </h1>
                        <p className="text-xl text-white/80 max-w-xl font-light">
                            {event.category?.toUpperCase()} EXPERIENCE
                        </p>

                        <div className="mt-8 flex items-center gap-2 text-white/60 animate-bounce">
                            <ChevronDown className="h-6 w-6" />
                            <span className="text-sm">Scroll to explore</span>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* About & Booking Section */}
            <section className="py-20 bg-[#FBF8F3]">
                <div className="container">
                    <div className="grid lg:grid-cols-3 gap-16">
                        {/* Left: About Content */}
                        <div className="lg:col-span-2 space-y-12">
                            <div>
                                <h2 className="font-serif text-3xl md:text-4xl font-medium mb-6">About this event</h2>
                                <p className="text-muted-foreground text-lg leading-relaxed whitespace-pre-line">
                                    {event.description}
                                </p>
                            </div>

                            {/* Highlights */}
                            <div>
                                <h3 className="font-serif text-2xl font-medium mb-6">What to expect</h3>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    {[
                                        "Expertly curated activities",
                                        "Professional networking",
                                        "Vibrant community atmosphere",
                                        "Memorably experiences",
                                        "Safe and secure environment"
                                    ].map((item, i) => (
                                        <ScrollReveal key={i} delay={i * 0.1}>
                                            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#EBE5D9]">
                                                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                <span className="text-foreground/80">{item}</span>
                                            </div>
                                        </ScrollReveal>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right: Booking Card */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-24 border-[#EBE5D9] shadow-lg rounded-3xl overflow-hidden">
                                <CardContent className="p-8 space-y-6">
                                    <div className="text-center pb-6 border-b border-[#EBE5D9]">
                                        <p className="text-muted-foreground text-sm mb-1">Starting from</p>
                                        <p className="font-serif text-4xl font-bold text-primary">GH₵{event.price}</p>
                                        <p className="text-muted-foreground text-sm">per person</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <span>{formatDate(event.date)}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Clock className="h-5 w-5 text-primary" />
                                            <span>{event.time_range}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <span>{event.location}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Users className="h-5 w-5 text-primary" />
                                            <span>Capacity: {event.capacity} people</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => setIsBookingModalOpen(true)}
                                        className={`w-full h-14 rounded-full text-lg ${isPastEvent ? "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed" : "bg-primary hover:bg-primary/90"}`}
                                        disabled={isPastEvent}
                                    >
                                        {isPastEvent ? "Event Completed" : "Book Now"}
                                    </Button>

                                    {isPastEvent && (
                                        <div className="bg-muted/30 p-4 rounded-xl text-center text-sm text-muted-foreground border border-dashed border-border mt-4">
                                            Booking is no longer available as this event has already taken place.
                                        </div>
                                    )}


                                    <p className="text-center text-xs text-muted-foreground">
                                        Free cancellation up to 48 hours before
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-background">
                <div className="container text-center">
                    <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">Team on this event</h2>
                    <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
                        Meet the amazing people who will make your experience unforgettable
                    </p>

                    <div className="flex flex-wrap justify-center gap-12">
                        {teamMembers.slice(0, 3).map((member, i) => (
                            <ScrollReveal key={member.id} delay={i * 0.1}>
                                <div className="text-center group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 border-4 border-[#FAF6F0] shadow-lg group-hover:scale-105 transition-transform duration-300">
                                        <img
                                            src={member.image_url || "https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1414_ij80mu.jpg"}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-serif text-xl font-medium">{member.name}</h3>
                                    <p className="text-muted-foreground text-sm">{member.role}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonial Section */}
            <section className="py-20 bg-[#FAF6F0]">
                <div className="container max-w-4xl text-center">
                    <h2 className="font-serif text-3xl font-medium mb-12">Don't just take our word for it</h2>

                    <ScrollReveal>
                        <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-[#EBE5D9]">
                            <Quote className="absolute -top-4 left-8 h-8 w-8 text-primary/30" />
                            <p className="font-serif text-2xl md:text-3xl leading-relaxed mb-8 italic text-foreground/80">
                                "{featuredTestimonial.content}"
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <span className="text-muted-foreground">—</span>
                                <div className="text-left">
                                    <p className="font-medium">{featuredTestimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{featuredTestimonial.role}</p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-background">
                <div className="container max-w-3xl">
                    <h2 className="font-serif text-3xl md:text-4xl font-medium text-center mb-12">
                        Frequently asked questions
                    </h2>

                    <div className="space-y-4">
                        {[
                            { q: "What should I wear?", a: "Comfortable athletic wear and sneakers. You'll be moving around a lot!" },
                            { q: "Can I come alone?", a: "Absolutely! Most of our attendees come solo. You'll be placed on a team and make friends instantly." },
                            { q: "Is food provided?", a: "Yes, light refreshments and snacks are included. We also have water stations throughout." },
                            { q: "What if it rains?", a: "We have a covered backup venue. The event will proceed rain or shine!" }
                        ].map((faq, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div
                                    className="bg-[#FAF6F0] rounded-2xl border border-[#EBE5D9] overflow-hidden"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                        className="w-full flex items-center justify-between p-6 text-left hover:bg-[#F5F0E8] transition-colors"
                                    >
                                        <span className="font-serif text-lg font-medium">{faq.q}</span>
                                        <ChevronDown className={`h-5 w-5 text-primary transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openFaq === i && (
                                        <div className="px-6 pb-6 animate-fade-in">
                                            <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Related Events */}
            <section className="py-20 bg-[#FAF6F0]">
                <div className="container">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="font-serif text-3xl md:text-4xl font-medium mb-2">Other events</h2>
                            <p className="text-muted-foreground">Discover more experiences you might love</p>
                        </div>
                        <Button variant="outline" className="rounded-full hidden md:flex" asChild>
                            <Link to="/game-day">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {relatedEvents.map((related, i) => (
                            <ScrollReveal key={related.id} delay={i * 0.1}>
                                <Link
                                    to={`/events/${related.id}`}
                                    className="group block bg-white rounded-3xl overflow-hidden border border-[#EBE5D9] hover:shadow-xl transition-all duration-300 h-full"
                                >
                                    <div className="grid md:grid-cols-2 h-full">
                                        <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
                                            <img
                                                src={related.image_url || "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915388/_MG_2318_kszvtt.jpg"}
                                                alt={related.title}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-6 flex flex-col justify-center">
                                            <Badge variant="outline" className="w-fit mb-3 border-primary/20 text-primary">
                                                {formatDate(related.date)}
                                            </Badge>
                                            <h3 className="font-serif text-2xl font-medium mb-2 group-hover:text-primary transition-colors">
                                                {related.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                {related.location}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Button variant="outline" className="rounded-full w-full" asChild>
                            <Link to="/game-day">View All Events</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-20 bg-[#4A3B32] text-[#FAF6F0] text-center">
                <div className="container">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl md:text-5xl font-medium mb-6">Ready to join us?</h2>
                        <p className="text-white/70 max-w-lg mx-auto mb-10 text-lg">
                            Spots fill up fast. Secure your place and get ready for an unforgettable experience.
                        </p>
                        <Button
                            onClick={() => setIsBookingModalOpen(true)}
                            size="lg"
                            className={`rounded-full h-14 px-10 text-lg ${isPastEvent ? "bg-white/20 text-white/50 cursor-not-allowed" : "bg-[#FAF6F0] text-[#4A3B32] hover:bg-white"}`}
                            disabled={isPastEvent}
                        >
                            {isPastEvent ? "Event Completed" : "Book Your Spot"}
                        </Button>

                    </ScrollReveal>
                </div>
            </section>

            {/* Booking Modal */}
            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                event={{
                    id: event.id,
                    title: event.title,
                    price: event.price
                }}
            />
        </Layout>
    );
};

export default EventDetail;
