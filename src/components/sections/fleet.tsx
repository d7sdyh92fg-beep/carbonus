import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, Fuel, Settings, Star, Calendar } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";
import kiaCeedSideDarkGray from "@/assets/kia-ceed-side-dark-gray.png";
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

// Image mapping object
const imageMap: { [key: string]: string } = {
  bmw3Clean,
  chryslerTownCountrySide,
  vwPassatSideClean,
  kiaCeedSideDarkGray,
  kiaCeedHatchbackSideGrayBrown,
};

export function Fleet() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const cars: Car[] = [
    {
      id: "1",
      name: "BMW 3 series",
      price: "nuo 30 EUR",
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
      price: "nuo 30 EUR",
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
      price: "nuo 30 EUR",
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
      price: "nuo 30 EUR",
      image: kiaCeedSideDarkGray,
      category: "Universalas",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Mechaninė",
      rating: 4.5,
      year: 2013,
      features: ["Ekonomiškas vairavimas", "Erdvus universalas", "Patikimas automobilis"]
    },
    {
      id: "5",
      name: "KIA CEED",
      price: "nuo 30 EUR",
      image: kiaCeedHatchbackSideGrayBrown,
      category: "Hečbekas",
      passengers: 5,
      fuel: "Dyzelinas",
      transmission: "Mechaninė",
      rating: 4.6,
      year: 2020,
      features: ["Ekonomiškas dyzelinis variklis", "Modernus LED apšvietimas", "Patikimas automobilis"]
    }
  ];

  return (
    <section id="cars" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            {t('fleet.badge')}
          </p>
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('fleet.title')}
          </h2>
        </div>

        {/* Cars Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.slice(0, 3).map((car, index) => (
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
                    className={`w-full h-48 transition-transform duration-300 ${
                      car.name === "Volkswagen Passat" 
                        ? "object-contain object-center scale-[1.15] sm:object-cover sm:scale-[0.8] lg:object-contain lg:scale-[1.3] -translate-y-2 group-hover:scale-[1.2] sm:group-hover:scale-[0.85] lg:group-hover:scale-[1.36]" 
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
                    {car.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="text-sm text-muted-foreground">
                        • {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('fleet.priceFrom')}</p>
                      <p className="text-2xl font-bold text-primary">{car.price}</p>
                      <p className="text-xs text-muted-foreground">{t('fleet.perDay')}</p>
                    </div>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        navigate(`/automobiliai/${car.id}`);
                        setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                      }}
                    >
                      {t('fleet.viewButton')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View More Button */}
        <div className="text-center mt-12">
          <Button 
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            onClick={() => {
              navigate('/automobiliai');
              setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
            }}
          >
            {t('fleet.viewMore')}
          </Button>
        </div>
      </div>
    </section>
  );
}