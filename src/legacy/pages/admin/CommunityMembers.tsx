import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { safeContactSearch } from '@/lib/bulkSms.mjs';
import { Button } from '@/components/ui/button';

type Member = { id: string; first_name: string; last_name: string; phone: string; email: string; source_row: number; source_filename: string; created_at: string };
const PAGE_SIZE = 50;
export default function CommunityMembers() {
    const [rows, setRows] = useState<Member[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    useEffect(() => { const timer = setTimeout(() => { setQuery(safeContactSearch(search)); setPage(0); }, 250); return () => clearTimeout(timer); }, [search]);
    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            let request = supabase.from('community_members').select('id,first_name,last_name,phone,email,source_row,source_filename,created_at', { count: 'exact' })
                .order('created_at', { ascending: false }).order('source_row').order('id').range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
            if (query) request = request.or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`);
            const { data, error, count } = await request;
            if (error) throw error;
            setRows(data || []); setTotal(count || 0);
        } catch { setError('Community members could not be loaded. Please try again.'); }
        finally { setLoading(false); }
    }, [page, query]);
    useEffect(() => { load(); }, [load]);
    return <section className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-3xl font-bold">Community members</h2><p className="text-sm text-muted-foreground mt-2">Original imported records, including repeated phone numbers. SMS uses one contact per number.</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={load} disabled={loading}>Refresh</Button><Button asChild><Link to="/admin/sms?source=community_members">Open Contacts &amp; SMS</Link></Button></div></header>
        <label className="block max-w-xl"><span className="sr-only">Search community members</span><input aria-label="Search community members" className="w-full rounded-lg border bg-background px-4 py-3 text-sm" placeholder="Search first name, last name, phone or email" value={search} onChange={e => setSearch(e.target.value)}/></label>
        <p className="text-sm text-muted-foreground">{total} source records{query ? ' matching your search' : ''}</p>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {loading ? <p role="status">Loading members…</p> : error ? null : !rows.length ? <p>{query ? 'No members match this search.' : 'No community members have been imported yet.'}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-sm text-left"><thead><tr>{['Name', 'Phone', 'Email', 'Source', 'Row'].map(label => <th key={label} className="p-3 text-muted-foreground font-medium">{label}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.id} className="border-t"><td className="p-3 font-medium">{`${row.first_name} ${row.last_name}`.trim() || 'Name not provided'}</td><td className="p-3 whitespace-nowrap">{row.phone}</td><td className="p-3 break-all">{row.email || 'Not provided'}</td><td className="p-3">{row.source_filename}</td><td className="p-3">{row.source_row}</td></tr>)}</tbody></table></div>}
        <div className="flex flex-wrap gap-4 items-center"><Button variant="outline" disabled={loading || page === 0} onClick={() => setPage(value => value - 1)}>Previous members</Button><span className="text-sm">Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span><Button variant="outline" disabled={loading || (page + 1) * PAGE_SIZE >= total} onClick={() => setPage(value => value + 1)}>Next members</Button></div>
    </section>;
}
