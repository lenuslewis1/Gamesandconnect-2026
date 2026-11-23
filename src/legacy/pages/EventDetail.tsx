import { useEffect, useRef, useState, type Ref } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import {
    ArrowLeft, ArrowRight, ArrowUpRight, CalendarDays, Clock3,
    Expand, Loader2, MapPin, MessageCircle, Ticket,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import BookingForm from "@/components/events/BookingForm";
import SEOHead from "@/components/seo/SEOHead";
import { BreadcrumbSchema, EventSchema } from "@/components/seo/StructuredData";
import { eventMetadata, formatEventDate } from "@/components/seo/eventMetadata.mjs";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { defaultEventCover, eventPhotos, type EventPhoto } from "@/data/eventPhotos";
import { savannahRecapPhotos } from "@/data/savannahGallery";
import { useEvents, useTestimonials } from "@/hooks/useSupabaseData";
import { eventPath, resolveEventLink } from "@/lib/eventLinks.mjs";
import type { DbEvent } from "@/lib/supabase";
import "./EventDetail.css";
import "./EventBooking.css";

function EventHero({ event, eventDate, photos, isPastEvent, heroRef }: {
    event: DbEvent;
    eventDate: string;
    photos: EventPhoto[];
    isPastEvent: boolean;
    heroRef: Ref<HTMLElement>;
}) {
    const [failedPhotos, setFailedPhotos] = useState<string[]>([]);
    const [loadedPhotos, setLoadedPhotos] = useState<string[]>([]);
    const [slideIndex, setSlideIndex] = useState(0);
    const [bookingStarted, setBookingStarted] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const availablePhotos = photos.filter(photo => !failedPhotos.includes(photo.src)).slice(0, 3);
    const slides: EventPhoto[] = availablePhotos.length ? availablePhotos : [{ src: defaultEventCover, alt: "" }];
    const slideCount = slides.length;
    const activeIndex = slideIndex % slideCount;
    const leadReady = loadedPhotos.includes(slides[0].src);
    const nextReady = loadedPhotos.includes(slides[(activeIndex + 1) % slideCount].src);
    useEffect(() => {
        const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setReducedMotion(motion.matches);
        motion.addEventListener("change", update);
        return () => motion.removeEventListener("change", update);
    }, []);

    useEffect(() => {
        if (bookingStarted || reducedMotion || slideCount < 2 || !leadReady || !nextReady) return;
        const timer = window.setInterval(() => {
            if (!document.hidden) setSlideIndex(index => (index + 1) % slideCount);
        }, 6500);
        return () => window.clearInterval(timer);
    }, [activeIndex, bookingStarted, leadReady, nextReady, reducedMotion, slideCount]);

    return (
        <header ref={heroRef} className="event-checkout"
            onFocusCapture={event => {
                if (event.target.closest("#booking")) setBookingStarted(true);
            }}>
            <div aria-hidden="true" className="event-checkout__backdrop">
                {slides.map((photo, index) => {
                    if (index !== 0 && index !== activeIndex && (!leadReady || reducedMotion)) return null;
                    return (
                        <picture key={photo.src}>
                            {photo.mobileSrc && <source media="(max-width: 767px)" srcSet={photo.mobileSrc} />}
                            <img
                                src={photo.src}
                                style={{ objectPosition: photo.position }}
                                alt=""
                                className={activeIndex === index ? "is-current" : undefined}
                                fetchPriority={index === 0 ? "high" : "low"}
                                decoding={index === 0 ? "auto" : "async"}
                                onLoad={() => setLoadedPhotos(loaded => loaded.includes(photo.src) ? loaded : [...loaded, photo.src])}
                                onError={photo.src === defaultEventCover ? undefined
                                    : () => setFailedPhotos(failed => [...failed, photo.src])}
                            />
                        </picture>
                    );
                })}
            </div>
            <div className="event-checkout__wrap">
                <Link className="event-checkout__back" to="/events">
                    <ArrowLeft aria-hidden="true" size={17} /> All events
                </Link>
                <div className="event-checkout__layout">
                    <div className="event-checkout__intro">
                        {(isPastEvent || event.category) && (
                            <p className="event-checkout__category">{isPastEvent ? "Past event" : event.category}</p>
                        )}
                        <h1>{event.title}</h1>
                        <ul aria-label="Event details" className="event-checkout__facts">
                            <li><CalendarDays aria-hidden="true" /><time dateTime={event.date}>{eventDate}</time></li>
                            {event.time_range && <li><Clock3 aria-hidden="true" /><span>{event.time_range} <small>Ghana time</small></span></li>}
                            {event.location && <li><MapPin aria-hidden="true" /><span>{event.location}</span></li>}
                        </ul>
                    </div>
                    {isPastEvent ? (
                        <section id="booking" tabIndex={-1} className="event-checkout__panel" aria-labelledby="booking-closed-title">
                            <h2 id="booking-closed-title">Booking has closed</h2>
                            <Link className="event-checkout__retry" to="/events">Browse upcoming events <ArrowRight aria-hidden="true" size={16} /></Link>
                        </section>
                    ) : <BookingForm event={event} />}
                </div>
            </div>
        </header>
    );
}

const EventDetail = ({ bookingRedirect = false }: { bookingRedirect?: boolean }) => {
    const { id } = useParams();
    const location = useLocation();
    const [selectedRecapPhoto, setSelectedRecapPhoto] = useState<string | null>(null);
    const heroRef = useRef<HTMLElement>(null);
    const [heroPassed, setHeroPassed] = useState(false);
    const { data: allEvents = [], isLoading, error } = useEvents();
    const { data: testimonials = [] } = useTestimonials();
    const event = resolveEventLink(allEvents, id);
    const isPastEvent = Boolean(event && event.date.slice(0, 10) < new Date().toISOString().slice(0, 10));
    const canonicalPath = event ? eventPath(event) : "";

    useEffect(() => {
        const hero = heroRef.current;
        if (!hero || isPastEvent || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(([entry]) => {
            setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
        });
        observer.observe(hero);
        return () => observer.disconnect();
    }, [canonicalPath, isPastEvent, location.pathname]);

    useEffect(() => {
        if (location.pathname !== canonicalPath || location.hash !== "#booking") return;
        const booking = document.getElementById("booking");
        if (!booking) return;

        let anchorScroll = window.scrollY;
        const scrollToBooking = () => {
            const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
            const top = window.scrollY + booking.getBoundingClientRect().top - headerHeight - 12;
            window.scrollTo({ top, behavior: "instant" });
            anchorScroll = window.scrollY;
        };

        scrollToBooking();
        booking.focus({ preventScroll: true });

        // Keep the anchor aligned if the event introduction reflows before the user scrolls.
        const intro = heroRef.current?.querySelector(".event-checkout__intro");
        if (!intro || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(() => {
            if (document.activeElement === booking && Math.abs(window.scrollY - anchorScroll) <= 2) {
                scrollToBooking();
            }
        });
        observer.observe(intro);
        return () => observer.disconnect();
    }, [canonicalPath, location.pathname, location.hash]);

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

    if (bookingRedirect) {
        return <Navigate to={canonicalPath + location.search + "#booking"} replace />;
    }
    if (location.pathname !== canonicalPath) {
        return <Navigate to={canonicalPath + location.search + location.hash} replace />;
    }

    const metadata = eventMetadata(event);
    const today = new Date().toISOString().slice(0, 10);
    const price = event.price?.trim();
    const description = event.description?.trim();
    const eventDate = formatEventDate(event.date, metadata.endDate);
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

    const ticketLink = () => (
        <a className="event-detail__action" href="#booking">
            <Ticket aria-hidden="true" /> Get tickets <ArrowRight aria-hidden="true" />
        </a>
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
                <EventHero key={event.id} event={event} eventDate={eventDate} photos={photos} isPastEvent={isPastEvent} heroRef={heroRef} />

                <div id="event-details" tabIndex={-1} className="event-detail__wrap event-detail__content">
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
                        {ticketLink()}
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
                                    <img src={related.image_url || defaultEventCover} alt="" loading="lazy" />
                                    <div>
                                        <time dateTime={related.date}>{formatEventDate(related.date)}</time>
                                        <h3>{related.title}</h3>
                                        <p>{related.location}</p>
                                    </div>
                                    <ArrowUpRight aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {!isPastEvent && heroPassed && (
                    <div className="event-detail__mobile-booking">
                        {price ? <div className="event-detail__price"><span>Tickets</span><strong>{price}</strong></div> : null}
                        {ticketLink()}
                    </div>
                )}
            </article>
        </Layout>
    );
};

export default EventDetail;
