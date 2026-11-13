import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Dices, Gamepad2, Target, Trophy, Volleyball } from 'lucide-react';

const primaryLinks = [['Home','/'],['About','/about'],['Events','/events'],['Game Day','/game-day'],['Hire us','/hire-us'],['Media','/media'],['Contact','/contact']];
const groups = {
 Explore: [['Events','/events'],['Travel','/travel'],['Game Day','/game-day'],['Our teams','/teams']],
 Community: [['Join the community','/community'],['Trivia','/trivia']],
 Media: [['Blog posts','/blog'],['Gallery','/gallery']],
 'Hire us': [['Hire us','/hire-us'],['Corporate','/hire-us/corporate'],['Packages','/hire-us/packages']],
 Experiences: [['Team building','/team-building'],['Corporate events','/corporate-events'],['Outdoor adventures','/outdoor-adventures'],['Games Day Accra','/games-day-accra']],
 About: [['Our story','/about'],['What is Games & Connect?','/about/what-is-games-and-connect'],['Contact us','/contact']],
};
function HireMenu() {
 const [open, setOpen] = useState(false);
 const container = useRef(null);
 const button = useRef(null);
 const { pathname } = useLocation();
 useEffect(() => { setOpen(false); }, [pathname]);
 useEffect(() => {
  const closeOutside = event => {
   if (!container.current?.contains(event.target)) setOpen(false);
  };
  document.addEventListener('pointerdown', closeOutside);
  return () => document.removeEventListener('pointerdown', closeOutside);
 }, []);
 return <div ref={container} className="gc-media"
  onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}
  onKeyDown={event => { if (event.key === 'Escape') { setOpen(false); button.current?.focus(); } }}>
  <button ref={button} type="button" className="gc-nav-tab gc-media-toggle"
   data-active={pathname.startsWith('/hire-us')} aria-expanded={open} aria-controls="hire-navigation"
   onClick={() => setOpen(!open)}>Hire us <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
  <div id="hire-navigation" className="gc-media-links" hidden={!open}>
   <NavLink to="/hire-us" end>Overview</NavLink>
   <NavLink to="/hire-us/corporate">Corporate</NavLink>
   <NavLink to="/hire-us/packages">Packages</NavLink>
  </div>
 </div>;
}

export function SiteHeader() {
 const [mobile,setMobile] = useState(false);
 const [mediaOpen,setMediaOpen] = useState(false);
 const mediaRef = useRef(null);
 const mediaButton = useRef(null);
 const {pathname} = useLocation();
 useEffect(()=>{setMobile(false);setMediaOpen(false);window.scrollTo(0,0)},[pathname]);
 useEffect(()=>{const close=e=>{if(e.key==='Escape'){setMobile(false);setMediaOpen(false);if(mediaOpen)mediaButton.current?.focus()}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[mediaOpen]);
 useEffect(()=>{const outside=e=>{if(!mediaRef.current?.contains(e.target))setMediaOpen(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[]);
 useEffect(()=>{if(!mobile)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const resize=()=>{if(window.innerWidth>900)setMobile(false)};window.addEventListener('resize',resize);return()=>{document.body.style.overflow=previous;window.removeEventListener('resize',resize)}},[mobile]);
 return <header className="site-header gc-header">
  <Link to="/" className="gc-logo" aria-label="Games and Connect home"><img src="/assets/games-connect/brand-logo-v2.png" alt="Games & Connect"/></Link>
  <nav aria-label="Primary navigation" className="gc-desktop gc-nav-tabs">{primaryLinks.map(([label,path])=>path === '/hire-us' ? <HireMenu key={path} /> : path === '/media' ? <div key={path} ref={mediaRef} className="gc-media" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setMediaOpen(false)}}><button ref={mediaButton} type="button" className="gc-nav-tab gc-media-toggle" data-active={pathname.startsWith('/blog') || pathname === '/gallery'} aria-expanded={mediaOpen} aria-controls="media-navigation" onClick={()=>setMediaOpen(!mediaOpen)}>Media <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button><div id="media-navigation" className="gc-media-links" hidden={!mediaOpen}><NavLink to="/blog">Blog posts <span aria-hidden="true">↗</span></NavLink><NavLink to="/gallery">Gallery <span aria-hidden="true">↗</span></NavLink></div></div> : <NavLink key={path} to={path} end={path==='/'} className="gc-nav-tab">{label}</NavLink>)}</nav>
  <div className="gc-actions"><Link className="gc-button" to="/events">Explore events</Link></div>
  <button className="gc-menu" aria-label={mobile?'Close menu':'Open menu'} aria-expanded={mobile} aria-controls="mobile-navigation" onClick={()=>setMobile(!mobile)}>{mobile?'✕':'☰'}</button>
  {mobile&&<nav id="mobile-navigation" className="gc-mobile" aria-label="Mobile navigation" onClick={e=>{if(e.target.closest('a'))setMobile(false)}}><div className="gc-mobile-tabs">{primaryLinks.map(([label,path])=>path === '/hire-us' ? <section className="gc-mobile-media" key={path} aria-label="Hire us"><NavLink to="/hire-us" end>Hire us</NavLink><NavLink to="/hire-us/corporate">Corporate</NavLink><NavLink to="/hire-us/packages">Packages</NavLink></section> : path === '/media' ? <section className="gc-mobile-media" key={path} aria-label="Media"><h2>Media</h2><NavLink to="/blog">Blog posts</NavLink><NavLink to="/gallery">Gallery</NavLink></section> : <NavLink key={path} to={path} end={path==='/'} className="gc-nav-tab">{label}</NavLink>)}</div><Link className="gc-button" to="/events">Explore events</Link></nav>}
 </header>;
}
export function SiteFooter(){return <footer className="gc-footer">
 <div className="gc-footer-games" aria-hidden="true"><Dices/><Target/><Gamepad2/><Trophy/><Volleyball/></div>
 <div className="gc-footer-intro"><Link className="gc-logo" to="/"><img src="/assets/games-connect/brand-logo-v2.png" alt="Games & Connect"/></Link><p>Good people.<br/>Great memories.</p><span>Play, travel and connect in Ghana.</span><a href="mailto:gamesandconnectgh@gmail.com">gamesandconnectgh@gmail.com ↗</a></div>
 <div className="gc-footer-links">{Object.entries(groups).map(([name,links])=><section key={name}><h2>{name}</h2>{links.map(([label,path])=><Link key={path} to={path}>{label}</Link>)}</section>)}</div>
 <div className="gc-footer-bottom"><Link to="/terms-and-conditions">Terms & Conditions</Link><span>© {new Date().getFullYear()} Games & Connect · Made with love in Accra</span><a href="https://www.instagram.com/games_connect_gh/" target="_blank" rel="noreferrer">Instagram ↗</a></div>
 </footer>}
