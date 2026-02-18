import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Gamepad2, Plane, Users, Calendar, MapPin, Heart } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import ScrollReveal from "@/components/ui/ScrollReveal";

const faqs = [
    {
        question: "What is Games and Connect?",
        answer: "Games and Connect is Ghana's leading youth social events community, founded in 2023. Based in Accra, we organise monthly squad games days, travel adventures, team building events, and social networking experiences for young professionals and fun-loving adults across Ghana."
    },
    {
        question: "Where is Games and Connect based?",
        answer: "Games and Connect is based in East Legon, Accra, Ghana. Our events take place across Greater Accra and we organise travel trips to destinations throughout Ghana including Cape Coast, Akosombo, and Ada Foah."
    },
    {
        question: "Who can join Games and Connect events?",
        answer: "Anyone aged 18 and above who loves fun, games, travel, and meeting new people. Our community includes young professionals, students, entrepreneurs, and anyone looking for genuine social connections in Ghana."
    },
    {
        question: "How do I book a Games and Connect event?",
        answer: "Visit our events page to see upcoming events. Select the event you want, choose your ticket tier, and pay securely via mobile money. You'll receive a confirmation with all event details."
    },
    {
        question: "Is Games and Connect only in Accra?",
        answer: "While most of our regular events happen in Accra, we organise travel adventures to destinations across Ghana. We plan to expand to other cities in the future. Join our WhatsApp community for updates."
    },
    {
        question: "How can I contact Games and Connect?",
        answer: "Email us at hello@gamesandconnect.com, call +233 505 891 665, or send a message through our website contact page. You can also reach us on Instagram @games_connect_gh and Twitter @GamesConnect_gh."
    }
];

const WhatIsGamesAndConnect = () => {
    return (
        <Layout>
            <SEOHead
                title="What is Games and Connect? — Ghana's Social Events Community"
                description="Games and Connect is Ghana's leading youth events community. We organise squad games, travel adventures, team building, and social events in Accra for young professionals."
                canonical="/about/what-is-games-and-connect"
            />
            <FAQSchema faqs={faqs} />
            <BreadcrumbSchema items={[
                { name: "Home", url: "/" },
                { name: "About", url: "/about" },
                { name: "What is Games and Connect?", url: "/about/what-is-games-and-connect" }
            ]} />

            {/* Hero */}
            <section className="py-24 bg-[#FFF7ED]">
                <div className="container max-w-4xl text-center">
                    <ScrollReveal>
                        <h1 className="font-serif text-5xl md:text-6xl font-medium mb-6">
                            What is Games and Connect?
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Your comprehensive guide to Ghana's most exciting social events community.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Definition / Summary */}
            <section className="py-16">
                <div className="container max-w-3xl">
                    <ScrollReveal>
                        <div className="prose prose-lg max-w-none">
                            <p className="text-lg leading-relaxed text-muted-foreground">
                                <strong className="text-foreground">Games and Connect</strong> is Ghana's leading social events community for young people. Founded in 2023 and based in East Legon, Accra, we bring together young professionals, students, and fun-loving adults through monthly squad games days, travel adventures, corporate team building experiences, and social networking events.
                            </p>
                            <p className="text-lg leading-relaxed text-muted-foreground mt-4">
                                Our mission is simple: <strong className="text-foreground">cure loneliness by connecting people through play, travel, and adventure</strong>. In a world where genuine human connection is becoming rare, we create safe, inclusive spaces where people can make real friendships and lasting memories.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* What We Do */}
            <section className="py-24 bg-[#FFF7ED]">
                <div className="container max-w-4xl">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-16">
                            What Does Games and Connect Do?
                        </h2>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                icon: Gamepad2,
                                title: "Monthly Squad Games Day",
                                description: "Every month, teams compete in fun outdoor games in Accra. Physical challenges, mental puzzles, and team strategy games with a season leaderboard.",
                                link: "/game-day",
                                linkText: "Learn about Games Day"
                            },
                            {
                                icon: Plane,
                                title: "Travel Adventures",
                                description: "Group trips to beautiful destinations across Ghana — Cape Coast, Akosombo, Ada Foah, and more. All-inclusive packages with flexible payment plans.",
                                link: "/travel",
                                linkText: "Explore travel trips"
                            },
                            {
                                icon: Users,
                                title: "Corporate Team Building",
                                description: "Custom team building events for companies. Interbank games, department challenges, and corporate retreats designed to strengthen your team.",
                                link: "/team-building",
                                linkText: "Corporate events"
                            },
                            {
                                icon: Heart,
                                title: "Community & Networking",
                                description: "A 2,000+ member WhatsApp community with weekly trivia, exclusive event access, member discounts, and genuine friendships.",
                                link: "/community",
                                linkText: "Join the community"
                            }
                        ].map((item, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className="bg-white p-8 rounded-2xl shadow-sm h-full">
                                    <item.icon className="h-10 w-10 text-primary mb-4" />
                                    <h3 className="font-serif text-2xl font-medium mb-2">{item.title}</h3>
                                    <p className="text-muted-foreground mb-4">{item.description}</p>
                                    <Link to={item.link} className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                                        {item.linkText} <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key Facts */}
            <section className="py-24">
                <div className="container max-w-3xl">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium text-center mb-12">
                            Key Facts About Games and Connect
                        </h2>
                    </ScrollReveal>
                    <div className="space-y-4">
                        {[
                            { label: "Founded", value: "2023" },
                            { label: "Location", value: "East Legon, Accra, Ghana" },
                            { label: "Community Members", value: "2,000+" },
                            { label: "Events Hosted", value: "50+" },
                            { label: "Destinations Visited", value: "15+" },
                            { label: "Email", value: "hello@gamesandconnect.com" },
                            { label: "Phone", value: "+233 505 891 665" },
                            { label: "Instagram", value: "@games_connect_gh" },
                            { label: "Twitter", value: "@GamesConnect_gh" },
                            { label: "Website", value: "gamesandconnect.com" },
                        ].map((fact, i) => (
                            <ScrollReveal key={i} delay={i * 0.05}>
                                <div className="flex justify-between items-center py-3 border-b border-border">
                                    <span className="font-medium text-foreground">{fact.label}</span>
                                    <span className="text-muted-foreground">{fact.value}</span>
                                </div>
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
                            Frequently Asked Questions
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
            <section className="py-24">
                <div className="container text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-4xl font-medium mb-4">Ready to Join Us?</h2>
                        <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
                            Whether you want to compete in games, explore Ghana, or simply make new friends — Games and Connect has something for you.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button asChild size="lg" className="rounded-full h-14 px-8">
                                <Link to="/events">Browse Events</Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8">
                                <Link to="/community">Join Community</Link>
                            </Button>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </Layout>
    );
};

export default WhatIsGamesAndConnect;
