import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader, SiteFooter } from "./SiteChrome";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const G = "/assets/games-connect/";
const navItems = {
  Explore: ["Upcoming events", "Travel experiences", "Game Day"],
  Community: ["Community stories", "Captured moments", "Our games"],
  Experiences: ["Outdoor adventures", "Corporate events", "Team building"],
  About: ["Our story", "Why we connect", "Contact us"],
};
const benefits = [
  { title: "Curated vibes", copy: "Every event is carefully planned for maximum enjoyment.", image: "community-portrait.jpg" },
  { title: "Safe spaces", copy: "Inclusive environments where everyone belongs.", image: "community-play.jpg" },
  { title: "Real connection", copy: "Meet like-minded people who love fun, travel and good energy.", image: "community-team.jpg" },
  { title: "Shared adventure", copy: "Explore hidden gems and scenic escapes with new friends.", image: "community-fun.jpg" },
];
const products = [
  { name: "Game Day", title: "Game on. Win big.", copy: "Competitions, laughter and team spirit. Join the arena for legendary games, friendly rivalry and a day that brings everyone together.", image: "game-day.jpg" },
  { name: "Travel", title: "Adventure awaits.", copy: "Weekend getaways, scenic trips and outdoor fun across Ghana—planned for solo travellers and friend groups alike.", image: "travel.jpg" },
  { name: "Community", title: "Your tribe. Your vibe.", copy: "Trivia nights, social meetups and community moments designed to make genuine connection feel easy.", image: "community.jpg" },
  { name: "Corporate", title: "Teams that play together, grow together.", copy: "Purposeful team-building experiences that replace awkward icebreakers with movement, laughter and real collaboration.", image: "friends-bonding.jpg" },
  { name: "Adventures", title: "Escape the ordinary.", copy: "Carefully curated outdoor experiences for explorers, photographers and anyone ready to make unforgettable memories.", image: "beach-hangout/IMG_0452.jpg" },
];
const steps = [
  { title: "Choose your vibe", copy: "Explore Game Day, travel, community meetups and outdoor adventures, then pick the experience that feels like you.", image: "beach-hangout/IMG_0456.jpg", color: "#eefaa4" },
  { title: "Reserve your place", copy: "Book the event that fits your calendar. Major trips offer flexible installment plans to make joining easier.", image: "beach-hangout/IMG_0461.jpg", color: "#d8f33f" },
  { title: "Come as you are", copy: "Most travellers arrive solo. Our hosts and activities are structured to help everyone connect from the start.", image: "beach-hangout/IMG_0466.jpg", color: "#d7ece4" },
  { title: "Leave with a story", copy: "Play hard, laugh freely and go home with new memories—and often, a few new friends too.", image: "beach-hangout/IMG_0471.jpg", color: "#f5d49a" },
];
const stories = {
  Travel: { person: "Kinat", role: "Travel Enthusiast", copy: "The Cape Coast trip was absolutely magical. I went alone but left with five new best friends. The vibe was immaculate from start to finish.", stat1: "80%", label1: "of travellers come solo", stat2: "15+", label2: "destinations across Ghana", image: "beach-hangout/IMG_0478.jpg" },
  "Game Day": { person: "Combo", role: "Gamer", copy: "I've never been to a game night this organized and fun. The FIFA tournament was intense! Can't wait for the next one.", stat1: "50+", label1: "game nights hosted", stat2: "4", label2: "colour teams on Game Day", image: "beach-hangout/IMG_0480.jpg" },
  Trivia: { person: "Jessica T.", role: "Trivia Queen", copy: "Finally, a place where being a nerd is celebrated! The trivia night questions were challenging but so much fun.", stat1: "All", label1: "skill levels welcome", stat2: "18+", label2: "games in the collection", image: "beach-hangout/IMG_0464.jpg" },
  Community: { person: "Florence", role: "Community Member", copy: "Games and Connect is exactly what Accra needed. A safe, fun space to just be yourself and meet genuine people.", stat1: "2,000+", label1: "community members", stat2: "1", label2: "community built for connection", image: "beach-hangout/IMG_0489.jpg" },
};
const faqs = [
  ["How do I become a member?", "It's simple: join the WhatsApp community or attend any of our events. There is no membership fee for the basic community."],
  ["Are the trips suitable for solo travellers?", "Absolutely. Around 80% of our travellers come solo, and every trip is structured to help people make friends quickly."],
  ["What happens at Game Days?", "We split into teams—Red, Blue, Green and Yellow—and compete in fun outdoor games such as Tug of War, Sack Races and more."],
  ["Can I pay in installments?", "Yes. For major trips, flexible installment plans are available to make the experience easier on your pocket."],
];

