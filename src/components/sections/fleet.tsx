import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import carMustang from "@/assets/car-mustang.jpg";
import carAudi from "@/assets/car-audi.jpg";
import carBmw from "@/assets/car-bmw.jpg";
import carMercedes from "@/assets/car-mercedes.jpg";
import carToyota from "@/assets/car-toyota.jpg";
import carTesla from "@/assets/car-tesla.jpg";

interface Car {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
}

export function Fleet() {
  const cars: Car[] = [
    {
      id: "1",
      name: "Ford - Mustang Convertible",
      price: "$59/day",
      image: carMustang,
      category: "Sports"
    },
    {
      id: "2", 
      name: "Audi A4 Sedan",
      price: "$49/day",
      image: carAudi,
      category: "Sedan"
    },
    {
      id: "3",
      name: "BMW X5 SUV", 
      price: "$79/day",
      image: carBmw,
      category: "SUV"
    },
    {
      id: "4",
      name: "Mercedes-Benz - C-Class Coupe",
      price: "$69/day", 
      image: carMercedes,
      category: "Coupe"
    },
    {
      id: "5",
      name: "Toyota - Camry Hybrid",
      price: "$39/day",
      image: carToyota, 
      category: "Hybrid"
    },
    {
      id: "6",
      name: "Tesla - Model 3",
      price: "$99/day",
      image: carTesla,
      category: "Electric"
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
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
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
                      <p className="text-sm text-muted-foreground">Nuo</p>
                      <p className="text-xl font-bold text-primary">{car.price}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="hover:bg-primary hover:text-primary-foreground transition-all duration-200"
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