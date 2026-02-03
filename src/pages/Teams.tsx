import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Users, ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TextMotion from "@/components/ui/TextMotion";

const teams = [
    {
        id: "red",
        name: "Team Red",
        color: "bg-team-red",
        hoverColor: "group-hover:shadow-red-500/30",
        description: "The passionate warriors who bring fire and determination to every competition.",
        memberCount: "50+",
        image: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg",
    },
    {
        id: "green",
        name: "Team Green",
        color: "bg-team-green",
        hoverColor: "group-hover:shadow-green-500/30",
        description: "The energetic nature force that thrives on teamwork and resilience.",
        memberCount: "55+",
        image: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg",
    },
    {
        id: "blue",
        name: "Team Blue",
        color: "bg-team-blue",
        hoverColor: "group-hover:shadow-blue-500/30",
        description: "The cool strategists who blend intellect with agility to dominate.",
        memberCount: "48+",
        image: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg",
    },
    {
        id: "yellow",
        name: "Team Yellow",
        color: "bg-team-yellow",
        hoverColor: "group-hover:shadow-yellow-500/30",
        description: "The bright stars who radiate energy and positivity in every challenge.",
        memberCount: "45+",
        image: "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915401/_MG_2185_rqpdrv.jpg",
    },
];

const Teams = () => {
    return (
        <Layout>
            <PageHeader
                title="Our Teams"
                subtitle="Four houses, one community. Pick your colors and join the family."
            />

            {/* Team Cards */}
            <section className="py-20">
                <div className="container">
                    <ScrollReveal>
                        <div className="text-center mb-16">
                            <TextMotion
                                text="Meet the Teams"
                                variant="word"
                                className="text-3xl font-bold md:text-5xl font-serif mb-4"
                            />
                            <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
                                Each team has its own identity, culture, and legacy.
                                Explore our four houses and see which one calls to you.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid gap-8 md:grid-cols-2">
                        {teams.map((team, index) => (
                            <ScrollReveal key={team.id} delay={index * 0.1} variant="scale-up">
                                <Link to={`/teams/${team.id}`}>
                                    <Card className={`overflow-hidden border-none transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group h-full ${team.hoverColor}`}>
                                        <div className="relative h-72 overflow-hidden">
                                            <img
                                                src={team.image}
                                                alt={team.name}
                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className={`absolute inset-0 ${team.color} opacity-40 group-hover:opacity-30 transition-opacity duration-500`} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                                <h3 className="text-3xl font-bold text-white mb-2 font-serif">{team.name}</h3>
                                                <p className="text-white/80 text-sm">{team.description}</p>
                                            </div>
                                        </div>
                                        <CardContent className={`${team.color} p-6`}>
                                            <div className="flex items-center justify-between text-white">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-5 w-5" />
                                                    <span className="font-medium">{team.memberCount} Members</span>
                                                </div>
                                                <div className="flex items-center gap-2 font-medium group-hover:gap-3 transition-all">
                                                    View Gallery
                                                    <ArrowRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join a Team CTA */}
            <section className="py-24 bg-muted/30">
                <div className="container text-center">
                    <ScrollReveal>
                        <TextMotion
                            text="Ready to Join?"
                            variant="word"
                            className="text-4xl font-serif font-bold mb-6"
                        />
                        <p className="mx-auto max-w-xl text-muted-foreground text-lg mb-8">
                            Register for our next Game Day event and get assigned to a team.
                            Your journey starts here!
                        </p>
                        <Link
                            to="/events"
                            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
                        >
                            View Upcoming Events
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </ScrollReveal>
                </div>
            </section>
        </Layout>
    );
};

export default Teams;
