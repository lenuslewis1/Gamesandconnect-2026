import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Users, Plane, Trophy } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent-foreground py-20 text-primary-foreground md:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-team-red" />
        <div className="absolute right-20 top-20 h-16 w-16 rounded-full bg-team-yellow" />
        <div className="absolute bottom-20 left-1/4 h-24 w-24 rounded-full bg-team-blue" />
        <div className="absolute bottom-10 right-10 h-14 w-14 rounded-full bg-team-green" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-3xl text-center">
          {/* Team Colors Indicator */}
          <div className="mb-6 flex justify-center gap-2">
            <div className="h-4 w-4 rounded-full bg-team-red shadow-lg" />
            <div className="h-4 w-4 rounded-full bg-team-yellow shadow-lg" />
            <div className="h-4 w-4 rounded-full bg-team-blue shadow-lg" />
            <div className="h-4 w-4 rounded-full bg-team-green shadow-lg" />
          </div>

          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Vibes • Games • Travel • Community
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Join Ghana's most vibrant community of young people who love outdoor games, 
            epic parties, brain-teasing trivia, and unforgettable travel adventures.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="text-base">
              <Link to="/community">
                Join Our Community <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base">
              <Link to="/events">
                Explore Events
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="mt-3 text-3xl font-bold">50+</p>
            <p className="text-sm text-primary-foreground/70">Events Hosted</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
              <Users className="h-6 w-6" />
            </div>
            <p className="mt-3 text-3xl font-bold">2,000+</p>
            <p className="text-sm text-primary-foreground/70">Community Members</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
              <Plane className="h-6 w-6" />
            </div>
            <p className="mt-3 text-3xl font-bold">15+</p>
            <p className="text-sm text-primary-foreground/70">Destinations</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
              <Trophy className="h-6 w-6" />
            </div>
            <p className="mt-3 text-3xl font-bold">4</p>
            <p className="text-sm text-primary-foreground/70">Competing Teams</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
