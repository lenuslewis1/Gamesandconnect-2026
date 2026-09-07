import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { App as Index } from "../App";
const About = lazy(() => import("./pages/About"));
const GameDay = lazy(() => import("./pages/GameDay"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Teams = lazy(() => import("./pages/Teams"));
const TeamDetail = lazy(() => import("./pages/TeamDetail"));
const Events = lazy(() => import("./pages/Events"));
const Travel = lazy(() => import("./pages/Travel"));
const Community = lazy(() => import("./pages/Community"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Trivia = lazy(() => import("./pages/Trivia"));

import AdminLayout from "./layouts/AdminLayout";
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const TeamRegistrations = lazy(() => import("./pages/admin/TeamRegistrations"));
const EventRegistrations = lazy(() => import("./pages/admin/EventRegistrations"));
const Payments = lazy(() => import("./pages/admin/Payments"));
const Users = lazy(() => import("./pages/admin/Users"));
const AdminEvents = lazy(() => import("./pages/admin/Events"));
const GalleryManager = lazy(() => import("./pages/admin/GalleryManager"));
const TeamsGallery = lazy(() => import("./pages/admin/TeamsGallery"));
const GameDayManager = lazy(() => import("./pages/admin/GameDayManager"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminSignup = lazy(() => import("./pages/admin/Signup"));
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./components/AuthProvider";

/* SEO Landing Pages */
const TeamBuilding = lazy(() => import("./pages/landing/TeamBuilding"));
const GamesDayAccra = lazy(() => import("./pages/landing/GamesDayAccra"));
const CorporateEvents = lazy(() => import("./pages/landing/CorporateEvents"));
const OutdoorAdventures = lazy(() => import("./pages/landing/OutdoorAdventures"));
const WhatIsGamesAndConnect = lazy(() => import("./pages/landing/WhatIsGamesAndConnect"));

/* Blog */
const Blog = lazy(() => import("./pages/Blog"));
const BlogArticle = lazy(() => import("./pages/BlogArticle"));

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div role="status" className="min-h-[60vh] grid place-items-center">Loading page…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/game-day" element={<GameDay />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/travel" element={<Travel />} />
              <Route path="/community" element={<Community />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/trivia" element={<Trivia />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:teamId" element={<TeamDetail />} />
              <Route path="/auth" element={<Auth />} />

              {/* SEO Landing Pages */}
              <Route path="/team-building" element={<TeamBuilding />} />
              <Route path="/games-day-accra" element={<GamesDayAccra />} />
              <Route path="/corporate-events" element={<CorporateEvents />} />
              <Route path="/outdoor-adventures" element={<OutdoorAdventures />} />
              <Route path="/about/what-is-games-and-connect" element={<WhatIsGamesAndConnect />} />

              {/* Blog */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogArticle />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/signup" element={<AdminSignup />} />
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/teams" element={<TeamRegistrations />} />
                  <Route path="/admin/registrations" element={<EventRegistrations />} />
                  <Route path="/admin/payments" element={<Payments />} />
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/events" element={<AdminEvents />} />
                  <Route path="/admin/gallery" element={<GalleryManager />} />
                  <Route path="/admin/teams-gallery" element={<TeamsGallery />} />
                  <Route path="/admin/game-day" element={<GameDayManager />} />
                </Route>
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
