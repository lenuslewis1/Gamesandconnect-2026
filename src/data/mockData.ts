// Mock data for the Games and Connect platform

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  price: number;
  image: string;
  category: "games" | "travel" | "party" | "trivia";
  featured?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  description: string;
  date: string;
  duration: string;
  price: number;
  installmentPrice?: number;
  image: string;
  itinerary: string[];
}

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  category: "games" | "travel" | "parties" | "trivia";
}

// Mock Events
export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Game Day Championship",
    description: "The ultimate showdown! Join us for an action-packed day of outdoor games, team battles, and amazing prizes.",
    date: "2026-02-01",
    time: "10:00 AM",
    location: "Nexus 9 Arena, Accra",
    price: 50,
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800",
    category: "games",
    featured: true,
  },
  {
    id: "2",
    title: "Beach Vibes Party",
    description: "Sun, sand, and good vibes! Come party with us at the beach for an unforgettable evening.",
    date: "2026-02-15",
    time: "4:00 PM",
    location: "Labadi Beach, Accra",
    price: 80,
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800",
    category: "party",
    featured: true,
  },
  {
    id: "3",
    title: "Trivia Night Special",
    description: "Test your knowledge and win big! Join our WhatsApp trivia competition.",
    date: "2026-02-07",
    time: "8:00 PM",
    location: "WhatsApp Community",
    price: 0,
    image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800",
    category: "trivia",
  },
  {
    id: "4",
    title: "Cape Coast Adventure",
    description: "Explore the beautiful Cape Coast! Visit the castle, enjoy local cuisine, and create lasting memories.",
    date: "2026-03-10",
    time: "6:00 AM",
    location: "Cape Coast, Central Region",
    price: 350,
    image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
    category: "travel",
    featured: true,
  },
];

// Mock Testimonials
export const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Kwame Asante",
    role: "Regular Attendee",
    content: "Games and Connect has changed my weekends! The energy, the people, the vibes - it's always an amazing experience.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: "2",
    name: "Ama Serwaa",
    role: "Travel Enthusiast",
    content: "The Cape Coast trip was incredible! Well organized, fun group, and memories that will last forever.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  },
  {
    id: "3",
    name: "Kofi Mensah",
    role: "Team Yellow Captain",
    content: "Being part of Team Yellow at Game Day is the highlight of every month. The competition is fierce but friendly!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
  },
  {
    id: "4",
    name: "Efua Nyarko",
    role: "Trivia Champion",
    content: "I've won twice at Trivia Friday! It's such a fun way to test your knowledge and meet new people.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
  },
];

// Mock Team Members
export const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Emmanuel Osei",
    role: "Founder & Lead Organizer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300",
    bio: "Emmanuel started Games and Connect with a vision to bring young Ghanaians together through fun experiences.",
  },
  {
    id: "2",
    name: "Adjoa Mensah",
    role: "Events Coordinator",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300",
    bio: "Adjoa ensures every event runs smoothly and everyone has an incredible time.",
  },
  {
    id: "3",
    name: "Daniel Kwarteng",
    role: "Travel Director",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=300",
    bio: "Daniel plans and leads our travel adventures across Ghana and beyond.",
  },
  {
    id: "4",
    name: "Nana Aba Ansah",
    role: "Community Manager",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    bio: "Nana Aba keeps our WhatsApp community vibrant and organizes Trivia Friday.",
  },
];

// Mock Trips
export const mockTrips: Trip[] = [
  {
    id: "1",
    title: "Cape Coast Castle Experience",
    destination: "Cape Coast",
    description: "A historical journey to Cape Coast Castle, combined with beach relaxation and local food tours.",
    date: "2026-03-10",
    duration: "2 Days",
    price: 350,
    installmentPrice: 120,
    image: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800",
    itinerary: [
      "Day 1: Departure from Accra, Castle tour, Beach sunset",
      "Day 2: Kakum National Park, Local food tour, Return to Accra",
    ],
  },
  {
    id: "2",
    title: "Akosombo Dam Getaway",
    destination: "Akosombo",
    description: "Relax by the beautiful Volta Lake, enjoy boat cruises, and experience the famous Akosombo Dam.",
    date: "2026-04-05",
    duration: "1 Day",
    price: 200,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    itinerary: [
      "Morning: Departure from Accra",
      "Midday: Dam tour and boat cruise",
      "Evening: Lakeside dinner and return",
    ],
  },
];

// Mock Gallery Images
export const mockGalleryImages: GalleryImage[] = [
  { id: "1", src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800", alt: "Game Day action", category: "games" },
  { id: "2", src: "https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=800", alt: "Cape Coast trip", category: "travel" },
  { id: "3", src: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800", alt: "Beach party", category: "parties" },
  { id: "4", src: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800", alt: "Trivia night", category: "trivia" },
  { id: "5", src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800", alt: "Team celebration", category: "games" },
  { id: "6", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800", alt: "Akosombo view", category: "travel" },
  { id: "7", src: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800", alt: "Night party", category: "parties" },
  { id: "8", src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800", alt: "Friends at event", category: "games" },
];
