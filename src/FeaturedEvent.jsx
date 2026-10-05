import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useEvents } from "./legacy/hooks/useSupabaseData";
import { selectUpcomingEvent } from "./legacy/lib/upcomingEvent.mjs";

export default function FeaturedEvent() {
  const { data: events = [], isLoading, isError } = useEvents();
  const [today, setToday] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const updateDay = () => setToday(new Date().toISOString().slice(0, 10));
    const timer = window.setInterval(updateDay, 60_000);
    window.addEventListener("focus", updateDay);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", updateDay);
    };
  }, []);

  const event = selectUpcomingEvent(events, today);
  const date = event && new Date(event.date).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });

  return (
    <section className="feature-card section-pad" data-reveal aria-label="Featured event">
      <div className="feature-copy">
        <span>{event ? "UPCOMING EVENT" : "EXPLORE EVENTS"}</span>
        {event && <small>{date} · {event.location}</small>}
        <h2>{event ? event.title : "Your next adventure awaits"}</h2>
        <p>{event ? event.description : isLoading || isError
          ? "Explore game days, group trips and community experiences with Games and Connect."
          : "No upcoming events are listed yet. Explore past events and join the community for updates."}</p>
        {event?.price && <div className="event-price">{event.price}</div>}
        <Link className="pill pill-secondary" to={event ? `/events/${event.id}` : "/events"}>
          {event ? "View event" : "Explore events"}
        </Link>
      </div>
      <div className="feature-art">
        <img src={event?.image_url || "/assets/games-connect/travel.jpg"} alt={event ? event.title : "Games and Connect travel experiences"} />
      </div>
    </section>
  );
}
