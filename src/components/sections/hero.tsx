import { Button } from "@/components/ui/button";

interface HeroProps {
  carImage?: string;
}

export function Hero({ carImage }: HeroProps) {
  return (
    <section className="relative min-h-screen pt-16 flex items-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-black leading-tight">
              Jūsų kelionė,
              <br />
              <span className="text-primary">Jūsų automobilis,</span>
              <br />
              Jūsų būdas
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 max-w-lg leading-relaxed">
              Patirkite aukščiausią pasirinkimo laisvę su CARBONUS - pritaikykite savo nuotykį 
              rinkdamiesi iš mūsų aukščiausios klasės automobilių parko.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              variant="hero"
              size="lg" 
              className="animate-scale-in"
            >
              Pradėti
            </Button>
          </div>
        </div>

        {/* Right Content - Car Image */}
        <div className="relative animate-slide-up -ml-12">
          {/* Green glow around car */}
          <div className="absolute inset-0 rounded-full bg-green-500/20 blur-3xl scale-110"></div>
          <div className="absolute inset-0 rounded-full bg-green-400/15 blur-2xl scale-125"></div>
          <div className="absolute inset-0 rounded-full bg-green-600/10 blur-xl scale-150"></div>
          
          {/* Car Types Badge */}
          <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg z-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-black">50+</div>
              <div className="text-sm text-gray-600 leading-tight">
                Automobilių tipų
                <br />
                pasirinkimas
              </div>
            </div>
          </div>

          {/* Main Car Image */}
          <div className="relative z-10">
            <img
              src="/src/assets/green-audi-front.png"
              alt="Premium Green Audi"
              className="w-full max-w-3xl mx-auto object-contain scale-110"
            />
          </div>
        </div>
      </div>


      {/* Background Elements */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}