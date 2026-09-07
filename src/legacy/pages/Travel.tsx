import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTrips } from "@/hooks/useSupabaseData";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock,
    MapPin,
    CreditCard,
    CheckCircle2,
    Plane,
    Users,
    Camera,
    Loader2,
    ArrowRight
} from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";

const travelFAQs = [
    {
        question: "Where does Games and Connect travel to?",
        answer: "We organise group trips to stunning destinations across Ghana including Cape Coast, Akosombo, Ada Foah, Aburi Mountains, and more. Each trip features curated experiences at must-visit locations."
    },
    {
        question: "How much do travel trips cost?",
        answer: "Trip prices vary by destination and duration, typically between GH₵300 and GH₵2,000. We offer flexible part-payment plans so you can secure your spot with a deposit and pay the rest in installments."
    },
    {
        question: "What is included in a Games and Connect trip?",
        answer: "Our travel packages include transportation, accommodation, planned activities, and professional photography. You just show up and enjoy the experience with a curated group of fun young people."
    }
];

const whyTravel = [
    {
        icon: Users,
        title: "Community First",
        description: "Travel with a curated group of fun, like-minded young people. No awkward stranger vibes.",
    },
    {
        icon: Camera,
        title: "Curated Experiences",
        description: "We find the hidden gems and Instagram-worthy spots so you don't have to.",
    },
    {
        icon: CreditCard,
        title: "Flexible Payment",
        description: "Secure your spot with a deposit and pay the rest in easy monthly installments.",
    },
    {
        icon: CheckCircle2,
        title: "Hassle-Free",
        description: "We handle transport, accommodation, and activities. You just show up and enjoy.",
    },
];

