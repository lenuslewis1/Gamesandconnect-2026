import { useRef, useState } from 'react';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import SEOHead from '@/components/seo/SEOHead';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { supabase } from '@/lib/supabase';
import '../../corporate.css';

const experiences = [
  ['01', 'Play as a team', 'Hosted games, friendly competitions and collaborative challenges that get everyone involved.'],
  ['02', 'Take the team outdoors', 'A change of scenery, shared adventures and time to connect beyond the office.'],
  ['03', 'Make it your own', 'Plan a staff celebration, department outing or retreat around your people and your goals.'],
];

export default function CorporateTeamBonding() {
  const [request, setRequest] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const result = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString('en-CA');
  async function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || request) return;
    inFlight.current = true;
    setSubmitting(true); setError('');
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) || '').trim();
    try {
      if (value('Website')) throw new Error('Invalid request');
      const id = crypto.randomUUID();
      const { error } = await supabase.from('corporate_enquiries').insert({
        id, company: value('Company'), contact_name: value('Contact name'), email: value('Email'),
        phone: value('Phone'), team_size: Number(value('Team size')), preferred_date: value('Preferred date') || null,
        experience: value('Experience'), location: value('Location'), budget: value('Budget'), requirements: value('Goals and requirements'),
      }).abortSignal(AbortSignal.timeout(20000));
      if (error) throw error;
      setRequest(id);
      requestAnimationFrame(() => { result.current?.focus(); result.current?.scrollIntoView({ block: 'center', behavior: 'instant' }); });
    } catch {
      setError('We could not confirm your submission. Your details are still here. Please try again, or contact us on +233 50 589 1665.');
    } finally { inFlight.current = false; setSubmitting(false); }
  }
  return <Layout>
    <SEOHead title="Corporate Team Bonding in Ghana" description="Bring your people together with Games & Connect. Explore corporate games, team outings and retreats in Ghana and request a tailored team bonding experience." canonical="/corporate-team-bonding" />
    <PageHeader title="Better together. Outside the office." subtitle="Corporate team bonding, powered by play. Give your people a day to connect, collaborate and enjoy being a team.">
      <a className="bond-button" href="#request">Plan your team day <span aria-hidden="true">↗</span></a>
    </PageHeader>
    <section className="bond-intro bond-wrap">
      <ScrollReveal><span className="bond-kicker">CORPORATE TEAM BONDING</span><h2>A shared experience.<br />A stronger connection.</h2><p>From a few hours of games to a full day away, we help you make room for the conversations, laughter and teamwork that busy workdays leave out.</p></ScrollReveal>
      <div className="bond-experiences">{experiences.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
    </section>
    <section className="bond-process bond-wrap" aria-label="How it works"><span className="bond-kicker">LET’S MAKE IT HAPPEN</span><h2>You bring the team.<br />We help plan the day.</h2><ol><li><strong>Tell us your idea</strong><p>Share your team size, preferred date and what you want to achieve.</p></li><li><strong>Shape the experience</strong><p>We discuss activities, location and any catering or transport needs.</p></li><li><strong>Agree the details</strong><p>Review your tailored plan and quote before confirming your booking.</p></li></ol></section>
    <section id="request" className="bond-request bond-wrap">
      <div className="bond-request-copy"><span className="bond-kicker">YOUR NEXT TEAM DAY STARTS HERE</span><h2>Let’s bring your<br />people together.</h2><p>Tell us a little about your team. We’ll use these details to discuss a tailored experience and quote with you.</p><p>Not sure about dates or budget yet? That’s fine — we can work through those together.</p><a href="tel:+233505891665">+233 50 589 1665</a><a href="mailto:gamesandconnectgh@gmail.com">gamesandconnectgh@gmail.com</a></div>
      <form className="bond-form" onSubmit={prepare} aria-busy={submitting}>
        <h3>Request our services</h3><p className="bond-help">Fields marked * are required. Submit your enquiry directly to our team.</p>
        <fieldset disabled={submitting || !!request}>
        <label hidden>Website<input name="Website" tabIndex={-1} autoComplete="off" /></label>
        <div className="bond-fields">
          <label>Company / organisation *<input name="Company" autoComplete="organization" required maxLength={120} /></label>
          <label>Your name *<input name="Contact name" autoComplete="name" required maxLength={100} /></label>
          <label>Email address *<input name="Email" type="email" autoComplete="email" required maxLength={160} /></label>
          <label>Phone / WhatsApp *<input name="Phone" type="tel" autoComplete="tel" required maxLength={40} /></label>
          <label>Number of participants *<input name="Team size" type="number" min="2" max="10000" step="1" required /></label>
          <label>Preferred date (optional)<input name="Preferred date" type="date" min={today} /></label>
          <label>Experience *<select name="Experience" required defaultValue=""><option value="" disabled>Select an experience</option><option>Team games and challenges</option><option>Outdoor team outing</option><option>Corporate retreat</option><option>Staff celebration</option><option>Help us choose</option></select></label>
          <label>Location (optional)<input name="Location" placeholder="City, venue or help us choose" maxLength={160} /></label>
          <label className="bond-wide">Estimated total budget in GH₵ (optional)<input name="Budget" placeholder="e.g. GH₵ 10,000, or to be discussed" maxLength={100} /></label>
          <label className="bond-wide">Goals and requirements (optional)<textarea name="Goals and requirements" rows={4} maxLength={1500} placeholder="What would make this a great day? Include duration, accessibility, catering or transport needs." /></label>
        </div>
        <p className="bond-help">We store your details so our team can respond to your enquiry. This is a request, not a confirmed booking.</p>
        <button className="bond-button" type="submit">{submitting ? 'Submitting…' : request ? 'Submitted' : 'Submit request'} <span aria-hidden="true">↗</span></button>
        </fieldset>
        {error && <p className="bond-result" role="alert">{error}</p>}
        {request && <div ref={result} tabIndex={-1} className="bond-result" role="status"><h3>Your request has been submitted</h3><p>Thank you. Our team will review your enquiry and contact you using the details provided.</p><p style={{ overflowWrap: 'anywhere' }}>Reference: {request}</p></div>}
      </form>
    </section>
  </Layout>;
}
