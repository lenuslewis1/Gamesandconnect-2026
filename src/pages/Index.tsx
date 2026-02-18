import Layout from "@/components/layout/Layout";
import Hero from "@/components/home/Hero";
import TestimonialSlider from "@/components/home/TestimonialSlider";
import { Link } from "react-router-dom";
import { Users, Globe, Trophy, ArrowRight, Sparkles, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import ScrollingGallery from "@/components/home/ScrollingGallery";
import { useEvents } from "@/hooks/useSupabaseData";
import { Loader2 } from "lucide-react";
import FloatingEdgeIcons from "@/components/home/FloatingEdgeIcons";
import SEOHead from "@/components/seo/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";

const homeFAQs = [
    {
        question: "What is Games and Connect?",
        answer: "Games and Connect is Ghana's leading social events community. We organise monthly squad games days, travel adventures, and team building experiences in Accra and across Ghana for young professionals and fun-loving adults."
    },
    {
        question: "Where are Games and Connect events held?",
        answer: "Our events take place across Accra including East Legon, Tema, and other vibrant locations. We also organise travel trips to destinations like Cape Coast, Akosombo, and other scenic spots across Ghana."
    },
    {
        question: "How do I join a Games and Connect event?",
        answer: "Browse our upcoming events page, select the event you want to attend, and register online. You can pay via mobile money. Join our WhatsApp community for early access to events and exclusive discounts."
    },
    {
        question: "How much do Games and Connect events cost?",
        answer: "Event prices vary from GH₵50 to GH₵500 depending on the activity. Squad games days are affordable starting from GH₵50, while travel adventures and premium experiences may cost more. Part payment plans are available."
    },
    {
        question: "What types of events does Games and Connect organise?",
        answer: "We organise squad games days with outdoor and indoor games, travel adventures to beautiful destinations across Ghana, corporate team building events, and social networking events for young professionals in Accra."
    }
];

const Index = () => {
    const { data: events = [], isLoading } = useEvents();

    // Filter for upcoming events (today or later)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today;
    });

    const featuredEvents = upcomingEvents.slice(0, 3);

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
            <SEOHead
                title="Fun Events & Squad Games in Accra"
                description="Join Ghana's leading social events community. Monthly squad games days, travel adventures, team building, and networking events in Accra. Book your next experience today!"
                canonical="/"
            />
            <FAQSchema faqs={homeFAQs} />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }]} />
            <FloatingEdgeIcons />
            <Hero />

            {/* Featured Events (Horizontal Scroll) */}
            <section className="py-24">
                <div className="container">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="font-serif text-4xl font-medium mb-2">Upcoming Adventures</h2>
                            <p className="text-muted-foreground">Don't miss out on what's happening next.</p>
                        </div>
                        <Button variant="outline" className="rounded-full hidden md:flex" asChild>
                            <Link to="/events">View All Events</Link>
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : featuredEvents.length > 0 ? (
                            featuredEvents.map((event) => {
                                const priceNum = parsePrice(event.price);
                                return (
                                    <Link key={event.id} to={`/events/${event.id}`} className="group block h-full">
                                        <div className="group bg-card rounded-[2rem] border border-border overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                                            <div className="aspect-[4/3] overflow-hidden relative">
                                                <img
                                                    src={event.image_url || "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"}
                                                    alt={event.title}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-black">
                                                    {formatDate(event.date)}
                                                </div>
                                            </div>
                                            <div className="p-6 flex flex-col flex-1">
                                                <div className="flex items-center gap-2 text-sm text-primary mb-3">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{event.location}</span>
                                                </div>
                                                <h3 className="font-serif text-2xl font-medium mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                                    {event.title}
                                                </h3>
                                                <p className="text-muted-foreground text-sm line-clamp-2 mb-6">
                                                    {event.description}
                                                </p>
                                                <div className="mt-auto flex items-center justify-between">
                                                    <span className="font-bold text-foreground">
                                                        {priceNum === 0 ? "Free Entry" : `GH₵${priceNum}`}
                                                    </span>
                                                    <Button className="rounded-full bg-[#FFF7ED] text-foreground hover:bg-primary hover:text-white border border-[#FDE8D0]" variant="ghost">
                                                        View Details
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="col-span-full text-center py-12 bg-muted/20 rounded-2xl">
                                <p className="text-muted-foreground">No upcoming events scheduled at the moment.</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 text-center md:hidden">
                        <Button variant="outline" className="rounded-full w-full" asChild>
                            <Link to="/events">View All Events</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Stats / Trust Section */}
            <section className="py-20 bg-background relative z-10 -mt-10">
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: Users, label: "Community Members", value: "2,000+", desc: "Young professionals connecting daily" },
                            { icon: Globe, label: "Destinations", value: "15+", desc: "Diverse locations across Ghana" },
                            { icon: Trophy, label: "Game Nights", value: "50+", desc: "Unforgettable evenings hosted" },
                        ].map((stat, i) => (
                            <div key={i} className="bg-[#FFF7ED] p-8 rounded-3xl border border-[#FDE8D0] text-center hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="h-14 w-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
                                    <stat.icon className="h-7 w-7" />
                                </div>
                                <h3 className="font-serif text-4xl font-bold text-foreground mb-2">{stat.value}</h3>
                                <p className="text-lg font-medium text-foreground/80 mb-2">{stat.label}</p>
                                <p className="text-muted-foreground text-sm">{stat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Introduction / Experience */}
            <section className="py-24 overflow-hidden bg-[#fd4c01] text-white">
                <div className="container">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="relative">
                            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl rotate-[-2deg]">
                                <img
                                    src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg"
                                    alt="Friends bonding"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-[#FDBA74] rounded-full blur-3xl -z-10" />
                        </div>

                        <div className="space-y-8">
                            <span className="text-white font-medium tracking-widest text-sm uppercase">About Us</span>
                            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium leading-[1.1] text-white">
                                Rediscover the joy of <br />
                                <span className="italic text-white/90">real connection</span>
                            </h2>
                            <p className="text-xl text-white/90 leading-relaxed font-light">
                                In a digital world, we create spaces for authentic human connection.
                                Whether it's through the adrenaline of a game night or the serenity of a
                                weekend getaway, Games and Connect is your passport to a more social life.
                            </p>

                            <div className="pt-4 grid sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-serif text-xl font-medium mb-1 text-white">Curated Vibes</h4>
                                        <p className="text-white/80 text-sm">Every event is carefully planned for maximum enjoyment.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 h-6 w-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-serif text-xl font-medium mb-1 text-white">Safe Spaces</h4>
                                        <p className="text-white/80 text-sm">Inclusive environments where everyone belongs.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button variant="link" asChild className="p-0 text-lg text-white hover:text-white/80 underline-offset-4">
                                    <Link to="/about">Read our full story <ArrowRight className="ml-2 h-4 w-4" /></Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Experience Categories */}
            <section className="py-24 bg-[#FFF7ED]">
                <div className="container">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <Sparkles className="h-8 w-8 text-team-yellow mx-auto mb-4" />
                        <h2 className="font-serif text-4xl md:text-5xl font-medium mb-4">Choose Your Vibe</h2>
                        <p className="text-muted-foreground text-lg">Ways you can get involved with the community</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Card 1: Games */}
                        <Link to="/gameday" className="group rounded-[2rem] overflow-hidden relative aspect-[4/5] block">
                            <img
                                src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915400/_MG_2284_njl6kn.jpg"
                                alt="Game Day"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
                                <h3 className="font-serif text-3xl mb-2">Game Day</h3>
                                <p className="text-white/80 line-clamp-2 mb-4 group-hover:text-white transition-colors">
                                    Competitions, laughter, and team spirit. Join the arena.
                                </p>
                                <span className="inline-flex items-center text-sm font-medium border-b border-white/40 w-fit pb-1 group-hover:border-white transition-colors">
                                    View Schedule <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </div>
                        </Link>

                        {/* Card 2: Travel */}
                        <Link to="/travel" className="group rounded-[2rem] overflow-hidden relative aspect-[4/5] block md:-translate-y-8">
                            <img
                                src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915382/_MG_2210_swxpme.jpg"
                                alt="Travel"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
                                <h3 className="font-serif text-3xl mb-2">Travel</h3>
                                <p className="text-white/80 line-clamp-2 mb-4 group-hover:text-white transition-colors">
                                    Explore hidden gems and scenic escapes with new friends.
                                </p>
                                <span className="inline-flex items-center text-sm font-medium border-b border-white/40 w-fit pb-1 group-hover:border-white transition-colors">
                                    See Destinations <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </div>
                        </Link>

                        {/* Card 3: Community */}
                        <Link to="/community" className="group rounded-[2rem] overflow-hidden relative aspect-[4/5] block">
                            <img
                                src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488676/_MG_1656_yoiklo.jpg"
                                alt="Community"
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end text-white">
                                <h3 className="font-serif text-3xl mb-2">Community</h3>
                                <p className="text-white/80 line-clamp-2 mb-4 group-hover:text-white transition-colors">
                                    Trivia nights, meetups, and exclusive member perks.
                                </p>
                                <span className="inline-flex items-center text-sm font-medium border-b border-white/40 w-fit pb-1 group-hover:border-white transition-colors">
                                    Join Us <ArrowRight className="ml-2 h-4 w-4" />
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>









            {/* Scrolling Gallery */}
            <ScrollingGallery />

            {/* Games Collection Section (Auto-Scroll Marquee) */}
            <section className="py-20 overflow-hidden bg-[#FFF7ED] border-y border-[#FDE8D0]">
                <div className="container mb-10 text-center">
                    <h2 className="font-serif text-3xl md:text-4xl font-medium mb-2">
                        Our <span className="text-[#fd4c01]">Games Collection</span>
                    </h2>
                    <p className="text-muted-foreground text-sm">
                        Explore our variety of exciting games for all skill levels
                    </p>
                </div>

                <div className="relative w-full overflow-hidden">
                    <div className="flex gap-6 animate-scroll-left w-fit hover:pause-on-hover py-4">
                        {[...Array(3)].flatMap(() => [
                            { name: "Football", level: "Intermediate", icon: "⚽" },
                            { name: "Limbo", level: "Beginner", icon: "🤸" },
                            { name: "Shooting Range", level: "Intermediate", icon: "🎪" },
                            { name: "UNO", level: "Beginner", icon: "🃏" },
                            { name: "Volleyball", level: "Intermediate", icon: "🏐" },
                            { name: "Archery", level: "Intermediate", icon: "🏹" },
                            { name: "Card Games", level: "Beginner", icon: "🤡" },
                            { name: "Cup Games", level: "Beginner", icon: "🥤" },
                            { name: "Darts", level: "Beginner", icon: "🎯" },
                            { name: "Trivia", level: "Beginner", icon: "🧠" },
                            { name: "Karaoke", level: "Beginner", icon: "🎤" },
                            { name: "Dance", level: "All Levels", icon: "💃" },
                            { name: "Charades", level: "Beginner", icon: "🎭" },
                            { name: "Scrabble", level: "Intermediate", icon: "🔤" },
                            { name: "Chess", level: "Advanced", icon: "♟️" },
                            { name: "Pool", level: "Intermediate", icon: "🎱" },
                            { name: "Table Tennis", level: "Beginner", icon: "🏓" },
                            { name: "Video Games", level: "All Levels", icon: "🎮" },
                        ]).map((game, i) => (
                            <div
                                key={`game-${i}`}
                                className="bg-white px-8 py-6 rounded-[2rem] border border-[#FDE8D0] flex items-center gap-4 group hover:shadow-lg transition-all duration-300 w-[280px] shrink-0 shadow-sm"
                            >
                                <span className="text-4xl group-hover:scale-110 transition-transform duration-300 shrink-0">
                                    {game.icon}
                                </span>
                                <div className="text-left overflow-hidden">
                                    <h4 className="font-serif text-xl font-medium mb-1 truncate">{game.name}</h4>
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 bg-muted/30 px-3 py-1 rounded-full whitespace-nowrap">
                                        {game.level}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <TestimonialSlider />

            {/* FAQ Section (Accordion Style from Reference) */}
            <section className="py-24 bg-[#FFF7ED]">
                <div className="container max-w-3xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-4xl font-medium mb-4">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground">Everything you need to know about joining us.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "How do I become a member?", a: "It's simple! Join our WhatsApp community or attend any of our events. There is no membership fee for the basic community." },
                            { q: "Are the trips suitable for solo travelers?", a: "Absolutely! 80% of our travelers come solo. We structure our trips to ensure you make friends instantly." },
                            { q: "What happens at Game Days?", a: "We split into teams (Red, Blue, Green, Yellow) and compete in fun outdoor games like Tug of War, Sack Races, and more." },
                            { q: "Can I pay in installments?", a: "Yes, for all our major trips, we offer flexible installment plans to make it easy on your pocket." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-[#FDE8D0] hover:shadow-md transition-all">
                                <h3 className="font-serif text-lg font-medium mb-2">{faq.q}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 relative overflow-hidden bg-[#fd4c01] text-white">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container relative z-10 text-center">
                    <h2 className="font-serif text-5xl md:text-7xl font-medium mb-8">
                        Ready for your <br /> next adventure?
                    </h2>
                    <p className="text-xl opacity-90 max-w-2xl mx-auto mb-12 font-light">
                        Stop watching from the sidelines. The memories, the fun, and the friends are waiting for you.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full h-16 px-10 text-xl bg-[#FFF7ED] text-[#fd4c01] hover:bg-white border-none shadow-xl">
                            <Link to="/events">Book an Experience</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Index;
