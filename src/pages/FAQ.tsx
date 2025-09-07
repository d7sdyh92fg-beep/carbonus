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
          answer: "Automobilį galite rezervuoti trimis būdais: mūsų internetinėje svetainėje www.carbonus.lt (rezervacija veikia 24/7), paskambinę telefonu +370 698 18 781, el. paštu info@carbonus.lt, arba atvykę į automobilio atsiėmimo vietą."
        },
        {
          question: "Ar galiu atšaukti rezervaciją?",
          answer: "Taip, rezervaciją galite atšaukti nemokamai likus ne mažiau kaip 72 val. iki automobilio atsiėmimo. Jei atšaukiate vėliau – taikomas 20% mokestis nuo visos užsakymo sumos."
        },
        {
          question: "Ar galiu atšaukti rezervaciją?",
          answer: "Taip, rezervaciją galite atšaukti nemokamai, jei liko daugiau nei 24 val. iki automobilio atsiėmimo. Jei atšaukiate vėliau, taikomas 20% mokestis nuo bendros užsakymo sumos. Jei neatvykstate neatšaukę rezervacijos (\"no-show\"), imamas mokestis už pirmąją nuomos dieną."
        },
        {
          question: "Ar galiu pakeisti rezervacijos detales?",
          answer: "Taip, rezervacijos detales galite keisti iki 24 val. prieš automobilio atsiėmimą. Susisiekite telefonu arba el. paštu."
        }
      ]
    },
    {
      title: "Dokumentai ir reikalavimai",
      icon: FileText,
      questions: [
        {
          question: "Kokius dokumentus reikia automobilio nuomai?",
          answer: "Reikalinga: ES šalyje išduotas ir galiojantis vairuotojo pažymėjimas (ne mažiau kaip 2 metų vairavimo stažas), asmens dokumentas (pasas arba ID kortelė), kreditinė kortelė užstato rezervavimui (jei užstatas nėra sumokėtas iš anksto kartu su nuomos mokesčiu)."
        },
        {
          question: "Koks minimalus amžius automobilio nuomai?",
          answer: "Ekonominės ir kompaktinės klasės automobiliams – nuo 21 m. Premium ir Luxury klasės automobiliams – nuo 25 m."
        },
        {
          question: "Ar priimami užsienio vairuotojo pažymėjimai?",
          answer: "Taip, priimami ES šalių ir tarptautiniai vairuotojo pažymėjimai. Pažymėjimas turi būti galiojantis ir išduotas ne mažiau kaip prieš 2 metus."
        },
        {
          question: "Ar galiu nuomotis automobilį be kreditinės kortelės?",
          answer: "Deja, kreditinė kortelė būtina užstato rezervavimui. Debetinės kortelės nepriimamos, išskyrus atvejus, kai rezervacijos mokestis ir nuomos mokestis sumokami iš anksto arba atsiimant automobilį."
        }
      ]
    },
    {
      title: "Apmokėjimas ir kainos",
      icon: CreditCard,
      questions: [
        {
          question: "Kokie apmokėjimo būdai priimami?",
          answer: "Priimame: grynuosius, banko korteles (vietoje), el. bankininkystės pervedimus, internetinius mokėjimus kortele."
        },
        {
          question: "Ar kainos apima visus mokesčius?",
          answer: "Taip, visos nurodytos kainos apima pagrindinius mokesčius. Papildomi mokesčiai taikomi už: vėlavimą grąžinti automobilį, kuro papildymą (jei grąžinama ne pilnu baku), automobilio plovimą ar salono valymą, rūkymą automobilyje (50 € bauda), kelių rinkliavas, KET pažeidimus, kitas eksploatacines išlaidas (pvz., langų skystis, siurbimas)."
        },
        {
          question: "Koks užstato dydis?",
          answer: "Užstato dydis – 300 €. Užstatas grąžinamas per 7 d. d. po automobilio grąžinimo, arba tą pačią dieną, jei sumokėtas grynaisiais."
        },
        {
          question: "Ar yra paslėptų mokesčių?",
          answer: "Ne, mes netaikome jokių paslėptų mokesčių. Visi papildomi mokesčiai aiškiai nurodyti sąlygose ir sutartyje."
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
          question: "Ką daryti avarijos atveju?",
          answer: "Nedelsiant skambinkite: mums – +370 698 18 781 (24/7), policijai – 112. Neatidėkite įvykio vietos, kol neatvyks policija."
        },
        {
          question: "Ką apima automobilio draudimas?",
          answer: "Draudimas dengia avarijas, vagystes, gaisrus, gamtos stichijų padarinius. Nedengiama: tyčiniai pažeidimai, vairavimas apsvaigus, dalyvavimas lenktynėse."
        },
        {
          question: "Ar galiu sumažinti atsakomybės ribą?",
          answer: "Taip, galite įsigyti papildomą draudimą, kuris sumažina atsakomybę iki 0 €. Kaina priklauso nuo automobilio klasės ir nuomos trukmės."
        }
      ]
    },
    {
      title: "Automobilio naudojimas",
      icon: Car,
      questions: [
        {
          question: "Ar galiu išvykti už Lietuvos ribų?",
          answer: "Taip, bet reikalingas išankstinis sutikimas. ES šalims – 25 €/diena, kitoms šalims – individualus susitarimas."
        },
        {
          question: "Kiek kilometrų galiu nuvažiuoti?",
          answer: "Kilometražas neribojamas visoms automobilių klasėms."
        },
        {
          question: "Ar galiu rūkyti automobilyje?",
          answer: "Ne, rūkymas draudžiamas. Pažeidimo atveju taikoma 50 € bauda."
        },
        {
          question: "Ar galiu vežti gyvūnus?",
          answer: "Taip, bet reikia pranešti iš anksto. Gyvūnas turi būti vežamas specialioje pernešimo priemonėje."
        }
      ]
    },
    {
      title: "Automobilio grąžinimas",
      icon: Clock,
      questions: [
        {
          question: "Kada reikia grąžinti automobilį?",
          answer: "Automobilį reikia grąžinti sutartyje nurodytu laiku. Už grąžinimą po darbo valandų ar savaitgalį – papildomas 20 € mokestis. Jei vėluojama ilgiau nei 3 val., skaičiuojama papildoma nuomos diena."
        },
        {
          question: "Su kiek kuro reikia grąžinti automobilį?",
          answer: "Su tokiu pačiu kiekiu, koks buvo atsiėmimo metu (dažniausiai – pilnu baku). Už trūkstamą kurą mokama 1,50 €/l."
        },
        {
          question: "Ar reikia valyti automobilį prieš grąžinant?",
          answer: "Automobilis turi būti švarus. Jei stipriai užterštas – taikomas 20 € valymo ir 20 € plovimo mokestis."
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