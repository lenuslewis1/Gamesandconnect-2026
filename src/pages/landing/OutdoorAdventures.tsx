import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mountain, Compass, Camera, MapPin, ArrowRight, Sun, TreePine, Waves } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import ScrollReveal from "@/components/ui/ScrollReveal";

const faqs = [
    {
        question: "What outdoor adventures does Games and Connect organise?",
        answer: "We organise group trips to Ghana's most beautiful outdoor destinations. Activities include hiking, beach getaways, waterfall visits, canopy walks, and cultural experiences in locations like Cape Coast, Akosombo, and Aburi."
    },
    {
        question: "Are outdoor adventure trips safe?",
        answer: "Safety is our top priority. All activities are supervised, we use experienced guides, and we ensure proper planning for every trip. We also carry first aid supplies and have emergency protocols in place."
    },
    {
        question: "Do I need to be physically fit for adventure events?",
        answer: "Our trips are designed for all fitness levels. While some activities involve moderate physical effort, there are always alternatives so everyone can participate and enjoy the experience regardless of fitness level."
    }
];

const destinations = [
    {
        icon: Waves,
        title: "Cape Coast & Elmina",
        description: "Beach vibes, historic castles, canopy walkways, and fresh seafood by the ocean.",
    },
    {
        icon: Mountain,
        title: "Akosombo & Volta Region",
        description: "Boat cruises on the Volta Lake, waterfall hikes, and serene mountain escapes.",
    },
    {
        icon: TreePine,
        title: "Aburi & Eastern Region",
        description: "Botanical gardens, mountain trails, and cool highland retreats just outside Accra.",
    },
    {
        icon: Sun,
        title: "Ada Foah & Beaches",
        description: "River estuary, beach camping, water sports, and the most beautiful sunsets in Ghana.",
    },
];

const OutdoorAdventures = () => {
    return (
        <Layout>
            <SEOHead
                title="Outdoor Adventures & Fun Activities in Ghana"
                description="Discover outdoor adventure events in Ghana with Games and Connect. Group trips, hiking, beach getaways, and nature experiences in Cape Coast, Akosombo, Aburi & more."
                canonical="/outdoor-adventures"
            />
            <FAQSchema faqs={faqs} />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Outdoor Adventures", url: "/outdoor-adventures" }]} />

            {/* Hero */}
            <section className="relative py-32 bg-gradient-to-br from-[#065f46] to-[#064e3b] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 70%, #34d399 0%, transparent 50%)' }} />
                <div className="container relative z-10 text-center">
                    <ScrollReveal>
                        <p className="text-emerald-300 uppercase tracking-wider text-sm font-bold mb-4">🌿 Explore Ghana</p>
                        <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6">
                            Outdoor Adventures in Ghana
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                            Escape the city and explore Ghana's most stunning outdoor destinations with a community of fun, adventurous young people.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button asChild size="lg" className="bg-white text-emerald-800 hover:bg-white/90 rounded-full h-14 px-8">
                                <Link to="/travel">View Upcoming Trips</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full h-14 px-8">
                                <Link to="/community">Join Community</Link>
                            </Button>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Summary */}
            <section className="py-16 bg-[#FFF7ED]">
                <div className="container max-w-3xl text-center">
                    <ScrollReveal>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            <strong>Games and Connect</strong> organises unforgettable outdoor adventure trips across Ghana. From the beaches of Cape Coast to the mountains of Aburi, our curated group travel experiences let you explore nature while making genuine connections with like-minded young Ghanaians.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Destinations */}
            <section className="py-24">
                <div className="container">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-16">
                            Where Can You Adventure in Ghana?
                        </h2>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {destinations.map((dest, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <Card className="text-center h-full border-none shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="pt-8 pb-6">
                                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                                            <dest.icon className="h-7 w-7 text-emerald-600" />
                                        </div>
                                        <h3 className="font-serif text-xl font-medium mb-2">{dest.title}</h3>
                                        <p className="text-muted-foreground text-sm">{dest.description}</p>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* What's Included */}
            <section className="py-24 bg-[#FFF7ED]">
                <div className="container max-w-4xl">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-12">
                            What's Included in Every Adventure?
                        </h2>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { emoji: "🚌", title: "Round-trip Transport", desc: "Comfortable bus transport from Accra to the destination and back." },
                            { emoji: "🏨", title: "Accommodation", desc: "Clean, safe accommodation for overnight trips at selected venues." },
                            { emoji: "🎯", title: "Planned Activities", desc: "Every trip has curated experiences — hiking, games, tours, and more." },
                            { emoji: "📸", title: "Professional Photography", desc: "A photographer captures every moment so you can enjoy without worrying." },
                            { emoji: "🍽️", title: "Meals Coordination", desc: "Group meals organised at local restaurants and food spots." },
                            { emoji: "🤝", title: "Community Experience", desc: "Travel with a curated group of fun, respectful, like-minded people." }
                        ].map((item, i) => (
                            <ScrollReveal key={i} delay={i * 0.05}>
                                <div className="flex gap-4 items-start p-5 bg-white rounded-2xl shadow-sm">
                                    <span className="text-2xl">{item.emoji}</span>
                                    <div>
                                        <h3 className="font-medium mb-1">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm">{item.desc}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24">
                <div className="container max-w-3xl">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-12">
                            Outdoor Adventures FAQ
                        </h2>
                    </ScrollReveal>
                    <div className="space-y-6">
                        {faqs.map((faq, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className="border-b border-border pb-6">
                                    <h3 className="font-serif text-xl font-medium mb-2">{faq.question}</h3>
                                    <p className="text-muted-foreground">{faq.answer}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-[#065f46] text-white">
                <div className="container text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium mb-4">Ready for Your Next Adventure?</h2>
                        <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                            Check out our upcoming travel experiences and book your spot today. Flexible payment plans available.
                        </p>
                        <Button asChild size="lg" className="bg-white text-emerald-800 hover:bg-white/90 rounded-full h-14 px-8">
                            <Link to="/travel">
                                View Trips <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </ScrollReveal>
                </div>
            </section>
        </Layout>
    );
};

export default OutdoorAdventures;
