import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { beachGallery } from "./legacy/data/beachGallery";
import { savannahGallery } from "./legacy/data/savannahGallery";
import { useGalleryImages } from "./legacy/hooks/useSupabaseData";

const additionalPhotos = [
  ["savannah/JTN_6453.JPG", "Friends together at the Savannah Experience"],
  ["savannah/JTN_6541.JPG", "A moment of joy at the Savannah Experience"],
  ["adventures/jtn_6558.webp", "Sharing a safari ride"],
  ["travel/jtn_6194.webp", "Exploring Ghana together"],
  ["play-accra.png", "Playing limbo on the beach in Accra"],
].map(([file, caption]) => ({ image_url: `/assets/games-connect/${file}`, caption }));

export default function HomeGallery() {
  const { data: savedImages = [] } = useGalleryImages();
  const photos = useMemo(() => {
    const seen = new Set();
    return [...savannahGallery, ...additionalPhotos, ...beachGallery, ...savedImages].filter(photo => {
      if (!photo.image_url || seen.has(photo.image_url)) return false;
      seen.add(photo.image_url);
      return true;
    });
  }, [savedImages]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const section = useRef(null);
  const touchStart = useRef(null);
  const current = index % photos.length;
  const move = direction => setIndex(value => (value + direction + photos.length) % photos.length);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => { if (media.matches) setPlaying(false); };
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    if (!playing || hovered || focused || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(value => (value + 1) % photos.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [playing, hovered, focused, visible, photos.length, current]);

  return <section id="home-gallery" className="home-gallery section-pad" ref={section} aria-label="Community photo slideshow" aria-roledescription="carousel">
    <div className="section-heading"><div><span className="section-kicker">CAPTURED MOMENTS</span><h2>Good times, frame by frame</h2><p>Game days, beach hangouts and adventures together.</p></div><Link className="gallery-link" to="/gallery">View full gallery <ArrowRight size={18} aria-hidden="true" /></Link></div>
    <div className="gallery-player" tabIndex={0} aria-label="Photo slideshow. Use left and right arrow keys to browse."
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}
      onTouchStart={event => { touchStart.current = event.touches[0].clientX; }}
      onTouchEnd={event => { if (touchStart.current !== null) { const delta = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1); touchStart.current = null; } }}>
      <div className="gallery-stage">
        <button className="gallery-preview" onClick={() => move(-1)} aria-label="Previous photo"><img src={photos[(current - 1 + photos.length) % photos.length].image_url} alt="" loading="lazy" /></button>
        <figure className="gallery-slide" aria-roledescription="slide" aria-label={`Photo ${current + 1} of ${photos.length}`}><img key={photos[current].image_url} src={photos[current].image_url} alt={photos[current].caption || "Games and Connect community moment"} loading="lazy" /></figure>
        <button className="gallery-preview" onClick={() => move(1)} aria-label="Next photo"><img src={photos[(current + 1) % photos.length].image_url} alt="" loading="lazy" /></button>
      </div>
      <div className="gallery-toolbar"><div className="gallery-caption" aria-live={playing ? "off" : "polite"}><span>{String(current + 1).padStart(2, "0")} / {photos.length}</span><p>{photos[current].caption || "Games and Connect community moment"}</p></div><div className="gallery-controls"><button onClick={() => move(-1)} aria-label="Previous slide"><ArrowLeft size={20} /></button><button onClick={() => setPlaying(value => !value)} aria-label={playing ? "Pause slideshow" : "Play slideshow"}>{playing ? <Pause size={18} /> : <Play size={18} />}</button><button onClick={() => move(1)} aria-label="Next slide"><ArrowRight size={20} /></button></div></div>
    </div>
  </section>;
}
