import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';

const goals = ['Connection across departments', 'Morale boost', 'Staff recognition', 'Communication and leadership', 'Celebrate a milestone', 'Wellness and fitness'];
const games = ['Icebreakers', 'Team challenges', 'Active and sports', 'Trivia and brain games', 'Ghanaian classics', 'Squid Game-style', 'Table game tournament'];
const extras = ['Branded team tees or bibs', 'Banners and signage', 'Photographer', 'Highlight video', 'Social media content', 'Sound system and MC', 'Prizes and hampers', 'Charity element', 'Catering', 'Transport', 'Custom merchandise'];

export default function CorporateBriefModal({ open, onOpenChange, restoreFocus }: { open:boolean; onOpenChange:(open:boolean)=>void; restoreFocus:()=>void }) {
  const [values,setValues] = useState<Record<string,string[]>>({});
  const [reference,setReference] = useState('');
  const [submitting,setSubmitting] = useState(false);
  const [error,setError] = useState('');
  const [copied,setCopied] = useState(false);
  const inFlight = useRef(false);
  const result = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString('en-CA');
  const value = (name:string) => values[name]?.join(', ') || '';
  const brief = ['GAMES DAY BRIEF', ...Object.entries(values).filter(([key,items])=>key!=='Website' && items.some(Boolean)).map(([key,items])=>`${key}: ${items.join(', ')}`)].join('\n');
  function capture(form:HTMLFormElement) {
    const next:Record<string,string[]> = {};
    new FormData(form).forEach((entry,key)=>{(next[key] ||= []).push(String(entry).trim());});
    setValues(next);setCopied(false);
  }
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(inFlight.current || reference) return;
    inFlight.current=true;setSubmitting(true);setError('');
    const data=new FormData(event.currentTarget);
    const get=(name:string)=>String(data.get(name)||'').trim();
    try {
      if(get('Website')) throw new Error('Invalid request');
      const id=crypto.randomUUID();
      const {error}=await supabase.from('corporate_enquiries').insert({
        id,company:get('Company name'),contact_name:get('Contact person'),email:get('Email'),phone:get('Phone or WhatsApp'),
        team_size:Number(get('Number of participants')),preferred_date:get('Preferred date') || null,
        experience:get('Occasion') === 'Corporate retreat' ? 'Corporate retreat' : 'Team games and challenges',location:get('Venue name or area') || get('Where will it happen?'),
        budget:get('Approximate budget (GHS)'),requirements:['GAMES DAY BRIEF', ...Array.from(new Set(data.keys())).filter(key=>key!=='Website' && data.getAll(key).some(item=>String(item).trim())).map(key=>`${key}: ${data.getAll(key).map(item=>String(item).trim()).join(', ')}`)].join('\n'),
      }).abortSignal(AbortSignal.timeout(20000));
      if(error) throw error;
      setReference(id);
      requestAnimationFrame(()=>result.current?.focus());
    } catch {setError('We could not confirm your submission. Your details are still here. Please try again, or call +233 50 589 1665.');}
    finally {inFlight.current=false;setSubmitting(false);}
  }
  const field=(name:string,label=name,props:any={})=><label>{label}<input name={name} defaultValue={value(name)} maxLength={160} {...props}/></label>;
  const select=(name:string,options:string[])=><label>{name}<select name={name} defaultValue={value(name)}><option value="">Select</option>{options.map(option=><option key={option}>{option}</option>)}</select></label>;
  const choices=(name:string,options:string[])=><fieldset className="brief-choices bond-wide"><legend>{name}</legend><div>{options.map(option=><label key={option}><input type={name==='Setting'?'radio':'checkbox'} name={name} value={option} defaultChecked={values[name]?.includes(option)}/><span>{option}</span></label>)}</div></fieldset>;
  return <Dialog open={open} onOpenChange={next=>{if(!submitting) onOpenChange(next);}}>
    <DialogContent className="bond-modal" onCloseAutoFocus={event=>{event.preventDefault();restoreFocus();}} onEscapeKeyDown={event=>{if(submitting)event.preventDefault();}} onPointerDownOutside={event=>event.preventDefault()}>
      <header className="brief-header"><span className="bond-kicker">GAMES & CONNECT · CORPORATE</span><DialogTitle>Games Day Brief</DialogTitle><DialogDescription>Tell us about your team and the day you have in mind. We’ll use your answers to prepare a proposal with a games lineup, schedule and pricing for your team.</DialogDescription></header>
      {reference ? <div ref={result} tabIndex={-1} className="bond-result" role="status"><h3>Your brief has been submitted</h3><p>Thank you. Our team will review your enquiry and contact you using the details provided.</p><p>Reference: {reference}</p><button className="bond-button" onClick={()=>onOpenChange(false)}>Done</button></div> : <form className="bond-form brief-form" onSubmit={submit} onChange={event=>capture(event.currentTarget)} aria-busy={submitting}>
        <p className="bond-help">Fields marked * are required. Rounds 3 and 4 are optional.</p>
        <fieldset disabled={submitting}>
          <label hidden>Website<input name="Website" tabIndex={-1} autoComplete="off"/></label>
          <section className="brief-round" aria-labelledby="brief-company"><span className="bond-kicker">ROUND 1</span><h3 id="brief-company">Your company</h3><div className="bond-fields">
            {field('Company name','Company name *',{required:true,autoComplete:'organization',maxLength:120})}
            {select('Industry',['Technology','Finance and insurance','Healthcare','Education','Professional services','Retail and hospitality','Manufacturing','Government and public sector','Nonprofit','Other'])}
            {field('Contact person','Contact person *',{required:true,autoComplete:'name',maxLength:100})}
            {field('Role or department','Role or department',{placeholder:'e.g. HR manager'})}
            {field('Email','Email *',{type:'email',required:true,autoComplete:'email'})}
            {field('Phone or WhatsApp','Phone or WhatsApp *',{type:'tel',required:true,autoComplete:'tel',minLength:5,maxLength:40})}
          </div></section>
          <section className="brief-round" aria-labelledby="brief-day"><span className="bond-kicker">ROUND 2</span><h3 id="brief-day">The day</h3><div className="bond-fields">
            {select('Occasion',['Team bonding','Staff appreciation','Company anniversary','End-of-year celebration','Department outing','Corporate retreat','Other'])}
            {field('Number of participants','Number of participants *',{type:'number',min:2,max:10000,step:1,required:true})}
            {field('Preferred date','Preferred date *',{type:'date',min:today,required:true})}
            {field('Backup date','Backup date',{type:'date',min:today})}
            {select('Length of the day',['A few hours','Half day','Full day','Multiple days','Help us decide'])}
            {select('Preferred start',['Morning','Afternoon','Evening','Flexible'])}
            {select('Where will it happen?',['Our office or venue','We have a venue in mind','Help us find a venue','To be decided'])}
            {field('Venue name or area','Venue name or area',{placeholder:'e.g. East Legon, Labadi Beach'})}
            {choices('Setting',['Outdoor','Indoor','Mix of both'])}
          </div><p className="bond-help">We usually form teams of 8 to 10.</p></section>
          <section className="brief-round" aria-labelledby="brief-people"><span className="bond-kicker">ROUND 3 · OPTIONAL</span><h3 id="brief-people">Your people and the play</h3><div className="bond-fields">
            {choices('What should the day achieve?',goals)}{choices('Which kinds of games appeal?',games)}
            {select('Energy level',['Relaxed','Balanced','High energy','A mix for everyone'])}
            {select('Who is taking part?',['One department','Multiple departments','The whole company','Staff and their families','Staff and invited guests','Other'])}
            <label className="bond-wide">Accessibility or health considerations<textarea name="Accessibility or health considerations" rows={3} maxLength={1500} defaultValue={value('Accessibility or health considerations')} placeholder="Share only the arrangements needed, such as step-free access, rest breaks or religious observance. No personal medical details are needed."/></label>
            {field('Games or themes to avoid')}
          </div></section>
          <section className="brief-round" aria-labelledby="brief-extras"><span className="bond-kicker">ROUND 4 · OPTIONAL</span><h3 id="brief-extras">Extras and budget</h3><div className="bond-fields">
            {choices('Would you like any of these?',extras)}
            {field('Package preference','Package you are leaning towards',{placeholder:'Tell us your preference, or help us choose'})}
            {field('Approximate budget (GHS)','Approximate budget (GHS)',{placeholder:'e.g. 15,000 or a range',maxLength:100})}
            {field('Date you will decide by','Date you will decide by',{type:'date',min:today})}
            {field('How did you hear about us?')}
            <label className="bond-wide">Anything else we should know?<textarea name="Anything else we should know?" rows={4} maxLength={1500} defaultValue={value('Anything else we should know?')} placeholder="Company culture, past events that worked or flopped, a theme in mind"/></label>
          </div></section>
          <details className="brief-summary"><summary>Review your brief</summary><pre>{brief}</pre><button type="button" className="brief-copy" onClick={async()=>{try{await navigator.clipboard.writeText(brief);setCopied(true);}catch{setError('Copy is unavailable. You can select and copy the brief above.');}}}>{copied?'Brief copied':'Copy brief'}</button></details>
          <p className="bond-help">We store your answers so our team can prepare your proposal and respond to your enquiry. This is a request, not a confirmed booking.</p>
          <button className="bond-button" type="submit">{submitting?'Submitting…':'Submit your brief'} <span aria-hidden="true">↗</span></button>
        </fieldset>
        {error && <p className="bond-result" role="alert">{error}</p>}
      </form>}
    </DialogContent>
  </Dialog>;
}
