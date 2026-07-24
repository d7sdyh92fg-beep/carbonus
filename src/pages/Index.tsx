import { Navigation } from "@/components/ui/navigation";
import { Hero } from "@/components/sections/hero";
import { Fleet } from "@/components/sections/fleet";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";

const Index = () => {
  return (
    <div className="min-h-screen bg-transparent md:bg-background">
      <Navigation logo="/__l5e/assets-v1/ca2ce61e-2fe8-4b83-805a-6d90ebedc076/carbonus_logo_green_white_transparent.png" />
      <Hero />
      <Fleet />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
};

export default Index;
