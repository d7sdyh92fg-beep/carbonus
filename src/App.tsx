import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { LanguageProvider } from "@/hooks/use-language";
import { BookingProvider } from "@/contexts/BookingContext";
import Index from "./pages/Index";
import Cars from "./pages/Cars";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CarDetail from "./pages/CarDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import NotFound from "./pages/NotFound";
import LeaseAgreement from "./pages/LeaseAgreement";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCanceled from "./pages/PaymentCanceled";
import ReservationInsurance from "./pages/ReservationInsurance";
import ReservationServices from "./pages/ReservationServices";
import ReservationReview from "./pages/ReservationReview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BookingProvider>
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
            <Route path="/naujienos" element={<Blog />} />
            <Route path="/naujienos/:slug" element={<BlogPost />} />
            <Route path="/duk" element={<FAQ />} />
            <Route path="/privatumo-politika" element={<PrivacyPolicy />} />
            <Route path="/nuomos-sutartis" element={<LeaseAgreement />} />
            <Route path="/automobiliai/:id" element={<CarDetail />} />
            <Route path="/rezervacija/:carId/atsakomybe" element={<ReservationInsurance />} />
            <Route path="/rezervacija/:carId/paslaugos" element={<ReservationServices />} />
            <Route path="/rezervacija/:carId/uzsakymas" element={<ReservationReview />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </TooltipProvider>
      </BookingProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
