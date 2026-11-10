import { useEffect, useMemo, useState } from 'react';
import { Building2, CalendarDays, ChevronDown, Mail, Phone, RefreshCw, Search, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Enquiry = {
  id: string; created_at: string; company: string; contact_name: string; email: string; phone: string;
  team_size: number; experience: string; preferred_date: string | null; location: string; budget: string; requirements: string;
};

const displayDate = (value: string | null) => value
  ? new Date(value.length === 10 ? `${value}T12:00:00` : value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : 'To be discussed';

export default function CorporateEnquiries() {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  async function load() {
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.from('corporate_enquiries').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      setRows(data || []);
    } catch { setError('Enquiries could not be loaded. Please retry.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);
  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? rows.filter(row => [row.company, row.contact_name, row.email, row.phone, row.id, row.experience, row.location, row.requirements].some(value => String(value || '').toLowerCase().includes(term))) : rows;
  }, [rows, search]);

  return <section className="mx-auto max-w-[1400px] text-[#10291d]">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#668071]">Enquiries</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Corporate enquiries</h2><p className="mt-2 text-sm text-[#687b6f]">Review team bonding requests and their Games Day briefs.</p></div>
      <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#d8e4da] bg-white px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#f3f8f2] disabled:opacity-60"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}/> Refresh</button>
    </div>
    <div className="mt-8 overflow-hidden rounded-xl border border-[#dfe8e1] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8eee9] p-5 sm:px-6"><div><h3 className="font-semibold">Requests</h3><p className="mt-1 text-xs text-[#718479]">Latest 200, newest first · {filteredRows.length} shown</p></div><label className="relative w-full sm:w-72"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#829389]"/><span className="sr-only">Search enquiries</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search enquiries" className="w-full rounded-lg border border-[#dce7dd] bg-[#fafcf9] py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#78ad7b] focus:ring-2 focus:ring-[#a6f15d]/30"/></label></div>
      {loading ? <p role="status" className="p-8 text-sm text-[#718479]">Loading enquiries…</p> : error ? <p role="alert" className="p-8 text-sm text-red-700">{error}</p> : !rows.length ? <div className="p-10 text-center"><Building2 className="mx-auto h-6 w-6 text-[#8aa192]"/><p className="mt-3 font-medium">No enquiries yet</p><p className="mt-1 text-sm text-[#718479]">New corporate requests will appear here.</p></div> : !filteredRows.length ? <p className="p-8 text-sm text-[#718479]">No enquiries match your search.</p> : <div className="divide-y divide-[#e8eee9]">{filteredRows.map(row => <details key={row.id} className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 px-5 py-5 transition-colors hover:bg-[#f7faf6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#43855c] sm:px-6 [&::-webkit-details-marker]:hidden">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef5ee] text-[#43805a]"><Building2 className="h-5 w-5"/></div>
          <div className="min-w-[160px] flex-1"><h4 className="font-semibold">{row.company}</h4><p className="mt-1 text-sm text-[#718479]">{row.contact_name} · {row.experience}</p></div>
          <div className="hidden min-w-[125px] text-sm text-[#60756a] md:block"><span className="block text-xs text-[#91a197]">Preferred date</span><span className="mt-1 block">{displayDate(row.preferred_date)}</span></div>
          <div className="hidden min-w-[90px] text-sm text-[#60756a] sm:block"><span className="block text-xs text-[#91a197]">Participants</span><span className="mt-1 block">{row.team_size}</span></div>
          <div className="text-right text-xs text-[#829389]"><span className="block">Received</span><span className="mt-1 block text-[#60756a]">{displayDate(row.created_at)}</span></div><ChevronDown className="h-4 w-4 shrink-0 text-[#829389] transition-transform group-open:rotate-180"/>
        </summary>
        <div className="border-t border-[#edf2ed] bg-[#fafcf9] px-5 py-6 sm:px-6"><div className="grid gap-7 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.7fr)]">
          <div><h5 className="text-xs font-bold uppercase tracking-[0.14em] text-[#789082]">Contact & event</h5><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-[#829389]">Contact</dt><dd className="mt-1 font-medium">{row.contact_name}</dd></div><div><dt className="text-[#829389]">Email</dt><dd className="mt-1 break-all"><a className="inline-flex items-center gap-2 text-[#286542] underline-offset-2 hover:underline" href={`mailto:${row.email}`}><Mail className="h-4 w-4 shrink-0"/>{row.email}</a></dd></div><div><dt className="text-[#829389]">Phone</dt><dd className="mt-1"><a className="inline-flex items-center gap-2 text-[#286542] underline-offset-2 hover:underline" href={`tel:${row.phone}`}><Phone className="h-4 w-4"/>{row.phone}</a></dd></div><div><dt className="text-[#829389]">Preferred date</dt><dd className="mt-1 flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#829389]"/>{displayDate(row.preferred_date)}</dd></div><div><dt className="text-[#829389]">Participants</dt><dd className="mt-1 flex items-center gap-2"><Users className="h-4 w-4 text-[#829389]"/>{row.team_size}</dd></div><div><dt className="text-[#829389]">Location</dt><dd className="mt-1 break-words">{row.location || 'To be discussed'}</dd></div><div><dt className="text-[#829389]">Budget</dt><dd className="mt-1 break-words">{row.budget || 'To be discussed'}</dd></div></dl></div>
          <div className="min-w-0"><h5 className="text-xs font-bold uppercase tracking-[0.14em] text-[#789082]">Submitted brief</h5><p className="mt-1 text-xs text-[#829389]">The full response as submitted by the contact.</p><div className="mt-4 whitespace-pre-wrap break-words rounded-lg border border-[#e3ebe4] bg-white p-4 text-sm leading-7 text-[#40594a]">{row.requirements || 'No additional details provided.'}</div><p className="mt-4 break-all text-xs text-[#91a197]">Reference: {row.id}</p></div>
        </div></div>
      </details>)}</div>}
    </div>
  </section>;
}
