import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Timer, MapPin, ArrowRight, Gamepad2, Star } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import ScrollReveal from "@/components/ui/ScrollReveal";

const faqs = [
    {
        question: "What is Games Day in Accra?",
        answer: "Games Day is a monthly outdoor event in Accra organised by Games and Connect. Teams compete in fun physical and mental games for points on the season leaderboard. It's the most exciting social event for young people in Accra."
    },
    {
        question: "When is the next Games Day in Accra?",
        answer: "Games Day happens monthly in Accra. Check our events page for the next date. Join our WhatsApp community for early announcements and priority registration before spots fill up."
    },
    {
        question: "Do I need a team to attend Games Day?",
        answer: "No! You can attend solo and we'll place you in a team. Games Day is designed for making new friends. Many of our strongest friendships started at Games Day in Accra."
    },
    {
        question: "What games are played at Games Day?",
        answer: "Games vary each month and include relay races, puzzle challenges, trivia, strategy games, and physical team activities. Every Games Day features a fresh mix of indoor and outdoor games to keep things exciting."
    }
];

const howItWorks = [
    {
        icon: Gamepad2,
        title: "Register Your Team",
        description: "Sign up solo or with friends. We form balanced teams for maximum fun. Everyone plays.",
    },
    {
        icon: Trophy,
        title: "Compete in Games",
        description: "5-7 exciting games per event. From relay races to mental challenges. Every game earns points.",
    },
    {
        icon: Star,
        title: "Climb the Leaderboard",
        description: "Points accumulate across the season. Top teams win prizes and bragging rights.",
    },
    {
        icon: Users,
        title: "Connect & Celebrate",
        description: "After the games, hang out, share laughs, and make friends. That's the real win.",
    },
];

const GamesDayAccra = () => {
    return (
        <Layout>
            <SEOHead
                title="Monthly Games Day in Accra — Fun Squad Games Event"
                description="Join the monthly Games Day in Accra with Games and Connect! Outdoor team games, fierce competition, and good vibes. Register for the next event near you."
                canonical="/games-day-accra"
            />
            <FAQSchema faqs={faqs} />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Games Day Accra", url: "/games-day-accra" }]} />

            {/* Hero */}
            <section className="relative py-32 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 25% 50%, #daee51 0%, transparent 50%)' }} />
                <div className="container relative z-10 text-center">
                    <ScrollReveal>
                        <p className="text-[#4d7c0f] uppercase tracking-wider text-sm font-bold mb-4">🎮 Monthly in Accra</p>
                        <h1 className="font-serif text-5xl md:text-7xl font-medium mb-6">
                            Squad Games Day in Accra
                        </h1>
                        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                            The most exciting monthly games event in Accra. Compete, connect, and conquer with Ghana's most fun community.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-full h-14 px-8">
                                <Link to="/game-day">See Next Event</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full h-14 px-8">
                                <Link to="/community">Join Community</Link>
                            </Button>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Summary Snippet */}
            <section className="py-16 bg-accent/30">
                <div className="container max-w-3xl text-center">
                    <ScrollReveal>
                        <p className="text-lg text-muted-foreground leading-relaxed">
                            <strong>Squad Games Day</strong> is a monthly outdoor games event in Accra, Ghana, organised by Games and Connect. Every month, dozens of young professionals come together to compete in fun team games, earn points on the season leaderboard, and make genuine connections. Whether you're a seasoned gamer or a first-timer, Games Day is the best thing to do in Accra this weekend.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-24">
                <div className="container">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-16">
                            How Does Games Day in Accra Work?
                        </h2>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {howItWorks.map((item, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <Card className="text-center h-full border-none shadow-lg hover:shadow-xl transition-shadow">
                                    <CardContent className="pt-8 pb-6">
                                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                            <item.icon className="h-7 w-7 text-[#4d7c0f]" />
                                        </div>
                                        <h3 className="font-serif text-xl font-medium mb-2">{item.title}</h3>
                                        <p className="text-muted-foreground text-sm">{item.description}</p>
                                    </CardContent>
                                </Card>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* What to Expect */}
            <section className="py-24 bg-accent/30">
                <div className="container max-w-4xl">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-12">
                            What to Expect at Games Day
                        </h2>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            { emoji: "🏃", title: "Physical Challenges", desc: "Relay races, obstacle courses, and team sprints that get your adrenaline pumping." },
                            { emoji: "🧠", title: "Mental Games", desc: "Trivia rounds, puzzle challenges, and strategy games that test your wits." },
                            { emoji: "📸", title: "Professional Photos", desc: "Every event is photographed so you can relive the memories and share on social." },
                            { emoji: "🎉", title: "After-Party Vibes", desc: "Music, refreshments, and socialising after the games. The real connections happen here." }
                        ].map((item, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className="flex gap-4 items-start p-6 bg-white rounded-2xl shadow-sm">
                                    <span className="text-3xl">{item.emoji}</span>
                                    <div>
                                        <h3 className="font-serif text-lg font-medium mb-1">{item.title}</h3>
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
                            Frequently Asked Questions About Games Day in Accra
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
            <section className="py-24 bg-[#1a1a2e] text-white">
                <div className="container text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium mb-4">Ready to Play?</h2>
                        <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
                            Don't miss the next Games Day in Accra. Register now and experience the most fun event for young people in Ghana.
                        </p>
                        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 rounded-full h-14 px-8">
                            <Link to="/game-day">
                                Register Now <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </ScrollReveal>
                </div>
            </section>
        </Layout>
    );
};

export default GamesDayAccra;
