import { useRef, useState, type FormEvent } from 'react';
import { MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

type PackageEnquiryDialogProps = {
  packageLabel: string;
  onClose: () => void;
  restoreFocus: () => void;
};

export default function PackageEnquiryDialog({ packageLabel, onClose, restoreFocus }: PackageEnquiryDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const done = useRef<HTMLButtonElement>(null);
  const whatsappMessage = encodeURIComponent(`Hi Games & Connect! I'd like to ask about ${packageLabel}.`);
  const whatsappUrl = `https://wa.me/233505891665?text=${whatsappMessage}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || sent) return;

    const fields = new FormData(event.currentTarget);
    const name = String(fields.get('name') ?? '').trim();
    const email = String(fields.get('email') ?? '').trim();
    const phone = String(fields.get('phone') ?? '').trim();
    if (!name) {
      setError('Please enter your name.');
      return;
    }
    if (!phone) {
      setError('Please enter your phone or WhatsApp number.');
      return;
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    inFlight.current = true;
    setSubmitting(true);
    setError('');
    try {
      // Open from the submit gesture so browsers allow the new tab.
      if (submitter?.getAttribute('value') === 'whatsapp') {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }
      const { error } = await supabase.from('contact_messages').insert({
        name,
        email,
        phone,
        subject: 'events',
        message: `Package enquiry: ${packageLabel}`,
      }).abortSignal(AbortSignal.timeout(20_000));
      if (error) throw error;
      setSent(true);
      requestAnimationFrame(() => done.current?.focus());
    } catch {
      setError('We couldn’t confirm your enquiry. Please try sending it again.');
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  return (
    <Dialog open onOpenChange={open => { if (!open && !inFlight.current) onClose(); }}>
      <DialogContent
        className="bond-modal package-enquiry"
        onCloseAutoFocus={event => { event.preventDefault(); restoreFocus(); }}
      >
        <header className="brief-header">
          <DialogTitle>{sent ? 'Enquiry received' : 'Enquire about this package'}</DialogTitle>
          <p className="package-enquiry-selection">{packageLabel}</p>
          <DialogDescription>
            {sent ? 'Thanks! Our team will be in touch.' : 'Leave your details and we’ll get in touch. Choosing WhatsApp also sends your enquiry to our team.'}
          </DialogDescription>
        </header>
        {sent ? (
          <button ref={done} type="button" className="bond-button" onClick={onClose}>Done</button>
        ) : (
          <form className="package-enquiry-form" onSubmit={submit} aria-busy={submitting}>
            <fieldset className="bond-fields" disabled={submitting}>
              <label>Full name<input name="name" autoComplete="name" maxLength={100} required /></label>
              <label>Email<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
              <label>Phone or WhatsApp<input name="phone" type="tel" autoComplete="tel" maxLength={40} required /></label>
            </fieldset>
            {error && <p className="package-enquiry-error" role="alert">{error}</p>}
            <div className="package-enquiry-actions">
              <button type="submit" className="bond-button" disabled={submitting}>{submitting ? 'Sending…' : 'Send enquiry'}</button>
              <button type="submit" value="whatsapp" className="bond-button package-whatsapp" disabled={submitting}>
                <MessageCircle size={18} aria-hidden="true" /> Chat on WhatsApp
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
