import { Button } from "@/components/ui/button";

interface HeroProps {
  carImage?: string;
}

export function Hero({ carImage }: HeroProps) {

  return (
    <section className="relative min-h-screen pt-16 flex items-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8 animate-fade-in">
          <div className="space-y-6">
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
              Your Journey,
              <br />
              <span className="text-primary">Your Car,</span>
              <br />
              Your Way
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground max-w-lg leading-relaxed">
              Experience the ultimate freedom of choice with Carbonus - tailor your adventure by 
              choosing from our premium fleet of vehicles.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" className="animate-scale-in">
              Get Started
            </Button>
          </div>

        </div>

        {/* Right Content - Car Image */}
        <div className="relative animate-slide-up">
          {/* Main Car Image */}
          <div className="relative">
            {carImage ? (
              <img
                src={carImage}
                alt="Premium Car"
                className="w-full max-w-2xl mx-auto object-contain"
              />
            ) : (
              <div className="w-full h-96 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <span className="text-primary-foreground text-xl font-semibold">Premium Car</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}