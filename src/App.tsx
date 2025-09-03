import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { LanguageProvider } from "@/hooks/use-language";
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import CarDetail from "./pages/CarDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
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
          <Route path="/blogas" element={<Blog />} />
          <Route path="/blogas/:slug" element={<BlogPost />} />
          <Route path="/duk" element={<FAQ />} />
          <Route path="/privatumo-politika" element={<PrivacyPolicy />} />
          <Route path="/nuomos-salygos" element={<TermsAndConditions />} />
          <Route path="/automobiliai/:id" element={<CarDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
