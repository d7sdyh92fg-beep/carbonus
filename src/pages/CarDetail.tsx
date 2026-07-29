import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Fuel, Settings, Star, CheckCircle, ChevronLeft, ChevronRight, Crown, Heart, MessageCircle } from "lucide-react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import { useTranslations } from "@/hooks/use-translations";
import { ProductSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { getCarIdFromSlug, getCarSlugFromId } from "@/utils/carSlugs";
import kiaCeedSideClean from "@/assets/kia-ceed-side-clean.png";
import kiaCeedFrontEnhanced from "@/assets/kia-ceed-front-enhanced.png";
import kiaCeedRearEnhanced from "@/assets/kia-ceed-rear-enhanced.png";
import kiaCeed2020SideClean from "@/assets/kia-ceed-2020-side-clean.png";
import kiaCeed2020FrontEnhanced from "@/assets/kia-ceed-2020-front-enhanced.png";
import kiaCeed2020RearEnhanced from "@/assets/kia-ceed-2020-rear-enhanced.png";
import kiaCeedNewFrontEnhanced from "@/assets/kia-ceed-new-front-enhanced.png";
import kiaCeedNewRearEnhanced from "@/assets/kia-ceed-new-rear-enhanced-no-plate.png";
import kiaCeedRear5 from "@/assets/kia-ceed-rear-5.png";
import kiaCeedHatchbackFrontClean from "@/assets/kia-ceed-hatchback-front-clean.png";
import kiaCeedHatchbackFrontNoShadow from "@/assets/kia-ceed-hatchback-front-studio.png";
import kiaCeedHatchbackRearClean from "@/assets/kia-ceed-hatchback-rear-studio.png";
import bmwEnhanced1 from "@/assets/bmw-3-enhanced-1.png";
import bmwEnhanced2 from "@/assets/bmw-3-enhanced-2.png";
import chryslerEnhanced1 from "@/assets/chrysler-enhanced-1.png";
import chryslerEnhanced2WithPlate from "@/assets/chrysler-enhanced-2.png";
import vwPassatEnhanced1 from "@/assets/vw-passat-enhanced-1.png";
import vwPassatEnhanced2 from "@/assets/vw-passat-enhanced-2.png";
import mercedesSlkFront from "@/assets/mercedes-slk-front-studio.png";
import mercedesSlkSide from "@/assets/mercedes-slk-side-clean.png";
import mercedesSlkRear from "@/assets/mercedes-slk-rear-studio.png";
import mercedesSlkSideRight from "@/assets/mercedes-slk-side-right-studio.png";
import citroenSpacetourerFront from "@/assets/citroen-spacetourer-front-studio.png";
import citroenSpacetourerRear from "@/assets/citroen-spacetourer-rear-studio.png";
import hyundaiBayonFront from "@/assets/hyundai-bayon-front-studio.png";
import hyundaiBayonSide from "@/assets/hyundai-bayon-side-clean.png";
import hyundaiBayonRear from "@/assets/hyundai-bayon-rear-studio.png";
import { useState } from "react";
import { Link } from "react-router-dom";


interface CarDetail {
  id: string;
  name: string;
  price: string;
  image: string;
  images?: string[];
  category: string;
  passengers: number;
  fuel: string;
  transmission: string;
  rating: number;
  year: string;
  doors: string;
  trunk: string;
  engineType: string;
  isPremium?: boolean;
}

const CarDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedPackage, setSelectedPackage] = useState<{ type: 'romantic' | 'wedding'; name: string; price: number; priceDisplay: string } | null>(null);
  const { t, language } = useTranslations();
  
  // Convert slug to ID for backward compatibility with existing car data structure
  const id = slug ? getCarIdFromSlug(slug) : null;

  // Fetch car pricing from database
  const { data: dbCarData } = useQuery({
    queryKey: ['car-pricing', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('cars')
        .select('is_premium, price_tier1, price_tier2, price_tier3, price_weekend, price_package_romantic, price_package_wedding, price_per_day')
        .eq('id', id)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!id,
  });
  
  // Redirect to 404 if slug is invalid
  useEffect(() => {
    if (slug && !id) {
      navigate('/404', { replace: true });
    }
  }, [slug, id, navigate]);

  // Normalize Lithuanian characters for translation keys
  const normalizeForTranslation = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ė/g, 'e')
      .replace(/ų/g, 'u')
      .replace(/č/g, 'c')
      .replace(/š/g, 's')
      .replace(/ž/g, 'z');
  };

  useEffect(() => {
    // Scroll to top when navigating to car detail page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Set page title and meta tags dynamically based on car
    const carName = carDetails[id || ""]?.name || t('carDetail.notFound');
    const metaTitle = t('carDetail.metaTitle').replace('{carName}', carName);
    const metaDescription = t('carDetail.metaDescription').replace('{carName}', carName);
    document.title = metaTitle;
    
    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', metaDescription);
    }
    
    // Update canonical URL with slug
    const canonical = document.querySelector('link[rel="canonical"]');
    const carSlug = id ? getCarSlugFromId(id, language as 'lt' | 'en') : null;
    const carDetailPath = carSlug 
      ? (language === 'en' ? `/cars/${carSlug}` : `/automobiliai/${carSlug}`)
      : '/404';
    if (canonical) {
      canonical.setAttribute('href', `https://carbonus.lt${carDetailPath}`);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', metaTitle);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://carbonus.lt${carDetailPath}`);
    }
  }, [id, t, language]);

  const carDetails: { [key: string]: CarDetail } = {
    "1": {
      id: "1",
      name: "BMW 3 series",
      price: "nuo 30 EUR",
      image: bmwEnhanced1,
      images: [
        bmwEnhanced1,
        bmwEnhanced2
      ],
      category: "Sedanas",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.8,
      year: "2015",
      doors: "4",
      trunk: "480 L",
      engineType: "2.0L Turbo"
    },
    "2": {
      id: "2",
      name: "Chrysler Town & Country",
      price: "nuo 30 EUR",
      image: chryslerEnhanced1,
      images: [
        chryslerEnhanced1,
        chryslerEnhanced2WithPlate
      ],
      category: "Miniautobusas",
      passengers: 7,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.6,
      year: "2016",
      doors: "5",
      trunk: "2000 L",
      engineType: "3.6L V6"
    },
    "3": {
      id: "3",
      name: "Volkswagen Passat",
      price: "30-40 EUR",
      image: vwPassatEnhanced1,
      images: [
        vwPassatEnhanced1,
        vwPassatEnhanced2
      ],
      category: "Sedanas",
      passengers: 5,
      fuel: "Dyzelinas",
      transmission: "Mechaninė",
      rating: 4.7,
      year: "2012",
      doors: "4",
      trunk: "565 L",
      engineType: "2.0L TDI"
    },
    "4": {
      id: "4",
      name: "KIA CEED",
      price: "nuo 30 EUR",
      image: kiaCeedFrontEnhanced,
      images: [
        kiaCeedFrontEnhanced,
        kiaCeedRearEnhanced
      ],
      category: "Universalas",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Mechaninė",
      rating: 4.5,
      year: "2013",
      doors: "5",
      trunk: "528 L",
      engineType: "1.4L"
    },
    "5": {
      id: "5",
      name: "KIA CEED",
      price: "nuo 30 EUR",
      image: kiaCeedHatchbackFrontNoShadow,
      images: [
        kiaCeedHatchbackFrontNoShadow,
        kiaCeedHatchbackRearClean
      ],
      category: "Hecbekas",
      passengers: 5,
      fuel: "Dyzelinas",
      transmission: "Mechaninė",
      rating: 4.6,
      year: "2020",
      doors: "5",
      trunk: "395 L",
      engineType: "1.6L CRDi"
    },
    "6": {
      id: "6",
      name: "Mercedes-Benz SLK",
      price: "nuo 90 EUR",
      image: mercedesSlkFront,
      images: [
        mercedesSlkFront,
        mercedesSlkRear
      ],
      category: "Kabrioletas",
      passengers: 2,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.9,
      year: "2015",
      doors: "2",
      trunk: "225 L",
      engineType: "1.8L Turbo",
      isPremium: true
    },
    "7": {
      id: "7",
      name: "Citroën SpaceTourer",
      price: "nuo 60 EUR",
      image: citroenSpacetourerFront,
      images: [
        citroenSpacetourerFront,
        citroenSpacetourerRear
      ],
      category: "Vienatūris",
      passengers: 8,
      fuel: "Dyzelinas",
      transmission: "Automatinė",
      rating: 4.8,
      year: "2026",
      doors: "5",
      trunk: "2763 L (max)",
      engineType: "2.2L Diesel 180 AG"
    },
    "8": {
      id: "8",
      name: "Hyundai Bayon Cross",
      price: "nuo 50 EUR",
      image: hyundaiBayonFront,
      images: [
        hyundaiBayonFront,
        hyundaiBayonSide,
        hyundaiBayonRear
      ],
      category: "Krosoveris",
      passengers: 5,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 5.0,
      year: "2026",
      doors: "5",
      trunk: "411 L",
      engineType: "1.0L T-GDi 100 AG"
    }
  };

  const getCarSpecifications = (carId: string) => {
    const staticData = carDetails[carId];
    if (!staticData) return [];
    
    return [
      { key: t('carDetail.specs.year'), value: staticData.year },
      { key: t('carDetail.specs.fuelType'), value: t('car.' + normalizeForTranslation(staticData.fuel)) },
      { key: t('carDetail.specs.gearbox'), value: t('car.' + normalizeForTranslation(staticData.transmission)) },
      { key: t('carDetail.specs.passengers'), value: staticData.passengers.toString() },
      { key: t('carDetail.specs.doors'), value: staticData.doors },
      { key: t('carDetail.specs.trunk'), value: staticData.trunk },
      { key: t('carDetail.specs.engineType'), value: staticData.engineType }
    ];
  };

  const car = carDetails[id || ""];

  const nextImage = () => {
    if (car.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images.length);
    }
  };

  const prevImage = () => {
    if (car.images && car.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + car.images.length) % car.images.length);
    }
  };

  const getCurrentImage = () => {
    if (car.images && car.images.length > 0) {
      return car.images[currentImageIndex];
    }
    return car.image;
  };

  if (!car) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">{t('carDetail.notFound')}</h2>
          <Button onClick={() => navigate(language === 'en' ? '/cars' : '/automobiliai')}>
            {t('carDetail.backToCars')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* SEO Meta Tags */}
      <SEOHead
        title={t('carDetail.metaTitle').replace('{carName}', car.name)}
        description={t('carDetail.metaDescription').replace('{carName}', car.name)}
        canonical={`https://carbonus.lt${language === 'en' ? '/cars/' + id : '/automobiliai/' + id}`}
        ogImage={`https://carbonus.lt${car.image}`}
        ogType="product"
        keywords={`${car.name} nuoma, ${car.name} rent, car rental ${car.name}, ${car.category.toLowerCase()}, carbonus`}
      />
      
      {/* Language Links */}
      <LanguageLinks 
        ltPath={`/automobiliai/${id}`}
        enPath={`/cars/${id}`}
      />
      
      {/* Product Schema */}
      <ProductSchema
        name={car.name}
        description={t('carData.' + car.id + '.description')}
        image={car.image}
        brand={car.name.split(' ')[0]}
        price={car.price}
        currency="EUR"
        rating={car.rating}
        reviewCount={127}
        category={car.category}
      />
      
      {/* Breadcrumb Schema */}
      <BreadcrumbSchema
        items={[
          { name: t('carDetail.breadcrumbHome'), url: '/' },
          { name: t('carDetail.breadcrumbCars'), url: language === 'en' ? '/cars' : '/automobiliai' },
          { name: car.name, url: `${language === 'en' ? '/cars/' : '/automobiliai/'}${id}` }
        ]}
      />
      
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Simple Breadcrumb Section */}
      <section className="pt-24 pb-6 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <Link 
              to="/" 
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase"
            >
              {t('carDetail.breadcrumbHome')}
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link 
              to={language === 'en' ? '/cars' : '/automobiliai'} 
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase"
            >
              {t('carDetail.breadcrumbCars')}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-primary font-medium uppercase">{car.name}</span>
          </div>
        </div>
      </section>

      {/* Car Details Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Car Image Carousel */}
            <div className="bg-gray-50 rounded-2xl p-8 relative">
              <div className="text-center overflow-hidden flex items-center justify-center h-[300px] sm:h-[350px] md:h-[400px]">
                <img
                  src={getCurrentImage()}
                  alt={`${car.name} - Premium automobilių nuoma Druskininkuose - ${t('carData.' + car.id + '.description').substring(0, 100)}`}
                  data-allow-save="true"
                  className={`max-w-full max-h-full mx-auto object-contain rounded-lg ${
                    car.id === "5" && currentImageIndex === 1 ? "scale-150" : ""
                  }`}
                />
              </div>
              
              {/* Navigation arrows - only show if multiple images */}
              {car.images && car.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {/* Image indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {car.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-primary' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Car Information */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-4">
                <Badge variant="secondary" className="bg-primary text-primary-foreground">
                  {t('car.categories.' + normalizeForTranslation(car.category))}
                </Badge>
                  {(dbCarData?.is_premium || car.isPremium) && (
                    <Badge variant="secondary" className="bg-amber-500 text-white flex items-center gap-1">
                      <Crown className="w-3 h-3" />
                      Premium
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{car.rating}</span>
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  {car.name}
                </h2>
                
                {/* Dynamic pricing from DB */}
                {dbCarData?.price_tier1 != null ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-sm text-muted-foreground">{t('carDetail.startingFrom')}</span>
                      <span className="text-4xl font-bold text-primary">€{dbCarData.price_tier3 ?? dbCarData.price_tier1}–€{dbCarData.price_tier1}</span>
                      <span className="text-lg text-muted-foreground">{t('carDetail.perDay')}</span>
                    </div>

                    {/* Pricing table */}
                    <div className="bg-secondary/30 rounded-xl p-4 mb-4 space-y-3">
                      <h4 className="font-semibold text-foreground text-sm">{t('carDetail.mercPricing.title')}</h4>
                      <div className="space-y-2 text-sm">
                        {dbCarData.price_tier3 != null && (
                          <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                            <span className="text-muted-foreground">{t('carDetail.mercPricing.weekday7')}</span>
                            <span className="font-bold text-foreground">{dbCarData.price_tier3} €<span className="text-xs text-muted-foreground font-normal"> / {t('carDetail.mercPricing.day')}</span></span>
                          </div>
                        )}
                        {dbCarData.price_tier2 != null && (
                          <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                            <span className="text-muted-foreground">{t('carDetail.mercPricing.weekday3')}</span>
                            <span className="font-bold text-foreground">{dbCarData.price_tier2} €<span className="text-xs text-muted-foreground font-normal"> / {t('carDetail.mercPricing.day')}</span></span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                          <span className="text-muted-foreground">{t('carDetail.mercPricing.weekday1')}</span>
                          <span className="font-bold text-foreground">{dbCarData.price_tier1} €<span className="text-xs text-muted-foreground font-normal"> / {t('carDetail.mercPricing.day')}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Emotional packages - only show if configured */}
                    {(dbCarData.price_package_romantic || dbCarData.price_package_wedding) && (
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl p-4 mb-6 space-y-3 border border-amber-200/50 dark:border-amber-800/30">
                        <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
                          <Heart className="w-4 h-4 text-rose-500" />
                          {t('carDetail.mercPricing.packagesTitle')}
                        </h4>
                        <div className="space-y-3 text-sm">
                          {dbCarData.price_package_romantic && (
                            <div className="flex justify-between items-center py-2 border-b border-amber-200/30 dark:border-amber-800/20">
                              <div>
                                <span className="font-medium text-foreground">{t('carDetail.mercPricing.romantic')}</span>
                                <span className="text-xs text-muted-foreground ml-2">(4–5 val.)</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-foreground">{dbCarData.price_package_romantic} €</span>
                                <button
                                  onClick={() => {
                                    const priceStr = dbCarData.price_package_romantic!;
                                    const parts = priceStr.split('-').map(Number);
                                    const midPrice = parts.length === 2 ? Math.round((parts[0] + parts[1]) / 2) : parts[0];
                                    setSelectedPackage({
                                      type: 'romantic',
                                      name: t('carDetail.mercPricing.romantic'),
                                      price: midPrice,
                                      priceDisplay: String(midPrice),
                                    });
                                    const bookingSection = document.getElementById('booking-section');
                                    bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  {t('carDetail.mercPricing.orderPackage')}
                                </button>
                              </div>
                            </div>
                          )}
                          {dbCarData.price_package_wedding && (
                            <div className="flex justify-between items-center py-2">
                              <div>
                                <span className="font-medium text-foreground">{t('carDetail.mercPricing.wedding')}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-foreground">{dbCarData.price_package_wedding} €</span>
                                <button
                                  onClick={() => {
                                    const priceStr = dbCarData.price_package_wedding!;
                                    const parts = priceStr.split('-').map(Number);
                                    const midPrice = parts.length === 2 ? Math.round((parts[0] + parts[1]) / 2) : parts[0];
                                    setSelectedPackage({
                                      type: 'wedding',
                                      name: t('carDetail.mercPricing.wedding'),
                                      price: midPrice,
                                      priceDisplay: String(midPrice),
                                    });
                                    const bookingSection = document.getElementById('booking-section');
                                    bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                  {t('carDetail.mercPricing.orderPackage')}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-sm text-muted-foreground">{t('carDetail.startingFrom')}</span>
                    <span className="text-4xl font-bold text-primary">€30–€50</span>
                    <span className="text-lg text-muted-foreground">{t('carDetail.perDay')}</span>
                  </div>
                )}

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {t('carData.' + car.id + '.description')}
                </p>

                {/* Car Specifications with Icons */}
                <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-secondary/30 rounded-lg">
                  <div className="text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-base font-bold text-foreground">{car.passengers}</div>
                    <div className="text-xs text-muted-foreground">{t('carDetail.passengers')}</div>
                  </div>
                  <div className="text-center">
                    <Fuel className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-base font-bold text-foreground">{t('car.' + normalizeForTranslation(car.fuel))}</div>
                    <div className="text-xs text-muted-foreground">{t('carDetail.fuel')}</div>
                  </div>
                  <div className="text-center">
                    <Settings className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-base font-bold text-foreground">{t('car.' + normalizeForTranslation(car.transmission))}</div>
                    <div className="text-xs text-muted-foreground">{t('carDetail.transmission')}</div>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground mb-6">
                  {t('carDetail.priceNote')}
                </div>

                <Button 
                  size="lg"
                  onClick={() => {
                    const bookingSection = document.getElementById('booking-section');
                    bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  {t('carDetail.orderButton')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Calendar */}
      <section className="py-20 bg-gray-50" id="booking-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">{t('carDetail.bookingTitle')}</h3>
            <p className="text-lg text-muted-foreground">
              {t('carDetail.bookingSubtitle')}
            </p>
          </div>
          <BookingCalendar 
            carId={car.id} 
            carName={car.name} 
            carImage={car.image} 
            selectedPackage={selectedPackage}
            onClearPackage={() => setSelectedPackage(null)}
          />
        </div>
      </section>

      {/* Features and Specifications */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t('carDetail.detailsTitle')}</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Features */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">{t('carDetail.featuresTitle')}</h3>
                <div className="grid gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((featureNum) => (
                    <div key={featureNum} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{t('carData.' + car.id + '.feature' + featureNum)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">{t('carDetail.specsTitle')}</h3>
                <div className="space-y-4">
                  {getCarSpecifications(car.id).map((spec, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-muted-foreground">{spec.key}</span>
                      <span className="font-semibold text-foreground">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CarDetail;