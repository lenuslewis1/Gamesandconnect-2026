import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const primaryLinks = [['Home','/'],['About','/about'],['Events','/events'],['Game Day','/game-day'],['Gallery','/gallery'],['Contact','/contact']];

const groups = {
 Explore: [['Events','/events'],['Travel','/travel'],['Game Day','/game-day'],['Our teams','/teams']],
 Community: [['Join the community','/community'],['Gallery','/gallery'],['Trivia','/trivia'],['Stories & guides','/blog']],
 Experiences: [['Team building','/team-building'],['Corporate events','/corporate-events'],['Outdoor adventures','/outdoor-adventures'],['Games Day Accra','/games-day-accra']],
 About: [['Our story','/about'],['What is Games & Connect?','/about/what-is-games-and-connect'],['Contact us','/contact']],
};
export function SiteHeader() {
 const [mobile,setMobile] = useState(false);
 const {pathname} = useLocation();
 useEffect(()=>{setMobile(false);window.scrollTo(0,0)},[pathname]);
 useEffect(()=>{const close=e=>{if(e.key==='Escape')setMobile(false)};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[]);
 useEffect(()=>{if(!mobile)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';const resize=()=>{if(window.innerWidth>900)setMobile(false)};window.addEventListener('resize',resize);return()=>{document.body.style.overflow=previous;window.removeEventListener('resize',resize)}},[mobile]);
 return <header className="site-header gc-header">
  <Link to="/" className="gc-logo" aria-label="Games and Connect home"><img src="/assets/games-connect/brand-logo-v2.png" alt="Games & Connect"/></Link>
  <nav aria-label="Primary navigation" className="gc-desktop gc-nav-tabs">{primaryLinks.map(([label,path])=><NavLink key={path} to={path} end={path==='/'} className="gc-nav-tab">{label}</NavLink>)}</nav>
  <div className="gc-actions"><Link className="gc-button" to="/events">Explore events</Link></div>
  <button className="gc-menu" aria-label={mobile?'Close menu':'Open menu'} aria-expanded={mobile} aria-controls="mobile-navigation" onClick={()=>setMobile(!mobile)}>{mobile?'✕':'☰'}</button>
  {mobile&&<nav id="mobile-navigation" className="gc-mobile" aria-label="Mobile navigation" onClick={e=>{if(e.target.closest('a'))setMobile(false)}}><div className="gc-mobile-tabs">{primaryLinks.map(([label,path])=><NavLink key={path} to={path} end={path==='/'} className="gc-nav-tab">{label}</NavLink>)}</div><Link className="gc-button" to="/events">Explore events</Link></nav>}
 </header>;
}
export function SiteFooter(){return <footer className="gc-footer">
 <div className="gc-footer-intro"><Link className="gc-logo" to="/"><img src="/assets/games-connect/brand-logo-v2.png" alt="Games & Connect"/></Link><p>Good people.<br/>Great memories.</p><span>Play, travel and connect in Ghana.</span><a href="mailto:gamesandconnectgh@gmail.com">gamesandconnectgh@gmail.com ↗</a></div>
 <div className="gc-footer-links">{Object.entries(groups).map(([name,links])=><section key={name}><h2>{name}</h2>{links.map(([label,path])=><Link key={path} to={path}>{label}</Link>)}</section>)}</div>
 <div className="gc-footer-bottom"><span>© {new Date().getFullYear()} Games & Connect · Made with love in Accra</span><a href="https://www.instagram.com/games_connect_gh/" target="_blank" rel="noreferrer">Instagram ↗</a><Link to="/admin/login">Admin</Link></div>
 </footer>}
