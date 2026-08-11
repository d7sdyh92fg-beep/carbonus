import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TermsAcceptanceModal } from "@/components/ui/terms-acceptance-modal";
import { useTranslations } from "@/hooks/use-translations";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { trackViewCarList, trackSearch, trackFilterCars, trackViewCar } from "@/lib/analytics";
import { getCarSlugFromId } from "@/utils/carSlugs";
import bmw3Clean from "@/assets/bmw-3-clean.png";
import chryslerTownCountrySide from "@/assets/chrysler-town-country-side.png";
import vwPassatSideClean from "@/assets/fleet-volkswagen-passat-side-v2.png";
import kiaCeedWagonSideClean from "@/assets/fleet-kia-ceed-wagon-side-v2.png";
import kiaCeedHatchbackSideBrown from "@/assets/fleet-kia-ceed-hatchback-side-v2.png";
import mercedesSlkSide from "@/assets/fleet-mercedes-slk-open-top-v3.png";
import citroenSpacetourerSide from "@/assets/fleet-citroen-spacetourer-side-v2.png";
import hyundaiBayonSide from "@/assets/fleet-hyundai-bayon-side-v2.png";
import { CarCard } from "@/components/CarCard";


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

  // Fetch premium status and pricing from DB
  const { data: dbCars } = useQuery({
    queryKey: ['cars-premium-status'],
    queryFn: async () => {
      const { data } = await supabase
        .from('cars')
        .select('id, price_tier1, price_tier3');
      return data || [];
    },
  });
  const getCarDbPrice = (carId: string) => {
    const dbCar = (dbCars || []).find(c => c.id === carId);
    if (dbCar?.price_tier3) return `${dbCar.price_tier3} EUR`;
    return null;
  };

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
      'Sportinis dizainas': 'car.featuresList.sportyDesign',
      '8 keleivių vietos': 'car.featuresList.nineSeats',
      'Slankiosios durys': 'car.featuresList.slidingDoors',
      'Erdvus salonas': 'car.featuresList.spaciousInterior'
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
      features: [
        "Atidaromas stogas",
        "Automatinė pavarų dėžė",
        "Sportinis dizainas"
      ],
    },
    {
      id: "7",
      name: "Citroën SpaceTourer",
      price: "nuo 60 EUR",
      image: citroenSpacetourerSide,
      category: "Vienatūris",
      passengers: 8,
      fuel: "Dyzelinas",
      transmission: "Automatinė",
      rating: 4.8,
      year: 2026,
      features: [
        "8 keleivių vietos",
        "Slankiosios durys",
        "Erdvus salonas"
      ],
    },
    {
      id: "8",
      name: "Hyundai Bayon Cross",
      price: "nuo 50 EUR",
      image: hyundaiBayonSide,
      category: "Krosoveris",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 5.0,
      year: 2026,
      features: [
        "Automatinė pavarų dėžė",
        "Modernus LED apšvietimas",
        "Naujas automobilis"
      ],
    },
    {
      id: "4",
      name: "KIA CEED",
      price: "nuo 30 EUR",
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
      price: "nuo 30 EUR",
      image: kiaCeedHatchbackSideBrown,
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
  ];

  const categories = ["all", "Sedanas", "Miniautobusas", "Universalas", "Hecbekas", "Kabrioletas", "Vienatūris", "Krosoveris"];

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
        keywords="automobilių nuoma druskininkuose, mercedes slk nuoma, citroen spacetourer nuoma, mikroautobuso nuoma, kabrioleto nuoma, volkswagen passat nuoma, kia ceed nuoma, hyundai bayon nuoma"
      />
      
      {/* Language Links */}
      <LanguageLinks ltPath="/automobiliai" enPath="/cars" />
      
      <Header />
      
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
                <span>{t('cars.totalCount')} {filteredCars.length} {getCarPluralForm(filteredCars.length)}</span>
              )}
            </div>
          </div>
        </div>
      </section>


      {/* Cars Grid */}
      <section className="pt-16 pb-20 bg-[hsl(210_20%_99%)]">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredCars.map((car) => (
              <CarCard
                key={car.id}
                car={car}
                price={(getCarDbPrice(car.id) || '30 EUR').replace('EUR', '€')}
                priceFrom={t('cars.from')}
                pricePerDay={t('cars.perDay')}
                categoryLabel={t(`car.categories.${normalizeForTranslation(car.category)}`)}
                transmissionLabel={t(`car.${normalizeForTranslation(car.transmission)}`)}
                fuelLabel={t(`car.${normalizeForTranslation(car.fuel)}`)}
                imageLoaded={loadedImages.has(car.id)}
                onImageLoad={() => setLoadedImages(prev => new Set(prev).add(car.id))}
                cta={
                  <button
                    type="button"
                    onClick={() => handleCarSelect(car.id)}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green-dark))] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_22px_hsl(var(--carbonus-green)/0.18)] transition-colors hover:bg-[hsl(var(--carbonus-green-deep))]"
                  >
                    {t('cars.viewButton')}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                }
              />
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

      <V3Footer />
    </div>
  );
};

export default Cars;