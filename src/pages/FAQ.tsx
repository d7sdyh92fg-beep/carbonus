import { useEffect, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  HelpCircle, 
  Car, 
  Calendar, 
  CreditCard, 
  Shield, 
  Clock,
  Users,
  FileText,
  Phone,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  useEffect(() => {
    // Set page title and meta tags
    document.title = "DUK - Dažnai užduodami klausimai | Carbonus automobilių nuoma";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Atsakymai į dažniausius klausimus apie automobilių nuomą Carbonus. Rezervacijos, dokumentai, draudimas, apmokėjimas ir kiti svarbūs klausimai.');
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/duk');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'DUK - Dažnai užduodami klausimai - Carbonus');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/duk');
    }
  }, []);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "Rezervacija ir užsakymas",
      icon: Calendar,
      questions: [
        {
          question: "Kaip rezervuoti automobilį?",
          answer: "Automobilį galite rezervuoti trimis būdais: mūsų internetinėje svetainėje, paskambinę telefonu +370 698 18 781 arba atvykę į bet kurį mūsų biurą. Online rezervacija veikia 24/7."
        },
        {
          question: "Ar galiu atšaukti rezervaciją?",
          answer: "Taip, rezervaciją galite atšaukti nemokamai likus 72 valandom iki automobilio atsiėmimo laiko. Jei atšaukiate vėliau, taikomas 20% mokestis nuo visos užsakymo sumos."
        },
        {
          question: "Kiek laiko galioja rezervacija?",
          answer: "Rezervacija galioja 24 valandas nuo jos atlikimo momento. Po šio laikotarpio rezervacija automatiškai anuliuojama."
        },
        {
          question: "Ar galiu pakeisti rezervacijos detales?",
          answer: "Taip, rezervacijos detales galite keisti iki 24 valandų prieš automobilio atsiėmimą. Susisiekite su mumis telefonu arba el. paštu."
        }
      ]
    },
    {
      title: "Dokumentai ir reikalavimai",
      icon: FileText,
      questions: [
        {
          question: "Kokius dokumentus reikia automobilio nuomai?",
          answer: "Reikalingas galiojantis vairuotojo pažymėjimas (ne mažiau nei 2 metų stažas), asmens dokumentas (pasas arba ID kortelė) ir kreditinė kortelė užstato rezervavimui."
        },
        {
          question: "Koks minimalus amžius automobilio nuomai?",
          answer: "Minimalus amžius - 21 metai ekonominės ir kompaktinės klasės automobiliams. Premium ir luxury klasės automobiliams - nuo 25 metų."
        },
        {
          question: "Ar priimami užsienio vairuotojo pažymėjimai?",
          answer: "Taip, priimami ES šalių ir tarptautiniai vairuotojo pažymėjimai. Vairuotojo pažymėjimas turi būti galiojantis ir išduotas ne mažiau nei prieš 2 metus."
        },
        {
          question: "Ar galiu nuomotis automobilį be kreditinės kortelės?",
          answer: "Deja, kreditinė kortelė yra privaloma užstato rezervavimui. Debetinės kortelės nepriimamos."
        }
      ]
    },
    {
      title: "Apmokėjimas ir kainos",
      icon: CreditCard,
      questions: [
        {
          question: "Kokie apmokėjimo būdai priimami?",
          answer: "Priimame grynuosius, banko korteles (vietoje), el. bankininkystės pervedimus ir online mokėjimus kortele. Užstatas rezervuojamas tik kreditine kortele."
        },
        {
          question: "Ar kainos apima visus mokesčius?",
          answer: "Taip, visos nurodytos kainos apima PVM ir pagrindinius mokesčius. Papildomi mokesčiai gali būti taikomi už vėlavimą, kuro papildymą ar valymo paslaugas."
        },
        {
          question: "Koks užstato dydis?",
          answer: "Užstato dydis priklauso nuo automobilio klasės: ekonominė - 800€, kompaktinė - 1000€, premium - 1500€, luxury - 3000€. Užstatas atlaisvinamas per 7-14 darbo dienų."
        },
        {
          question: "Ar yra paslėptų mokesčių?",
          answer: "Ne, mes netaikome jokių paslėptų mokesčių. Visi galimi papildomi mokesčiai aiškiai nurodyti mūsų sąlygose."
        }
      ]
    },
    {
      title: "Draudimas ir saugumas",
      icon: Shield,
      questions: [
        {
          question: "Ar automobiliai apdrausti?",
          answer: "Taip, visi automobiliai apdrausti KASKO ir OCTA draudimu. Nuomininko atsakomybės riba priklauso nuo automobilio klasės ir gali būti sumažinta įsigijus papildomą draudimą."
        },
        {
          question: "Ką daryti avarijų atveju?",
          answer: "Nedelsiant skambinkite mums telefonu +370 698 18 781 (24/7) ir policijai 112. Nepaliekite įvykio vietos, kol neatvyks policija ir mūsų atstovas."
        },
        {
          question: "Kas dengta draudimo?",
          answer: "Draudimu dengiami avarijų, vagysčių, gaisrų ir gamtos stichijų padariniai. Nedengti: tyčiniai pažeidimai, vairavimas alkoholio paveiktam, dalyvavimas lenktynėse."
        },
        {
          question: "Ar galiu sumažinti atsakomybės ribą?",
          answer: "Taip, galite įsigyti papildomą draudimą, kuris sumažina jūsų atsakomybės ribą iki 0€. Kaina priklauso nuo automobilio klasės ir nuomos trukmės."
        }
      ]
    },
    {
      title: "Automobilio naudojimas",
      icon: Car,
      questions: [
        {
          question: "Ar galiu išvykti už Lietuvos ribų?",
          answer: "Taip, bet būtinas išankstinis sutikimas. ES šalims mokestis - 25€/dieną, kitoms šalims - individualus susitarimas."
        },
        {
          question: "Kiek kilometrų galiu nuvažiuoti?",
          answer: "Kilometražas neribojamas visoms automobilio klasėms. Apmokama tik už sunaudotą kurą."
        },
        {
          question: "Ar galiu rūkyti automobilyje?",
          answer: "Ne, visuose automobiliuose rūkymas griežtai draudžiamas. Už rūkymo pėdsakų šalinimą taikomas 150€ mokestis."
        },
        {
          question: "Ar galiu vežti gyvūnus?",
          answer: "Taip, bet būtinas išankstinis pranešimas ir papildomas 25€ mokestis automobilio valymui. Gyvūnas turi būti specialioje pernešimo priemonėje."
        }
      ]
    },
    {
      title: "Automobilio grąžinimas",
      icon: Clock,
      questions: [
        {
          question: "Kada reikia grąžinti automobilį?",
          answer: "Automobilį reikia grąžinti sutartyje nurodytą datą ir laiką. Galimas grąžinimas bet kuriuo paros metu naudojant raktų dėžutę."
        },
        {
          question: "Su kiek kuro reikia grąžinti?",
          answer: "Automobilį reikia grąžinti su tokiu pačiu kuro kiekiu, koks buvo atsiėmimo metu (paprastai pilnas bakas). Už trūkstamą kurą mokama 1.50€/litras."
        },
        {
          question: "Ką daryti jei pavėluoju grąžinti?",
          answer: "Nedelsiant susisiekite su mumis. Už kiekvieną pavėluotą valandą taikomas 25€ mokestis. Po 6 valandų vėlavimo skaičiuojama papildoma diena."
        },
        {
          question: "Ar reikia valyti automobilį prieš grąžinant?",
          answer: "Automobilis turi būti pagrindinio švarumo. Už stipriai užterštą automobilį taikomas 50€ valymo mokestis."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            PAGALBA
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Dažnai užduodami klausimai
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Čia rasite atsakymus į dažniausius klausimus apie automobilių nuomą. 
            Nerandate atsakymo? Susisiekite su mumis tiesiogiai.
          </p>
          <Button size="lg" onClick={() => window.location.href = '/kontaktai'}>
            Susisiekti su mumis
          </Button>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => {
              const IconComponent = category.icon;
              return (
                <Card key={categoryIndex} className="shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {category.title}
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => {
                        const globalIndex = categoryIndex * 100 + faqIndex;
                        const isOpen = openItems.includes(globalIndex);
                        
                        return (
                          <div key={faqIndex} className="border border-border rounded-lg">
                            <button
                              onClick={() => toggleItem(globalIndex)}
                              className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                            >
                              <span className="font-medium text-foreground pr-4">
                                {faq.question}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                            
                            {isOpen && (
                              <div className="px-4 pb-4">
                                <p className="text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Neradote atsakymo?
            </h2>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            Mūsų komanda visada pasiruošusi padėti. Susisiekite su mumis bet kuriuo jums patogiu būdu.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Telefonu</h3>
              <p className="text-muted-foreground text-sm mb-3">+370 698 18 781</p>
              <p className="text-xs text-muted-foreground">8:00-17:00 klientų aptarnavimas</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">El. paštu</h3>
              <p className="text-muted-foreground text-sm mb-3">info@carbonus.lt</p>
              <p className="text-xs text-muted-foreground">24/7 atsakysime per 2 val.</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Skubūs atvejai</h3>
              <p className="text-muted-foreground text-sm mb-3">+370 698 18 781</p>
              <p className="text-xs text-muted-foreground">Avarijų linija 24/7</p>
            </Card>
          </div>
          
          <Button size="lg" onClick={() => window.location.href = '/kontaktai'}>
            Eiti į kontaktų puslapį
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;