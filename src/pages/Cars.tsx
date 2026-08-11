import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Fuel, Settings, Star, Calendar, Crown, ArrowUpRight } from "lucide-react";
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
    }
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
              <article
                key={car.id}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-black/[0.04] bg-white p-3 shadow-[0_14px_38px_rgba(16,24,40,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(16,24,40,0.12)]"
              >
                <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-[15px] bg-[#f4f6f5]">
                  <img
                    src={car.image}
                    alt={car.name}
                    loading="lazy"
                    width={1536}
                    height={1024}
                    data-allow-save="true"
                    onLoad={() => setLoadedImages(prev => new Set(prev).add(car.id))}
                    className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.025]"
                  />
                  {premiumCarIds.has(car.id) && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[11px] font-semibold text-white">
                      <Crown className="h-3 w-3" />
                      Premium
                    </span>
                  )}

                </div>

                <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      {car.year}
                    </span>
                    <span className="rounded-md bg-[hsl(var(--carbonus-green)/0.08)] px-2 py-1 text-[11px] font-semibold text-[hsl(var(--carbonus-green-dark))]">
                      {t(`car.categories.${normalizeForTranslation(car.category)}`)}
                    </span>
                  </div>

                  <h3 className="mt-3 text-[16px] font-bold tracking-[-0.02em] text-foreground">
                    {car.name}
                  </h3>

                  <p className="mt-2.5 flex items-baseline gap-1.5 text-[19px] font-extrabold text-[hsl(var(--carbonus-green))]">
                    {t('cars.from')} {(getCarDbPrice(car.id) || '30 EUR').replace('EUR', '€')}
                    <span className="text-[12px] font-medium text-muted-foreground">{t('cars.perDay')}</span>
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-1 border-t border-border pt-3.5 text-[10px] text-muted-foreground">
                    <span className="flex flex-col items-center gap-1.5 text-center">
                      <Users className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
                      {car.passengers}
                    </span>
                    <span className="flex flex-col items-center gap-1.5 text-center">
                      <Settings className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
                      {t(`car.${normalizeForTranslation(car.transmission)}`)}
                    </span>
                    <span className="flex flex-col items-center gap-1.5 text-center">
                      <Fuel className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
                      {t(`car.${normalizeForTranslation(car.fuel)}`)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCarSelect(car.id)}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green-dark))] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_22px_hsl(var(--carbonus-green)/0.18)] transition-colors hover:bg-[hsl(var(--carbonus-green-deep))]"
                  >
                    {t('cars.viewButton')}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
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