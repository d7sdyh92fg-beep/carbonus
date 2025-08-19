import { Navigation } from "@/components/ui/navigation";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Fleet } from "@/components/sections/fleet";
import { Features } from "@/components/sections/features";
import { Testimonials } from "@/components/sections/testimonials";
import { Footer } from "@/components/sections/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/f307c05e-658c-4866-b3eb-8b9d71719579.png" />
      <Hero carImage="/src/assets/car-green-hero.png" />
      <HowItWorks />
      <Fleet />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
