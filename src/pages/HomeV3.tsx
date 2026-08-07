import { Header } from "@/components/home/Header";
import { V3Hero } from "@/components/homev3/V3Hero";
import { V3HowItWorks } from "@/components/homev3/V3HowItWorks";
import { V3BestServices } from "@/components/homev3/V3BestServices";
import { V3TopDeals } from "@/components/homev3/V3TopDeals";
import { V3CustomerExperience } from "@/components/homev3/V3CustomerExperience";
import { V3Footer } from "@/components/homev3/V3Footer";

/** Design mockup page (v3) — route: /home-v3 */
const HomeV3 = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-foreground">
      <Header />
      <V3Hero />
      <V3HowItWorks />
      <V3TopDeals />
      <V3BestServices />
      <V3CustomerExperience />
      <V3Footer />
    </div>
  );
};

export default HomeV3;
