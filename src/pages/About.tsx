import { useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Users, Clock, Shield, Award, CheckCircle2, Star, Calendar, MapPin } from "lucide-react";
import carInterior from "@/assets/car-interior.jpg";
import fleetCars from "@/assets/fleet-cars.jpg";

const About = () => {
  useEffect(() => {
    // Set page title and meta tags
    document.title = "Apie mus - Carbonus | Moderni automobilių nuomos įmonė Lietuvoje";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Carbonus - moderni automobilių nuomos įmonė, įkurta 2024 metais. Siūlome aukščiausios kokybės automobilius ir išskirtinį aptarnavimą Lietuvoje.');
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/apie-mus');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Apie mus - Carbonus');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/apie-mus');
    }
  }, []);
  const stats = [
    { number: "2025", label: "Įkūrimo metai", icon: Calendar },
    { number: "200+", label: "Automobilių", icon: Car },
    { number: "1000+", label: "Klientų", icon: Users },
    { number: "98%", label: "Pasitenkinimas", icon: Star }
  ];

  const values = [
    {
      icon: Shield,
      title: "Saugumas",
      description: "Visi mūsų automobiliai reguliariai tikrinami ir atitinka aukščiausius saugumo standartus."
    },
    {
      icon: Award,
      title: "Kokybė",
      description: "Siūlome tik aukščiausios klasės automobilius, kurie užtikrins komfortą ir patikimumą."
    },
    {
      icon: Clock,
      title: "Patikimumas",
      description: "24/7 klientų aptarnavimas ir greitas reagavimas į visus jūsų poreikius."
    },
    {
      icon: CheckCircle2,
      title: "Skaidrumas",
      description: "Jokių paslėptų mokesčių - visa informacija apie kainas yra aiški ir suprantama."
    }
  ];


  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                MŪSŲ ISTORIJA
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-foreground mb-6 leading-tight">
                Naujas žingsnis automobilių nuomos srityje
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Carbonus - tai jauna, veržli ir nuolat auganti bei tobulėjanti automobilių nuomos įmonė, sukurta atsižvelgiant į šiuolaikinius klientų poreikius. Mūsų tikslas - suteikti jums ne tik kokybišką transportą, bet ir išskirtinę aptarnavimo patirtį, naudojant naujausias technologijas ir inovacijas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="default" onClick={() => window.location.href = '/automobiliai'}>
                  Peržiūrėti automobilius
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src={carInterior} 
                alt="Premium automobilių interjeras" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold">2025</div>
                <div className="text-sm opacity-90">Įkūrimo metai</div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Values Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              MŪSŲ VERTYBĖS
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Kodėl pasirinkti Carbonus?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nors esame jauna įmonė, tačiau ne naujokai šioje srityje. Kartu su partneriais nuolat palaikome reikiamą automobilių parko būklę, rūpinamės kiekvienu klientu ir jo poreikiais, diegiame ir taikome naujus ir modernius aptarnavimo bei paslaugų suteikimo būdus, metodus ir technologines priemones.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="p-6 text-center border-0 shadow-lg bg-background hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-0">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-2xl mb-6">
                      <IconComponent className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>


      {/* Vision Section */}
      <section className="py-20 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                MŪSŲ VIZIJA
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Patikimų automobilių ir modernių paslaugų sintezė
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Mes tikime, kad automobilių nuoma turėtų būti paprasta, skaidri ir maloni. 
                Todėl kuriame paslaugą, kurioje technologijos tarnauja žmogui, 
                o ne atvirkščiai.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Modernios ir nuolat vystomos paslaugų technologijos</div>
                    <div className="text-muted-foreground">Investuojame į naujausias technologijas ir inovacijas</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Saugumas, patikimumas ir aukščiausia kokybė</div>
                    <div className="text-muted-foreground">Kiekvienas automobilis atitinka aukščiausius standartus</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src={fleetCars} 
                alt="Mūsų automobilių parkas" 
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-black md:bg-black rounded-3xl overflow-hidden min-h-[300px] md:min-h-[400px] flex items-center">
            {/* Car Image - Full Background on Mobile, Left Side on Desktop */}
            <div className="absolute inset-0 md:left-0 md:top-0 md:bottom-0 md:w-1/2 lg:w-3/5">
              <img
                src="/lovable-uploads/d3b98744-2940-4908-82ac-d9936a34e2d5.png"
                alt="Premium car with dramatic lighting"
                className="w-full h-full object-cover object-center opacity-30 md:opacity-100"
              />
              {/* Dark overlay for mobile text readability */}
              <div className="absolute inset-0 bg-black/50 md:bg-transparent"></div>
            </div>
            
            {/* Content - Centered on Mobile, Right Side on Desktop */}
            <div className="relative z-10 w-full flex justify-center md:justify-end">
              <div className="w-full md:w-1/2 lg:w-2/5 p-6 md:p-8 lg:p-12 text-white text-center md:text-left">
                <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-6 leading-tight">
                  Rezervuokite savo svajonių automobilį šiandien ir pajuskite geriausią kelionės patirtį
                </h2>
                
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 md:px-8 py-4 rounded-full transition-all duration-300"
                  onClick={() => window.location.href = '/automobiliai'}
                >
                  Rezervuoti dabar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;