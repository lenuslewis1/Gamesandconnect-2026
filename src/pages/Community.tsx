import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTestimonials } from "@/hooks/useSupabaseData";
import {
    MessageCircle,
    Users,
    Calendar,
    Gift,
    Bell,
    Heart,
    CheckCircle2,
    Star,
    Loader2,
    Quote,
    ArrowRight
} from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";

const communityFAQs = [
    {
        question: "How do I join the Games and Connect community?",
        answer: "Join our WhatsApp community by clicking the join button on our website. It's free and gives you priority access to events, exclusive discounts, and a network of fun young people in Ghana."
    },
    {
        question: "Is the Games and Connect community free?",
        answer: "Yes! Joining the Games and Connect WhatsApp community is completely free. You get priority access to event registrations, exclusive member discounts, and weekly trivia competitions with cash prizes."
    }
];

const benefits = [
    {
        icon: Calendar,
        title: "Priority Access",
        description: "Be the first to know about trip slots and game day registrations before we go public.",
    },
    {
        icon: Gift,
        title: "Exclusive Deals",
        description: "Community members get special discounts on travel packages and merchandise.",
    },
    {
        icon: Users,
        title: "Find Your Tribe",
        description: "Connect with 2,000+ young people who share your interests in games and travel.",
    },
    {
        icon: Bell,
        title: "Stay in the Loop",
        description: "Get real-time updates so you never miss a spontaneous meetup or event.",
    },
    {
        icon: Star,
        title: "Trivia Friday Access",
        description: "Compete in our weekly WhatsApp trivia battles for real cash prizes.",
    },
    {
        icon: Heart,
        title: "Safe Space",
        description: "A moderated, positive environment where everyone is welcome and respected.",
    },
];

const communityStats = [
    { label: "Active Members", value: "2,000+", icon: Users },
    { label: "Community Events", value: "50+", icon: Calendar },
    { label: "Cities Reached", value: "15+", icon: Star },
];

const guidelines = [
    "Kindness is key. Respect everyone.",
    "No spam or unauthorized promos.",
    "Keep conversations fun and relevant.",
    "What happens in the group shares in the group!",
    "Support your fellow members.",
];

const Community = () => {
    const whatsappLink = "https://chat.whatsapp.com/your-community-link";
    const { data: testimonials = [], isLoading: isLoadingTestimonials } = useTestimonials();

    return (
        <Layout>
            <SEOHead
                title="Join Ghana's Most Fun Community"
                description="Be part of 2,000+ young Ghanaians who love games, travel, and social events. Join the Games and Connect WhatsApp community for priority event access and exclusive deals."
                canonical="/community"
            />
            <FAQSchema faqs={communityFAQs} />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Community", url: "/community" }]} />
            <PageHeader
                title="Join The Inner Circle"
                subtitle="Ghana's most vibrant community of travelers, gamers, and thrill-seekers"
            >
                <div className="mt-8">
                    <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none">
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Join WhatsApp Community
                        </a>
                    </Button>
                    <p className="mt-3 text-sm text-muted-foreground/80">
                        Always free. Always fun.
                    </p>
                </div>
            </PageHeader>

            {/* Stats Section */}
            <section className="py-16 md:py-24 border-b border-border/50">
                <div className="container">
                    <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
                        {communityStats.map((stat) => (
                            <div key={stat.label} className="text-center group">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 mb-4">
                                    <stat.icon className="h-7 w-7" />
                                </div>
                                <p className="text-4xl font-bold text-foreground mb-2">
                                    {stat.value}
                                </p>
                                <p className="text-muted-foreground font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-24 bg-muted/30">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
                            Why You Should Join
                        </h2>
                        <p className="mx-auto max-w-xl text-muted-foreground text-lg">
                            It's more than just a group chat. It's a lifestyle.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {benefits.map((benefit) => (
                            <div
                                key={benefit.title}
                                className="bg-background rounded-2xl p-8 border border-border/50 hover:shadow-lg transition-all duration-300"
                            >
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                    <benefit.icon className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-serif font-medium mb-3">{benefit.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24">
                <div className="container">
                    <div className="text-center mb-16">
                        <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
                            Heard on the Streets
                        </h2>
                        <p className="mx-auto max-w-xl text-muted-foreground text-lg">
                            Don't just take our word for it
                        </p>
                    </div>

                    {isLoadingTestimonials && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {!isLoadingTestimonials && testimonials.length > 0 && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {testimonials.map((testimonial) => (
                                <Card
                                    key={testimonial.id}
                                    className="border-none bg-muted/30 shadow-none hover:bg-muted/50 transition-colors"
                                >
                                    <CardContent className="p-8 flex flex-col h-full">
                                        <Quote className="h-8 w-8 text-primary/20 mb-6" />
                                        <p className="text-muted-foreground italic leading-relaxed mb-6 flex-1">
                                            "{testimonial.content}"
                                        </p>
                                        <div className="flex items-center gap-3 pt-6 border-t border-border/10">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    src={testimonial.avatar_url || undefined}
                                                    alt={testimonial.name}
                                                />
                                                <AvatarFallback className="bg-primary/10 text-primary">
                                                    {testimonial.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold text-sm">{testimonial.name}</p>
                                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Community Guidelines */}
            <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="container relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
                                We Keep It Real
                            </h2>
                            <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
                                Our community is built on trust, respect, and good vibes.
                                We have a few simple rules to make sure everyone feels at home.
                            </p>
                            <Button variant="secondary" size="lg" className="rounded-full px-8 h-12">
                                Read Full Guidelines
                            </Button>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                            <h3 className="font-serif text-2xl font-medium mb-6">The Vibe Check</h3>
                            <ul className="space-y-4">
                                {guidelines.map((guideline, index) => (
                                    <li key={index} className="flex items-start gap-4">
                                        <div className="h-6 w-6 rounded-full bg-team-green flex items-center justify-center shrink-0 mt-0.5">
                                            <CheckCircle2 className="h-4 w-4 text-white" />
                                        </div>
                                        <span className="text-lg">{guideline}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 text-center">
                <div className="container">
                    <h2 className="font-serif text-3xl md:text-5xl font-medium mb-6">
                        You Belong Here
                    </h2>
                    <p className="mx-auto max-w-xl text-muted-foreground text-lg mb-10">
                        Join 2,000+ others who have found their tribe.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full h-16 px-10 text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all bg-[#25D366] hover:bg-[#25D366]/90 text-white border-none"
                    >
                        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-3 h-6 w-6" />
                            Join WhatsApp Community
                        </a>
                    </Button>
                </div>
            </section>
        </Layout>
    );
};

export default Community;
