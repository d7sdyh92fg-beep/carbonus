import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/use-translations";
import { Car, Calendar, MapPin, User, ChevronDown, ArrowRight, ShieldCheck, CheckCircle2, Headphones, Gem, Wallet } from "lucide-react";
import { useState } from "react";

type TabKey = "cars" | "suv" | "long" | "transfer";

export function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [tab, setTab] = useState<TabKey>("cars");
  const today = new Date().toISOString().slice(0, 10);
  const inTwo = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const [pickup, setPickup] = useState(today);
  const [ret, setRet] = useState(inTwo);

  const goToCars = () => {
    navigate(`/automobiliai?pickup=${pickup}&return=${ret}`);
    setTimeout(() => window.scrollTo({ top: 300, behavior: "smooth" }), 100);
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "cars", label: "Automobiliai", icon: Car },
    { key: "suv", label: "SUV", icon: Car },
    { key: "long", label: "Ilgesnė nuoma", icon: Calendar },
    { key: "transfer", label: "Pervežimas | oro uostą", icon: ArrowRight },
  ];

  return (
    <section className="dark relative bg-background text-foreground">
      {/* Hero dark area */}
      <div className="relative overflow-hidden">
        {/* Ambient background glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/3 h-[520px] w-[520px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-primary/5 blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-24 md:pb-36">
          {/* Search widget */}
          <div className="rounded-3xl bg-card/95 backdrop-blur-xl border border-border shadow-elegant p-4 sm:p-6">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 items-end">
              <Field label="Paėmimo vieta" icon={<MapPin className="h-4 w-4 text-muted-foreground" />}>
                <input
                  defaultValue="Druskininkai"
                  className="w-full bg-transparent outline-none text-card-foreground font-medium"
                />
              </Field>
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
              <Field label="Vairuotojo amžius" icon={<User className="h-4 w-4 text-muted-foreground" />}>
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium text-card-foreground">21+</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
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
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Aiškios kainos be paslėptų mokesčių</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Nemokamas atšaukimas iki 24 val.</span>
              <span className="inline-flex items-center gap-2"><Headphones className="h-4 w-4 text-primary" /> Klientų aptarnavimas 24/7</span>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-16 md:mt-28 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-primary text-xs font-semibold tracking-[0.2em] uppercase border-b border-primary/60 pb-2 mb-6">
              <MapPin className="h-3.5 w-3.5" />
              Druskininkai
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-foreground">
              KELIAUKITE STILINGAI.<br />
              MĖGAUKITĖS LAISVE.
            </h1>
          </div>
        </div>
      </div>

      {/* Green feature band */}
      <div className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              PREMIUM AUTOMOBILIŲ NUOMA DRUSKININKUOSE
            </h2>
            <p className="mt-3 text-primary-foreground/85 text-sm sm:text-base">
              Patogus rezervavimas, aiškios kainos ir kokybiški automobiliai kiekvienai kelionei.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm sm:text-base">
            <Feature icon={<Gem className="h-5 w-5" />} label="Aukščiausios klasės automobiliai" />
            <Feature icon={<MapPin className="h-5 w-5" />} label="Patogus atsiėmimas Druskininkuose" />
            <Feature icon={<Wallet className="h-5 w-5" />} label="Konkurencingos ir skaidrios kainos" />
            <Feature icon={<ShieldCheck className="h-5 w-5" />} label="Pilnas draudimas ir pagalba kelyje" />
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
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 h-14">
        {icon}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </label>
  );
}

function Feature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 justify-center md:justify-start">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-foreground/10 border border-primary-foreground/20">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </div>
  );
}
