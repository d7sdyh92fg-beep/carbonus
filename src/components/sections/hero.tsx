import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/use-translations";
import { Car, Calendar, MapPin, ArrowRight, ShieldCheck, CheckCircle2, Headphones, Gem, Wallet, CalendarClock, Hotel } from "lucide-react";
import { useState } from "react";

type TabKey = "cars" | "long" | "hotel";

export function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [tab, setTab] = useState<TabKey>("cars");
  const today = new Date().toISOString().slice(0, 10);
  const inTwo = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const [pickup, setPickup] = useState(today);
  const [ret, setRet] = useState(inTwo);
  const [hotel, setHotel] = useState("");

  const goToCars = () => {
    const params = new URLSearchParams({ pickup, return: ret, mode: tab });
    if (tab === "hotel" && hotel) params.set("hotel", hotel);
    navigate(`/automobiliai?${params.toString()}`);
    setTimeout(() => window.scrollTo({ top: 300, behavior: "smooth" }), 100);
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "cars", label: "Automobiliai", icon: Car },
    { key: "long", label: "Ilgesnė nuoma", icon: CalendarClock },
    { key: "hotel", label: "Pristatymas viešbutyje", icon: Hotel },
  ];

  const showHotel = tab === "hotel";

  return (
    <section className="dark relative bg-background text-foreground h-[100svh] flex flex-col overflow-hidden">
      {/* Hero fills remaining space */}
      <div className="relative flex-1 flex flex-col overflow-hidden">
        {/* Ambient background glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/3 h-[45vh] w-[45vh] rounded-full bg-primary/12 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[40vh] w-[40vh] rounded-full bg-primary/8 blur-[100px]" />
          <div className="absolute top-1/2 -left-24 h-[30vh] w-[30vh] rounded-full bg-primary/6 blur-[90px]" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(5rem+2vh)] pb-[3vh]">
          {/* Search widget */}
          <div className="rounded-3xl bg-white text-slate-900 backdrop-blur-xl border border-white/10 shadow-elegant p-4 sm:p-5 lg:p-6 [&_*]:text-slate-900">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4 lg:mb-5">
              {tabs.map(({ key, label, icon: Icon }) => {
                const active = tab === key;
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors border ${
                      active
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-card-foreground border-border hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Fields */}
            <div className={`grid grid-cols-1 gap-3 lg:gap-4 items-end ${showHotel ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 lg:grid-cols-3"}`}>
              {showHotel && (
                <Field label="Viešbučio pavadinimas" icon={<Hotel className="h-4 w-4 text-muted-foreground" />}>
                  <input
                    value={hotel}
                    onChange={(e) => setHotel(e.target.value)}
                    placeholder="Pvz. Grand SPA Lietuva"
                    className="w-full bg-transparent outline-none text-card-foreground font-medium placeholder:text-muted-foreground"
                  />
                </Field>
              )}
              <Field label="Paėmimo data" icon={<Calendar className="h-4 w-4 text-muted-foreground" />}>
                <input
                  type="date"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  className="w-full bg-transparent outline-none text-card-foreground font-medium"
                />
              </Field>
              <Field label="Grąžinimo data" icon={<Calendar className="h-4 w-4 text-muted-foreground" />}>
                <input
                  type="date"
                  value={ret}
                  onChange={(e) => setRet(e.target.value)}
                  className="w-full bg-transparent outline-none text-card-foreground font-medium"
                />
              </Field>
              <Button
                variant="hero"
                size="lg"
                onClick={goToCars}
                className="h-14 rounded-2xl w-full justify-center gap-2"
              >
                Rodyti automobilius
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Trust row */}
            <div className="mt-4 lg:mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Aiškios kainos be paslėptų mokesčių</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Nemokamas atšaukimas iki 24 val.</span>
              <span className="inline-flex items-center gap-2"><Headphones className="h-4 w-4 text-primary" /> Klientų aptarnavimas 24/7</span>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-auto pt-[4vh] max-w-3xl">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold tracking-[0.2em] uppercase border-b border-primary/60 pb-2 mb-4 lg:mb-6">
              <MapPin className="h-3.5 w-3.5" />
              Druskininkai
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-foreground">
              KELIAUKITE STILINGAI.<br />
              MĖGAUKITĖS LAISVE.
            </h1>
          </div>
        </div>
      </div>

      {/* Green feature band - fits in fullscreen */}
      <div className="bg-primary text-primary-foreground flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
          <div className="text-center">
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight">
              PREMIUM AUTOMOBILIŲ NUOMA DRUSKININKUOSE
            </h2>
            <p className="mt-1 lg:mt-2 text-primary-foreground/85 text-xs sm:text-sm">
              Patogus rezervavimas, aiškios kainos ir kokybiški automobiliai kiekvienai kelionei.
            </p>
          </div>
          <div className="mt-4 lg:mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5 text-xs sm:text-sm">
            <Feature icon={<Gem className="h-4 w-4" />} label="Aukščiausios klasės automobiliai" />
            <Feature icon={<MapPin className="h-4 w-4" />} label="Patogus atsiėmimas Druskininkuose" />
            <Feature icon={<Wallet className="h-4 w-4" />} label="Konkurencingos ir skaidrios kainos" />
            <Feature icon={<ShieldCheck className="h-4 w-4" />} label="Pilnas draudimas ir pagalba kelyje" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 h-12 lg:h-14">
        {icon}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </label>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 lg:gap-3 justify-center md:justify-start">
      <span className="inline-flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full bg-primary-foreground/10 border border-primary-foreground/20 flex-shrink-0">
        {icon}
      </span>
      <span className="font-medium leading-tight">{label}</span>
    </div>
  );
}
