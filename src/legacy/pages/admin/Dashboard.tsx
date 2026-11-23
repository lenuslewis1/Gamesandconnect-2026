
import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAdminArticles } from '@/hooks/useArticles';
import { useAuth } from '@/components/AuthProvider';
import { Users, CreditCard, UserPlus, DollarSign, Loader2, ArrowUpRight, FileText } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format, subMonths, eachMonthOfInterval, isSameMonth } from "date-fns";

const CONFIRMED_PAYMENT_STATUSES = ['success', 'successful', 'completed', 'confirmed', 'paid'];

const isConfirmedPayment = (status?: string | null) =>
    CONFIRMED_PAYMENT_STATUSES.includes(status?.toLowerCase().trim() || '');

const dayMs = 86_400_000;
const dayLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });
const fullDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'UTC' });

function EventRegistrationsChart() {
    const { user } = useAuth();
    const { data, isPending, isError, refetch } = useQuery({
        queryKey: ['admin-registration-chart', user?.id],
        refetchInterval: 30_000,
        queryFn: async ({ signal }) => {
            const today = Math.floor(Date.now() / dayMs) * dayMs;
            return Promise.all(Array.from({ length: 7 }, async (_, index) => {
                const start = new Date(today - (6 - index) * dayMs);
                const end = new Date(start.getTime() + dayMs);
                const { count, error } = await supabase.from('event_registrations')
                    .select('id', { count: 'exact', head: true })
                    .gte('created_at', start.toISOString()).lt('created_at', end.toISOString())
                    .abortSignal(signal);
                if (error) throw error;
                return { day: dayLabel.format(start), date: fullDate.format(start), count: count ?? 0 };
            }));
        },
    });
    const total = data?.reduce((sum, day) => sum + day.count, 0) ?? 0;

    return (
        <section aria-labelledby="dashboard-registrations-title" className="min-w-0 rounded-xl border border-[#dfe8e1] bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h3 id="dashboard-registrations-title" className="text-lg font-semibold">Event registrations</h3>
                    <p className="mt-1 text-sm text-[#718479]">Submissions per day over the last 7 days</p>
                </div>
                {data && <span className="shrink-0 rounded-full bg-[#eef5ee] px-3 py-1 text-xs font-medium text-[#416a51]">{total} total</span>}
            </div>
            <div className="mt-8 h-[260px] w-full">
                {isPending ? (
                    <p role="status" className="pt-4 text-sm text-muted-foreground">Loading registrations&hellip;</p>
                ) : isError && !data ? (
                    <div className="space-y-3 pt-4 text-sm">
                        <p role="alert">Registration data could not be loaded.</p>
                        <button type="button" className="font-medium text-[#0f3d2e] underline" onClick={() => void refetch()}>Try again</button>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 8, right: 0, left: -24, bottom: 0 }} accessibilityLayer>
                            <CartesianGrid stroke="#edf2ed" vertical={false} />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: '#60756a', fontSize: 12 }} dy={10} />
                            <YAxis allowDecimals={false} domain={[0, (maximum: number) => Math.max(1, maximum)]}
                                tickLine={false} axisLine={false} tick={{ fill: '#60756a', fontSize: 11 }} />
                            <Tooltip cursor={{ fill: '#f4f8f3' }} labelFormatter={(_, points) => points[0]?.payload.date}
                                contentStyle={{ border: '1px solid #dfe8e1', borderRadius: 10 }} />
                            <Bar dataKey="count" name="Registrations" fill="#43855c" radius={[5, 5, 0, 0]} maxBarSize={34} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
            {data && (
                <ul className="sr-only" aria-label="Daily registration counts">
                    {data.map(day => <li key={day.date}>{day.date} &middot; {day.count} registrations</li>)}
                </ul>
            )}
        </section>
    );
}

