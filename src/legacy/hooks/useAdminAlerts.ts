import { useEffect, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const activity = [
    { path: "/admin/corporate-enquiries", table: "corporate_enquiries" },
    { path: "/admin/registrations", table: "event_registrations" },
    { path: "/admin/teams", table: "team_registrations" },
    { path: "/admin/payments", table: "payments" },
];

type Visits = Record<string, string>;
const contactPath = "/admin/contact-messages";
export const adminAlertsKey = ["admin-alerts"] as const;
const refreshInterval = 30_000;
const countOptions = { count: "exact", head: true } as const;

function readVisits(key: string): Visits {
    try {
        const stored = JSON.parse(localStorage.getItem(key) || "{}");
        return Object.fromEntries(Object.entries(stored ?? {}).filter(([, value]) =>
            typeof value === "string" && Number.isFinite(Date.parse(value)),
        )) as Visits;
    } catch {
        return {};
    }
}

export function useAdminAlerts(userId: string, pathname: string, navigationKey: string) {
    const storageKey = "gc-admin-visits:" + userId;
    const [visits, setVisits] = useState<Visits>(() => readVisits(storageKey));
    const [firstSeenFrom] = useState(() => new Date(Date.now() - 86_400_000).toISOString());

    useEffect(() => {
        if (!activity.some(item => item.path === pathname)) return;
        const next = { ...readVisits(storageKey), [pathname]: new Date().toISOString() };
        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
            // The current tab still tracks visits if browser storage is unavailable.
        }
        setVisits(current => ({ ...current, ...next }));
    }, [pathname, navigationKey, storageKey]);

    useEffect(() => {
        const syncVisits = (event: StorageEvent) => {
            if (event.key === storageKey) setVisits(readVisits(storageKey));
        };
        window.addEventListener("storage", syncVisits);
        return () => window.removeEventListener("storage", syncVisits);
    }, [storageKey]);

    const unread = useQuery({
        queryKey: [...adminAlertsKey, userId, "contact_messages"],
        refetchInterval: refreshInterval,
        queryFn: async ({ signal }) => {
            const { count, error } = await supabase.from("contact_messages")
                .select("id", countOptions).or("is_read.eq.false,is_read.is.null").abortSignal(signal);
            if (error) throw error;
            return count ?? 0;
        },
    });

    const counts = useQueries({
        queries: activity.map(item => {
            const since = visits[item.path] ?? firstSeenFrom;
            return {
                queryKey: [...adminAlertsKey, userId, item.table, since],
                refetchInterval: refreshInterval,
                queryFn: async ({ signal }: { signal: AbortSignal }) => {
                    const { count, error } = await supabase.from(item.table)
                        .select("id", countOptions).gt("created_at", since).abortSignal(signal);
                    if (error) throw error;
                    return count ?? 0;
                },
            };
        }),
    });

    const alerts: Record<string, { count: number; label: "new" | "unread" }> = {
        [contactPath]: { count: unread.data ?? 0, label: "unread" },
    };
    activity.forEach((item, index) => {
        alerts[item.path] = { count: counts[index].data ?? 0, label: "new" };
    });
    return alerts;
}
