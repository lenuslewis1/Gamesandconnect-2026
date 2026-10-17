import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

type EventRecord = { id: number; event_id: number; full_name: string; email: string; phone: string; ticket_count: number; status: string; created_at: string };
const PAGE_SIZE = 50;

// Free-event bookings and older form records live here. Paid bookings also have
// a matching record; retain both lists instead of guessing which records to hide.
export default function EventFormRecords() {
    const [rows, setRows] = useState<EventRecord[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data, error, count } = await supabase.from('event_registrations').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id').range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
            if (error) throw error;
            setRows(data || []); setTotal(count || 0);
        } catch { setError('Event form records could not be loaded. Please retry.'); }
        finally { setLoading(false); }
    }, [page]);
    useEffect(() => { load(); window.addEventListener('focus', load); return () => window.removeEventListener('focus', load); }, [load]);
    return <section className="border rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap justify-between gap-4"><div><h3 className="text-2xl font-semibold">Event form records</h3><p className="text-muted-foreground">Includes free registrations and older submissions. Paid bookings may also appear in Ticket Sales above; these are not additional ticket sales.</p></div><Button variant="outline" onClick={load} disabled={loading}>Refresh event records</Button></div>
        {error && <p role="alert">{error}</p>}
        {loading ? <p role="status">Loading event records…</p> : !rows.length ? <p>No event form records yet.</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead><tr>{['Date','Name','Email','Phone','Event','Tickets','Booking status'].map(label => <th className="p-3" key={label}>{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t"><td className="p-3 whitespace-nowrap">{new Date(row.created_at).toLocaleString()}</td><td className="p-3">{row.full_name}</td><td className="p-3"><a className="underline" href={`mailto:${row.email}`}>{row.email}</a></td><td className="p-3"><a href={`tel:${row.phone}`}>{row.phone}</a></td><td className="p-3">{row.event_id}</td><td className="p-3">{row.ticket_count}</td><td className="p-3">{row.status}</td></tr>)}</tbody></table></div>}
        <div className="flex flex-wrap items-center gap-4"><Button variant="outline" onClick={() => setPage(value => value - 1)} disabled={loading || !page}>Previous event records</Button><span>{total} records · Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span><Button variant="outline" onClick={() => setPage(value => value + 1)} disabled={loading || (page + 1) * PAGE_SIZE >= total}>Next event records</Button></div>
    </section>;
}
