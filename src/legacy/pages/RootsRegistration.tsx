import { useState, type FormEvent } from 'react';
import Layout from '@/components/layout/Layout';
import PageHeader from '@/components/layout/PageHeader';
import SEOHead from '@/components/seo/SEOHead';
import { Input } from '@/components/ui/input';

const title = 'Roots Connect & Celebrate 2026';
const eventDetails = 'Wednesday, 9 December 2026 · The Conclave, Osu';

const formName = 'roots-connect-2026';
const formEndpoint = '/roots-form.html';
const nonBlank = String.raw`.*\S.*`;

export default function RootsRegistration() {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'saving' || status === 'saved') return;

    const body = new URLSearchParams();
    for (const [name, value] of new FormData(event.currentTarget)) {
      body.set(name, String(value).trim());
    }

    setStatus('saving');
    try {
      const response = await fetch(formEndpoint, { method: 'POST', body });
      if (!response.ok) throw new Error('Registration request failed.');
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Layout>
      <SEOHead
        title={title}
        description={`Confirm your attendance for ${title}. ${eventDetails}.`}
        canonical="/roots"
        noindex
      />
      <PageHeader title={title} subtitle={eventDetails} className="gc-roots-hero" />
      <section className="gc-roots-registration" aria-label="Roots Connect registration">
        <p>
          Register to confirm your attendance and help us organise the teams for games night. We’ll use your organisation and department to create <strong>10 balanced teams</strong> that bring colleagues from Roots Hospitality International and Key Architects together across departments.
        </p>
        <p>
          Games &amp; Connect will assign teams ahead of the event. Please select your organisation and enter your department when registering, and submit one registration per person.
        </p>
        <a className="gc-button" href="#registration">Register for Roots Connect</a>
      </section>
      <section className="gc-roots-form" aria-labelledby="registration">
        <h2 id="registration" tabIndex={-1}>Registration</h2>
        <div role="status">
          {status === 'saved' && <p>Thank you. Your attendance is confirmed.</p>}
        </div>
        {status !== 'saved' && (
          <form name={formName} method="post" action={formEndpoint} onSubmit={submitRegistration}>
            <input type="hidden" name="form-name" value={formName} />
            <div hidden>
              <label>Leave this field empty <input name="bot-field" autoComplete="off" /></label>
            </div>
            <fieldset disabled={status === 'saving'} aria-label="Participant details">
              <label htmlFor="roots-full-name">Full name</label>
              <Input id="roots-full-name" name="full-name" autoComplete="name" maxLength={150} pattern={nonBlank} required />

              <label htmlFor="roots-organisation">Organisation</label>
              <select id="roots-organisation" name="organisation" defaultValue="" required>
                <option value="" disabled>Select your organisation</option>
                <option>Roots Hospitality International</option>
                <option>Key Architects</option>
              </select>

              <label htmlFor="roots-department">Department</label>
              <Input id="roots-department" name="department" maxLength={150} pattern={nonBlank} required />

              <button className="gc-button" type="submit">
                {status === 'saving' ? 'Submitting…' : 'Submit registration'}
              </button>
            </fieldset>
            {status === 'error' && <p role="alert">We couldn’t confirm your registration. Please try again.</p>}
          </form>
        )}
      </section>
    </Layout>
  );
}
