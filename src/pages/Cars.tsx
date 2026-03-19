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
import { TermsAcceptanceModal } from "@/components/ui/terms-acceptance-modal";
import { useTranslations } from "@/hooks/use-translations";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { trackViewCarList, trackSearch, trackFilterCars, trackViewCar } from "@/lib/analytics";
import { getCarSlugFromId } from "@/utils/carSlugs";
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/vw-passat-side-clean.png";
import kiaCeedSideClean from "@/assets/kia-ceed-side-clean.png";
import kiaCeedSideDarkGray from "@/assets/kia-ceed-side-dark-gray.png";
import kiaCeedWagonSide from "@/assets/kia-ceed-wagon-side.png";
import kiaCeedWagonSideClean from "@/assets/kia-ceed-wagon-side-clean.png";
import kiaCeedHatchbackSide from "@/assets/kia-ceed-hatchback-side.png";
import kiaCeedHatchbackSideFlipped from "@/assets/kia-ceed-hatchback-side-flipped.png";
import kiaCeedHatchbackSideBrown from "@/assets/kia-ceed-hatchback-side-brown.png";
import kiaCeedHatchbackSideGrayBrown from "@/assets/kia-ceed-hatchback-side-gray-brown.png";
import kiaCeedHatchbackFrontClean from "@/assets/kia-ceed-hatchback-front-clean.png";
import kiaCeedHatchbackSideCleanGray from "@/assets/kia-ceed-hatchback-side-khaki.png";
import mercedesSlkSideClean from "@/assets/mercedes-slk-side-clean.png";
import { PRICING } from "@/config/pricing";

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
  const { t, language } = useTranslations();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Set page title and meta tags
    document.title = t('cars.meta.title');
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('cars.meta.description'));
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    const carsPath = language === 'en' ? '/cars' : '/automobiliai';
    if (canonical) {
      canonical.setAttribute('href', `https://carbonus.lt${carsPath}`);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t('cars.meta.title'));
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://carbonus.lt${carsPath}`);
    }
    
    // Track view car list
    trackViewCarList(cars);
  }, [t, language]);

  // Track search
  useEffect(() => {
    if (searchTerm) {
      const timeoutId = setTimeout(() => {
        trackSearch(searchTerm, 'cars_page');
      }, 500); // Debounce search tracking
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm]);

  // Track filter
  useEffect(() => {
    if (selectedCategory !== 'all') {
      trackFilterCars('category', selectedCategory);
    }
  }, [selectedCategory]);

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
      'Sportinis dizainas': 'car.featuresList.sportyDesign'
    };
    return featureMap[feature] || feature;
  };

  // Helper for plural forms
  const getCarPluralForm = (count: number): string => {
    if (language === 'lt') {
      if (count === 1) return t('cars.carSingular');
      if (count < 10) return t('cars.carPlural');
      return t('cars.carPluralMany');
    }
    return t('cars.carPlural');
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

  const handleCarSelect = (carId: string) => {
    const selectedCar = cars.find(c => c.id === carId);
    if (selectedCar) {
      trackViewCar({
        id: selectedCar.id,
        name: selectedCar.name,
        category: selectedCar.category,
        price: selectedCar.price,
        year: selectedCar.year?.toString()
      });
    }
    
    const slug = getCarSlugFromId(carId, language as 'lt' | 'en');
    if (slug) {
      const route = language === 'en' ? `/cars/${slug}` : `/automobiliai/${slug}`;
      navigate(route);
    }
  };

  const cars: Car[] = [
    {
      id: "1",
      name: "BMW 3 series",
      price: PRICING.priceFrom,
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
      price: PRICING.priceFrom,
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
      id: "6",
      name: "Mercedes-Benz SLK",
      price: "50 EUR",
      image: mercedesSlkSideClean,
      category: "Kabrioletas",
      passengers: 2,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.9,
      year: 2015,
      features: [
        "Atidaromas stogas",
        "Automatinė pavarų dėžė",
        "Sportinis dizainas"
      ],
    },
    {
      id: "4",
      name: "KIA CEED",
      price: PRICING.priceFrom,
      image: kiaCeedWagonSideClean,
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
      price: PRICING.priceFrom,
      image: kiaCeedHatchbackSideCleanGray,
      category: "Hecbekas",
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
    },
    {
      id: "3",
      name: "Volkswagen Passat",
      price: PRICING.priceFrom,
      image: vwPassatSideClean,
      category: "Sedanas",
      passengers: 5,
      fuel: "Dyzelinas",
      transmission: "Mechaninė",
      rating: 4.7,
      year: 2012,
      features: ["Ekonomiškas", "Patogus", "Didelis bagažas"]
    }
  ];

  const categories = ["all", "Sedanas", "Miniautobusas", "Universalas", "Hecbekas", "Kabrioletas"];

  // IDs of sold cars to hide from public view
  const hiddenCarIds = ["1", "2"]; // BMW 3 series, Chrysler Town & Country

  // Filter cars based on search term and selected category (excluding sold cars)
  const filteredCars = cars.filter(car => {
    // Hide sold cars
    if (hiddenCarIds.includes(car.id)) return false;
    
    const matchesSearch = car.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         car.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || car.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title={t('cars.meta.title')}
        description={t('cars.meta.description')}
        canonical={`https://carbonus.lt/${language === 'en' ? 'cars' : 'automobiliai'}`}
        keywords="automobilių nuoma, car rental, BMW, KIA, VW Passat, premium cars, nuoma Lietuvoje"
      />
      
      {/* Language Links */}
      <LanguageLinks ltPath="/automobiliai" enPath="/cars" />
      
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-12 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('cars.title')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t('cars.subtitle')}
          </p>
          
          {/* Search and Filter Controls */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              {/* Search Input */}
              <div className="w-full md:w-96">
                <Input
                  placeholder={t('cars.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-12 text-lg"
                />
              </div>
              
              {/* Category Filter */}
              <div className="w-full md:w-64">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-12 text-lg">
                    <SelectValue placeholder={t('cars.category')} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="all">{t('car.categories.all')}</SelectItem>
                    {categories.filter(cat => cat !== "all").map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(`car.categories.${normalizeForTranslation(category)}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Results Counter */}
            <div className="mt-4 text-sm text-muted-foreground">
              {searchTerm || selectedCategory !== "all" ? (
                <span>{t('cars.resultsCount')} {filteredCars.length} {getCarPluralForm(filteredCars.length)}</span>
              ) : (
                <span>{t('cars.totalCount')} {cars.length} {getCarPluralForm(cars.length)}</span>
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
                            ? "scale-[1.22] group-hover:scale-[1.27]" 
                            : car.name === "Mercedes-Benz SLK"
                            ? "scale-[0.99] group-hover:scale-[1.04] translate-y-4"
                            : car.id === "4"
                            ? "scale-[1.33] group-hover:scale-[1.38] translate-y-4"
                            : car.id === "5"
                            ? "scale-[1.65] group-hover:scale-[1.70] translate-y-4"
                            : "scale-[1.07] group-hover:scale-[1.12] translate-y-4"
                        }`}
                      />
                      {/* Shadow under KIA CEED 2020 and Mercedes SLK only */}
                      {(car.id === "5" || car.id === "6") && loadedImages.has(car.id) && (
                        <div 
                          className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[90%] h-6 rounded-[50%]"
                          style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.9) 0%, transparent 70%)' }}
                        />
                      )}
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground">
                        {t(`car.categories.${normalizeForTranslation(car.category)}`)}
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
                      {car.features.map((feature, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {t(getFeatureKey(feature))}
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('cars.price')}</p>
                        <p className="text-2xl font-bold text-primary">{t('cars.from')} 30 EUR</p>
                        <p className="text-xs text-muted-foreground">{t('cars.perDay')}</p>
                      </div>
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => handleCarSelect(car.id)}
                      >
                        {t('cars.viewButton')}
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
                {t('cars.noResults')}
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