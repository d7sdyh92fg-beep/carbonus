import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Phone, MapPin, Calendar } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              DUOMENŲ APSAUGA
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Privatumo politika
            </h1>
            <p className="text-xl text-muted-foreground">
              Carbonus gerbia jūsų privatumą ir saugo asmens duomenis pagal galiojančius teisės aktus
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                <div className="mb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Mes, Carbonus, gerbdami jūsų privatumą, įsipareigojame saugoti jį vadovaudamiesi šia privatumo politika. 
                    Šiame dokumente rasite išsamią informaciją apie jūsų asmens duomenų tvarkymą mūsų paslaugų teikimo procese. 
                    Svarbu, kad atidžiai susipažintumėte su šiais principais, nes naudodamiesi mūsų automobilių nuomos paslaugomis, 
                    jūs sutinkate su šioje politikoje aprašytomis sąlygomis.
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Kokie asmens duomenys tvarkomi?</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Rezervuodami automobilį mūsų platformoje, jūs pateikiate asmens duomenis: vardą, pavardę, 
                      telefono numerį, elektroninio pašto adresą, dokumentų duomenis, adreso informaciją ir kitus 
                      nuomos paslaugai teikti būtinus duomenis.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Šie duomenys tvarkomi teisėtai ir naudojami jūsų automobilio nuomos užsakymo vykdymui, 
                      rezervacijos patvirtinimams siųsti, nuomos sutarčiai sudaryti bei saugiam paslaugų teikimui užtikrinti. 
                      Pateikdami duomenis, patvirtinate jų tikslumą ir teisingumą.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Duomenų rinkimo būdai</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Jūsų asmens duomenis renkame tiesiogiai iš jūsų: užpildant rezervacijos formas, 
                      susisiekiant su klientų aptarnavimo komanda, registruojantis mūsų platformoje arba 
                      naudojantis kitomis mūsų teikiamomis paslaugomis.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Phone className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Duomenų atskleidimas tretiesiems asmenims</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Carbonus neteikia jūsų asmens duomenų tretiesiems asmenims komerciniams tikslams. 
                      Duomenys gali būti perduoti tik įstatymų numatytais atvejais valstybės institucijoms, 
                      teismams, teisėsaugos organams arba kitiems teisėtą interesą turintiems subjektams, 
                      taip pat paslaugų teikėjams, reikalingiems užsakymo vykdymui.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Duomenų saugumas</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Mes rimtai žiūrime į jūsų duomenų saugumą. Visa informacija saugoma naudojant 
                      šiuolaikinius saugumo sprendimus ir prieinami tik įgaliotiems darbuotojams. 
                      Taikome technines ir organizacines priemones duomenų apsaugai nuo praradimo, 
                      neteisėto naudojimo ir pakeitimų.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Visi mūsų darbuotojai yra pasirašę konfidencialumo sutartis ir įsipareigoja 
                      nesklaidyti kliento informacijos tretiesiems asmenims.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Duomenų saugojimo trukmė</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Jūsų asmens duomenis saugome tiek, kiek reikalinga sutarties vykdymui ir 
                      teisės aktų numatytoms prievolėms įvykdyti, bet ne ilgiau nei 7 metus po 
                      paskutinio paslaugos naudojimo, išskyrus atvejus, kai ilgesnis saugojimas 
                      reikalingas dėl teisinių prievolių.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Jūsų teisės</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Turite teisę prašyti prieigos prie savo duomenų, jų ištaisymo, ištrynimo, 
                      apriboti duomenų tvarkymą ar nesutikti su jų tvarkymu. Taip pat turite teisę 
                      į duomenų perkeliamumą ir pateikti skundą duomenų apsaugos institucijai.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Slapukai ir analizės įrankiai</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Mūsų svetainėje naudojami slapukai (cookies) svetainės veikimo gerinimui, 
                      statistikos rinkimui ir jūsų patirties personalizavimui. Galite bet kada 
                      pakeisti slapukų nustatymus savo naršyklėje.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Naujienlaiškai</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Jei sutikote gauti mūsų naujienlaiškį, naudosime jūsų elektroninio pašto adresą 
                      informacijai apie pasiūlymus, nuolaidas, naujienas ir kitus mums svarbius pranešimus siųsti. 
                      Galite bet kada atsisakyti prenumeratos paspausdami nuorodą laiške arba susisiekę su mumis.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Politikos pakeitimai</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Pasiliekame teisę atnaujinti šią privatumo politiką. Apie svarbius pakeitimus 
                      informuosime el. paštu arba paskelbdami pranešimą mūsų svetainėje. 
                      Pakeitimai įsigalioja nuo jų paskelbimo dienos.
                    </p>
                  </div>

                  <div className="pt-8 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Phone className="w-6 h-6 text-primary" />
                      <h2 className="text-2xl font-bold text-foreground">Kontaktai</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Jei turite klausimų dėl šios privatumo politikos ar duomenų tvarkymo, 
                      susisiekite su mumis:
                    </p>
                    <div className="space-y-2 text-muted-foreground">
                      <p>El. paštas: privatumas@carbonus.lt</p>
                      <p>Telefonas: +370 600 12345</p>
                      <p>Adresas: Gedimino pr. 1, Vilnius, Lietuva</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground pt-6 border-t border-border">
                    <p>Paskutinį kartą atnaujinta: 2024 m. sausio 15 d.</p>
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

export default PrivacyPolicy;