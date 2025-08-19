import { CheckCircle, Car, DollarSign } from "lucide-react";
import carInterior from "@/assets/car-interior.jpg";

export function Features() {
  const features = [
    {
      icon: CheckCircle,
      title: "Easy Booking",
      description: "Simple and quick booking process with instant confirmation"
    },
    {
      icon: Car,
      title: "Quality & Variety", 
      description: "Premium fleet of vehicles to match every need and preference"
    },
    {
      icon: DollarSign,
      title: "Affordable Rates",
      description: "Competitive pricing with transparent fees and no hidden costs"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Why Choose Carbonus?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our satisfied customers who trust us for their journeys. We serve with a lot of values that you can feel directly.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="text-center space-y-4 p-8 rounded-2xl hover:bg-secondary/50 transition-all duration-300 hover:shadow-card animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-4">
                  <Icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}