const Travel = () => {
    const { data: trips = [], isLoading, error } = useTrips();

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <Layout>
            <SEOHead
                title="Travel & Adventure Trips Across Ghana"
                description="Explore Ghana's most beautiful destinations with Games and Connect. Group travel trips to Cape Coast, Akosombo, Ada Foah & more. Flexible payment plans available."
                canonical="/travel"
            />
            <FAQSchema faqs={travelFAQs} />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Travel", url: "/travel" }]} />
            <PageHeader
                title="Travel Experiences"
                subtitle="Explore Ghana's most beautiful destinations with friends you haven't met yet"
            >
                <div className="mt-8 flex justify-center gap-2 text-[#4d7c0f] font-medium bg-primary/5 w-fit mx-auto px-6 py-2 rounded-full">
                    <Plane className="h-5 w-5" />
                    <span>Next Adventure Loading...</span>
                </div>
            </PageHeader>

            {/* Value Proposition */}
            <section className="py-24 bg-background">
                <div className="container">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">
                            Not Your Average Group Trip
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            We curate travel experiences designed for connection, adventure, and relaxation.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {whyTravel.map((item, i) => (
                            <div key={i} className="text-center group p-6 rounded-2xl transition-colors hover:bg-muted/30">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-[#4d7c0f] group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300 mb-6">
                                    <item.icon className="h-8 w-8" />
                                </div>
                                <h3 className="font-serif text-xl font-medium mb-3">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Trips */}
            <section className="py-24 bg-muted/30">
                <div className="container">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-4">Upcoming Trips</h2>
                            <p className="text-muted-foreground max-w-lg text-lg">
                                Secure your spot today. Spaces are strictly limited to keep the vibe right.
                            </p>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center py-24">
                            <Loader2 className="h-10 w-10 animate-spin text-[#4d7c0f]" />
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-24">
                            <p className="text-destructive text-lg">
                                Failed to load trips. Please refresh the page.
                            </p>
                        </div>
                    )}

                    {!isLoading && !error && trips.length > 0 && (
                        <div className="grid gap-8 lg:grid-cols-2">
                            {trips.map((trip) => {
                                const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];

                                return (
                                    <div key={trip.id} className="group flex flex-col h-full bg-card rounded-3xl overflow-hidden border border-border/50 hover:shadow-xl transition-all duration-300">
                                        <div className="relative aspect-video overflow-hidden">
                                            <img
                                                src={trip.image_url || "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915382/_MG_2210_swxpme.jpg"}
                                                alt={trip.title}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                                            <Badge className="absolute right-6 top-6 bg-white/90 text-black hover:bg-white backdrop-blur-md border-none px-4 py-1.5 text-sm font-medium">
                                                {trip.duration}
                                            </Badge>
                                            <div className="absolute bottom-6 left-6 text-white">
                                                <div className="flex items-center gap-2 text-white/90 text-sm font-medium mb-2">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{trip.destination}</span>
                                                </div>
                                                <h3 className="font-serif text-3xl font-medium">{trip.title}</h3>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-8 flex flex-col">
                                            <p className="text-muted-foreground leading-relaxed mb-6">
                                                {trip.description}
                                            </p>

                                            <div className="flex items-center gap-6 text-sm text-foreground/80 font-medium mb-8 p-4 bg-muted/30 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-[#4d7c0f]" />
                                                    <span>{formatDate(trip.date)}</span>
                                                </div>
                                                <div className="h-4 w-px bg-border" />
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-[#4d7c0f]" />
                                                    <span>{trip.duration}</span>
                                                </div>
                                            </div>

                                            {itinerary.length > 0 && (
                                                <div className="space-y-3 mb-8">
                                                    <p className="font-serif font-medium text-lg">Highlights</p>
                                                    <ul className="space-y-2">
                                                        {itinerary.slice(0, 3).map((item, index) => (
                                                            <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                                                                <CheckCircle2 className="mt-0.5 h-4 w-4 text-[#4d7c0f] shrink-0" />
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                        {itinerary.length > 3 && (
                                                            <li className="text-xs text-[#4d7c0f] font-medium pl-7">
                                                                + {itinerary.length - 3} more activities
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="mt-auto pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div>
                                                    <p className="text-sm text-muted-foreground">Starting from</p>
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-3xl font-bold text-[#4d7c0f]">GH₵{trip.price}</span>
                                                    </div>
                                                    {trip.installment_price && (
                                                        <p className="text-xs text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded-full w-fit">
                                                            Installments available
                                                        </p>
                                                    )}
                                                </div>
                                                <Button size="lg" className="w-full sm:w-auto rounded-full h-12 px-8" asChild>
                                                    <Link to="/events">
                                                        Book Spot <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {!isLoading && !error && trips.length === 0 && (
                        <div className="text-center py-20 bg-background rounded-3xl border border-dashed border-border">
                            <Plane className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="font-serif text-xl font-medium mb-2">No upcoming trips</h3>
                            <p className="text-muted-foreground">
                                We're planning our next adventure. Join the waitlist to be notified first!
                            </p>
                            <Button variant="outline" className="mt-6 rounded-full" asChild>
                                <Link to="/community">Join Community Waitlist</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>

            {/* Past Destinations */}
            <section className="py-24 bg-background">
                <div className="container">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-2xl md:text-3xl font-medium text-muted-foreground">
                            Places We've Conquered
                        </h2>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
                        {[
                            "Cape Coast", "Akosombo", "Kumasi", "Elmina",
                            "Aburi", "Ada Foah", "Volta Region", "Busua Beach", "Wli Falls"
                        ].map((destination) => (
                            <span
                                key={destination}
                                className="px-5 py-2.5 rounded-full bg-muted/30 border border-border/50 text-foreground/80 text-sm md:text-base hover:bg-primary/5 hover:border-primary/20 hover:text-[#4d7c0f] transition-all cursor-default"
                            >
                                📍 {destination}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container relative z-10 text-center">
                    <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
                        Don't Miss The Next One
                    </h2>
                    <p className="mx-auto max-w-xl text-primary-foreground/80 text-lg mb-10 leading-relaxed">
                        Join our community to get early access to trips, exclusive
                        discounts, and to vote on our next destination!
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild size="lg" variant="secondary" className="rounded-full h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                            <Link to="/community">Join Community</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Travel;
