import { Button } from "@/components/ui/button";

interface HeroProps {
  carImage?: string;
}

export function Hero({ carImage }: HeroProps) {
  return (
    <section className="relative min-h-screen pt-16 flex items-center overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative">
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in relative z-10">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-black leading-tight">
              Your Journey,
              <br />
              <span className="text-green-600">Your Car,</span>
              <br />
              Your Way
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 max-w-lg leading-relaxed">
              Experience the ultimate freedom of choice with CARBONUS - tailor your adventure by 
              choosing from our premium fleet of vehicles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-full transition-all duration-300 animate-scale-in"
            >
              Get Started
            </Button>
          </div>
        </div>

        {/* Right Content - Car Image */}
        <div className="relative animate-slide-up -ml-12">
          {/* Car Types Badge */}
          <div className="absolute top-8 right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg z-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-black">50+</div>
              <div className="text-sm text-gray-600 leading-tight">
                Car Types
                <br />
                Available
              </div>
            </div>
          </div>

          {/* Main Car Image */}
          <div className="relative">
            <img
              src="/src/assets/green-audi-front.png"
              alt="Premium Green Audi"
              className="w-full max-w-3xl mx-auto object-contain scale-110"
            />
          </div>
        </div>
      </div>

      {/* Background CARBONUS Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-[20rem] font-bold text-green-600/10 select-none whitespace-nowrap">
          CARBONUS
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}