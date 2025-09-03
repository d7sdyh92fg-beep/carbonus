import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HeroProps {
  carImage?: string;
}

export function Hero({ carImage }: HeroProps) {
  const navigate = useNavigate();

  const handleNavigateToCars = () => {
    navigate('/automobiliai');
    // Small delay to ensure navigation completes before scrolling
    setTimeout(() => {
      window.scrollTo({
        top: 300, // Same scroll amount as CTA button
        behavior: 'smooth'
      });
    }, 100);
  };

  return (
    <section className="relative min-h-[60vh] md:min-h-screen pt-12 md:pt-16 flex items-start md:items-center overflow-hidden bg-transparent md:bg-gradient-to-br md:from-gray-50 md:to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Content */}
        <div className="space-y-3 md:space-y-8 animate-fade-in relative z-10 text-center lg:text-left pt-8 md:pt-0">
          <div className="space-y-3 md:space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-black leading-tight">
              Jūsų kelionė,
              <br />
              <span className="text-primary">Jūsų automobilis,</span>
              <br />
              Jūsų būdas
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Patirkite aukščiausią pasirinkimo laisvę su CARBONUS - pritaikykite savo nuotykį 
              rinkdamiesi iš mūsų aukščiausios klasės automobilių parko.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button 
              variant="hero"
              size="lg" 
              className="animate-scale-in"
              onClick={handleNavigateToCars}
            >
              Pradėti
            </Button>
          </div>
        </div>

        {/* Right Content - Car Image - Hidden on Mobile */}
        <div className="hidden lg:block relative animate-slide-up -ml-0 lg:-ml-12 mt-8 lg:mt-0">
          {/* Enhanced green glow around car - Hidden on mobile */}
          <div className="hidden lg:block absolute inset-0 rounded-full bg-emerald-400/18 blur-[80px] scale-110"></div>
          <div className="hidden lg:block absolute inset-0 rounded-full bg-green-500/22 blur-3xl scale-125"></div>
          <div className="hidden lg:block absolute inset-0 rounded-full bg-green-400/15 blur-2xl scale-105"></div>
          <div className="hidden lg:block absolute inset-0 rounded-full bg-emerald-300/12 blur-xl scale-150"></div>
          

          {/* Main Car Image */}
          <div className="relative z-10">
            <img
              src="/lovable-uploads/a3fa3c94-d1ad-4b21-984f-e85b545f68df.png"
              alt="Premium Green Audi"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-3xl mx-auto object-contain scale-75 sm:scale-90 lg:scale-110"
            />
          </div>
        </div>
      </div>


      {/* Background Elements - Hidden on mobile */}
      <div className="hidden lg:block absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}