import React from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CookieBanner } from "@/components/cookies/CookieBanner";
import { LanguageProvider } from "@/hooks/use-language";
import { BookingProvider } from "@/contexts/BookingContext";
import { getCarSlugFromId } from "@/utils/carSlugs";
import Index from "./pages/Index";
import HomeV2 from "./pages/HomeV2";
import Cars from "./pages/Cars";
import AvailableCars from "./pages/AvailableCars";
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
import ReservationTerms from "./pages/ReservationTerms";
import ReservationReview from "./pages/ReservationReview";
import SEOChecklist from "./pages/SEOChecklist";
import PixelTester from "./pages/PixelTester";

const queryClient = new QueryClient();

// Redirect component for old numeric car URLs to new slug URLs
const CarIdRedirect = ({ id, language }: { id: string; language: 'lt' | 'en' }) => {
  const slug = getCarSlugFromId(id, language);
  if (!slug) return <Navigate to="/404" replace />;
  const path = language === 'en' ? `/cars/${slug}` : `/automobiliai/${slug}`;
  return <Navigate to={path} replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BookingProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <CookieBanner />
          <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Home */}
            <Route path="/" element={<Index />} />
            
            {/* Cars - Lithuanian & English */}
            <Route path="/automobiliai" element={<Cars />} />
            <Route path="/cars" element={<Cars />} />

            {/* Availability search results */}
            <Route path="/laisvi-automobiliai" element={<AvailableCars />} />
            <Route path="/available-cars" element={<AvailableCars />} />

            
            {/* New slug-based car routes */}
            <Route path="/automobiliai/:slug" element={<CarDetail />} />
            <Route path="/cars/:slug" element={<CarDetail />} />
            
            {/* 301 Redirects: Old numeric IDs to new slugs (keep these AFTER slug routes) */}
            {['1', '2', '3', '4', '5', '6', '7'].map(id => (
              <React.Fragment key={id}>
                <Route 
                  path={`/automobiliai/${id}`} 
                  element={<CarIdRedirect id={id} language="lt" />} 
                />
                <Route 
                  path={`/cars/${id}`} 
                  element={<CarIdRedirect id={id} language="en" />} 
                />
              </React.Fragment>
            ))}
            
            {/* About - Lithuanian & English */}
            <Route path="/apie-mus" element={<About />} />
            <Route path="/about" element={<About />} />
            
            {/* Contact - Lithuanian & English */}
            <Route path="/kontaktai" element={<Contact />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Blog - Lithuanian & English */}
            <Route path="/naujienos" element={<Blog />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/naujienos/:slug" element={<BlogPost />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            
            {/* FAQ - Lithuanian & English */}
            <Route path="/duk" element={<FAQ />} />
            <Route path="/faq" element={<FAQ />} />
            
            {/* Privacy Policy - Lithuanian & English */}
            <Route path="/privatumo-politika" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            
            {/* Lease Agreement - Lithuanian & English */}
            <Route path="/nuomos-sutartis" element={<LeaseAgreement />} />
            <Route path="/rental-agreement" element={<LeaseAgreement />} />
            <Route path="/lease-agreement" element={<LeaseAgreement />} />
            
            {/* Reservation - Lithuanian & English */}
            <Route path="/rezervacija/:carId/atsakomybe" element={<ReservationInsurance />} />
            <Route path="/reservation/:carId/insurance" element={<ReservationInsurance />} />
            <Route path="/rezervacija/:carId/paslaugos" element={<ReservationServices />} />
            <Route path="/reservation/:carId/services" element={<ReservationServices />} />
            <Route path="/rezervacija/:carId/salygos" element={<ReservationTerms />} />
            <Route path="/reservation/:carId/terms" element={<ReservationTerms />} />
            <Route path="/rezervacija/:carId/uzsakymas" element={<ReservationReview />} />
            <Route path="/reservation/:carId/review" element={<ReservationReview />} />
            
            {/* Payment & Auth - Same for both languages */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/payment-canceled" element={<PaymentCanceled />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            
            {/* SEO Checklist */}
            <Route path="/seo-checklist" element={<SEOChecklist />} />

            {/* Pixel / GA4 Event Tester (dev only, not linked anywhere) */}
            <Route path="/pixel-tester" element={<PixelTester />} />
            
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
