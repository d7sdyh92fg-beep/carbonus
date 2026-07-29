import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { Fleet } from "@/components/sections/fleet";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BottomCTA } from "@/components/home/BottomCTA";
import { Footer } from "@/components/home/Footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";

const Index = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#12191A]">
      <LanguageLinks />
      <Header />
      <Hero />
      <PopularCars />
      <BenefitsSection />
      <HowItWorks />
      <BottomCTA />
      <Footer />
    </div>
  );
};

export default Index;
