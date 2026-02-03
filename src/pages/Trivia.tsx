import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import {
    MessageCircle,
    Trophy,
    Clock,
    Users,
    Gift,
    Brain,
    Star,
    CheckCircle2,
    Crown,
    ArrowRight
} from "lucide-react";

const pastWinners = [
    { name: "Efua Nyarko", prize: "GH₵200", date: "Jan 24, 2026" },
    { name: "Kofi Mensah", prize: "GH₵200", date: "Jan 17, 2026" },
    { name: "Ama Serwaa", prize: "GH₵150", date: "Jan 10, 2026" },
    { name: "Daniel Kwarteng", prize: "GH₵200", date: "Jan 3, 2026" },
];

const howToPlay = [
    {
        step: 1,
        title: "Join Group",
        description: "Hop into our WhatsApp community where it all goes down.",
        icon: MessageCircle,
    },
    {
        step: 2,
        title: "Be On Time",
        description: "Friday at 8 PM. Sharp. Speed is part of the game.",
        icon: Clock,
    },
    {
        step: 3,
        title: "Test Yourself",
        description: "Questions drop. First correct answer gets the point.",
        icon: Brain,
    },
    {
        step: 4,
        title: "Secure Bags",
        description: "Top scorers instantly win cash and airtime prizes.",
        icon: Gift,
    },
];

const categories = [
    { name: "General Knowledge", emoji: "🌍" },
    { name: "Pop Culture", emoji: "🎬" },
    { name: "Ghana Trivia", emoji: "🇬🇭" },
    { name: "Sports", emoji: "⚽" },
    { name: "Music", emoji: "🎵" },
    { name: "History", emoji: "📜" },
];

const Trivia = () => {
    return (
        <Layout>
            <PageHeader
                title="Trivia Friday"
                subtitle="The weekly brain battle where speed meets knowledge"
            >
                <div className="mt-8">
                    <Badge className="bg-[#FFD700]/20 text-[#B8860B] hover:bg-[#FFD700]/30 border border-[#FFD700]/30 text-lg px-6 py-2 rounded-full font-serif backdrop-blur-sm">
                        🧠 Every Friday @ 8:00 PM
                    </Badge>
                </div>
            </PageHeader>

            {/* Intro Stats */}
            <section className="py-16 md:py-24">
                <div className="container">
                    <div className="mx-auto max-w-3xl text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
                            Smart Pays. Literally.
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            It's fast, it's chaotic, and it's incredibly fun. Join hundreds of
                            players every Friday night competing for cash prizes and the
                            coveted title of "Big Brains".
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center p-8 bg-muted/20 rounded-2xl border border-border/50">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <Users className="h-6 w-6" />
                            </div>
                            <span className="text-3xl font-bold mb-1">500+</span>
                            <span className="text-muted-foreground">Weekly Players</span>
                        </div>
                        <div className="flex flex-col items-center p-8 bg-muted/20 rounded-2xl border border-border/50">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <Gift className="h-6 w-6" />
                            </div>
                            <span className="text-3xl font-bold mb-1">GH₵200+</span>
                            <span className="text-muted-foreground">Weekly Prizes</span>
                        </div>
                        <div className="flex flex-col items-center p-8 bg-muted/20 rounded-2xl border border-border/50">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                <Star className="h-6 w-6" />
                            </div>
                            <span className="text-3xl font-bold mb-1">Free</span>
                            <span className="text-muted-foreground">To Play</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How To Play */}
            <section className="py-24 bg-muted/30">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">How To Play</h2>
                        <p className="mx-auto max-w-xl text-muted-foreground text-lg">
                            Get in on the action in 4 easy steps
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                        {howToPlay.map((item, i) => (
                            <div key={item.step} className="bg-background rounded-2xl p-8 border border-border/50 hover:shadow-lg transition-all duration-300">
                                <div className="h-14 w-14 rounded-xl bg-primary/5 flex items-center justify-center text-primary mb-6">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-2">
                                    Step 0{item.step}
                                </div>
                                <h3 className="text-xl font-serif font-medium mb-3">{item.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Weekly Prizes */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 -z-10" />
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-5xl font-medium mb-4">The Prize Pool</h2>
                        <p className="mx-auto max-w-xl text-muted-foreground text-lg">
                            We award the top 3 scholars every single week
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:items-end max-w-4xl mx-auto">
                        {/* 2nd Place */}
                        <div className="w-full max-w-sm order-2 md:order-1">
                            <div className="bg-background rounded-t-3xl rounded-b-xl p-8 text-center border border-border/50 shadow-sm relative pt-12">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-slate-200 border-4 border-background flex items-center justify-center text-lg font-bold text-slate-600 shadow-sm">
                                    2
                                </div>
                                <h3 className="font-serif text-xl font-bold text-muted-foreground mb-2">Runner Up</h3>
                                <p className="text-4xl font-bold text-slate-600 mb-4">GH₵60</p>
                                <p className="text-sm text-muted-foreground">Cash sent instantly</p>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="w-full max-w-sm order-1 md:order-2 z-10">
                            <div className="bg-background rounded-t-3xl rounded-b-xl p-10 text-center border-2 border-[#FFD700] shadow-xl relative pt-16 transform md:-translate-y-4">
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-16 w-16 rounded-full bg-[#FFD700] border-4 border-background flex items-center justify-center text-2xl font-bold text-white shadow-md">
                                    <Crown className="h-8 w-8 text-white fill-white" />
                                </div>
                                <Badge className="mb-4 bg-[#FFD700]/20 text-[#B8860B] hover:bg-[#FFD700]/30 border-none">Champion</Badge>
                                <h3 className="font-serif text-2xl font-bold mb-2">1st Place</h3>
                                <p className="text-5xl font-bold text-primary mb-4">GH₵100</p>
                                <p className="text-sm text-muted-foreground font-medium">
                                    + Exclusive Merch & Bragging Rights
                                </p>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="w-full max-w-sm order-3">
                            <div className="bg-background rounded-t-3xl rounded-b-xl p-8 text-center border border-border/50 shadow-sm relative pt-12">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 h-12 w-12 rounded-full bg-[#CD7F32] border-4 border-background flex items-center justify-center text-lg font-bold text-white shadow-sm">
                                    3
                                </div>
                                <h3 className="font-serif text-xl font-bold text-muted-foreground mb-2">Third Place</h3>
                                <p className="text-4xl font-bold text-[#CD7F32] mb-4">GH₵40</p>
                                <p className="text-sm text-muted-foreground">Cash sent instantly</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Winners */}
            <section className="py-24 bg-muted/30">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">Hall of Fame</h2>
                        <p className="mx-auto max-w-xl text-muted-foreground text-lg">
                            Recent scholars who secured the bag
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
                        {pastWinners.map((winner, index) => (
                            <div key={index} className="flex items-center gap-4 bg-background p-4 rounded-xl border border-border/50 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{winner.name}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{winner.date}</span>
                                        <span className="h-1 w-1 rounded-full bg-border" />
                                        <span className="text-green-600 dark:text-green-400 font-medium">Won {winner.prize}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24">
                <div className="container text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-8">
                        <Brain className="h-8 w-8" />
                    </div>
                    <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
                        Ready to Flex Your Brain?
                    </h2>
                    <p className="mx-auto max-w-xl text-muted-foreground text-lg mb-10">
                        Join the WhatsApp community now to get notified when the next round starts.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none">
                            <Link to="/community">
                                <MessageCircle className="mr-2 h-5 w-5" />
                                Join WhatsApp Group
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Trivia;
