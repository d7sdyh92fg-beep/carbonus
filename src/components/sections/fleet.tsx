import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";

interface Car {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

export function Fleet() {
  const navigate = useNavigate();
  const cars: Car[] = [
    {
      id: "1",
      name: "BMW 3 series",
      price: "30 EUR",
      image: bmw3Clean,
      category: "Sedan"
    },
    {
      id: "2",
      name: "Chrysler Town & Country",
      price: "30 EUR",
      image: chryslerTownCountrySide,
      category: "Minivan"
    },
    {
      id: "3",
      name: "Volkswagen Passat",
      price: "30 EUR",
      image: vwPassatSideClean,
      category: "Sedan"
    }
  ];

  return (
    <section id="cars" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            AUTOMOBILIAI
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Automobilių nuoma
          </h2>
        </div>

        {/* Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car, index) => (
            <Card
              key={car.id}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-background border-0 shadow-card animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={car.image}
                    alt={car.name}
                    className={`w-full h-48 transition-transform duration-300 group-hover:scale-115 ${
                      car.name === "Volkswagen Passat" 
                        ? "object-contain object-center scale-[1.35]" 
                        : "object-cover"
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                      {car.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Kaina nuo</p>
                      <p className="text-xl font-bold text-primary">{car.price}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      onClick={() => {
                        navigate(`/automobiliai/${car.id}`);
                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                      }}
                    >
                      Žiūrėti
                    </Button>
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