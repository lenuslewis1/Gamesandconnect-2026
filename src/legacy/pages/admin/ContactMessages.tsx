import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

type Message = { id: string; name: string; email: string; subject: string; message: string; created_at: string; is_read: boolean };
const PAGE_SIZE = 50;

export default function ContactMessages() {
    const [rows, setRows] = useState<Message[]>([]);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const load = useCallback(async () => {
        setLoading(true); setError('');
        try {
            const { data, error, count } = await supabase.from('contact_messages').select('*', { count: 'exact' })
                .order('created_at', { ascending: false }).order('id').range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
            if (error) throw error;
            setRows(data || []); setTotal(count || 0);
        } catch { setError('Messages could not be loaded. Please retry.'); }
        finally { setLoading(false); }
    }, [page]);
    useEffect(() => {
        load();
        window.addEventListener('focus', load);
        return () => window.removeEventListener('focus', load);
    }, [load]);
    async function markRead(row: Message) {
        setUpdating(row.id); setError('');
        try {
            const { data, error } = await supabase.from('contact_messages').update({ is_read: !row.is_read }).eq('id', row.id).select('id').single();
            if (error || !data) throw error || new Error('Message not updated');
            setRows(current => current.map(item => item.id === row.id ? { ...item, is_read: !row.is_read } : item));
        } catch { setError('Read status could not be updated. Please retry.'); }
        finally { setUpdating(null); }
    }
    return <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="text-3xl font-bold">Contact messages</h2><p className="text-muted-foreground">Messages submitted through the contact form, newest first.</p></div><Button variant="outline" onClick={load} disabled={loading}>Refresh</Button></div>
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {loading ? <p role="status">Loading messages…</p> : rows.length === 0 ? <p>No messages yet.</p> : rows.map(row => <article key={row.id} className="border rounded-xl p-6 space-y-4">
            <div className="flex flex-wrap justify-between gap-4"><div><h3 className="text-xl font-semibold">{row.subject}</h3><p className="text-sm text-muted-foreground">{new Date(row.created_at).toLocaleString()} · {row.is_read ? 'Read' : 'Unread'}</p></div><Button variant="outline" disabled={updating === row.id} onClick={() => markRead(row)}>Mark as {row.is_read ? 'unread' : 'read'}</Button></div>
            <p>{row.name} · <a className="underline break-all" href={`mailto:${row.email}`}>{row.email}</a></p>
            <p className="whitespace-pre-wrap break-words">{row.message}</p>
        </article>)}
        <div className="flex flex-wrap items-center gap-4"><Button variant="outline" disabled={loading || page === 0} onClick={() => setPage(value => value - 1)}>Previous</Button><span>{total} messages · Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span><Button variant="outline" disabled={loading || (page + 1) * PAGE_SIZE >= total} onClick={() => setPage(value => value + 1)}>Next</Button></div>
    </section>;
}
