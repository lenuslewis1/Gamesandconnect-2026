import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MapPin,
    Phone,
    Mail,
    Send,
    Loader2,
    MessageCircle,
    Instagram,
    Twitter
} from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import SEOHead from "@/components/seo/SEOHead";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [subject, setSubject] = useState("general");
    const [error, setError] = useState("");
    const inFlight = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inFlight.current) return;
        inFlight.current = true;
        setIsSubmitting(true);
        setError("");
        const form = e.currentTarget as HTMLFormElement;
        const value = (id: string) => (form.querySelector('#' + id) as HTMLInputElement)?.value.trim() || '';
        try {
            const { error } = await supabase.from('contact_messages').insert({
                name: `${value('firstName')} ${value('lastName')}`.trim(),
                email: value('email'), subject, message: value('message'),
            }).abortSignal(AbortSignal.timeout(20000));
            if (error) throw error;
            setIsSuccess(true);
        } catch {
            setError("We couldn't confirm your submission. Your message is still here. Please try again or call +233 50 589 1665.");
        } finally {
            inFlight.current = false;
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <SEOHead
                title="Contact Us — Reach Games and Connect in Accra"
                description="Get in touch with Games and Connect. Questions about events, team building, or partnerships in Ghana? Email, call, or send us a message. Based in Accra, Ghana."
                canonical="/contact"
            />
            <BreadcrumbSchema items={[{ name: "Home", url: "/" }, { name: "Contact", url: "/contact" }]} />
            <PageHeader
                title="Get in Touch"
                subtitle="We'd love to hear from you. Questions, feedback, or just want to say hi?"
            />

            <section className="py-24">
                <div className="container">
                    <div className="grid lg:grid-cols-2 gap-16">
                        {/* Contact Form */}
                        <div>
                            <ScrollReveal delay={0.1}>
                                <div className="max-w-lg">
                                    <h2 className="font-serif text-3xl font-medium mb-2">Send us a Message</h2>
                                    <p className="text-muted-foreground mb-8">
                                        Send your message directly to our team.
                                    </p>

                                    {isSuccess ? (
                                        <div role="status" className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8 text-center">
                                            <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-800/40 flex items-center justify-center text-green-600 dark:text-green-400 mx-auto mb-4">
                                                <Send className="h-6 w-6" />
                                            </div>
                                            <h3 className="font-serif text-xl font-medium mb-2">Your message has been submitted</h3>
                                            <p className="text-muted-foreground">
                                                Thank you. Our team will review your message and reply using your email address.
                                            </p>
                                            <Button
                                                variant="outline"
                                                className="mt-6 rounded-full"
                                                onClick={() => setIsSuccess(false)}
                                            >
                                                Send Another Message
                                            </Button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
                                            <fieldset disabled={isSubmitting} className="space-y-6">
                                            <div className="grid sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="firstName">First Name</Label>
                                                    <Input id="firstName" placeholder="Jane" required maxLength={100} className="rounded-xl h-12" />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="lastName">Last Name</Label>
                                                    <Input id="lastName" placeholder="Doe" required maxLength={100} className="rounded-xl h-12" />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input id="email" type="email" placeholder="jane@example.com" required maxLength={254} className="rounded-xl h-12" />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="subject">Subject</Label>
                                                <Select value={subject} onValueChange={setSubject}>
                                                    <SelectTrigger id="subject" className="rounded-xl h-12">
                                                        <SelectValue placeholder="What's this about?" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="general">General Inquiry</SelectItem>
                                                        <SelectItem value="events">Events & Tickets</SelectItem>
                                                        <SelectItem value="travel">Travel & Trips</SelectItem>
                                                        <SelectItem value="partnerships">Partnerships</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message</Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Tell us more..."
                                                    className="min-h-[150px] rounded-xl resize-none p-4"
                                                    required
                                                    maxLength={5000}
                                                />
                                            </div>

                                            <Button type="submit" size="lg" className="w-full rounded-full h-12" disabled={isSubmitting}>
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    "Send message"
                                                )}
                                            </Button>
                                            </fieldset>
                                            <p className="text-xs text-muted-foreground">We store your details so our team can respond to your message.</p>
                                            {error && <p role="alert" className="text-red-700">{error}</p>}
                                        </form>
                                    )}
                                </div>
                            </ScrollReveal>
                        </div>

                        {/* Contact Info & Socials */}
                        <div className="space-y-12">
                            {/* Info Cards */}
                            <div className="grid gap-6">
                                {[
                                    { icon: Mail, title: "Email Us", desc: "For general support and inquiries", value: "gamesandconnectgh@gmail.com", link: "mailto:gamesandconnectgh@gmail.com" },
                                    { icon: Phone, title: "Call Us", desc: "Mon-Fri from 8am to 5pm", value: "+233 50 589 1665", link: "tel:+233505891665" },
                                    { icon: MapPin, title: "Visit Us", desc: "East Legon, Accra\nGhana", value: "", link: null }
                                ].map((item, index) => (
                                    <ScrollReveal key={index} delay={0.2 + (index * 0.1)} variant="slide-in-right">
                                        <Card className={`border-border/50 shadow-none transition-colors ${index === 1 ? "bg-transparent hover:bg-transparent" : "bg-muted/20 hover:bg-muted/40"}`}>
                                            <CardContent className="p-6 flex items-start gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-[#4d7c0f] shrink-0">
                                                    <item.icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium mb-1">{item.title}</h3>
                                                    <p className="text-muted-foreground text-sm mb-2 whitespace-pre-line">{item.desc}</p>
                                                    {item.link && (
                                                        <a href={item.link} className="text-[#4d7c0f] hover:underline font-medium">
                                                            {item.value}
                                                        </a>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </ScrollReveal>
                                ))}
                            </div>

                            {/* Social Connect */}
                            <ScrollReveal delay={0.5}>
                                <div>
                                    <h3 className="font-serif text-2xl font-medium mb-6">Connect with us</h3>
                                    <div className="flex gap-4">
                                        <a href="https://www.instagram.com/games_connect_gh/" aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                                            <Instagram className="h-5 w-5" />
                                        </a>
                                        <a href="https://x.com/GamesConnect_gh" aria-label="X (Twitter)" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                                            <Twitter className="h-5 w-5" />
                                        </a>
                                        <a href="https://wa.me/233505891665" aria-label="Contact us on WhatsApp" target="_blank" rel="noopener noreferrer" className="h-12 w-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300">
                                            <MessageCircle className="h-5 w-5" />
                                        </a>
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Contact;
