import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/events/EventCard";
import { mockEvents } from "@/data/mockData";

const FeaturedEvents = () => {
  const featuredEvents = mockEvents.filter((event) => event.featured);

  return (
    <section className="py-16">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Upcoming Events</h2>
            <p className="mt-2 text-muted-foreground">
              Don't miss out on our next adventure!
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/events">
              View All Events <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEvents;
