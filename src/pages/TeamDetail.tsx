import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, X } from "lucide-react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import TextMotion from "@/components/ui/TextMotion";
import { useState, useEffect } from "react";
import { getTeamImagesFromStorage } from "./admin/TeamsGallery";

interface TeamData {
    id: string;
    name: string;
    color: string;
    textColor: string;
    description: string;
    motto: string;
    defaultImages: string[]; // Fallback images
}

const teamsData: Record<string, TeamData> = {
    red: {
        id: "red",
        name: "Team Red",
        color: "bg-team-red",
        textColor: "text-red-600",
        description: "The passionate warriors who bring fire and determination to every competition. Known for their fierce competitiveness and unwavering spirit, Team Red never backs down from a challenge.",
        motto: "Burn bright, fight hard!",
        defaultImages: [
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2393_cv5xbp.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918852/_MG_2075_i2peyk.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915388/_MG_2318_kszvtt.jpg",
        ],
    },
    green: {
        id: "green",
        name: "Team Green",
        color: "bg-team-green",
        textColor: "text-green-600",
        description: "The energetic nature force that thrives on teamwork and resilience. Team Green embodies growth, harmony, and the power of working together as one.",
        motto: "Grow together, win together!",
        defaultImages: [
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915398/_MG_2403_hknyss.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915399/_MG_2214_zq4dzb.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915389/_MG_2356_nlkxwl.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915382/_MG_2210_swxpme.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918852/_MG_2336_mxnylu.jpg",
        ],
    },
    blue: {
        id: "blue",
        name: "Team Blue",
        color: "bg-team-blue",
        textColor: "text-blue-600",
        description: "The cool strategists who blend intellect with agility to dominate. Team Blue approaches every game with calm precision and tactical brilliance.",
        motto: "Stay cool, stay winning!",
        defaultImages: [
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746918906/_MG_2027_oblrvo.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915400/_MG_2284_njl6kn.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915395/_MG_2305_z4ozhb.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915383/_MG_2106_epgam5.jpg",
        ],
    },
    yellow: {
        id: "yellow",
        name: "Team Yellow",
        color: "bg-team-yellow",
        textColor: "text-yellow-600",
        description: "The bright stars who radiate energy and positivity in every challenge. Team Yellow brings sunshine and enthusiasm to every competition they enter.",
        motto: "Shine bright, aim high!",
        defaultImages: [
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915401/_MG_2185_rqpdrv.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915388/_MG_2118_gi8okx.jpg",
            "https://res.cloudinary.com/drkjnrvtu/image/upload/v1746915393/_MG_2181_oohsbh.jpg",
        ],
    },
};

// Helper function to get images for a team (from storage or fallback)
const getTeamImages = (teamId: string): string[] => {
    const storedImages = getTeamImagesFromStorage(teamId);
    if (storedImages.length > 0) {
        return storedImages;
    }
    return teamsData[teamId]?.defaultImages || [];
};

const TeamDetail = () => {
    const { teamId } = useParams<{ teamId: string }>();
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [images, setImages] = useState<string[]>([]);

    const team = teamId ? teamsData[teamId] : null;

    // Load images from storage on mount and when teamId changes
    useEffect(() => {
        if (teamId) {
            setImages(getTeamImages(teamId));
        }
    }, [teamId]);

    if (!team) {
        return (
            <Layout>
                <div className="container py-32 text-center">
                    <h1 className="text-4xl font-bold mb-4">Team Not Found</h1>
                    <p className="text-muted-foreground mb-8">The team you're looking for doesn't exist.</p>
                    <Button asChild>
                        <Link to="/teams">Back to Teams</Link>
                    </Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Hero Section */}
            <section className={`${team.color} py-20 text-white relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
                <div className="container relative z-10">
                    <ScrollReveal>
                        <Button
                            variant="ghost"
                            className="mb-8 text-white hover:bg-white/20 hover:text-white"
                            onClick={() => navigate("/teams")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Teams
                        </Button>
                        <TextMotion
                            text={team.name}
                            variant="letter"
                            className="text-5xl md:text-7xl font-bold font-serif mb-6"
                        />
                        <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-4">
                            {team.description}
                        </p>
                        <p className="text-lg italic text-white/80">"{team.motto}"</p>
                    </ScrollReveal>
                </div>
            </section>

            {/* Photo Gallery */}
            <section className="py-20">
                <div className="container">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <TextMotion
                                text="Team Gallery"
                                variant="word"
                                className="text-3xl md:text-4xl font-bold font-serif mb-4"
                            />
                            <p className="text-muted-foreground">
                                Moments captured from our Game Day events
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {images.map((image, index) => (
                            <ScrollReveal key={index} delay={index * 0.1} variant="scale-up">
                                <div
                                    className="relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-500"
                                    onClick={() => setSelectedImage(image)}
                                >
                                    <img
                                        src={image}
                                        alt={`${team.name} photo ${index + 1}`}
                                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className={`absolute inset-0 ${team.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                                        <span className="text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/50 px-4 py-2 rounded-full">
                                            View Image
                                        </span>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Other Teams */}
            <section className="py-20 bg-muted/30">
                <div className="container">
                    <ScrollReveal>
                        <div className="text-center mb-12">
                            <TextMotion
                                text="Explore Other Teams"
                                variant="word"
                                className="text-3xl md:text-4xl font-bold font-serif mb-4"
                            />
                        </div>
                    </ScrollReveal>

                    <div className="grid gap-4 sm:grid-cols-3">
                        {Object.values(teamsData)
                            .filter((t) => t.id !== team.id)
                            .map((otherTeam, index) => (
                                <ScrollReveal key={otherTeam.id} delay={index * 0.1}>
                                    <Link to={`/teams/${otherTeam.id}`}>
                                        <div className={`${otherTeam.color} p-6 rounded-2xl text-white text-center hover:scale-105 transition-transform duration-300 shadow-lg hover:shadow-xl`}>
                                            <h3 className="text-xl font-bold font-serif">{otherTeam.name}</h3>
                                            <p className="text-white/80 text-sm mt-2">{getTeamImages(otherTeam.id).length} Photos</p>
                                        </div>
                                    </Link>
                                </ScrollReveal>
                            ))}
                    </div>
                </div>
            </section>

            {/* Lightbox Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </Layout>
    );
};

export default TeamDetail;
