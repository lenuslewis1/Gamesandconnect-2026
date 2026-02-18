import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Trophy, ArrowRight, Briefcase, Award, Shield } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import ScrollReveal from "@/components/ui/ScrollReveal";

const faqs = [
    {
        question: "What corporate events does Games and Connect organise in Ghana?",
        answer: "We organise corporate team building days, company fun days, interbank games, department challenges, and corporate retreats. Every event is customised to your company's objectives and culture."
    },
    {
        question: "What are interbank games in Ghana?",
        answer: "Interbank games are competitive sporting and team events between banks and financial institutions in Ghana. Games and Connect organises and facilitates these events with professional planning and execution."
    },
    {
        question: "Can Games and Connect handle large corporate events?",
        answer: "Absolutely. We've successfully managed events for groups of 200+ people. We handle all logistics including venue, equipment, catering coordination, photography, and professional facilitation."
    }
];

const packages = [
    {
        icon: Users,
        title: "Team Building Day",
        description: "Half-day or full-day team building with customised games, challenges, and activities for your team.",
        features: ["Custom activity design", "Professional facilitation", "Team photography", "Refreshments coordination"]
    },
    {
        icon: Trophy,
        title: "Interbank Games",
        description: "Competitive inter-company sporting events with full tournament management and awards.",
        features: ["Tournament bracket setup", "Multiple game categories", "Awards ceremony", "Event branding"]
    },
    {
        icon: Building2,
        title: "Company Fun Day",
        description: "A full day of entertainment for your staff and their families. Games, food, music, and community.",
        features: ["Family-friendly activities", "Entertainment & music", "Food coordination", "Full event management"]
    },
    {
        icon: Award,
        title: "Corporate Retreat",
        description: "Multi-day destination retreats combining team building with travel experiences outside Accra.",
        features: ["Destination planning", "Accommodation booking", "Activities & excursions", "Transport coordination"]
    }
];

const CorporateEvents = () => {
    return (
        <Layout>
            <SEOHead
                title="Corporate Events & Interbank Games Ghana"
                description="Professional corporate event planning in Ghana. Team building, interbank games, company fun days, and corporate retreats by Games and Connect. Get a custom quote."
                canonical="/corporate-events"
            />
            <FAQSchema faqs={faqs} />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Corporate Events", url: "/corporate-events" }]} />

            {/* Hero */}
            <section className="relative py-32 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 75% 25%, #fd4c01 0%, transparent 60%)' }} />
                <div className="container relative z-10 text-center">
                    <ScrollReveal>
                        <p className="text-[#fd4c01] uppercase tracking-wider text-sm font-bold mb-4">Corporate Solutions</p>
                        <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6">
                            Corporate Events in Ghana
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                            From interbank games to company retreats, Games and Connect delivers professional corporate event experiences that your team will never forget.
                        </p>
                        <Button asChild size="lg" className="bg-[#fd4c01] hover:bg-[#e04400] rounded-full h-14 px-8">
                            <Link to="/contact">Request a Quote</Link>
                        </Button>
                    </ScrollReveal>
                </div>
            </section>

            {/* Summary */}
            <section className="py-16 bg-[#FFF7ED]">
                <div className="container max-w-3xl text-center">
                    <ScrollReveal>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            <strong>Games and Connect</strong> provides end-to-end corporate event planning services in Ghana. We specialise in high-energy team building events, interbank games, and corporate retreats that strengthen team bonds and boost employee morale. Trusted by companies across Accra and Ghana.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Packages */}
            <section className="py-24">
                <div className="container">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-16">
                            Our Corporate Event Packages
                        </h2>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-2 gap-8">
                        {packages.map((pkg, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="pt-8 pb-6">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <pkg.icon className="h-7 w-7 text-primary" />
                                        </div>
                                        <h3 className="font-serif text-2xl font-medium mb-2">{pkg.title}</h3>
                                        <p className="text-muted-foreground mb-4">{pkg.description}</p>
                                        <ul className="space-y-2">
                                            {pkg.features.map((feature, j) => (
                                                <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Shield className="h-4 w-4 text-primary shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-[#FFF7ED]">
                <div className="container max-w-3xl">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-12">
                            Corporate Events FAQ
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
            <section className="py-24 bg-[#0f172a] text-white">
                <div className="container text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium mb-4">Let's Plan Your Corporate Event</h2>
                        <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                            Contact us today for a free consultation and customised quote for your next corporate event in Ghana.
                        </p>
                        <Button asChild size="lg" className="bg-[#fd4c01] hover:bg-[#e04400] rounded-full h-14 px-8">
                            <Link to="/contact">
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </ScrollReveal>
                </div>
            </section>
        </Layout>
    );
};

export default CorporateEvents;
