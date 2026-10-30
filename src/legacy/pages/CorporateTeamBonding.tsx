import { useEffect, useRef, useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import SEOHead from '@/components/seo/SEOHead';
import ScrollReveal from '@/components/ui/ScrollReveal';
import CorporateBriefModal from '@/components/CorporateBriefModal';
import '../../corporate.css';

const experiences = [
  ['01', 'Play as a team', 'Hosted games, friendly competitions and collaborative challenges that get everyone involved.'],
  ['02', 'Take the team outdoors', 'A change of scenery, shared adventures and time to connect beyond the office.'],
  ['03', 'Make it your own', 'Plan a staff celebration, department outing or retreat around your people and your goals.'],
];

export default function CorporateTeamBonding() {
  const [briefOpen, setBriefOpen] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  function openBrief(event:React.MouseEvent<HTMLButtonElement>) {opener.current=event.currentTarget;setBriefOpen(true);}
  useEffect(() => {
    const openFromHash = () => {if(window.location.hash === '#request') setBriefOpen(true);};
    openFromHash();
    window.addEventListener('hashchange',openFromHash);
    return () => window.removeEventListener('hashchange',openFromHash);
  },[]);
  function closeBrief(open:boolean) {
    setBriefOpen(open);
    if(!open && window.location.hash === '#request') window.history.replaceState(null,'',window.location.pathname + window.location.search);
  }
  return <Layout>
    <SEOHead title="Corporate Team Bonding in Ghana" description="Bring your people together with Games & Connect. Explore corporate games, team outings and retreats in Ghana and request a tailored team bonding experience." canonical="/corporate-team-bonding" />
    <PageHeader title="Better together. Outside the office." subtitle="Corporate team bonding, powered by play. Give your people a day to connect, collaborate and enjoy being a team.">
      <button ref={opener} className="bond-button" onClick={openBrief} aria-haspopup="dialog">Plan your team day <span aria-hidden="true">↗</span></button>
    </PageHeader>
    <section className="bond-intro bond-wrap">
      <ScrollReveal><span className="bond-kicker">CORPORATE TEAM BONDING</span><h2>A shared experience.<br />A stronger connection.</h2><p>From a few hours of games to a full day away, we help you make room for the conversations, laughter and teamwork that busy workdays leave out.</p></ScrollReveal>
      <div className="bond-experiences">{experiences.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>
    <section className="bond-process bond-wrap" aria-label="How it works"><span className="bond-kicker">LET’S MAKE IT HAPPEN</span><h2>You bring the team.<br />We help plan the day.</h2><ol><li><strong>Tell us your idea</strong><p>Share your team size, preferred date and what you want to achieve.</p></li><li><strong>Shape the experience</strong><p>We discuss activities, location and any catering or transport needs.</p></li><li><strong>Agree the details</strong><p>Review your tailored plan and quote before confirming your booking.</p></li></ol></section>
    <section id="request" className="bond-request bond-wrap">
      <div className="bond-request-copy"><span className="bond-kicker">YOUR NEXT TEAM DAY STARTS HERE</span><h2>Let’s bring your<br />people together.</h2><p>Share your team’s ideas in our Games Day Brief. We’ll help shape the games, schedule and extras into a proposal for your people.</p><div className="bond-contact"><a href="tel:+233505891665">+233 50 589 1665</a><a href="mailto:gamesandconnectgh@gmail.com">gamesandconnectgh@gmail.com</a></div></div>
      <div className="bond-request-action"><span className="bond-kicker">LET’S PLAN SOMETHING GOOD</span><p>Your company. Your people.<br />A day worth getting together for.</p><button className="bond-button" onClick={openBrief} aria-haspopup="dialog">Request a proposal <span aria-hidden="true">↗</span></button><small>Tell us about your team, your plans and what you have in mind.</small></div>
    </section>
    <CorporateBriefModal open={briefOpen} onOpenChange={closeBrief} restoreFocus={()=>opener.current?.focus()}/>
  </Layout>;
}
