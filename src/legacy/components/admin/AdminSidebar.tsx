
import {
    LayoutDashboard,
    Users,
    CreditCard,
    CalendarCheck,
    UserPlus,
    Settings,
    LogOut,
    CalendarDays,
    Image as ImageIcon,
    Trophy
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Team Registrations",
        href: "/admin/teams",
        icon: UserPlus,
    },
    {
        title: "Event Registrations",
        href: "/admin/registrations",
        icon: CalendarCheck,
    },
    {
        title: "Payments",
        href: "/admin/payments",
        icon: CreditCard,
    },
    {
        title: "Users",
        href: "/admin/users",
        icon: Users,
    },
    {
        title: "Events",
        href: "/admin/events",
        icon: CalendarDays,
    },
    {
        title: "Gallery",
        href: "/admin/gallery",
        icon: ImageIcon,
    },
    {
        title: "Teams Gallery",
        href: "/admin/teams-gallery",
        icon: Users,
    },
    {
        title: "Game Day Manager",
        href: "/admin/game-day",
        icon: Trophy,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

const AdminSidebar = () => {
    const location = useLocation();

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-background">
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight text-[#4d7c0f]">Admin</h2>
                <p className="text-sm text-muted-foreground">Manage your platform</p>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));

                        return (
                            <Link
                                key={index}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-[#4d7c0f]",
                                    isActive
                                        ? "bg-muted text-[#4d7c0f]"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <Button variant="ghost" className="w-full justify-start gap-2 text-red-500 hover:text-red-500 hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default AdminSidebar;
