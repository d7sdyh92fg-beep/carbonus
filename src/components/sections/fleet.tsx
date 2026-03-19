import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Users, Fuel, Settings, Star, Calendar, Crown } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCarSlugFromId } from "@/utils/carSlugs";
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";
import kiaCeedWagonSideClean from "@/assets/kia-ceed-wagon-side-clean.png";
import kiaCeedHatchbackSideCleanGray from "@/assets/kia-ceed-hatchback-side-khaki.png";
import mercedesSlkSide from "@/assets/mercedes-slk-side-clean.png";
import citroenSpacetourerSide from "@/assets/citroen-spacetourer-side-clean.png";

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
  kiaCeedWagonSideClean,
  kiaCeedHatchbackSideCleanGray,
};

export function Fleet() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  // Fetch premium status from DB
  const { data: dbCars } = useQuery({
    queryKey: ['cars-premium-status'],
    queryFn: async () => {
      const { data } = await supabase
        .from('cars')
        .select('id, is_premium, price_tier1, price_tier3');
      return data || [];
    },
  });
  const premiumCarIds = new Set((dbCars || []).filter(c => c.is_premium).map(c => c.id));
  const getCarDbPrice = (carId: string) => {
    const dbCar = (dbCars || []).find(c => c.id === carId);
    if (dbCar?.price_tier3) return `${dbCar.price_tier3} EUR`;
    return null;
  };

  // Feature key mapping for translation
  const getFeatureKey = (feature: string): string => {
    const featureMap: { [key: string]: string } = {
      'Kondicionierius': 'car.featuresList.airConditioning',
      'Bluetooth': 'car.featuresList.bluetooth',
      'GPS navigacija': 'car.featuresList.gpsNavigation',
      '7 vietos': 'car.featuresList.sevenSeats',
      'Bagažinė': 'car.featuresList.trunk',
      'Šeimos automobilis': 'car.featuresList.familyCar',
      'Ekonomiškas': 'car.featuresList.economical',
      'Patogus': 'car.featuresList.comfortable',
      'Didelis bagažas': 'car.featuresList.largeTrunk',
      'Ekonomiškas vairavimas': 'car.featuresList.economicalDriving',
      'Erdvus universalas': 'car.featuresList.spaciousWagon',
      'Patikimas automobilis': 'car.featuresList.reliable',
      'Ekonomiškas dyzelinis variklis': 'car.featuresList.economicalDiesel',
      'Modernus LED apšvietimas': 'car.featuresList.modernLED',
      'Atidaromas stogas': 'car.featuresList.retractableRoof',
      'Automatinė pavarų dėžė': 'car.featuresList.automaticTransmission',
      'Sportinis dizainas': 'car.featuresList.sportyDesign',
      '9 keleivių vietos': 'car.featuresList.nineSeats',
      'Slankiosios durys': 'car.featuresList.slidingDoors',
      'Erdvus salonas': 'car.featuresList.spaciousInterior'
    };
    return featureMap[feature] || feature;
  };

  // Normalize Lithuanian characters for translation keys
  const normalizeForTranslation = (text: string): string => {
    return text.toLowerCase()
      .replace(/ė/g, 'e')
      .replace(/ą/g, 'a')
      .replace(/į/g, 'i')
      .replace(/ų/g, 'u')
      .replace(/ū/g, 'u')
      .replace(/č/g, 'c')
      .replace(/š/g, 's')
      .replace(/ž/g, 'z');
  };

  // Only show available cars (BMW and Chrysler are sold)
  const cars: Car[] = [
    {
      id: "6",
      name: "Mercedes-Benz SLK",
      price: "90 EUR",
      image: mercedesSlkSide,
      category: "Kabrioletas",
      passengers: 2,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.9,
      year: 2015,
      features: ["Atidaromas stogas", "Automatinė pavarų dėžė", "Sportinis dizainas"]
    },
    {
      id: "7",
      name: "Citroën SpaceTourer",
      price: "60 EUR",
      image: citroenSpacetourerSide,
      category: "Vienatūris",
      passengers: 9,
      fuel: "Dyzelinas",
      transmission: "Automatinė",
      rating: 4.8,
      year: 2025,
      features: ["9 keleivių vietos", "Slankiosios durys", "Erdvus salonas"]
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
      id: "5",
      name: "KIA CEED",
      price: "30 EUR",
      image: kiaCeedHatchbackSideCleanGray,
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars.map((car, index) => (
            <Card
              key={car.id}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 bg-background border-0 shadow-card animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-0">
                <div className="relative overflow-hidden rounded-t-lg" style={{ background: 'linear-gradient(180deg, #f3f4f6 0%, #e9eaec 100%)' }}>
                  <div className="relative">
                    <img
                      src={car.image}
                      alt={car.name}
                      loading="eager"
                      onLoad={() => setLoadedImages(prev => new Set(prev).add(car.id))}
                    className={`w-full h-48 transition-transform duration-300 object-contain object-center mix-blend-multiply ${
                      !loadedImages.has(car.id) ? "opacity-0" : "opacity-100"
                    } ${
                      car.name === "Volkswagen Passat" 
                        ? "scale-[0.92] group-hover:scale-[0.97]" 
                        : car.name === "Mercedes-Benz SLK"
                        ? "scale-[0.92] group-hover:scale-[0.97] translate-y-4"
                        : car.id === "7"
                        ? "scale-[1.0] group-hover:scale-[1.05] translate-y-2"
                        : car.id === "5"
                        ? "scale-[1.30] group-hover:scale-[1.35] translate-y-3"
                        : "scale-100 group-hover:scale-105 translate-y-4"
                    }`}
                    />
                    {/* Shadow under cars */}
                    {(car.id === "5" || car.id === "6") && loadedImages.has(car.id) && (
                      <div 
                        className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-[90%] h-6 rounded-[50%]"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 70%)' }}
                      />
                    )}
                    {car.id === "7" && loadedImages.has(car.id) && (
                      <div 
                        className="absolute bottom-[16%] left-1/2 -translate-x-1/2 w-[96%] h-6 rounded-[50%]"
                        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, transparent 70%)' }}
                      />
                    )}
                  </div>
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <Badge variant="secondary" className="bg-primary text-primary-foreground">
                      {t(`car.categories.${normalizeForTranslation(car.category)}`)}
                    </Badge>
                    {premiumCarIds.has(car.id) && (
                      <Badge variant="secondary" className="bg-amber-500 text-white flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </Badge>
                    )}
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
                      <span>{t(`car.${normalizeForTranslation(car.fuel)}`)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Settings className="w-4 h-4" />
                      <span>{t(`car.${normalizeForTranslation(car.transmission)}`)}</span>
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
                        • {t(getFeatureKey(feature))}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('fleet.price')}</p>
                      <p className="text-2xl font-bold text-primary">{t('fleet.from')} {getCarDbPrice(car.id) || car.price}</p>
                      <p className="text-xs text-muted-foreground">{t('fleet.perDay')}</p>
                    </div>
                    <Button 
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={() => {
                        const slug = getCarSlugFromId(car.id, 'lt');
                        if (slug) {
                          navigate(`/automobiliai/${slug}`);
                          setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
                        }
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