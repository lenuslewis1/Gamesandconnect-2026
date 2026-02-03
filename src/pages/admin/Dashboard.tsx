
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, CreditCard, UserPlus, DollarSign, Loader2 } from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval, isSameMonth } from "date-fns";

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { title: "Total Revenue", value: "GHS 0.00", change: "...", icon: DollarSign, color: "bg-gradient-to-br from-green-500 to-emerald-700", textColor: "text-white" },
        { title: "Active Users", value: "0", change: "...", icon: Users, color: "bg-gradient-to-br from-blue-500 to-indigo-700", textColor: "text-white" },
        { title: "Registrations", value: "0", change: "...", icon: UserPlus, color: "bg-gradient-to-br from-purple-500 to-fuchsia-700", textColor: "text-white" },
        { title: "Total Payments", value: "0", change: "...", icon: CreditCard, color: "bg-gradient-to-br from-orange-500 to-red-700", textColor: "text-white" },
    ]);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [userActivityData, setUserActivityData] = useState<any[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Stats
            const [
                { data: payments, error: paymentsError },
                { count: userCount, error: userError },
                { count: registrationCount, error: regError },
                { data: allPayments, error: allPaymentsError }
            ] = await Promise.all([
                supabase.from('payments').select('amount').or('status.eq.success,status.eq.successful'),
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
                    title: "Active Users",
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
                    ?.filter((p: any) => (p.status === 'success' || p.status === 'successful') && isSameMonth(new Date(p.created_at), monthDate))
                    ?.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0) || 0;

                return { name: monthName, revenue: monthRevenue };
            });
            setRevenueData(processedRevenue);

            // 3. Process User Activity Data (Signups per day last 7 days)
            const { data: recentProfiles } = await supabase
                .from('profiles')
                .select('created_at')
                .gte('created_at', subMonths(new Date(), 1).toISOString()); // Just get last month for simplicity

            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const processedActivity = days.map(day => {
                const count = recentProfiles?.filter((p: any) => format(new Date(p.created_at), 'EEE') === day).length || 0;
                return { name: day, new: count, active: Math.floor(count * 1.5) }; // Mocking active as 1.5x new for visual
            });
            setUserActivityData(processedActivity);

        } catch (error) {
            console.error("Dashboard data error:", error);
            toast.error("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in-50 duration-500">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your platform's performance.</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className={`${stat.color} border-none shadow-lg transition-transform hover:scale-105 duration-300`}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className={`text-sm font-medium ${stat.textColor} opacity-90`}>
                                    {stat.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${stat.textColor} opacity-75`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</div>
                                <p className={`text-xs ${stat.textColor} opacity-75`}>
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Revenue Chart */}
                <Card className="col-span-4 border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
                    <CardHeader>
                        <CardTitle>Revenue Overview</CardTitle>
                        <CardDescription>Monthly revenue performance (last 6 months)</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `GHS${value}`} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#10b981' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* User Activity Chart */}
                <Card className="col-span-3 border-none shadow-md bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
                    <CardHeader>
                        <CardTitle>User Activity</CardTitle>
                        <CardDescription>New signups by day of week</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={userActivityData}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="new" name="New Signups" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="active" name="Active Users (Est)" fill="#a855f7" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
