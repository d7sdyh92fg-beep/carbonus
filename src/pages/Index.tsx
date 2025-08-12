import { Navigation } from "@/components/ui/navigation";
import { Hero } from "@/components/sections/hero";
import { Fleet } from "@/components/sections/fleet";
import { Features } from "@/components/sections/features";
import { Testimonials } from "@/components/sections/testimonials";
import { Footer } from "@/components/sections/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/f307c05e-658c-4866-b3eb-8b9d71719579.png" />
      <Hero carImage="/lovable-uploads/70c1b8d2-2c07-425e-b9b7-36067768f565.png" />
      <Fleet />
      <Features />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
