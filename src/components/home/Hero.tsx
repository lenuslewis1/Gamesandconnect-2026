import { ArrowRight, Users, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TextMotion from "@/components/ui/TextMotion";

const Hero = () => {
    return (
        <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-background">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <ScrollReveal delay={0.1}>
                        <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                            Join the #1 Youth Community in Ghana
                        </div>
                    </ScrollReveal>

                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold tracking-tight text-foreground leading-[1.1]">
                        <TextMotion text="Play. Travel." variant="word" delay={0.2} />
                        <br />
                        <TextMotion text="Connect." variant="word" delay={0.6} className="text-primary" />
                    </h1>

                    <TextMotion
                        text="Looking for your squad? We curate epic game nights, road trips, and experiences designed to help you meet new people and make lifelong friends."
                        variant="word"
                        delay={0.8}
                        stagger={0.02}
                        className="text-xl text-muted-foreground max-w-lg leading-relaxed block"
                    />

                    <ScrollReveal delay={0.4}>
                        <div className="flex flex-wrap gap-4">
                            <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105" asChild>
                                <Link to="/events">
                                    Find an Event <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg border-2 hover:bg-muted/50" asChild>
                                <Link to="/about">
                                    Our Story
                                </Link>
                            </Button>
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.5}>
                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-muted overflow-hidden">
                                        <img
                                            src={`https://i.pravatar.cc/100?img=${i + 10}`}
                                            alt="User"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="text-sm">
                                <span className="font-bold block text-lg">500+</span>
                                <span className="text-muted-foreground">Community Members</span>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>

                <div className="relative hidden lg:block h-[600px]">
                    <ScrollReveal variant="scale-up" duration={0.8} delay={0.2} width="100%" className="h-full">
                        <div className="absolute right-0 top-0 w-4/5 h-4/5 bg-muted rounded-3xl overflow-hidden shadow-2xl rotate-3 transition-transform hover:rotate-2">
                            <img
                                src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1742488675/_MG_1344_y4iq2a.jpg"
                                alt="Friends at Games and Connect event"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <div className="absolute left-0 bottom-20 w-3/5 h-3/5 bg-background rounded-3xl overflow-hidden shadow-2xl -rotate-6 border-8 border-background transition-transform hover:-rotate-3">
                            <img
                                src="https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg"
                                alt="Community gathering"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        {/* Floating Badge 1 */}
                        <div className="absolute top-20 left-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl animate-bounce-slow">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Trophy className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground">Next Event</p>
                                    <p className="font-bold text-sm text-foreground">Game Day</p>
                                </div>
                            </div>
                        </div>

                        {/* Floating Badge 2 */}
                        <div className="absolute bottom-40 right-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl animate-bounce-slow delay-700">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground">Date</p>
                                    <p className="font-bold text-sm text-foreground">This Weekend</p>
                                </div>
                            </div>
                        </div>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};


export default Hero;
