import { useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  Calendar, 
  Shield, 
  CreditCard, 
  Car,
  Users,
  Phone,
  AlertTriangle
} from "lucide-react";

const LeaseAgreement = () => {
  useEffect(() => {
    // Set page title and meta tags
    document.title = "Nuomos sutartis | Carbonus automobilių nuoma";
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Carbonus automobilių nuomos sutarties sąlygos. Susipažinkite su nuomos taisyklėmis, draudimo sąlygomis ir atsakomybėmis.');
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/nuomos-sutartis');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', 'Nuomos sutartis - Carbonus');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/nuomos-sutartis');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            SUTARTIS
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            Automobilių nuomos sutartis
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Susipažinkite su mūsų nuomos sąlygomis ir taisyklėmis. 
            Galite atsisiųsti PDF formatą arba skaityti žemiau.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => {
              // Create a link element and trigger download
              const link = document.createElement('a');
              link.href = '/carbonus-nuomos-sutartis.pdf';
              link.download = 'Carbonus-Nuomos-Sutartis.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              <Download className="w-5 h-5 mr-2" />
              Atsisiųsti PDF
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              // Open PDF in new window and trigger print
              const printWindow = window.open('/carbonus-nuomos-sutartis.pdf', '_blank');
              if (printWindow) {
                printWindow.onload = () => {
                  printWindow.print();
                };
              }
            }}>
              <FileText className="w-5 h-5 mr-2" />
              Spausdinti
            </Button>
          </div>
        </div>
      </section>

      {/* Agreement Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Important Notice */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">Svarbi informacija</h3>
                  <p className="text-amber-700">
                    Prieš rezervuojant automobilį, būtina susipažinti su nuomos sąlygomis. 
                    Rezervacijos metu patvirtinsite, kad sutinkate su šiomis sąlygomis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Sutarties turinys
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  <li><a href="#reservation" className="text-primary hover:underline">1. Rezervacija ir užsakymas</a></li>
                  <li><a href="#documents" className="text-primary hover:underline">2. Dokumentai ir reikalavimai</a></li>
                  <li><a href="#payment" className="text-primary hover:underline">3. Apmokėjimas ir kainos</a></li>
                  <li><a href="#insurance" className="text-primary hover:underline">4. Draudimas ir saugumas</a></li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li><a href="#usage" className="text-primary hover:underline">5. Automobilio naudojimas</a></li>
                  <li><a href="#return" className="text-primary hover:underline">6. Automobilio grąžinimas</a></li>
                  <li><a href="#penalties" className="text-primary hover:underline">7. Pažeidimai ir baudos</a></li>
                  <li><a href="#contact" className="text-primary hover:underline">8. Kontaktai</a></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Agreement Sections */}
          <div className="space-y-8">
            
            {/* Section 1: Reservation */}
            <Card id="reservation">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    1. Rezervacija ir užsakymas
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.1 Rezervacijos būdai</h3>
                    <p>Automobilį galite rezervuoti trimis būdais:</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Mūsų internetinėje svetainėje www.carbonus.lt (rezervacija veikia 24/7)</li>
                      <li>Paskambinę telefonu +370 698 18 781</li>
                      <li>El. paštu info@carbonus.lt</li>
                      <li>Atvykę į automobilio atsiėmimo vietą</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.2 Rezervacijos atšaukimas</h3>
                    <p>Rezervaciją galite atšaukti nemokamai, jei liko daugiau nei 24 val. iki automobilio atsiėmimo. Jei atšaukiate vėliau, taikomas 20% mokestis nuo bendros užsakymo sumos. Jei neatvykstate neatšaukę rezervacijos („no-show"), imamas mokestis už pirmąją nuomos dieną.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.3 Rezervacijos galiojimas</h3>
                    <p>Rezervacija galioja 24 val. nuo jos atlikimo momento. Po šio laikotarpio ji automatiškai anuliuojama.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">1.4 Rezervacijos keitimas</h3>
                    <p>Rezervacijos detales galite keisti iki 24 val. prieš automobilio atsiėmimą. Susisiekite telefonu arba el. paštu.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Documents */}
            <Card id="documents">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    2. Dokumentai ir reikalavimai
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2.1 Reikalingi dokumentai</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>ES šalyje išduotas ir galiojantis vairuotojo pažymėjimas (ne mažiau kaip 2 metų vairavimo stažas)</li>
                      <li>Asmens dokumentas (pasas arba ID kortelė)</li>
                      <li>Kreditinė kortelė užstato rezervavimui (jei užstatas nėra sumokėtas iš anksto kartu su nuomos mokesčiu)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2.2 Amžiaus reikalavimai</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Ekonominės ir kompaktinės klasės automobiliams – nuo 21 m.</li>
                      <li>Premium ir Luxury klasės automobiliams – nuo 25 m.</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2.3 Užsienio pažymėjimai</h3>
                    <p>Priimami ES šalių ir tarptautiniai vairuotojo pažymėjimai. Pažymėjimas turi būti galiojantis ir išduotas ne mažiau kaip prieš 2 metus.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">2.4 Kreditinė kortelė</h3>
                    <p>Kreditinė kortelė būtina užstato rezervavimui. Debetinės kortelės nepriimamos, išskyrus atvejus, kai rezervacijos mokestis ir nuomos mokestis sumokami iš anksto arba atsiimant automobilį.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Payment */}
            <Card id="payment">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    3. Apmokėjimas ir kainos
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">3.1 Apmokėjimo būdai</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>Grynieji pinigai</li>
                      <li>Banko kortelės (vietoje)</li>
                      <li>El. bankininkystės pervedimai</li>
                      <li>Internetiniai mokėjimai kortele</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">3.2 Kainų sudėtis</h3>
                    <p>Visos nurodytos kainos apima pagrindinius mokesčius. Papildomi mokesčiai taikomi už:</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Vėlavimą grąžinti automobilį</li>
                      <li>Kuro papildymą (jei grąžinama ne pilnu baku)</li>
                      <li>Automobilio plovimą ar salono valymą</li>
                      <li>Rūkymą automobilyje (50 € bauda)</li>
                      <li>Kelių rinkliavas</li>
                      <li>KET pažeidimus</li>
                      <li>Kitas eksploatacines išlaidas (pvz., langų skystis, siurbimas)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">3.3 Užstatas</h3>
                    <p>Užstato dydis – 200 €. Užstatas grąžinamas per 7 d. d. po automobilio grąžinimo, arba tą pačią dieną, jei sumokėtas grynaisiais.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">3.4 Paslėpti mokesčiai</h3>
                    <p>Mes netaikome jokių paslėptų mokesčių. Visi papildomi mokesčiai aiškiai nurodyti sąlygose ir sutartyje.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Insurance */}
            <Card id="insurance">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    4. Draudimas ir saugumas
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.1 Draudimo aprėptis</h3>
                    <p>Visi automobiliai apdrausti KASKO ir OCTA draudimu. Nuomininko atsakomybės riba priklauso nuo automobilio klasės ir gali būti sumažinta įsigijus papildomą draudimą.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.2 Avarijos atveju</h3>
                    <p>Nedelsiant skambinkite:</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Mums – +370 698 18 781 (24/7)</li>
                      <li>Policijai – 112</li>
                    </ul>
                    <p className="mt-2">Neatidėkite įvykio vietos, kol neatvyks policija.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.3 Draudimo dengiama</h3>
                    <p>Draudimas dengia avarijas, vagystes, gaisrus, gamtos stichijų padarinius. Nedengiama: tyčiniai pažeidimai, vairavimas apsvaigus, dalyvavimas lenktynėse.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">4.4 Papildomas draudimas</h3>
                    <p>Galite įsigyti papildomą draudimą, kuris sumažina atsakomybę iki 0 €. Kaina priklauso nuo automobilio klasės ir nuomos trukmės.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Usage */}
            <Card id="usage">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    5. Automobilio naudojimas
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">5.1 Kelionės už Lietuvos ribų</h3>
                    <p>Galite išvykti už Lietuvos ribų, bet reikalingas išankstinis sutikimas:</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>ES šalims – 25 €/diena</li>
                      <li>Kitoms šalims – individualus susitarimas</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">5.2 Kilometražas</h3>
                    <p>Kilometražas neribojamas visoms automobilių klasėms.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">5.3 Rūkymas</h3>
                    <p>Rūkymas draudžiamas. Pažeidimo atveju taikoma 50 € bauda.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">5.4 Gyvūnai</h3>
                    <p>Galite vežti gyvūnus, bet reikia pranešti iš anksto. Gyvūnas turi būti vežamas specialioje pernešimo priemonėje.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Return */}
            <Card id="return">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    6. Automobilio grąžinimas
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">6.1 Grąžinimo laikas</h3>
                    <p>Automobilį reikia grąžinti sutartyje nurodytu laiku. Už grąžinimą po darbo valandų ar savaitgalį – papildomas 20 € mokestis. Jei vėluojama ilgiau nei 3 val., skaičiuojama papildoma nuomos diena.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">6.2 Kuras</h3>
                    <p>Su tokiu pačiu kiekiu, koks buvo atsiėmimo metu (dažniausiai – pilnu baku). Už trūkstamą kurą mokama 1,50 €/l.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">6.3 Švara</h3>
                    <p>Automobilis turi būti švarus. Jei stipriai užterštas – taikomas 20 € valymo ir 20 € plovimo mokestis.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card id="contact" className="bg-primary/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    7. Kontaktai
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Bendras kontaktas</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Telefonas:</strong> +370 698 18 781</p>
                      <p><strong>El. paštas:</strong> info@carbonus.lt</p>
                      <p><strong>Darbo laikas:</strong> 8:00-17:00 (klientų aptarnavimas)</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Avarijų linija</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Telefonas:</strong> +370 698 18 781</p>
                      <p><strong>Veikia:</strong> 24/7</p>
                      <p><strong>Policija:</strong> 112</p>
                    </div>
                  </div>
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

export default LeaseAgreement;