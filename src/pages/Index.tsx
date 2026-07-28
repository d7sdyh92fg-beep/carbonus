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
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
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
