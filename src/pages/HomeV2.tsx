import { Header } from "@/components/home/Header";
import { Hero } from "@/components/home/Hero";
import { PopularCars } from "@/components/home/PopularCars";
import { BenefitsSection } from "@/components/home/BenefitsSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { BottomCTA } from "@/components/home/BottomCTA";
import { Footer } from "@/components/home/Footer";

/**
 * Work-in-progress homepage (v2).
 * Route: /home-v2 — not indexed, safe to iterate on before replacing "/".
 */
const HomeV2 = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#12191A]">
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

export default HomeV2;
