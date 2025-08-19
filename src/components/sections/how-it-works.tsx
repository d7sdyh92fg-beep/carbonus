import { MousePointer, Calendar, CircleDot, Car } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const steps = [
  {
    id: 1,
    title: "Select",
    icon: MousePointer,
    description: "Choose your desired car from our fleet",
  },
  {
    id: 2,
    title: "Book",
    icon: Calendar,
    description: "Reserve your car through our website",
  },
  {
    id: 3,
    title: "Drive",
    icon: CircleDot,
    description: "Pick up your car and hit the road",
  },
  {
    id: 4,
    title: "Return",
    icon: Car,
    description: "Bring the car back at the end of your rental period",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wider uppercase">
            HOW IT WORKS
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Simple Steps to Get the Car
          </h2>
        </div>

        {/* Steps */}
        <div className="relative max-w-md mx-auto">
          {/* Dotted line */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-0.5 transform -translate-x-1/2 opacity-30"
            style={{
              backgroundImage: 'radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)',
              backgroundSize: '1px 8px',
              backgroundRepeat: 'repeat-y'
            }}
          ></div>

          {/* Step items */}
          <div className="relative space-y-12">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              const isEven = index % 2 === 1;
              
              return (
                <div
                  key={step.id}
                  className={`flex items-center ${
                    isEven ? "flex-row-reverse" : "flex-row"
                  } gap-8`}
                >
                  {/* Step content */}
                  <div className={`flex-1 ${isEven ? "text-right" : "text-left"}`}>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                  </div>

                  {/* Step button with hover */}
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <button className="relative z-10 w-20 h-20 bg-background border-2 border-border rounded-3xl flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 group shadow-lg">
                        <IconComponent className="w-8 h-8" />
                        
                        {/* Dot indicator */}
                        <div className="absolute -left-1 top-1/2 w-2 h-2 bg-border rounded-full transform -translate-y-1/2 group-hover:bg-primary transition-colors duration-300"></div>
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side={isEven ? "left" : "right"} 
                      className="w-64 p-4"
                      sideOffset={10}
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  {/* Empty space for alignment */}
                  <div className="flex-1"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}