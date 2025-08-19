import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car, Calendar, CreditCard, Shield, Clock, AlertTriangle, FileText, Users } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              NUOMOS SĄLYGOS
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Automobilių nuomos sąlygos
            </h1>
            <p className="text-xl text-muted-foreground">
              Susipažinkite su Carbonus automobilio nuomos taisyklėmis ir sąlygomis
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Rezervacija</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Automobilius galite rezervuoti mūsų interneto svetainėje, elektroniniu paštu arba telefonu. 
                      Rezervacija galioja 24 valandas nuo jos atlikimo momento.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Skubios rezervacijos (tą pačią dieną) galimos tik susisiekus telefonu ir patvirtinus automobilio prieinamumą.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Car className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Automobilių parkas</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Carbonus siūlo naujausių modelių ir techniškai tvarkingų automobilių nuomą.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Nuomos laikotarpis</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Minimali nuomos trukmė - 1 diena (24 valandos). Maksimali nuomos trukmė nėra ribojama.
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Nuomos laikai:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Darbo dienomis: 8:00 - 20:00</li>
                        <li>• Savaitgaliais: 9:00 - 18:00</li>
                        <li>• Automobilio grąžinimas - bet kuriuo laiku (raktų dėžutė)</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <CreditCard className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Apmokėjimas</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Atsiskaitymas už automobilio nuomą galimas šiais būdais:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Vietoje</h4>
                        <ul className="space-y-1 text-muted-foreground text-sm">
                          <li>• Grynaisiais pinigais</li>
                          <li>• Banko kortele</li>
                          <li>• Pervedimas</li>
                        </ul>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Iš anksto</h4>
                        <ul className="space-y-1 text-muted-foreground text-sm">
                          <li>• El. bankininkystė</li>
                          <li>• Banko kortele online</li>
                          <li>• PayPal</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Kainos ir mokesčiai</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Visos nurodytos kainos yra galutinės ir apima PVM. Papildomi mokesčiai gali būti taikomi:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-foreground mb-2">Papildomi mokesčiai:</h4>
                        <ul className="space-y-2 text-muted-foreground">
                          <li>• Kuro papildymas (jei grąžinamas ne pilnas bakas) - 1.50€/l</li>
                          <li>• Vėlavimas grąžinti automobilį - 25€/val</li>
                          <li>• Automobilio išvalymas (jei reikalingas) - 50€</li>
                          <li>• Draudimo išpirkos sumažinimas - nuo 15€/dieną</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Reikalavimai nuomininkui</h2>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-foreground mb-2">Būtini reikalavimai:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Amžius: nuo 21 metų (kai kurioms klasėms - nuo 25 m.)</li>
                        <li>• Vairuotojo pažymėjimo stažas: ne mažiau nei 2 metai</li>
                        <li>• Galiojantis asmens dokumentas</li>
                        <li>• Kreditinė kortelė garantijos summai</li>
                      </ul>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Nuomininkas turi pateikti visus reikalingus dokumentus automobilio atsiėmimo metu.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Draudimas ir garantija</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Visi automobiliai apdrausti KASKO ir OCTA draudimu. Nuomininko atsakomybės riba:
                    </p>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <h4 className="font-semibold text-foreground mb-2">Ekonominė</h4>
                        <p className="text-2xl font-bold text-primary mb-1">800€</p>
                        <p className="text-sm text-muted-foreground">išpirkos suma</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <h4 className="font-semibold text-foreground mb-2">Premium</h4>
                        <p className="text-2xl font-bold text-primary mb-1">1500€</p>
                        <p className="text-sm text-muted-foreground">išpirkos suma</p>
                      </div>
                      <div className="bg-muted/50 p-4 rounded-lg text-center">
                        <h4 className="font-semibold text-foreground mb-2">Luxury</h4>
                        <p className="text-2xl font-bold text-primary mb-1">3000€</p>
                        <p className="text-sm text-muted-foreground">išpirkos suma</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Draudimai ir apribojimai</h2>
                    </div>
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-foreground mb-2">Griežtai draudžiama:</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Vairuoti alkoholio ar narkotikų paveiktam</li>
                        <li>• Dalyvauti lenktynėse ar testuose</li>
                        <li>• Rūkyti automobilyje</li>
                        <li>• Vežti gyvūnus be specialaus leidimo</li>
                        <li>• Išvykti už Lietuvos ribų be sutikimo</li>
                        <li>• Perduoti automobilį tretiesiems asmenims</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Car className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Automobilio grąžinimas</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Automobilį reikia grąžinti nustatytą datą, laiku ir vietoje. Automobilis turi būti:
                    </p>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <ul className="space-y-2 text-muted-foreground">
                        <li>• Švarus iš vidaus ir išorės</li>
                        <li>• Su pilnu kuro baku</li>
                        <li>• Be naujų pažeidimų</li>
                        <li>• Su visais dokumentais ir raktais</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Avarijų ir gedimų tvarka</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Avarijų ar gedimų atveju nedelsiant pranešti Carbonus:
                    </p>
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                      <div className="space-y-2 text-muted-foreground">
                        <p><strong>Telefonas:</strong> +370 698 18 781 (24/7)</p>
                        <p><strong>El. paštas:</strong> info@carbonus.lt</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <FileText className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Baigiamosios nuostatos</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Šios sąlygos galioja visiems automobilio nuomos atvejams. Carbonus pasilieka teisę keisti 
                      sąlygas, apie tai pranešdama interneto svetainėje.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Ginčai sprendžiami derybų keliu arba Lietuvos Respublikos teismų tvarka.
                    </p>
                  </div>

                  <div className="text-sm text-muted-foreground pt-6 border-t border-border">
                    <p>Sąlygos paskutinį kartą atnaujintos: 2024 m. sausio 15 d.</p>
                    <p className="mt-2">
                      Klausimų atveju susisiekite: <strong>info@carbonus.lt</strong> arba <strong>+370 698 18 781</strong>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default TermsAndConditions;