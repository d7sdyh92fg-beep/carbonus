import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

interface HeroProps {
  carImage?: string;
}

export function Hero({ carImage }: HeroProps) {
  const carTypes = ["Sedan", "Sports", "SUV", "Coupe", "Convertible"];

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

          {/* Social Links */}
          <div className="flex space-x-4">
            {[Instagram, Facebook, Twitter, Linkedin].map((Icon, index) => (
              <button
                key={index}
                className="p-2 text-muted-foreground hover:text-primary transition-colors duration-200 hover:scale-110 transform"
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Car Image */}
        <div className="relative animate-slide-up">
          {/* Stats Card */}
          <div className="absolute top-0 left-0 z-10 bg-background/80 backdrop-blur-sm rounded-2xl p-6 shadow-card animate-scale-in">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Car Types</div>
              <div className="text-xs text-muted-foreground mt-1">Available</div>
            </div>
          </div>

          {/* Customer Reviews Card */}
          <div className="absolute top-4 right-0 z-10 bg-background/80 backdrop-blur-sm rounded-2xl p-4 shadow-card animate-scale-in">
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-primary"></div>
                <div className="w-8 h-8 rounded-full bg-primary-light"></div>
                <div className="w-8 h-8 rounded-full bg-primary-dark"></div>
              </div>
              <div>
                <div className="text-sm font-semibold">12.5K+ People</div>
                <div className="text-xs text-muted-foreground">has used our services such as</div>
                <div className="text-xs text-muted-foreground">renting, buying, or even selling their car.</div>
              </div>
            </div>
          </div>

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

          {/* Car Type Tags */}
          <div className="absolute bottom-0 right-0 space-y-2 animate-fade-in">
            {carTypes.map((type, index) => (
              <Badge
                key={type}
                variant="secondary"
                className={`block text-right transform transition-all duration-300 hover:scale-105 ${
                  index % 2 === 0 ? 'animate-slide-up' : 'animate-fade-in'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {type}
              </Badge>
            ))}
            <div className="mt-4 text-right">
              <a
                href="#cars"
                className="text-primary font-semibold hover:underline transition-all duration-200 hover:translate-x-1 inline-flex items-center space-x-2"
              >
                <span>Learn more</span>
                <span>→</span>
              </a>
            </div>
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