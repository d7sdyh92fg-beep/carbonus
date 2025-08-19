import { Hand, CalendarCheck, Circle, Car } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

const steps = [
  {
    id: 1,
    title: "Pasirinkti",
    icon: Hand,
    description: "Išsirinkite norimą automobilį iš mūsų parko",
    side: "right",
    hoverSide: "left",
  },
  {
    id: 2,
    title: "Užsakyti",
    icon: CalendarCheck,
    description: "Rezervuokite automobilį per mūsų svetainę",
    side: "left",
    hoverSide: "right",
  },
  {
    id: 3,
    title: "Vairuoti",
    icon: Circle,
    description: "Pasiimkite automobilį ir kelkitės į kelią",
    side: "right",
    hoverSide: "left",
  },
  {
    id: 4,
    title: "Grąžinti",
    icon: Car,
    description: "Grąžinkite automobilį nuomos laikotarpio pabaigoje",
    side: "left",
    hoverSide: "right",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm font-semibold text-primary mb-2 tracking-wider uppercase">
            KAIP TAI VEIKIA
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground">
            Paprasti žingsniai automobilio gavimui
          </h2>
        </div>

        {/* Steps */}
        <div className="relative max-w-sm mx-auto">
          {/* Dotted line */}
          <div 
            className="absolute left-1/2 top-12 bottom-12 w-px transform -translate-x-1/2"
            style={{
              backgroundImage: 'repeating-linear-gradient(to bottom, hsl(var(--muted-foreground)) 0px, hsl(var(--muted-foreground)) 4px, transparent 4px, transparent 12px)',
            }}
          ></div>

          {/* Step items */}
          <div className="relative space-y-16">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              
              return (
                <div
                  key={step.id}
                  className="relative flex items-center justify-center"
                >
                  {/* Step content - positioned based on side */}
                  {step.side === "left" && (
                    <div className="absolute right-1/2 pr-12 text-right">
                      <h3 className="text-2xl font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                  )}

                  {/* Step button with hover */}
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <button className="relative z-10 w-20 h-20 bg-background border-2 border-border rounded-3xl flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110 shadow-lg">
                        <IconComponent className="w-7 h-7" />
                      </button>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      side={step.hoverSide === "left" ? "left" : "right"}
                      className="w-64 p-4"
                      sideOffset={15}
                    >
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>

                  {/* Step content - positioned based on side */}
                  {step.side === "right" && (
                    <div className="absolute left-1/2 pl-12 text-left">
                      <h3 className="text-2xl font-bold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                  )}

                  {/* Dot on line */}
                  <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-muted-foreground rounded-full transform -translate-x-1/2 -translate-y-1/2 z-0"></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}