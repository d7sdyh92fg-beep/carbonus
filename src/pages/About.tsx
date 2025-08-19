import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Users, Clock, Shield, Award, CheckCircle2, Star, Calendar, MapPin } from "lucide-react";
import carInterior from "@/assets/car-interior.jpg";
import fleetCars from "@/assets/fleet-cars.jpg";

const About = () => {
  const stats = [
    { number: "10+", label: "Metų patirtis", icon: Calendar },
    { number: "500+", label: "Automobilių", icon: Car },
    { number: "15000+", label: "Klientų", icon: Users },
    { number: "99%", label: "Pasitenkinimas", icon: Star }
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

  const milestones = [
    {
      year: "2014",
      title: "Įmonės įkūrimas",
      description: "Pradėjome veiklą su 15 automobilių ir didele vizija transformuoti automobilių nuomos rinką Lietuvoje."
    },
    {
      year: "2017",
      title: "Plėtra",
      description: "Pasiekėme 100 automobilių ženklą ir atidarėme antrą biurą Kaune."
    },
    {
      year: "2020",
      title: "Digitalizacija",
      description: "Paleidome online platformą, leidžiančią klientams rezervuoti automobilius 24/7."
    },
    {
      year: "2023",
      title: "Premium klasė",
      description: "Pridėjome premium ir elektrinių automobilių kategoriją, tapdami rinkos lyderiais."
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
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
                Lyderiaujame automobilių nuomos srityje
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Per daugiau nei 10 metų padedame klientams rasti tobulus automobilius 
                jų kelionėms. Mūsų misija - suteikti ne tik transporto priemonę, 
                bet ir nepamirštamą vairavimo patirtį.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" variant="default">
                  Peržiūrėti automobilius
                </Button>
                <Button size="lg" variant="outline">
                  Susisiekti su mumis
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
                <div className="text-3xl font-bold">10+</div>
                <div className="text-sm opacity-90">Metų patirtis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-2xl mb-4">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              );
            })}
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
              Mūsų vertybės formuoja kiekvieną sprendimą ir užtikrina, 
              kad jūsų patirtis būtų išskirtinė.
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

      {/* Timeline Section */}
      <section className="py-20 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              MŪSŲ KELIAS
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Augimo istorija
            </h2>
            <p className="text-xl text-muted-foreground">
              Pažvelkite į mūsų kelią nuo mažos šeimos įmonės iki rinkos lyderio.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-border"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`relative flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'}`}>
                    <Card className="p-6 shadow-lg">
                      <CardContent className="p-0">
                        <div className="text-2xl font-bold text-primary mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-3">
                          {milestone.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4">
                MŪSŲ KOMANDA
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Profesionalų komanda jūsų paslaugoms
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Mūsų komandą sudaro patyrę automobilių industrijos specialistai, 
                kurie kasdien dirba tam, kad jūsų patirtis būtų nepriekaištinga. 
                Kiekvienas narys yra atsidavęs savo darbui ir pasiryžęs viršyti lūkesčius.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">50+ darbuotojų</div>
                    <div className="text-muted-foreground">Profesionalų komanda</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">5 miestai</div>
                    <div className="text-muted-foreground">Veikla visoje Lietuvoje</div>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary to-primary/80">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            Pradėkite savo kelionę šiandien
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed">
            Atraskite mūsų automobilių parką ir rezervuokite savo tobulą automobilį 
            jau dabar. Mes pasiruošę padėti jums sukurti nepamirštamą kelionę.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Peržiūrėti automobilius
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Susisiekti su mumis
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;