import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for database tables
export interface DbEvent {
    id: number;
    title: string;
    date: string;
    time_range: string;
    location: string;
    description: string;
    image_url: string | null;
    price: string | null;
    capacity: number;
    category: string | null;
    created_at: string;
}

export interface DbTrip {
    id: string;
    title: string;
    destination: string;
    description: string;
    date: string;
    duration: string;
    price: number;
    installment_price: number | null;
    image_url: string | null;
    itinerary: string[];
    is_active: boolean;
    created_at: string;
}

export interface DbTestimonial {
    id: string;
    name: string;
    role: string;
    content: string;
    avatar_url: string | null;
    is_featured: boolean;
    is_active: boolean;
    created_at: string;
}

export interface DbTeamMember {
    id: string;
    name: string;
    role: string;
    bio: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
}

export interface DbGalleryImage {
    id: string;
    image_url: string;
    caption: string | null;
    category: string | null;
    created_at: string;
}

export interface DbGameDayGallery {
    id: string;
    image_url: string;
    caption: string | null;
    category: string | null;
    event_date: string | null;
    created_at: string;
}

export interface DbGameDayScoreboard {
    id: string;
    team_name: string;
    team_color: string;
    wins: number;
    season_points: number;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface DbGameDayEvent {
    id: string;
    title: string;
    event_date: string;
    event_time: string;
    location: string;
    description: string | null;
    is_upcoming: boolean;
    registration_link: string | null;
    created_at: string;
    updated_at: string;
}

export interface ContactMessage {
    name: string;
    email: string;
    subject: string;
    message: string;
}
