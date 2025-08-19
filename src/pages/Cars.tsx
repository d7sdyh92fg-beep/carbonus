import { useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Fuel, Settings, Star } from "lucide-react";

interface Car {
  id: string;
  name: string;
  price: string;
  image: string;
  category: string;
  passengers: number;
  fuel: string;
  transmission: string;
  rating: number;
  features: string[];
}

const Cars = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const cars: Car[] = [
    {
      id: "1",
      name: "BMW 3 series",
      price: "30 EUR",
      image: "/src/assets/bmw-3-clean.png",
      category: "Sedan",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.8,
      features: ["Kondicionierius", "Bluetooth", "GPS navigacija"]
    },
    {
      id: "2",
      name: "Chrysler Town & Country",
      price: "30 EUR",
      image: "/src/assets/chrysler-town-country-side.png",
      category: "Minivan",
      passengers: 7,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.6,
      features: ["7 vietos", "Bagažinė", "Šeimos automobilis"]
    }
  ];

  const categories = ["all", "Sedan", "SUV", "Minivan", "Electric", "Sports"];

  const filteredCars = cars.filter(car => {
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/f307c05e-658c-4866-b3eb-8b9d71719579.png" />
      
      {/* Hero Section */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Automobilių nuoma
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Raskite tobulą automobilį savo kelionei. Turime platų pasirinkimą aukščiausios kokybės automobilių.
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Ieškoti automobilio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Kategorija" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Visi automobiliai</SelectItem>
                {categories.slice(1).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCars.map((car) => (
              <Card
                key={car.id}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-background border-0 shadow-card"
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        {car.category}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 rounded-full px-2 py-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{car.rating}</span>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                        {car.name}
                      </h3>
                    </div>

                    {/* Car Features */}
                    <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{car.passengers}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Fuel className="w-4 h-4" />
                        <span>{car.fuel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        <span>{car.transmission}</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-1">
                      {car.features.map((feature, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {feature}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Kaina nuo</p>
                        <p className="text-2xl font-bold text-primary">{car.price}</p>
                        <p className="text-xs text-muted-foreground">per dieną</p>
                      </div>
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        Užsakyti
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredCars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">
                Nerasta automobilių pagal jūsų paieškos kriterijus.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cars;