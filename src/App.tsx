import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import GameDay from "./pages/GameDay";
import EventDetail from "./pages/EventDetail";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";

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
import Events from "./pages/Events";
import AdminLogin from "./pages/admin/Login";
import AdminSignup from "./pages/admin/Signup";
import AdminRoute from "./components/AdminRoute";
import { AuthProvider } from "./components/AuthProvider";


const queryClient = new QueryClient();

const App = () => (
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
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:teamId" element={<TeamDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/signup" element={<AdminSignup />} />

            {/* Admin Routes */}
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
);

export default App;

