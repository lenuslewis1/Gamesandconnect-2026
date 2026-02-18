import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import About from "./pages/About";
import GameDay from "./pages/GameDay";
import EventDetail from "./pages/EventDetail";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Events from "./pages/Events";
import Travel from "./pages/Travel";
import Community from "./pages/Community";
import Gallery from "./pages/Gallery";
import Trivia from "./pages/Trivia";

import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import TeamRegistrations from "./pages/admin/TeamRegistrations";
import EventRegistrations from "./pages/admin/EventRegistrations";
import Payments from "./pages/admin/Payments";
import Users from "./pages/admin/Users";
import AdminEvents from "./pages/admin/Events";
import GalleryManager from "./pages/admin/GalleryManager";
import TeamsGallery from "./pages/admin/TeamsGallery";
import GameDayManager from "./pages/admin/GameDayManager";
import AdminLogin from "./pages/admin/Login";
import AdminSignup from "./pages/admin/Signup";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./components/AuthProvider";

/* SEO Landing Pages */
import TeamBuilding from "./pages/landing/TeamBuilding";
import GamesDayAccra from "./pages/landing/GamesDayAccra";
import CorporateEvents from "./pages/landing/CorporateEvents";
import OutdoorAdventures from "./pages/landing/OutdoorAdventures";
import WhatIsGamesAndConnect from "./pages/landing/WhatIsGamesAndConnect";

/* Blog */
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
