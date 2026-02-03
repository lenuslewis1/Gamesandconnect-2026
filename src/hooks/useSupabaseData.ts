import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, DbEvent, DbTrip, DbTestimonial, DbTeamMember, DbGalleryImage, DbGameDayGallery, DbGameDayScoreboard, DbGameDayEvent } from '@/lib/supabase';

// Fetch all events
export function useEvents() {
    return useQuery({
        queryKey: ['events'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;
            return data as DbEvent[];
        },
    });
}

// Fetch a single event by ID
export function useEvent(id: string | number) {
    return useQuery({
        queryKey: ['events', id],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as DbEvent;
        },
        enabled: !!id,
    });
}

// Fetch all trips
export function useTrips() {
    return useQuery({
        queryKey: ['trips'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('trips')
                .select('*')
                .eq('is_active', true)
                .order('date', { ascending: true });

            if (error) throw error;
            return data as DbTrip[];
        },
    });
}

// Fetch all testimonials
export function useTestimonials() {
    return useQuery({
        queryKey: ['testimonials'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as DbTestimonial[];
        },
    });
}

// Fetch all team members
export function useTeamMembers() {
    return useQuery({
        queryKey: ['team_members'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('team_members')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data as DbTeamMember[];
        },
    });
}

// Fetch all gallery images
export function useGalleryImages() {
    return useQuery({
        queryKey: ['gallery'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as DbGalleryImage[];
        },
    });
}


export function useRegisterForEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (registration: {
            event_id: number;
            full_name: string;
            email: string;
            phone: string;
            ticket_count: number;
        }) => {
            const { data, error } = await supabase
                .from('event_registrations')
                .insert([registration])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
}

// Gallery Mutations
export function useAddGalleryImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (image: { image_url: string; caption?: string; category?: string }) => {
            const { data, error } = await supabase
                .from('gallery')
                .insert([image])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
        },
    });
}

export function useDeleteGalleryImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('gallery')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
        },
    });
}

// ============================================
// GAME DAY HOOKS
// ============================================

// Game Day Gallery Queries
export function useGameDayGallery() {
    return useQuery({
        queryKey: ['game_day_gallery'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('game_day_gallery')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as DbGameDayGallery[];
        },
    });
}

// Game Day Scoreboards Queries
export function useGameDayScoreboards() {
    return useQuery({
        queryKey: ['game_day_scoreboards'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('game_day_scoreboards')
                .select('*')
                .order('season_points', { ascending: false });

            if (error) throw error;
            return data as DbGameDayScoreboard[];
        },
    });
}

// Game Day Events Queries
export function useGameDayEvents() {
    return useQuery({
        queryKey: ['game_day_events'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('game_day_events')
                .select('*')
                .order('event_date', { ascending: false });

            if (error) throw error;
            return data as DbGameDayEvent[];
        },
    });
}

export function useUpcomingGameDayEvent() {
    return useQuery({
        queryKey: ['game_day_events', 'upcoming'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('game_day_events')
                .select('*')
                .eq('is_upcoming', true)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
            return data as DbGameDayEvent | null;
        },
    });
}

// Game Day Gallery Mutations
export function useAddGameDayImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (image: { image_url: string; caption?: string; category?: string; event_date?: string }) => {
            const { data, error } = await supabase
                .from('game_day_gallery')
                .insert([image])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['game_day_gallery'] });
        },
    });
}

export function useDeleteGameDayImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('game_day_gallery')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['game_day_gallery'] });
        },
    });
}

// Game Day Scoreboard Mutations
export function useUpdateScoreboard() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (scoreboard: { id: string; wins?: number; season_points?: number; description?: string }) => {
            const { data, error } = await supabase
                .from('game_day_scoreboards')
                .update({
                    ...(scoreboard.wins !== undefined && { wins: scoreboard.wins }),
                    ...(scoreboard.season_points !== undefined && { season_points: scoreboard.season_points }),
                    ...(scoreboard.description !== undefined && { description: scoreboard.description }),
                })
                .eq('id', scoreboard.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['game_day_scoreboards'] });
        },
    });
}

// Game Day Events Mutations
export function useAddGameDayEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (event: {
            title: string;
            event_date: string;
            event_time: string;
            location: string;
            description?: string;
            is_upcoming?: boolean;
            registration_link?: string;
        }) => {
            const { data, error } = await supabase
                .from('game_day_events')
                .insert([event])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['game_day_events'] });
        },
    });
}

export function useUpdateGameDayEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (event: {
            id: string;
            title?: string;
            event_date?: string;
            event_time?: string;
            location?: string;
            description?: string;
            is_upcoming?: boolean;
            registration_link?: string;
        }) => {
            const { id, ...updates } = event;
            const { data, error } = await supabase
                .from('game_day_events')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['game_day_events'] });
        },
    });
}

export function useDeleteGameDayEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('game_day_events')
                .delete()
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['game_day_events'] });
        },
    });
}

