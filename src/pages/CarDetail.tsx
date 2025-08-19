import { useParams, useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Users, Fuel, Settings, Star, CheckCircle } from "lucide-react";

interface CarDetail {
  id: string;
  name: string;
  price: string;
  image: string;
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

  const carDetails: { [key: string]: CarDetail } = {
    "1": {
      id: "1",
      name: "BMW 3 series",
      price: "30 EUR",
      image: "/src/assets/bmw-3-clean.png",
      category: "Sedan",
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
      image: "/src/assets/chrysler-town-country-side.png",
      category: "Minivan",
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
    }
  };

  const car = carDetails[id || ""];

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
      <Navigation logo="/lovable-uploads/f307c05e-658c-4866-b3eb-8b9d71719579.png" />
      
      {/* Hero Section with Car Image */}
      <section className="pt-24 pb-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-6">
            <span className="opacity-70">PRADŽIA</span>
            <span className="opacity-70">/</span>
            <span className="opacity-70">AUTOMOBILIAI</span>
            <span className="opacity-70">/</span>
            <span>AUTOMOBILIO DETALĖS</span>
          </div>
          
          <div className="flex items-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/automobiliai")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl lg:text-5xl font-bold">
              Automobilio detalės
            </h1>
          </div>
        </div>
      </section>

      {/* Car Details Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Car Image */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <img
                src={car.image}
                alt={car.name}
                className="w-full max-w-2xl mx-auto object-contain"
              />
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
                  <span className="text-4xl font-bold text-primary">{car.price}</span>
                  <span className="text-lg text-muted-foreground">/dieną</span>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  {car.description}
                </p>

                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
                >
                  Užsakyti dabar
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

      <Footer />
    </div>
  );
};

export default CarDetail;