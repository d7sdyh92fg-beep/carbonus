import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Badge } from "@/components/ui/badge";

type ChangeGroup = {
  category: string;
  items: string[];
};

/** Major changes shipped after the last publish. Newest group first. */
const CHANGE_GROUPS: ChangeGroup[] = [
  {
    category: "Rezervacijų duomenų sauga",
    items: [
      "Išjungtas automatinis praėjusių blokuotų datų trynimas admin panelėje (dėl jo dingdavo telefoninės rezervacijos).",
      "Telefoninės / rankinės rezervacijos ir blokai dabar trinami „minkštai“ (deleted_at) – duomenys lieka duomenų bazėje ir gali būti atkurti.",
      "Iš naujo blokuojant tas pačias datas įrašas automatiškai atgaivinamas.",
      "Prieinamumo patikra (check_car_availability) ignoruoja ištrintus blokus.",
    ],
  },
  {
    category: "Kainos ir nuolaidos",
    items: [
      "Pagrindinio puslapio automobilių kortelės kainas ima tiesiai iš duomenų bazės (nebeliko netikrų kainų).",
      "Suvienodintos atsarginės kainos visame kataloge (SLK 100 €, SpaceTourer 80 €, kiti 30 €).",
      "Nuolaidos kodų sistema: promo_codes lentelė, validate_promo_code funkcija ir kodo laukelis užsakymo peržiūroje.",
      "Nuolaidos kodo laukelio tekstas nebeatskleidžia realaus kodo.",
      "Atsiliepimų puslapyje ACIU10 sąlygos ir „Peržiūrėti sąlygas“ langas; kodų išdavimo sekimas admin skiltyje „Nuolaidos“.",
    ],
  },
  {
    category: "Admin panelė",
    items: [
      "Kompaktiškos automobilių kortelės su paieška „Automobilių parkas“ skiltyje.",
      "Kortelių nuotraukos 16/10, baltas fonas, pilnai matomas automobilis.",
      "Saugaus trynimo režimas istorijoje su varnelėmis.",
      "Sąskaitų faktūrų numerio ir datos redagavimas; data pagal nuomos pradžią.",
      "Vietinės rezervacijos juodraščiai („Juodraščiai“ skiltis).",
      "Mokėjimo būdas „Pavedimu“ ir parašo pridėjimas jau patvirtintai rezervacijai.",
    ],
  },
  {
    category: "Puslapio dizainas (V3)",
    items: [
      "Naujas pagrindinis puslapis pagal mockupą: Manrope šriftas, naujas hero su paieška ir Google 5.0 ženkleliu.",
      "Pagrindiniame puslapyje rodomi 4 automobiliai + mygtukas „Rodyti daugiau“.",
      "Naujas /laisvi-automobiliai puslapis su datų sinchronizacija ir 30 min. intervalais.",
      "Rezervacija negalima anksčiau nei 1 val. nuo dabar.",
      "Suvienodintas V3 header ir footer.",
    ],
  },
  {
    category: "Pristatymas ir logistika",
    items: [
      "Pristatymo / paėmimo kainos skaičiavimas: 1,60 €/km, min. 40 €, 15 km spindulys aplink Druskininkus – 0 €.",
      "Atstumai skaičiuojami per Google Routes API.",
    ],
  },
  {
    category: "Saugumas",
    items: [
      "Panaikintos viešos EXECUTE teisės pagalbinėms funkcijoms.",
      "Vairuotojo pažymėjimų saugykla su pasirašytomis (signed) nuorodomis.",
      "Serverinė rezervacijų patikra su pg_advisory_xact_lock – nebegalimos dvigubos rezervacijos.",
      "get_booked_ranges funkcija saugiam užimtų datų rodymui.",
    ],
  },
  {
    category: "SEO ir turinys",
    items: [
      "Pilna SEO peržiūra: meta žymos, JSON-LD schemos, alt tekstai, aria-label.",
      "sitemap.xml ir robots.txt atnaujinti, Google Search Console patvirtinimas.",
      "Pašalinti nereikalingi puslapiai (SEO checklist, pikselių testeris, senos versijos).",
      "Pašalintas „Nuoma Druskininkuose“ akcentas – „Vairuokite visoje Lietuvoje“.",
    ],
  },
];

const Changelog = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Pakeitimų sąrašas | Carbonus"
        description="Vidinis Carbonus sistemos pakeitimų sąrašas po paskutinio publikavimo."
        noindex
      />
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <header className="mb-10">
          <Badge variant="secondary" className="mb-3">
            Vidinis dokumentas
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Pakeitimų sąrašas
          </h1>
          <p className="mt-3 text-muted-foreground">
            Svarbiausi sistemos pakeitimai, atlikti po paskutinio publikavimo.
          </p>
        </header>

        <div className="space-y-8">
          {CHANGE_GROUPS.map((group) => (
            <section
              key={group.category}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="mb-4 text-xl font-semibold">{group.category}</h2>
              <ul className="space-y-3">
                {group.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="text-foreground/90">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>

      <V3Footer />
    </div>
  );
};

export default Changelog;
