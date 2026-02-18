import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Trophy, ArrowRight, CheckCircle2, Calendar, MapPin } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import ScrollReveal from "@/components/ui/ScrollReveal";

const faqs = [
    {
        question: "What team building activities does Games and Connect offer in Ghana?",
        answer: "We offer outdoor squad games, relay challenges, trivia competitions, problem-solving activities, and customised corporate team building experiences. All activities are designed to boost teamwork, communication, and morale."
    },
    {
        question: "How many people can attend a team building event?",
        answer: "Our team building events accommodate groups from 10 to 200+ people. Whether it's a small department outing or a large corporate retreat, we tailor the experience to your team size and goals."
    },
    {
        question: "Where are team building events held in Ghana?",
        answer: "We host team building events at venues across Accra including East Legon, Tema, and other outdoor locations. We can also organise events at your preferred venue or as destination retreats in Cape Coast and Akosombo."
    },
    {
        question: "How much does a corporate team building event cost?",
        answer: "Pricing depends on group size, activities, and location. Contact us for a custom quote. Corporate packages typically include full event planning, facilitation, equipment, photography, and refreshments."
    }
];

const benefits = [
    {
        icon: Target,
        title: "Custom Activities",
        description: "Every team building programme is tailored to your company's goals, culture, and team dynamics.",
    },
    {
        icon: Users,
        title: "Expert Facilitation",
        description: "Our experienced facilitators ensure everyone participates and has a great time.",
    },
    {
        icon: Trophy,
        title: "Proven Results",
        description: "Teams report improved communication, morale, and collaboration after our events.",
    },
    {
        icon: Calendar,
        title: "Flexible Scheduling",
        description: "We work around your schedule. Weekdays, weekends, or as part of a larger corporate retreat.",
    },
];

const TeamBuilding = () => {
    return (
        <Layout>
            <SEOHead
                title="Team Building Events in Ghana — Corporate Activities"
                description="Book the best team building events in Ghana. Custom corporate team activities in Accra, outdoor challenges, and group bonding experiences. Get a free quote today!"
                canonical="/team-building"
            />
            <FAQSchema faqs={faqs} />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Team Building", url: "/team-building" }]} />

            {/* Hero */}
            <section className="relative py-32 bg-gradient-to-br from-[#fd4c01] to-[#e04400] text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="container relative z-10 text-center">
                    <ScrollReveal>
                        <p className="text-white/80 uppercase tracking-wider text-sm font-medium mb-4">Corporate & Team Events</p>
                        <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6">
                            Team Building Events in Ghana
                        </h1>
                        <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                            Unite your team through play. Games and Connect designs unforgettable corporate team building experiences in Accra and across Ghana.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button asChild size="lg" className="bg-white text-[#fd4c01] hover:bg-white/90 rounded-full h-14 px-8">
                                <Link to="/contact">Get a Free Quote</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10 rounded-full h-14 px-8">
                                <Link to="/events">See Events</Link>
                            </Button>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Summary Snippet */}
            <section className="py-16 bg-[#FFF7ED]">
                <div className="container max-w-3xl text-center">
                    <ScrollReveal>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            <strong>Games and Connect</strong> is Ghana's top provider of corporate team building events. Based in Accra, we design fun, engaging activities that strengthen teamwork, boost morale, and create lasting memories. From outdoor squad games to custom corporate challenges, we bring your team together through play.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24">
                <div className="container">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-16">
                            Why Choose Games and Connect for Team Building?
                        </h2>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <Card className="text-center h-full border-none shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="pt-8 pb-6">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <benefit.icon className="h-7 w-7 text-primary" />
                                        </div>
                                        <h3 className="font-serif text-xl font-medium mb-2">{benefit.title}</h3>
                                        <p className="text-muted-foreground text-sm">{benefit.description}</p>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24 bg-[#FFF7ED]">
                <div className="container max-w-4xl">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-16">
                            How Does It Work?
                        </h2>
                    </ScrollReveal>
                    <div className="space-y-8">
                        {[
                            { step: "1", title: "Tell Us Your Goals", description: "Share your team size, objectives, and preferred date. We'll design a custom programme." },
                            { step: "2", title: "We Plan Everything", description: "From venue selection to activity design. We handle all logistics so you can focus on your team." },
                            { step: "3", title: "Show Up and Play", description: "On the day, our facilitators run everything. Your only job is to have fun and bond with your team." },
                            { step: "4", title: "Lasting Impact", description: "Walk away with strengthened relationships, better communication, and memories that last." }
                        ].map((item, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className="flex gap-6 items-start">
                                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shrink-0">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-xl font-medium mb-1">{item.title}</h3>
                                        <p className="text-muted-foreground">{item.description}</p>
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
                            Frequently Asked Questions About Team Building in Ghana
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
            <section className="py-24 bg-primary text-white">
                <div className="container text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium mb-4">Ready to Build Your Team?</h2>
                        <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                            Let's plan an unforgettable team building experience for your company. Contact us today for a free consultation and custom quote.
                        </p>
                        <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full h-14 px-8">
                            <Link to="/contact">
                                Contact Us <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </ScrollReveal>
                </div>
            </section>
        </Layout>
    );
};

export default TeamBuilding;
