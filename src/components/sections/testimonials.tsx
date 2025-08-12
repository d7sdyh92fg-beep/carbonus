import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import customer1 from "@/assets/customer-1.jpg";
import customer2 from "@/assets/customer-2.jpg";
import customer3 from "@/assets/customer-3.jpg";

interface Testimonial {
  id: string;
  name: string;
  quote: string;
  image: string;
}

export function Testimonials() {
  const testimonials: Testimonial[] = [
    {
      id: "1",
      name: "Aleea Thompson",
      quote: "My Carbonus experience was nothing short of incredible. The pristine car and impeccable service made my trip unforgettable. I'll be back for more.",
      image: customer1
    },
    {
      id: "2", 
      name: "Thomas Alfa",
      quote: "The car I rented was in pristine condition and very comfortable. Overall, Carbonus provided top-notch service at a competitive price.",
      image: customer2
    },
    {
      id: "3",
      name: "Chelsea Davidson", 
      quote: "Carbonus exceeded my expectations with their exceptional car rental service. The car was immaculate and comfortable for our long road trip.",
      image: customer3
    }
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            WHAT OUR CUSTOMERS SAY
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Customer Reviews
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="bg-background border-0 shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Stars */}
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-primary text-primary"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-foreground leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center space-x-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-foreground">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Verified Customer
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}