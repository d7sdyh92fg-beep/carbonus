import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Fuel, Settings, Star, Calendar } from "lucide-react";
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";
import kiaCeedSideClean from "@/assets/kia-ceed-side-clean.png";
import kiaCeedSideDarkGray from "@/assets/kia-ceed-side-dark-gray.png";
import kiaCeedWagonSide from "@/assets/kia-ceed-wagon-side.png";
import kiaCeedHatchbackSide from "@/assets/kia-ceed-hatchback-side.png";
import kiaCeedHatchbackSideFlipped from "@/assets/kia-ceed-hatchback-side-flipped.png";
import kiaCeedHatchbackSideBrown from "@/assets/kia-ceed-hatchback-side-brown.png";
import kiaCeedHatchbackSideGrayBrown from "@/assets/kia-ceed-hatchback-side-gray-brown.png";

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
  year: number;
}

const Cars = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    // Set page title and meta tags
    document.title = "Automobiliai - Carbonus | BMW, Audi ir kiti premium automobiliai nuomai";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Peržiūrėkite mūsų premium automobilių parką. BMW 3 serijos, Chrysler ir kiti naujausių modelių automobiliai nuomai Lietuvoje. Rezervuokite online.');
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/automobiliai');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Automobiliai - Carbonus');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/automobiliai');
    }
  }, []);

  const cars: Car[] = [
    {
      id: "1",
      name: "BMW 3 series",
      price: "30 EUR",
      image: bmw3Clean,
      category: "Sedanas",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.8,
      year: 2017,
      features: ["Kondicionierius", "Bluetooth", "GPS navigacija"]
    },
    {
      id: "2",
      name: "Chrysler Town & Country",
      price: "30 EUR",
      image: chryslerTownCountrySide,
      category: "Miniautobusas",
      passengers: 7,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.6,
      year: 2014,
      features: ["7 vietos", "Bagažinė", "Šeimos automobilis"]
    },
    {
      id: "3",
      name: "Volkswagen Passat",
      price: "30 EUR",
      image: vwPassatSideClean,
      category: "Sedanas",
      passengers: 5,
      fuel: "Dyzelinas",
      transmission: "Mechaninė",
      rating: 4.7,
      year: 2012,
      features: ["Ekonomiškas", "Patogus", "Didelis bagažas"]
    },
    {
      id: "4",
      name: "KIA CEED",
      price: "30 EUR",
      image: kiaCeedSideDarkGray,
      category: "Universalas",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Mechaninė",
      rating: 4.5,
      year: 2013,
      features: [
        "Ekonomiškas vairavimas",
        "Erdvus universalas",
        "Patikimas automobilis"
      ],
    },
    {
      id: "5",
      name: "KIA CEED",
      price: "30 EUR",
      image: kiaCeedHatchbackSideGrayBrown,
      category: "Hečbekas",
      passengers: 5,
      fuel: "Dyzelinas",
      transmission: "Mechaninė",
      rating: 4.6,
      year: 2020,
      features: [
        "Ekonomiškas dyzelinis variklis",
        "Modernus LED apšvietimas",
        "Patikimas automobilis"
      ],
    }
  ];

  const categories = ["all", "Sedanas", "Miniautobusas", "Universalas", "Hečbekas"];

  // Filter cars based on search term and selected category
  const filteredCars = cars.filter(car => {
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Automobilių nuoma
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Raskite tobulą automobilį savo kelionei. Turime platų pasirinkimą aukščiausios kokybės automobilių.
          </p>
          
          {/* Search and Filter Controls */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              {/* Search Input */}
              <div className="w-full md:w-96">
                <Input
                  placeholder="Ieškoti automobilio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              
              {/* Category Filter */}
              <div className="w-full md:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder="Kategorija" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="all">Visos kategorijos</SelectItem>
                    {categories.filter(cat => cat !== "all").map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Results Counter */}
            <div className="mt-4 text-sm text-muted-foreground">
              {searchTerm || selectedCategory !== "all" ? (
                <span>Rasta {filteredCars.length} automobil{filteredCars.length === 1 ? 'is' : filteredCars.length < 10 ? 'iai' : 'ių'}</span>
              ) : (
                <span>Iš viso {cars.length} automobil{cars.length < 10 ? 'iai' : 'ių'}</span>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Cars Grid */}
      <section className="pt-16 pb-20 bg-secondary/30">
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
                      className={`w-full h-48 transition-transform duration-300 ${
                        car.name === "Volkswagen Passat" 
                          ? "object-contain object-center scale-[1.25] -translate-y-2 group-hover:scale-[1.31]" 
                          : "object-cover group-hover:scale-105"
                      }`}
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
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
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
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{car.year}</span>
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
                        onClick={() => navigate(`/automobiliai/${car.id}`)}
                      >
                        Žiūrėti
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