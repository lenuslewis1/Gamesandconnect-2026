import { useRef, useState, type MouseEvent } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import {
    ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Clock3,
    Expand, Loader2, MapPin, MessageCircle, Ticket,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import BookingModal from "@/components/events/BookingModal";
import SEOHead from "@/components/seo/SEOHead";
import { BreadcrumbSchema, EventSchema } from "@/components/seo/StructuredData";
import { eventMetadata } from "@/components/seo/eventMetadata.mjs";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { eventPhotos, type EventPhoto } from "@/data/eventPhotos";
import { savannahRecapPhotos } from "@/data/savannahGallery";
import { useEvents, useTestimonials } from "@/hooks/useSupabaseData";
import { eventPath, resolveEventLink } from "@/lib/eventLinks.mjs";
import "./EventDetail.css";

const fallbackImage = "/assets/games-connect/hero-game-day.jpg";

const EventPhotoGallery = ({ photos }: { photos: EventPhoto[] }) => {
    const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
    const availablePhotos = photos.filter(photo => !failedPhotos.includes(photo.src)).slice(0, 3);
    const markFailed = (src: string) => setFailedPhotos(failed => [...failed, src]);

    return (
        <div className="event-detail__photos" data-count={availablePhotos.length || 1}>
            {availablePhotos.length > 0 ? availablePhotos.map((photo, index) => (
                <Dialog key={photo.src}>
                    <DialogTrigger asChild>
                        <button type="button" className="event-detail__photo" aria-label={"Enlarge photo: " + photo.alt}>
                            <img
                                src={photo.src}
                                alt={photo.alt}
                                style={{ objectPosition: photo.position }}
                                fetchPriority={index === 0 ? "high" : undefined}
                                loading={index === 0 ? undefined : "lazy"}
                                decoding="async"
                                onError={() => markFailed(photo.src)}
                            />
                            <span className="event-detail__expand"><Expand aria-hidden="true" /></span>
                        </button>
                    </DialogTrigger>
                    <DialogContent aria-describedby={undefined} className="w-[calc(100%-2rem)] max-w-5xl border-none p-5">
                        <DialogTitle className="sr-only">{photo.alt}</DialogTitle>
                        <img src={photo.src} alt={photo.alt} className="max-h-[82vh] w-full object-contain" />
                    </DialogContent>
                </Dialog>
            )) : (
                <div className="event-detail__photo">
                    <img src={fallbackImage} alt="Games and Connect attendees playing together" fetchPriority="high" />
                    <span className="event-detail__photo-credit">From Games &amp; Connect</span>
                </div>
            )}
        </div>
    );
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});

const formatDate = (date: string, endDate?: string) => (
    endDate && endDate !== date
        ? dateFormatter.formatRange(new Date(date), new Date(endDate))
        : dateFormatter.format(new Date(date))
);

const EventDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const bookingTrigger = useRef<HTMLButtonElement | null>(null);
    const [bookingEventId, setBookingEventId] = useState<number | null>(null);
    const [selectedRecapPhoto, setSelectedRecapPhoto] = useState<string | null>(null);
    const { data: allEvents = [], isLoading, error } = useEvents();
    const { data: testimonials = [] } = useTestimonials();
    const event = resolveEventLink(allEvents, id);

    if (isLoading) {
        return (
            <Layout>
                <div role="status" className="flex min-h-[65vh] items-center justify-center">
                    <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin text-[var(--forest)]" />
                    <span className="sr-only">Loading event</span>
                </div>
            </Layout>
        );
    }

    if (error || !event) {
        const title = error ? "We couldn’t load this event" : "Event not found";
        return (
            <Layout>
                <SEOHead title={title} description="Explore upcoming Games and Connect events." noindex />
                <div className="container flex min-h-[65vh] flex-col items-center justify-center gap-5 text-center">
                    <h1 className="font-serif text-4xl">{title}</h1>
                    <Link to="/events" className="event-detail__action">Browse events <ArrowRight aria-hidden="true" /></Link>
                </div>
            </Layout>
        );
    }

    const canonicalPath = eventPath(event);
    if (location.pathname !== canonicalPath) {
        return <Navigate to={canonicalPath + location.search + location.hash} replace />;
    }

    const metadata = eventMetadata(event);
    const today = new Date().toISOString().slice(0, 10);
    const isPastEvent = event.date.slice(0, 10) < today;
    const isBookingOpen = bookingEventId === event.id;
    const openBooking = (click: MouseEvent<HTMLButtonElement>) => {
        bookingTrigger.current = click.currentTarget;
        setBookingEventId(event.id);
    };
    const price = event.price?.trim();
    const description = event.description?.trim();
    const eventDate = formatDate(event.date, metadata.endDate);
    const testimonial = testimonials.find(({ is_featured }) => is_featured) || testimonials[0];
    const photos = eventPhotos(event);
    const upcomingByPath = new Map<string, typeof event>();
    for (const related of allEvents) {
        const path = eventPath(related);
        if (path !== canonicalPath && related.date.slice(0, 10) >= today) {
            const current = upcomingByPath.get(path);
            if (!current || related.date > current.date || (related.date === current.date && related.id > current.id)) {
                upcomingByPath.set(path, related);
            }
        }
    }
    const relatedEvents = [...upcomingByPath.values()].sort((a, b) => a.date.localeCompare(b.date));
    const upcomingEvents = [
        ...relatedEvents.filter(related => related.category === event.category),
        ...relatedEvents.filter(related => related.category !== event.category),
    ].slice(0, 2);

    const ticketButton = () => (
        <button type="button" className="event-detail__action" onClick={openBooking}>
            <Ticket aria-hidden="true" /> Get tickets <ArrowRight aria-hidden="true" />
        </button>
    );

    return (
        <Layout>
            <SEOHead
                title={event.title + " — Event in " + event.location}
                description={description?.slice(0, 155) || "Find event details for " + event.title + " by Games and Connect."}
                canonical={canonicalPath}
                ogImage={event.image_url || undefined}
            />
            <EventSchema
                name={event.title}
                description={event.description}
                startDate={event.date}
                location={event.location}
                image={event.image_url || undefined}
                price={event.price || undefined}
                url={"https://gamesandconnect.com" + canonicalPath}
                timeRange={event.time_range}
                capacity={event.capacity}
                endDate={metadata.endDate}
                bookingOpen={!isPastEvent}
                ticketSalesStart={metadata.ticketSalesStart}
                performers={metadata.performers}
            />
            <BreadcrumbSchema items={[
                { name: "Home", url: "/" },
                { name: "Events", url: "/events" },
                { name: event.title, url: canonicalPath },
            ]} />

            <article className="event-detail">
                <div className="event-detail__wrap">
                    <Link className="event-detail__back" to="/events">
                        <ArrowLeft aria-hidden="true" /> All events
                    </Link>

                    <header className="event-detail__hero">
                        <div className="event-detail__hero-title">
                            {(isPastEvent || event.category) && (
                                <p className="event-detail__eyebrow">{isPastEvent ? "Past event" : event.category}</p>
                            )}
                            <h1>{event.title}</h1>
                        </div>

                        <div className="event-detail__hero-info">
                            <ul className="event-detail__facts">
                                <li><CalendarDays aria-hidden="true" /><time dateTime={event.date}>{eventDate}</time></li>
                                {event.time_range && <li><Clock3 aria-hidden="true" /><span>{event.time_range} <small>Ghana time</small></span></li>}
                                {event.location && <li><MapPin aria-hidden="true" /><span>{event.location}</span></li>}
                            </ul>

                            {isPastEvent ? (
                                <Link to="/events" className="event-detail__action">
                                    Browse upcoming events <ArrowRight aria-hidden="true" />
                                </Link>
                            ) : (
                                <div className="event-detail__hero-booking">
                                    {price && <div className="event-detail__price"><span>Tickets</span><strong>{price}</strong></div>}
                                    {ticketButton()}
                                </div>
                            )}
                        </div>
                    </header>
                </div>

                <EventPhotoGallery key={event.id} photos={photos} />

                <div className="event-detail__wrap">
                    <div className="event-detail__body">
                        <div>
                            {description && (
                                <section aria-labelledby="event-about-title">
                                    <h2 id="event-about-title">About this event</h2>
                                    <p className="event-detail__description">{description}</p>
                                </section>
                            )}
                            {testimonial && (
                                <figure className="event-detail__quote">
                                    <figcaption>
                                        <span className="event-detail__eyebrow">From the community</span>
                                        <span>{testimonial.name}{testimonial.role && " · " + testimonial.role}</span>
                                    </figcaption>
                                    <blockquote>“{testimonial.content}”</blockquote>
                                </figure>
                            )}
                        </div>

                        <div className="event-detail__sidebar">
                            {event.image_url && (
                                <Dialog>
                                    <section className="event-detail__flyer-section" aria-labelledby="event-flyer-title">
                                        <h2 id="event-flyer-title">Event flyer</h2>
                                        <DialogTrigger asChild>
                                            <button type="button" className="event-detail__flyer-preview" aria-label="Enlarge event flyer">
                                                <img src={event.image_url} alt={event.title + " event flyer"} loading="lazy" decoding="async" />
                                                <span className="event-detail__expand"><Expand aria-hidden="true" /></span>
                                            </button>
                                        </DialogTrigger>
                                    </section>
                                    <DialogContent aria-describedby={undefined} className="w-[calc(100%-2rem)] max-w-4xl border-none p-5">
                                        <DialogTitle className="sr-only">{event.title} event flyer</DialogTitle>
                                        <img src={event.image_url} alt={event.title + " event flyer"} className="max-h-[82vh] w-full object-contain" />
                                    </DialogContent>
                                </Dialog>
                            )}
                            <aside className="event-detail__help" aria-labelledby="event-help-title">
                                <MessageCircle aria-hidden="true" />
                                <h2 id="event-help-title">Questions?</h2>
                                <p>Ask Games &amp; Connect about the event or your booking.</p>
                                <a
                                    href={"https://wa.me/233505891665?text=" + encodeURIComponent("Hi Games & Connect, I have a question about " + event.title + ".")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Chat on WhatsApp <ArrowUpRight aria-hidden="true" />
                                    <span className="sr-only"> (opens in a new tab)</span>
                                </a>
                                {!isPastEvent && <Link to="/terms-and-conditions">Booking and refund terms <ArrowRight aria-hidden="true" /></Link>}
                            </aside>
                        </div>
                    </div>
                </div>

            {String(event.id) === "40" && (
                <section className="py-20 bg-accent/30" aria-labelledby="savannah-recap-title">
                    <div className="container">
                        <ScrollReveal>
                            <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                                <div>
                                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#4d7c0f]">The trip, remembered</p>
                                    <h2 id="savannah-recap-title" className="font-serif text-3xl font-medium md:text-4xl">Savannah, in moments</h2>
                                </div>
                                <p className="max-w-md text-muted-foreground">A few scenes from the people, wildlife and landscapes that made the journey.</p>
                            </div>
                        </ScrollReveal>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
                            {savannahRecapPhotos.map((photo, index) => (
                                <Dialog key={photo.id} open={selectedRecapPhoto === photo.id} onOpenChange={(open) => setSelectedRecapPhoto(open ? photo.id : null)}>
                                    <DialogTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedRecapPhoto(photo.id)}
                                            aria-label={`View Savannah trip photo ${index + 1}`}
                                            className={`group relative block w-full overflow-hidden rounded-2xl bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4d7c0f] ${index === 0 || index === 5 ? "aspect-[4/5] md:row-span-2 md:aspect-auto md:min-h-[26rem]" : "aspect-[4/3]"}`}
                                        >
                                            <img src={photo.image_url} alt={photo.caption || "Savannah trip moment"} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                                            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-4 pb-4 pt-10 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">Savannah Experience</span>
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent aria-describedby={undefined} className="max-w-5xl border-none bg-transparent p-0 shadow-2xl">
                                        <DialogTitle className="sr-only">{photo.caption || "Savannah trip photo"}</DialogTitle>
                                        <div className="overflow-hidden rounded-2xl bg-black/90">
                                            <img src={photo.image_url} alt={photo.caption || "Savannah trip moment"} className="max-h-[82vh] w-full object-contain" />
                                            <p className="bg-black/50 p-4 text-center text-sm text-white/80">{photo.caption}</p>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ))}
                        </div>
                    </div>
                </section>
            )}

                {!isPastEvent && (
                    <section className="event-detail__wrap event-detail__close" aria-label="Book this event">
                        <div>
                            <p className="event-detail__eyebrow">{eventDate}</p>
                            <h2>Join us at {event.title}</h2>
                        </div>
                        {ticketButton()}
                    </section>
                )}

                {upcomingEvents.length > 0 && (
                    <section className="event-detail__wrap event-detail__related" aria-labelledby="event-related-title">
                        <div className="event-detail__related-heading">
                            <h2 id="event-related-title">More upcoming events</h2>
                            <Link to="/events">View all <ArrowRight aria-hidden="true" /></Link>
                        </div>
                        <div className="event-detail__related-list">
                            {upcomingEvents.map(related => (
                                <Link key={related.id} to={eventPath(related)} className="event-detail__related-event">
                                    <img src={related.image_url || fallbackImage} alt="" loading="lazy" />
                                    <div>
                                        <time dateTime={related.date}>{formatDate(related.date)}</time>
                                        <h3>{related.title}</h3>
                                        <p>{related.location}</p>
                                    </div>
                                    <ArrowUpRight aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {!isPastEvent && (
                    <div className="event-detail__mobile-booking">
                        {price ? <div className="event-detail__price"><span>Tickets</span><strong>{price}</strong></div> : null}
                        {ticketButton()}
                    </div>
                )}
            </article>

            {!isPastEvent && (
                <BookingModal
                    key={event.id}
                    isOpen={isBookingOpen}
                    onClose={() => setBookingEventId(null)}
                    onCloseAutoFocus={(focusEvent) => {
                        if (bookingTrigger.current) {
                            focusEvent.preventDefault();
                            bookingTrigger.current.focus({ preventScroll: true });
                        }
                    }}
                    event={event}
                />
            )}
        </Layout>
    );
};

export default EventDetail;
