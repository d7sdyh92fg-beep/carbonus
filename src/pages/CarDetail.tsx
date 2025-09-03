import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Fuel, Settings, Star, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import BookingCalendar from "@/components/booking/BookingCalendar";
import kiaCeedSideClean from "@/assets/kia-ceed-side-clean.png";
import kiaCeedFrontEnhanced from "@/assets/kia-ceed-front-enhanced.png";
import kiaCeedRearEnhanced from "@/assets/kia-ceed-rear-enhanced.png";
import bmwEnhanced1 from "@/assets/bmw-3-enhanced-1.png";
import bmwEnhanced2 from "@/assets/bmw-3-enhanced-2.png";
import chryslerEnhanced1 from "@/assets/chrysler-enhanced-1.png";
import chryslerEnhanced2 from "@/assets/chrysler-enhanced-2.png";
import vwPassatEnhanced1 from "@/assets/vw-passat-enhanced-1.png";
import vwPassatEnhanced2 from "@/assets/vw-passat-enhanced-2.png";
import { useState } from "react";

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
  description: string;
  features: string[];
  specifications: {
    [key: string]: string;
  };
}

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Scroll to top when navigating to car detail page
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Set page title and meta tags dynamically based on car
    const carName = carDetails[id || ""]?.name || "Automobilis";
    document.title = `${carName} - Carbonus | Premium automobilio nuoma nuo 30€/dieną`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', `${carName} nuomai Carbonus automobilių parke. Premium klasės automobilis su visais patogumais. Rezervuokite online ir užsisakykite šiandien.`);
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `https://carbonus.lt/automobiliai/${id}`);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', `${carName} - Carbonus`);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://carbonus.lt/automobiliai/${id}`);
    }
  }, [id]);

  const carDetails: { [key: string]: CarDetail } = {
    "1": {
      id: "1",
      name: "BMW 3 series",
      price: "30 EUR",
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
      description: "Patirkite aukščiausią vairavimo malonumą su BMW 3 serijos sedanu. Šis automobilis sujungia sportinį charakterį su kasdienės praktikos patogumais, siūlydamas nepakartojamą vairavimo patirtį.",
      features: [
        "Kondicionierius",
        "Bluetooth ryšys",
        "GPS navigacija",
        "Odos salonai",
        "Elektrinis rankinio stabdžio valdymas",
        "LED žibintai",
        "Sportinio stiliaus sėdynės",
        "Išplėstinis saugumas"
      ],
      specifications: {
        "Kuras": "Benzinas",
        "Pavarų dėžė": "Automatinė",
        "Keleivių skaičius": "5",
        "Durų skaičius": "4",
        "Bagažinės talpa": "480 L",
        "Variklio tipas": "2.0L Turbo"
      }
    },
    "2": {
      id: "2",
      name: "Chrysler Town & Country",
      price: "30 EUR",
      image: chryslerEnhanced1,
      images: [
        chryslerEnhanced1,
        chryslerEnhanced2
      ],
      category: "Miniautobusas",
      passengers: 7,
      fuel: "Benzinas",
      transmission: "Automatinė",
      rating: 4.6,
      description: "Idealus pasirinkimas šeimoms ir grupėms. Chrysler Town & Country siūlo erdvų saloną, patogias sėdynes ir visus reikalingus patogumą užtikrinančius sprendimus ilgoms kelionėms.",
      features: [
        "7 keleivių vietos",
        "Erdus bagažinės skyrius",
        "Šeimos automobilis",
        "Kondicionierius visoms eilėms",
        "DVD pramogų sistema",
        "Elektriniai slankiojantys durys",
        "Atverčiamos sėdynės",
        "Saugos sistemos"
      ],
      specifications: {
        "Kuras": "Benzinas",
        "Pavarų dėžė": "Automatinė",
        "Keleivių skaičius": "7",
        "Durų skaičius": "5",
        "Bagažinės talpa": "2000 L",
        "Variklio tipas": "3.6L V6"
      }
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
      description: "Volkswagen Passat 2012 - patikimas ir ekonomiškas sedanas, puikiai tinkantis verslo kelionėms ir kasdieniam naudojimui. Dyzelinis variklis užtikrina mažą kuro sąnaudą.",
      features: [
        "Ekonomiškas dyzelinis variklis",
        "Mechaninė pavarų dėžė",
        "Kondicionierius",
        "Elektriniai langai",
        "Centrinis užraktas",
        "ABS stabdžių sistema",
        "Patogios sėdynės",
        "Didelis bagažas"
      ],
      specifications: {
        "Kuras": "Dyzelinas",
        "Pavarų dėžė": "Mechaninė",
        "Keleivių skaičius": "5",
        "Durų skaičius": "4",
        "Bagažinės talpa": "565 L",
        "Variklio tipas": "2.0L TDI"
      }
    },
    "4": {
      id: "4",
      name: "KIA CEED",
      price: "30 EUR",
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
      description: "KIA CEED 2013 universalas - praktiškas ir erdvus automobilis, idealus kelionėms ir kasdieniam naudojimui. Tamsiai pilkos spalvos automobilis su 1.4 litro benzininiu varikliu. Puikiai tvarkytas automobilis su visais reikalingais patogumais.",
      features: [
        "Ekonomiškas benzininis variklis",
        "Erdvus universalo bagažas", 
        "Patikimas kasdieniam naudojimui",
        "Mechaninė pavarų dėžė",
        "Kondicionierius",
        "Patogus 5 vietų salons",
        "Didelis bagažinės skyrius",
        "Praktiškas miesto automobilis"
      ],
      specifications: {
        "Kuras": "Benzinas",
        "Pavarų dėžė": "Mechaninė", 
        "Keleivių skaičius": "5",
        "Durų skaičius": "5",
        "Bagažinės talpa": "528 L",
        "Variklio tipas": "1.4L"
      }
    }
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
          <h2 className="text-2xl font-bold text-foreground mb-4">Automobilis nerastas</h2>
          <Button onClick={() => navigate("/automobiliai")}>
            Grįžti į automobilių sąrašą
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Simple Breadcrumb Section */}
      <section className="pt-24 pb-6 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <a href="/" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase">
              pradžia
            </a>
            <span className="text-muted-foreground">/</span>
            <a href="/automobiliai" className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase">
              automobiliai
            </a>
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
              <div className="text-center">
                <img
                  src={getCurrentImage()}
                  alt={`${car.name} - ${currentImageIndex + 1}`}
                  className="w-full max-w-2xl mx-auto object-contain rounded-lg"
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
                    {car.category}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{car.rating}</span>
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold text-foreground mb-4">
                  {car.name}
                </h2>
                
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-sm text-muted-foreground">Pradedant nuo</span>
                  <span className="text-4xl font-bold text-primary">30-50€</span>
                  <span className="text-lg text-muted-foreground">per dieną</span>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {car.description}
                </p>

                <div className="text-sm text-muted-foreground mb-6">
                  * Galutinė kaina priklauso nuo nuomos trukmės
                </div>

                <Button 
                  size="lg"
                  onClick={() => {
                    const bookingSection = document.getElementById('booking-section');
                    bookingSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
                >
                  Užsakyti
                </Button>
              </div>

              {/* Quick Specs */}
              <div className="grid grid-cols-3 gap-6 py-6 border-y">
                <div className="text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold text-foreground">{car.passengers}</div>
                  <div className="text-sm text-muted-foreground">Keleiviai</div>
                </div>
                <div className="text-center">
                  <Fuel className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-lg font-semibold text-foreground">{car.fuel}</div>
                  <div className="text-sm text-muted-foreground">Kuras</div>
                </div>
                <div className="text-center">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-lg font-semibold text-foreground">{car.transmission}</div>
                  <div className="text-sm text-muted-foreground">Pavarų dėžė</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features and Specifications */}
          <div className="grid lg:grid-cols-2 gap-12 mt-20">
            {/* Features */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">Įranga ir savybės</h3>
                <div className="grid gap-3">
                  {car.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">Specifikacijos</h3>
                <div className="space-y-4">
                  {Object.entries(car.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-muted-foreground">{key}</span>
                      <span className="font-semibold text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Booking Calendar */}
      <section className="py-20 bg-gray-50" id="booking-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">Užsakyti automobilį</h3>
            <p className="text-lg text-muted-foreground">
              Pasirinkite datas ir pamatykite tikslią kainą
            </p>
          </div>
          <BookingCalendar carId={car.id} carName={car.name} />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CarDetail;