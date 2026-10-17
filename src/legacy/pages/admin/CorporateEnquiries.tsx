import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
export default function CorporateEnquiries() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.from('corporate_enquiries').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      setRows(data || []);
    } catch { setError('Enquiries could not be loaded. Please retry.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);
  return <section><div className="flex items-center justify-between gap-4 mb-6"><div><h2 className="text-2xl font-bold">Corporate enquiries</h2><p>Latest 200 team bonding requests, newest first.</p></div><button onClick={load} disabled={loading} className="border rounded-lg p-3">Refresh</button></div>
    {loading ? <p role="status">Loading enquiries…</p> : error ? <p role="alert">{error}</p> : !rows.length ? <p>No enquiries yet.</p> : <div className="space-y-5">{rows.map(row => <article key={row.id} className="bg-white border rounded-xl p-6"><h3 className="text-xl font-semibold">{row.company}</h3><p className="text-sm text-muted-foreground">{new Date(row.created_at).toLocaleString()} · Reference: {row.id}</p><dl className="grid sm:grid-cols-2 gap-4 mt-4">{[['Contact',row.contact_name],['Email',row.email],['Phone',row.phone],['Participants',row.team_size],['Experience',row.experience],['Preferred date',row.preferred_date || 'To be discussed'],['Location',row.location || 'To be discussed'],['Budget',row.budget || 'To be discussed']].map(([label,value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="break-words">{value}</dd></div>)}</dl><p className="whitespace-pre-wrap mt-4">{row.requirements}</p></article>)}</div>}
  </section>;
}
