import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CarDetail from "./pages/CarDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CookieBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/automobiliai" element={<Cars />} />
          <Route path="/apie-mus" element={<About />} />
          <Route path="/kontaktai" element={<Contact />} />
          <Route path="/duk" element={<FAQ />} />
          <Route path="/privatumo-politika" element={<PrivacyPolicy />} />
          <Route path="/nuomos-salygos" element={<TermsAndConditions />} />
          <Route path="/automobiliai/:id" element={<CarDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
