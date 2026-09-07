import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gamepad2, Plane, PartyPopper, Brain } from "lucide-react";

const features = [
  {
    icon: Gamepad2,
    title: "Game Day",
    description: "Monthly outdoor games with Nexus 9. Join Team Red, Yellow, Blue, or Green!",
    link: "/game-day",
    color: "bg-team-red",
  },
  {
    icon: Plane,
    title: "Travel Adventures",
    description: "Explore Ghana's best destinations with our curated travel experiences.",
    link: "/travel",
    color: "bg-team-blue",
  },
  {
    icon: PartyPopper,
    title: "Epic Parties",
    description: "Beach vibes, rooftop hangouts, and themed parties you'll never forget.",
    link: "/events",
    color: "bg-team-yellow",
  },
  {
    icon: Brain,
    title: "Trivia Friday",
    description: "Test your knowledge in our weekly WhatsApp trivia competitions.",
    link: "/trivia",
    color: "bg-team-green",
  },
];

const QuickActions = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="text-center">
          <h2 className="text-3xl font-bold md:text-4xl">What We Do</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From competitive games to relaxing getaways, we've got something for everyone.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="group transition-all hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${feature.color} transition-transform group-hover:scale-110`}>
                  <feature.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                <Button asChild variant="link" className="mt-4">
                  <Link to={feature.link}>Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickActions;
