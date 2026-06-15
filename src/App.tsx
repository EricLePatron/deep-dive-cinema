import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import FilmDeepDive from "./pages/FilmDeepDive";
import Favorites from "./pages/Favorites";
import Diary from "./pages/Diary";
import NotFound from "./pages/NotFound";
import MentionsLegales from "./pages/legal/MentionsLegales";
import Confidentialite from "./pages/legal/Confidentialite";
import CGU from "./pages/legal/CGU";
import Cookies from "./pages/legal/Cookies";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/film/:id" element={<FilmDeepDive />} />
          <Route path="/favoris" element={<Favorites />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/confidentialite" element={<Confidentialite />} />
          <Route path="/cgu" element={<CGU />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/analytics-deepdive-prive-2026" element={<AnalyticsDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
