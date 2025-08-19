import { CheckCircle, Car, DollarSign } from "lucide-react";
import carInterior from "@/assets/car-interior.jpg";

export function Features() {
  const features = [
    {
      icon: CheckCircle,
      title: "Lengvas užsakymas",
      description: "Paprastas ir greitas užsakymo procesas su momentaliu patvirtinimu"
    },
    {
      icon: Car,
      title: "Kokybė ir įvairovė", 
      description: "Aukščiausios klasės automobilių parkas, atitinkantis kiekvieną poreikį ir pageidavimą"
    },
    {
      icon: DollarSign,
      title: "Prieinamos kainos",
      description: "Konkurencingi tarifai su skaidriomis sąlygomis ir be paslėptų mokesčių"
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Kodėl rinktis Carbonus?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prisijunkite prie mūsų patenkintų klientų, kurie pasitiki mumis savo kelionėms. Mes aptarnaujame su daugybe vertybių, kurias galite pajusti tiesiogiai.
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