const AdminDashboard = () => {
    const {data: articles = []} = useAdminArticles();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { title: "Total Revenue", value: "GHS 0.00", change: "...", icon: DollarSign, color: "bg-gradient-to-br from-green-500 to-emerald-700", textColor: "text-white" },
        { title: "Profiles", value: "0", change: "...", icon: Users, color: "bg-gradient-to-br from-blue-500 to-indigo-700", textColor: "text-white" },
        { title: "Registrations", value: "0", change: "...", icon: UserPlus, color: "bg-gradient-to-br from-purple-500 to-fuchsia-700", textColor: "text-white" },
        { title: "Total Payments", value: "0", change: "...", icon: CreditCard, color: "bg-gradient-to-br from-orange-500 to-red-700", textColor: "text-white" },
    ]);
    const [revenueData, setRevenueData] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();

        const channel = supabase
            .channel('admin-dashboard-analytics')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchDashboardData(false))
            .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => fetchDashboardData(false))
            .subscribe();

        const refreshOnFocus = () => fetchDashboardData(false);
        window.addEventListener('focus', refreshOnFocus);

        return () => {
            window.removeEventListener('focus', refreshOnFocus);
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchDashboardData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);

            // 1. Fetch Stats
            const [
                { data: payments, error: paymentsError },
                { count: userCount, error: userError },
                { count: registrationCount, error: regError },
                { data: allPayments, error: allPaymentsError }
            ] = await Promise.all([
                supabase.from('payments').select('amount').in('status', CONFIRMED_PAYMENT_STATUSES),
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('registrations').select('*', { count: 'exact', head: true }),
                supabase.from('payments').select('amount, created_at, status')
            ]);

            if (paymentsError || userError || regError || allPaymentsError) {
                console.error("Error fetching dashboard data:", { paymentsError, userError, regError, allPaymentsError });
                toast.error("Failed to load some dashboard data");
            }

            const totalRevenue = payments?.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0) || 0;

            setStats([
                {
                    title: "Total Revenue",
                    value: `GHS ${totalRevenue.toLocaleString()}`,
                    change: "Lifetime revenue",
                    icon: DollarSign,
                    color: "bg-gradient-to-br from-green-500 to-emerald-700",
                    textColor: "text-white"
                },
                {
                    title: "Profiles",
                    value: (userCount || 0).toString(),
                    change: "Registered profiles",
                    icon: Users,
                    color: "bg-gradient-to-br from-blue-500 to-indigo-700",
                    textColor: "text-white"
                },
                {
                    title: "Registrations",
                    value: (registrationCount || 0).toString(),
                    change: "Event bookings",
                    icon: UserPlus,
                    color: "bg-gradient-to-br from-purple-500 to-fuchsia-700",
                    textColor: "text-white"
                },
                {
                    title: "Total Payments",
                    value: (allPayments?.length || 0).toString(),
                    change: "All transactions",
                    icon: CreditCard,
                    color: "bg-gradient-to-br from-orange-500 to-red-700",
                    textColor: "text-white"
                },
            ]);

            // 2. Process Revenue Chart Data (Last 6 Months)
            const last6Months = eachMonthOfInterval({
                start: subMonths(new Date(), 5),
                end: new Date()
            });

            const processedRevenue = last6Months.map(monthDate => {
                const monthName = format(monthDate, 'MMM');
                const monthRevenue = allPayments
                    ?.filter((p: any) => isConfirmedPayment(p.status) && isSameMonth(new Date(p.created_at), monthDate))
                    ?.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0) || 0;

                return { name: monthName, revenue: monthRevenue };
            });
            setRevenueData(processedRevenue);

        } catch (error) {
            console.error("Dashboard data error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#4d7c0f]" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1500px] space-y-8 text-[#10291d] animate-in fade-in duration-500">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#668071]">Games & Connect / Admin</p>
                    <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Overview</h2>
                    <p className="mt-2 text-sm text-[#687b6f]">A snapshot of your community and activity.</p>
                </div>
                <Link to="/admin/events" className="inline-flex items-center gap-2 rounded-lg bg-[#0f3d2e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#19523d]">Manage events <ArrowUpRight className="h-4 w-4" /></Link>
            </div>

            <section aria-label="Platform totals" className="grid grid-cols-1 overflow-hidden rounded-xl border border-[#dfe8e1] bg-white sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return <div key={stat.title} className="border-b border-[#e7eee8] p-6 last:border-b-0 sm:border-r xl:border-b-0">
                        <div className="flex items-center justify-between gap-3"><span className="text-sm font-medium text-[#60756a]">{stat.title}</span><Icon className="h-4 w-4 text-[#759083]" /></div>
                        <div className="mt-5 text-3xl font-semibold tracking-tight text-[#10291d]">{stat.value}</div>
                        <p className="mt-2 text-xs text-[#7a8d80]">{stat.change}</p>
                    </div>;
                })}
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,1fr)]">
                <section className="min-w-0 rounded-xl border border-[#dfe8e1] bg-white p-5 sm:p-7">
                    <div className="mb-8 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7b9183]">Payments</p><h3 className="mt-2 text-lg font-semibold">Revenue overview</h3><p className="mt-1 text-sm text-[#718479]">Confirmed payments over the last 6 months</p></div><span className="rounded-full bg-[#eef5ee] px-3 py-1 text-xs font-medium text-[#416a51]">Last 6 months</span></div>
                    <div className="h-[260px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}><defs><linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a6f15d" stopOpacity={0.4}/><stop offset="100%" stopColor="#a6f15d" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid stroke="#edf2ed" vertical={false}/><XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill:'#829389',fontSize:12}} dy={10}/><YAxis tickLine={false} axisLine={false} width={55} tick={{fill:'#829389',fontSize:11}} tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : `${value}`}/><Tooltip formatter={(value: number) => [`GHS ${value.toLocaleString()}`, 'Revenue']} contentStyle={{border:'1px solid #dfe8e1',borderRadius:10}}/><Area type="monotone" dataKey="revenue" stroke="#43855c" strokeWidth={2.5} fill="url(#dashboardRevenue)"/></AreaChart></ResponsiveContainer></div>
                </section>
                <EventRegistrationsChart />
            </div>
            <section className="rounded-xl border border-[#dfe8e1] bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-5"><div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eef5ee] text-[#2f7049]"><FileText className="h-5 w-5"/></div><div><h3 className="font-semibold">Articles</h3><p className="mt-1 text-sm text-[#718479]">{articles.filter(article => article.status === 'published').length} published · {articles.filter(article => article.status === 'draft').length} drafts</p></div></div><div className="flex flex-wrap gap-2"><Link className="rounded-lg border border-[#d8e4da] px-4 py-2.5 text-sm font-medium transition-colors hover:bg-[#f4f8f3]" to="/admin/articles">Manage articles</Link><Link className="rounded-lg bg-[#a6f15d] px-4 py-2.5 text-sm font-semibold text-[#163a24] transition-colors hover:bg-[#b9f782]" to="/admin/articles/new">Write an article</Link></div></div>
            </section>
        </div>
    );
};

export default AdminDashboard;
