import { V3Header } from "@/components/homev3/V3Header";
import { V3Hero } from "@/components/homev3/V3Hero";
import { V3Partners } from "@/components/homev3/V3Partners";
import { V3HowItWorks } from "@/components/homev3/V3HowItWorks";
import { V3BestServices } from "@/components/homev3/V3BestServices";
import { V3TopDeals } from "@/components/homev3/V3TopDeals";
import { V3CustomerExperience } from "@/components/homev3/V3CustomerExperience";
import { V3AppCta } from "@/components/homev3/V3AppCta";
import { V3Footer } from "@/components/homev3/V3Footer";

/** Design mockup page (v3) — route: /home-v3 */
const HomeV3 = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-foreground">
      <V3Header />
      <V3Hero />
      <V3Partners />
      <V3HowItWorks />
      <V3BestServices />
      <V3TopDeals />
      <V3CustomerExperience />
      <V3AppCta />
      <V3Footer />
    </div>
  );
};

export default HomeV3;
