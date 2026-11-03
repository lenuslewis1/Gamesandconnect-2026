import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, RefreshCw, Search, Send, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CONTACT_SOURCES, canReceiveSms, safeContactSearch, smsEstimate } from '@/lib/bulkSms.mjs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import './bulk-sms.css';

type Contact = { id: string; name: string; email: string; phone: string; normalized_phone: string | null; sources: string[]; sms_opt_out: boolean; last_seen_at: string };
type Campaign = { id: string; created_at?: string; message: string; recipient_count: number; accepted_count: number; status: string; provider_campaign_id?: string; error?: string };
const PAGE_SIZE = 50;
const statusLabel: Record<string, string> = { sending: 'Awaiting result', accepted: 'Accepted by BMS', partial: 'Partially accepted', failed: 'Not accepted', unknown: 'Check BMS history' };

export default function BulkSms() {
    const [rows, setRows] = useState<Contact[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [source, setSource] = useState(() => {
        const value = new URLSearchParams(window.location.search).get('source');
        return value && Object.hasOwn(CONTACT_SOURCES, value) ? value : 'all';
    });
    const [eligibility, setEligibility] = useState('all');
    const [selected, setSelected] = useState<Map<string, Contact>>(new Map());
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const [review, setReview] = useState(false);
    const [result, setResult] = useState<Campaign | null>(null);
    const [sendError, setSendError] = useState('');
    const [pendingId, setPendingId] = useState<string | null>(null);
    const [history, setHistory] = useState<Campaign[]>([]);
    const [historyPage, setHistoryPage] = useState(0);
    const [historyCount, setHistoryCount] = useState(0);
    const [historyError, setHistoryError] = useState('');
    const [connection, setConnection] = useState<{ configured: boolean; sender: string | null } | null>(null);
    const [connectionError, setConnectionError] = useState('');
    const [updating, setUpdating] = useState<string | null>(null);
    const inFlight = useRef(false);
    const loadSequence = useRef(0);

    useEffect(() => { const timer = setTimeout(() => { setQuery(safeContactSearch(search)); setPage(0); }, 250); return () => clearTimeout(timer); }, [search]);
    const load = useCallback(async () => {
        const sequence = ++loadSequence.current;
        setLoading(true); setError('');
        let request = supabase.from('website_contacts').select('id,name,email,phone,normalized_phone,sources,sms_opt_out,last_seen_at', { count: 'exact' })
            .order('last_seen_at', { ascending: false }).order('id').range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
        if (query) request = request.or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%,normalized_phone.ilike.%${query}%`);
        if (source !== 'all') request = request.contains('sources', [source]);
        if (eligibility === 'ready') request = request.not('normalized_phone', 'is', null).eq('sms_opt_out', false);
        if (eligibility === 'excluded') request = request.eq('sms_opt_out', true);
        try {
            const { data, error, count } = await request;
            if (error) throw error;
            if (sequence !== loadSequence.current) return;
            setRows(data || []); setTotal(count || 0);
        } catch { if (sequence === loadSequence.current) setError('Contacts could not be loaded. Please try again.'); }
        finally { if (sequence === loadSequence.current) setLoading(false); }
    }, [page, query, source, eligibility]);
    const loadHistory = useCallback(async () => {
        setHistoryError('');
        const { data, error, count } = await supabase.from('sms_campaigns').select('id,created_at,message,recipient_count,accepted_count,status,provider_campaign_id,error', { count: 'exact' })
            .order('created_at', { ascending: false }).order('id').range(historyPage * 10, historyPage * 10 + 9);
        if (error) setHistoryError('Send history could not be loaded.');
        else { setHistory(data || []); setHistoryCount(count || 0); }
    }, [historyPage]);
    const checkConnection = useCallback(async () => {
        setConnectionError('');
        try {
            const { data, error } = await supabase.functions.invoke('bulk-sms', { body: { action: 'status' } });
            if (error || typeof data?.configured !== 'boolean') throw error;
            setConnection(data);
        } catch { setConnection(null); setConnectionError('SMS connection could not be checked.'); }
    }, []);
    useEffect(() => { load(); }, [load]);
    useEffect(() => { loadHistory(); }, [loadHistory]);
    useEffect(() => { checkConnection(); }, [checkConnection]);
    const recipients = new Set([...selected.values()].map(row => row.normalized_phone)).size;
    const estimate = smsEstimate(message.trim(), recipients);
    const locked = sending || Boolean(pendingId) || Boolean(result);
    function toggle(row: Contact) {
        setSelected(current => { const next = new Map(current); if (next.has(row.id)) next.delete(row.id); else if (canReceiveSms(row) && next.size < 500) next.set(row.id, row); return next; });
    }
    async function preference(row: Contact) {
        setUpdating(row.id); setError('');
        try {
            const { data, error } = await supabase.from('website_contacts').update({ sms_opt_out: !row.sms_opt_out }).eq('id', row.id).select('id').single();
            if (error || !data) throw error;
            setSelected(current => { const next = new Map(current); next.delete(row.id); return next; });
            await load();
        } catch { setError('The SMS preference could not be saved. Please retry.'); }
        finally { setUpdating(null); }
    }
    async function send() {
        if (inFlight.current) return;
        inFlight.current = true; setSending(true); setSendError(''); setReview(false);
        const id = pendingId || localStorage.getItem('games-connect-pending-sms') || crypto.randomUUID();
        setPendingId(id);
        // Persist the reference before sending so reloads cannot silently encourage duplicate sends.
        localStorage.setItem('games-connect-pending-sms', id);
        try {
            const { data, error } = await supabase.functions.invoke('bulk-sms', { body: { campaign_id: id, contact_ids: [...selected.keys()], message: message.trim() } });
            if (error || !data?.campaign) {
                let detail = data?.error;
                if (!detail && error?.context instanceof Response) { try { detail = (await error.context.json()).error; } catch { /* Use the actionable fallback below. */ } }
                throw new Error(detail || 'The result could not be confirmed. Check this campaign before sending another message.');
            }
            setResult(data.campaign);
            if (data.warning) setSendError(data.warning);
            if (data.campaign.status !== 'sending') { setPendingId(null); localStorage.removeItem('games-connect-pending-sms'); }
            await loadHistory();
        } catch (error) { setSendError(error instanceof Error ? error.message : 'The send result is unavailable. Check BMS history.'); }
        finally { inFlight.current = false; setSending(false); }
    }
    // After a reload, inspect the existing reference without replaying a send.
    useEffect(() => {
        const id = localStorage.getItem('games-connect-pending-sms');
        if (!id) return;
        setPendingId(id);
        setSendError('A previous send needs its result checked. Use “Check send status” before starting another message.');
    }, []);
    async function checkPending() {
        if (!pendingId || inFlight.current) return;
        inFlight.current = true; setSending(true); setSendError('');
        try {
            const { data, error } = await supabase.from('sms_campaigns').select('*').eq('id', pendingId).maybeSingle();
            if (error) throw error;
            if (!data) { setSendError('No saved campaign was found. Review the message again to retry with the same reference.'); setPendingId(null); setResult(null); }
            else { setResult(data); if (data.status !== 'sending') { setPendingId(null); localStorage.removeItem('games-connect-pending-sms'); } }
            await loadHistory();
        } catch { setSendError('The result could not be checked. Keep this reference and check BMS history before sending again.'); }
        finally { inFlight.current = false; setSending(false); }
    }
    return <section className="bulk-sms">
        <header className="sms-heading"><div><span className="sms-eyebrow">CONTACTS & MESSAGING</span><h2>Bulk SMS</h2><p>Website contacts in one place. Select recipients and send through BMS Africa.</p></div><Button variant="outline" onClick={() => { load(); loadHistory(); checkConnection(); }} disabled={loading || sending}><RefreshCw size={15} /> Refresh</Button></header>
        <div className="sms-connection" role="status"><MessageSquare size={18}/><span>{connection ? connection.configured ? `BMS Africa configured · Sender: ${connection.sender}` : 'SMS sending is not connected yet.' : connectionError || 'Checking SMS connection…'}</span></div>
        <div className="sms-workspace"><div className="sms-contacts">
            <div className="sms-section-heading"><h3><Users size={18}/> Website contacts <span>{total}</span></h3><p>Bookings, enquiries, team registrations and accounts are saved automatically.</p></div>
            <div className="sms-filters"><label className="sms-search"><Search size={16}/><input aria-label="Search contacts" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone or email"/></label><label><span className="sr-only">Contact source</span><select aria-label="Contact source" value={source} onChange={e => { setSource(e.target.value); setPage(0); }}><option value="all">All sources</option>{Object.entries(CONTACT_SOURCES).map(([key, label]) => <option key={key} value={key}>{label as string}</option>)}</select></label><label><span className="sr-only">SMS eligibility</span><select aria-label="SMS eligibility" value={eligibility} onChange={e => { setEligibility(e.target.value); setPage(0); }}><option value="all">All contacts</option><option value="ready">Ready for SMS</option><option value="excluded">Excluded from SMS</option></select></label></div>
            <div className="sms-selection"><span>{selected.size} selected · up to 500 per send</span><div><button disabled={locked || loading || Boolean(error)} onClick={() => setSelected(current => { const next = new Map(current); for (const row of rows) if (canReceiveSms(row) && next.size < 500) next.set(row.id, row); return next; })}>Select this page</button><button disabled={locked || !selected.size} onClick={() => setSelected(new Map())}>Clear selection</button></div></div>
            {error && <p role="alert" className="sms-error">{error}</p>}
            {loading ? <p role="status" className="sms-empty">Loading contacts…</p> : error ? null : !rows.length ? <div className="sms-empty"><Users size={28}/><h4>{query || source !== 'all' || eligibility !== 'all' ? 'No matching contacts' : 'No contacts yet'}</h4><p>{query || source !== 'all' || eligibility !== 'all' ? 'Try another search or filter.' : 'Website submissions will appear here automatically.'}</p></div> : <div className="sms-table-scroll"><table><thead><tr><th><span className="sr-only">Select</span></th><th>Contact</th><th>Phone</th><th>Source</th><th>SMS</th></tr></thead><tbody>{rows.map(row => <tr key={row.id} data-selected={selected.has(row.id)}><td><input type="checkbox" aria-label={`Select ${row.name || row.email || row.phone}`} checked={selected.has(row.id)} disabled={locked || !canReceiveSms(row) || (!selected.has(row.id) && selected.size >= 500)} onChange={() => toggle(row)}/></td><td><strong>{row.name || 'Name not provided'}</strong><small>{row.email || 'No email'}</small></td><td className="sms-phone">{row.phone || 'No phone number'}</td><td><small>{row.sources.map(key => CONTACT_SOURCES[key] || key).join(', ')}</small></td><td><span className={`sms-contact-state ${canReceiveSms(row) ? 'ready' : ''}`}>{row.sms_opt_out ? 'Excluded' : row.normalized_phone ? 'Ready' : 'No Ghana number'}</span><button className="sms-preference" disabled={locked || updating === row.id} onClick={() => preference(row)}>{row.sms_opt_out ? 'Allow SMS' : 'Exclude from SMS'}</button></td></tr>)}</tbody></table></div>}
            <div className="sms-pagination"><Button variant="outline" disabled={loading || page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button><span>Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</span><Button variant="outline" disabled={loading || (page + 1) * PAGE_SIZE >= total} onClick={() => setPage(p => p + 1)}>Next</Button></div>
        </div><aside className="sms-compose"><span className="sms-eyebrow">COMPOSE</span><h3>Your message</h3><label htmlFor="sms-message">SMS text</label><textarea id="sms-message" value={message} maxLength={1000} rows={8} disabled={locked} placeholder="Write your message to customers…" onChange={e => setMessage(e.target.value)}/><div className="sms-message-count"><span>{message.length}/1,000 characters</span><span>{estimate.encoding}</span></div><dl className="sms-estimate"><div><dt>Unique phone numbers</dt><dd>{recipients}</dd></div><div><dt>Parts per SMS</dt><dd>{estimate.segments}</dd></div><div><dt>Estimated SMS credits</dt><dd>{estimate.credits}</dd></div></dl><p className="sms-help">Ghana numbers only. Duplicate numbers receive one message. Longer messages and emoji can use more credits.</p>
            {sendError && <p role="alert" className="sms-error">{sendError}</p>}{result && <div role="status" className="sms-result"><strong>{statusLabel[result.status] || result.status}</strong><p>{result.accepted_count} of {result.recipient_count} numbers accepted.</p>{result.error && <p>{result.error}</p>}<small>Acceptance by BMS does not confirm delivery to the phone.</small></div>}
            {pendingId ? <><small className="sms-reference">Reference: {pendingId}</small><Button onClick={checkPending} disabled={sending}>{sending ? 'Checking…' : 'Check send status'}</Button></> : result ? <Button variant="outline" onClick={() => { setResult(null); setMessage(''); setSelected(new Map()); setSendError(''); }}>New message</Button> : <Button onClick={() => setReview(true)} disabled={!connection?.configured || !selected.size || !message.trim() || sending}><Send size={16}/> Review SMS</Button>}
        </aside></div>
        <section className="sms-history"><div className="sms-section-heading"><h3>Send history</h3><p>Campaign results and references. Check delivery reports in BMS Africa.</p></div>{historyError ? <p role="alert" className="sms-error">{historyError}</p> : !history.length ? <p className="sms-help">No SMS campaigns yet.</p> : <div className="sms-table-scroll"><table><thead><tr><th>Date</th><th>Message</th><th>Recipients</th><th>Result</th><th>Reference</th></tr></thead><tbody>{history.map(row => <tr key={row.id}><td>{new Date(row.created_at!).toLocaleString('en-GB')}</td><td className="sms-history-message">{row.message}</td><td>{row.accepted_count}/{row.recipient_count} accepted</td><td>{statusLabel[row.status] || row.status}{row.error && <small>{row.error}</small>}</td><td className="sms-reference">{row.provider_campaign_id || row.id}</td></tr>)}</tbody></table></div>}<div className="sms-pagination"><Button variant="outline" disabled={!historyPage} onClick={() => setHistoryPage(p => p - 1)}>Previous campaigns</Button><span>{historyCount} campaigns</span><Button variant="outline" disabled={(historyPage + 1) * 10 >= historyCount} onClick={() => setHistoryPage(p => p + 1)}>Next campaigns</Button></div></section>
        <Dialog open={review} onOpenChange={setReview}><DialogContent><DialogHeader><DialogTitle>Send to {recipients} phone numbers?</DialogTitle><DialogDescription>Estimated {estimate.credits} SMS credits using {estimate.segments} part(s) per number. BMS Africa will use your account credits.</DialogDescription></DialogHeader><div className="sms-review-text">{message.trim()}</div><p className="sms-help">{selected.size} selected contacts · Sender: {connection?.sender}</p><DialogFooter><Button variant="outline" onClick={() => setReview(false)}>Back to editing</Button><Button disabled={sending || !connection?.configured || !selected.size || !message.trim()} onClick={send}>Send SMS</Button></DialogFooter></DialogContent></Dialog>
    </section>;
}