function Logo() {
  return <a href="#top" className="logo" aria-label="Games and Connect home"><img src={`${G}brand-logo-v2.png`} alt="Games & Connect" /></a>;
}
function AppButton({ children, secondary = false, onClick, href = "#join" }) {
  return <a className={`pill ${secondary ? "pill-secondary" : ""}`} href={href} onClick={onClick}>{children}</a>;
}

export function App() {
  const appRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openNav, setOpenNav] = useState(null);
  const [headline, setHeadline] = useState(0);
  const [product, setProduct] = useState(0);
  const [storyTab, setStoryTab] = useState("Travel");
  const [faq, setFaq] = useState(0);
  const [notice, setNotice] = useState("");
  const words = ["Play.", "Travel.", "Connect."];
  const selectedStory = useMemo(() => stories[storyTab], [storyTab]);

  useEffect(() => {
    const timer = window.setInterval(() => setHeadline((value) => (value + 1) % words.length), 2600);
    return () => window.clearInterval(timer);
  }, []);

  useGSAP(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealTargets = gsap.utils.toArray("[data-reveal]").filter((element) => !element.classList.contains("step"));
    if (reducedMotion) {
      gsap.set([...revealTargets, ".step", ".step > img", ".cloud"], { clearProps: "all", autoAlpha: 1 });
      return;
    }
    const hero = document.querySelector(".hero");
    const heroImage = hero.querySelector(":scope > img");
    const headerHeight = () => document.querySelector(".site-header").offsetHeight;
    // One pinned coordinate space keeps the original image continuous throughout.
    const surroundingImages = gsap.utils.toArray(".cloud:not(.cloud-c)");
    const heroSequence = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".hero-stage", start: () => `top top+=${headerHeight()}`,
        end: () => `+=${window.innerHeight}`, pin: true, scrub: 0.35,
        anticipatePin: 1, invalidateOnRefresh: true },
    });
    heroSequence.fromTo(heroImage, { x: 0, y: 0, width: "100%", height: "100%" }, {
      x: () => hero.clientWidth * (window.innerWidth <= 720 ? 0.30 : 0.3575),
      y: () => hero.clientHeight * 0.154,
      width: () => hero.clientWidth * (window.innerWidth <= 720 ? 0.40 : 0.285),
      height: () => hero.clientHeight * 0.692,
      borderRadius: 16, duration: 0.55,
    }, 0)
      .to(".hero-copy", { autoAlpha: 0, duration: 0.12 }, 0)
      .to(".hero-shade", { autoAlpha: 0, duration: 0.25 }, 0)
      .fromTo(surroundingImages, { scale: 0, y: 100 }, { scale: 1, y: 0, duration: 0.55 }, 0.25)
      .to(surroundingImages, { y: () => -window.innerHeight * 0.14, duration: 0.2 }, 0.8);
    revealTargets.forEach((element) => gsap.fromTo(element, { autoAlpha: 0, y: 54 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 84%", toggleActions: "play none none reverse" } }));
    gsap.fromTo(".benefit-card", { autoAlpha: 0, y: 64, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.85, stagger: 0.13, ease: "power3.out", scrollTrigger: { trigger: ".benefit-grid", start: "top 78%", toggleActions: "play none none reverse" } });
    ScrollTrigger.create({ trigger: ".products", start: "top top+=94", end: "+=2200", pin: true, scrub: 0.7, anticipatePin: 1, onUpdate: (self) => setProduct(Math.min(products.length - 1, Math.floor(self.progress * products.length))) });
    gsap.fromTo(".product-image", { scale: 0.84, autoAlpha: 0.45 }, { scale: 1, autoAlpha: 1, ease: "none", scrollTrigger: { trigger: ".products", start: "top 70%", end: "top top+=94", scrub: 0.8 } });
    gsap.utils.toArray(".step").forEach((element, index) => {
      const image = element.querySelector("img");
      const title = element.querySelector("h2");
      gsap.set(element, { autoAlpha: 1 });
      gsap.fromTo(element, { scale: 0.94 }, { scale: 1, ease: "none", scrollTrigger: { trigger: element, start: "top bottom", end: "top top+=130", scrub: 0.9 } });
      gsap.fromTo(image, { scale: 0.8, autoAlpha: 0.28, y: 80 }, { scale: 1, autoAlpha: 1, y: 0, ease: "none", scrollTrigger: { trigger: element, start: "top 88%", end: "top 24%", scrub: 1 } });
      gsap.fromTo(title, { clipPath: "inset(0 100% 0 0)", y: 24 }, { clipPath: "inset(0 0% 0 0)", y: 0, ease: "none", scrollTrigger: { trigger: element, start: "top 72%", end: "top 34%", scrub: 0.8 } });
      gsap.set(element, { zIndex: index + 1 });
    });
    gsap.fromTo(".resource-grid article", { autoAlpha: 0, y: 72, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.16, ease: "power3.out", scrollTrigger: { trigger: ".resource-grid", start: "top 82%", toggleActions: "play none none reverse" } });
    ScrollTrigger.refresh();
  }, { scope: appRef });

  const demoNotice = (event) => {
    event.preventDefault();
    setNotice("Thanks for your interest. This local preview does not send form data—visit Gamesandconnect.com to book.");
  };

  return <div id="top" className="new-home" ref={appRef}>
    <SiteHeader />
    <main>
      <div className="hero-stage">
      <section className="hero" aria-label="Games and Connect introduction">
        <img src={`${G}play-accra.png`} alt="Friends playing limbo together on a beach in Accra" /><div className="hero-shade"></div>
        <div className="hero-copy"><h1 key={headline}>{words[headline]}</h1><p>Epic game nights, road trips and experiences for young people.</p><div><AppButton href="/events">Explore events</AppButton><a className="down-button" href="#about" aria-label="Explore the page">↓</a></div></div>
      </section>
      <section className="portrait-cloud" aria-label="Games and Connect community moments">
        <img className="cloud cloud-f" src={`${G}beach-hangout/IMG_0492.jpg`} alt="A moment with the community" />
        <img className="cloud cloud-g" src={`${G}beach-hangout/IMG_0495.jpg`} alt="Exploring Ghana together" />
        <img className="cloud cloud-a" src={`${G}beach-hangout/IMG_0498.jpg`} alt="Friends enjoying a community event" /><img className="cloud cloud-b" src={`${G}beach-hangout/IMG_0502.jpg`} alt="Community members playing together" /><img className="cloud cloud-c" src={`${G}beach-hangout/IMG_0506.jpg`} alt="A Games and Connect team moment" /><img className="cloud cloud-d" src={`${G}beach-hangout/IMG_0510.jpg`} alt="Friends sharing a fun activity" /><img className="cloud cloud-e" src={`${G}beach-hangout/IMG_0514.jpg`} alt="Friends bonding at an event" />
      </section>
      </div>
      <section id="about" className="benefits section-pad" data-reveal>
        <div className="benefit-intro"><span className="section-kicker">ABOUT US</span><h2>Rediscover the joy of real connection</h2><p>In a digital world, we create spaces for authentic human connection. Whether it's the adrenaline of a game night or the serenity of a weekend getaway, Games and Connect is your passport to a more social life.</p><AppButton href="/community">Join the community</AppButton></div>
        <div className="benefit-grid">{benefits.map((item, index) => <article className="benefit-card" key={item.title}><div className="icon-tile"><img src={`${G}${item.image}`} alt="" /></div><div><h3>{item.title}</h3><p>{item.copy}</p><Link className="benefit-link" aria-label={`Read about ${item.title}`} to={`/blog/${item.title.toLowerCase().replaceAll(" ", "-")}`}>{index === 0 ? "Learn more →" : "→"}</Link></div></article>)}</div>
      </section>
      <section className="feature-card section-pad" data-reveal><div className="feature-copy"><span>UPCOMING ADVENTURE</span><small>18 September 2026 · Mole National Park</small><h2>The Savannah Experience</h2><p>Escape the ordinary and discover Northern Ghana through breathtaking landscapes, rich culture, wildlife, history and exciting group activities.</p><div className="event-price">GH₵1,700</div><AppButton secondary href="/events/40">Book this experience</AppButton></div><div className="feature-art"><img src={`${G}savannah-experience.jpg`} alt="The Savannah Experience event" /></div></section>
      <section id="experiences" className="products" data-reveal><h2>Choose your vibe</h2><div className="product-layout"><div className="product-tabs" role="tablist">{products.map((item, index) => <button role="tab" aria-selected={product === index} className={product === index ? "active" : ""} onClick={() => setProduct(index)} key={item.name}>{item.name}</button>)}</div><img className="product-image" src={`${G}${products[product].image}`} alt={`${products[product].name} experience`} /><div className="product-copy"><h3>{products[product].title}</h3><p>{products[product].copy}</p><a href={["/game-day", "/travel", "/community", "/corporate-events", "/outdoor-adventures"][product]}>Explore {products[product].name.toLowerCase()} <span>›</span></a></div></div></section>
      <section className="steps" aria-label="How to join Games and Connect">{steps.map((step, index) => <article className="step" style={{ "--step-bg": step.color, "--step-index": index + 1 }} key={step.title} data-reveal><div className="step-copy"><span>STEP {String(index + 1).padStart(2, "0")}</span><h2>{step.title}</h2><p>{step.copy}</p><AppButton secondary href="/events">Find your next event</AppButton></div><img src={`${G}${step.image}`} alt={step.title} /></article>)}</section>
      <section className="cases section-pad" data-reveal><div className="section-heading"><div><span className="section-kicker">COMMUNITY STORIES</span><h2>Meet the people who make it special</h2></div><AppButton secondary href="/community">Join the community</AppButton></div><div className="case-tabs" role="tablist">{Object.keys(stories).map((name) => <button role="tab" aria-selected={storyTab === name} className={storyTab === name ? "active" : ""} onClick={() => setStoryTab(name)} key={name}>{name}</button>)}</div><article className="case-card"><div><span className="story-role">{selectedStory.role}</span><h3>{selectedStory.person}</h3><p>“{selectedStory.copy}”</p><a href="/community">Be part of the story →</a></div><img src={`${G}${selectedStory.image}`} alt="A shared moment from the Games and Connect community" /><div className="case-stats"><strong>{selectedStory.stat1}</strong><span>{selectedStory.label1}</span><strong>{selectedStory.stat2}</strong><span>{selectedStory.label2}</span></div></article></section>
      <section id="resources" className="resources section-pad" data-reveal><span className="section-kicker">EXPLORE</span><h2>More ways to connect</h2><div className="resource-grid"><article><img src={`${G}beach-hangout/IMG_0516.jpg`} alt="Games and Connect Game Day" /><h3>Game Day</h3><p>Competitions, laughter and team spirit. Join the arena.</p><a href="/game-day">View schedule →</a></article><article><img src={`${G}beach-hangout/IMG_0520.jpg`} alt="Games and Connect travel experience" /><h3>Travel</h3><p>Explore hidden gems and scenic escapes with new friends.</p><a href="/travel">See destinations →</a></article><article><img src={`${G}beach-hangout/IMG_0523.jpg`} alt="Games and Connect community" /><h3>Community</h3><p>Trivia nights, meetups and exclusive member moments.</p><a href="/community">Join us →</a></article></div></section>
      <section id="join" className="start-card section-pad" data-reveal><div><span className="section-kicker">YOUR NEXT ADVENTURE</span><h2>Stop watching from the sidelines</h2><p>The memories, the fun and the friends are waiting for you. Find your next experience and make it happen.</p><a className="site-link" href="https://gamesandconnect.com" target="_blank" rel="noreferrer">Visit Gamesandconnect.com ↗</a></div><div className="home-join-actions"><AppButton href="/events">Find your next event</AppButton><AppButton secondary href="/community">Meet the community</AppButton><AppButton secondary href="/contact">Talk to us</AppButton></div></section>
      <section className="faq section-pad" data-reveal><div className="section-heading"><div><span className="section-kicker">GOOD TO KNOW</span><h2>Frequently asked questions</h2></div><AppButton href="/events">Book an experience</AppButton></div><div className="faq-list">{faqs.map(([question, answer], index) => <article className={faq === index ? "open" : ""} key={question}><button aria-expanded={faq === index} onClick={() => setFaq(faq === index ? -1 : index)}><span>{question}</span><b>{faq === index ? "−" : "+"}</b></button>{faq === index && <p>{answer}</p>}</article>)}</div></section>
    </main>
    <SiteFooter />
    {notice && <div className="toast" role="status"><span>{notice}</span><button aria-label="Dismiss notification" onClick={() => setNotice("")}>×</button></div>}
  </div>;
}
