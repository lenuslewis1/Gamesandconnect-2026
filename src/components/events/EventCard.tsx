import { Link } from "react-router-dom";
import { Calendar, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Event } from "@/data/mockData";

interface EventCardProps {
  event: Event;
  className?: string;
}

const categoryColors = {
  games: "bg-team-red text-primary-foreground",
  travel: "bg-team-blue text-primary-foreground",
  party: "bg-team-yellow text-foreground",
  trivia: "bg-team-green text-primary-foreground",
};

const EventCard = ({ event, className }: EventCardProps) => {
  const formattedDate = new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className={cn("group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1", className)}>
      <div className="relative aspect-video overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <Badge className={cn("absolute left-3 top-3", categoryColors[event.category])}>
          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
        </Badge>
        {event.featured && (
          <Badge className="absolute right-3 top-3 bg-primary">Featured</Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold line-clamp-1">{event.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate} • {event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <span className="text-lg font-bold text-primary">
          {event.price === 0 ? "Free" : `GH₵${event.price}`}
        </span>
        <Button asChild size="sm">
          <Link to={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
