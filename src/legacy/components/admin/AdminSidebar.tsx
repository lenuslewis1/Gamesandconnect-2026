import { LayoutDashboard, Users, CreditCard, CalendarCheck, UserPlus, Settings, LogOut, CalendarDays, Image as ImageIcon, Trophy, MessageSquare, FileText, Mail, Building2, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useAdminAlerts } from "@/hooks/useAdminAlerts";
import { cn } from "@/lib/utils";

const groups = [
    { title: "Overview", items: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "Events", href: "/admin/events", icon: CalendarDays },
        { title: "Game Day Manager", href: "/admin/game-day", icon: Trophy },
    ]},
    { title: "People & bookings", items: [
        { title: "Event Registrations", href: "/admin/registrations", icon: CalendarCheck },
        { title: "Team Registrations", href: "/admin/teams", icon: UserPlus },
        { title: "Payments", href: "/admin/payments", icon: CreditCard },
        { title: "Users", href: "/admin/users", icon: Users },
        { title: "Community members", href: "/admin/community-members", icon: Users },
        { title: "Contacts & SMS", href: "/admin/sms", icon: MessageSquare },
    ]},
    { title: "Content & enquiries", items: [
        { title: "Articles", href: "/admin/articles", icon: FileText },
        { title: "Gallery", href: "/admin/gallery", icon: ImageIcon },
        { title: "Teams Gallery", href: "/admin/teams-gallery", icon: Users },
        { title: "Contact messages", href: "/admin/contact-messages", icon: Mail },
        { title: "Corporate enquiries", href: "/admin/corporate-enquiries", icon: Building2 },
        { title: "Settings", href: "/admin/settings", icon: Settings },
    ]},
];

const formatAlertCount = (count: number) => count > 99 ? "99+" : String(count);

const AdminNavigation = ({ userId, signOut }: { userId: string; signOut: () => Promise<void> }) => {
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const alerts = useAdminAlerts(userId, location.pathname, location.key);
    const totalAlerts = Object.values(alerts).reduce((total, alert) => total + alert.count, 0);

    return <aside className="z-20 flex w-full shrink-0 flex-col border-b border-[#dce8de] bg-[#0f3d2e] text-white md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0">
        <div className="flex items-center justify-between px-5 py-5 md:px-6 md:py-7">
            <Link to="/admin" onClick={() => setOpen(false)} className="leading-tight"><span className="block text-lg font-bold tracking-tight">games <span className="text-[#a6f15d]">&</span> connect</span><span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a8c8b3]">Admin workspace</span></Link>
            <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="admin-navigation-panel"
                aria-label={open ? "Close navigation" : "Open navigation" + (totalAlerts ? ", " + totalAlerts + " alerts" : "")}
                className="flex items-center gap-2 rounded-md p-2 text-white hover:bg-white/10 md:hidden">
                {!open && totalAlerts > 0 && <span aria-hidden="true" className="rounded-full bg-[#a6f15d] px-2 py-0.5 text-xs font-bold text-[#103c29]">{formatAlertCount(totalAlerts)}</span>}
                {open ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
            </button>
        </div>
        <div id="admin-navigation-panel" className={cn("min-h-0 flex-1 overflow-y-auto px-3 pb-4", open ? "block" : "hidden md:block")}>
            <nav aria-label="Admin navigation" className="space-y-5">
                {groups.map(group => (
                    <div key={group.title}>
                        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91b5a0]">{group.title}</p>
                        <div className="space-y-0.5">
                            {group.items.map(item => {
                                const Icon = item.icon;
                                const active = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href + "/"));
                                const alert = alerts[item.href];
                                return (
                                    <Link key={item.href} to={item.href} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
                                        className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                                            active ? "bg-[#a6f15d] text-[#103c29]" : "text-[#d2e3d6] hover:bg-white/10 hover:text-white")}>
                                        <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                                        <span className="min-w-0 flex-1">{item.title}</span>
                                        {alert?.count > 0 && (
                                            <>
                                                <span aria-hidden="true" className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
                                                    active ? "bg-[#103c29] text-white" : "bg-[#a6f15d] text-[#103c29]")}>{formatAlertCount(alert.count)}</span>
                                                <span className="sr-only">{alert.count} {alert.label}</span>
                                            </>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
            <button type="button" onClick={() => void signOut()} className="mt-6 flex w-full items-center gap-3 border-t border-white/15 px-3 pt-5 text-left text-[13px] font-medium text-[#d2e3d6] hover:text-white"><LogOut className="h-4 w-4"/>Sign out</button>
        </div>
    </aside>;
};

const AdminSidebar = () => {
    const { signOut, user } = useAuth();
    return user ? <AdminNavigation key={user.id} userId={user.id} signOut={signOut} /> : null;
};

export default AdminSidebar;
