import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/use-translations";
import { Car, Calendar as CalendarIcon, MapPin, ArrowRight, Gem, CalendarClock, Hotel, LifeBuoy } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import heroCar from "@/assets/hero-spacetourer.png.asset.json";

type TabKey = "cars" | "long" | "hotel";

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatLt = (dateStr: string) => {
  return format(new Date(`${dateStr}T12:00:00`), "yyyy 'm.' MMMM d 'd.'", { locale: lt });
};

function DateField({
  label,
  value,
  onChange,
  minDate,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selected = new Date(`${value}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ?? today;
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 h-12 lg:h-14 w-full text-left transition-colors hover:bg-background/70 hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
            )}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="flex-1 min-w-0 truncate text-card-foreground font-medium">
              {formatLt(value)}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 pointer-events-auto z-[80]" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => {
              if (d) {
                onChange(toISO(d));
                setOpen(false);
              }
            }}
            disabled={(d) => d < min}
            initialFocus
            locale={lt}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </label>
  );
}

export function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [tab, setTab] = useState<TabKey>("cars");
  const today = new Date().toISOString().slice(0, 10);
  const inTwo = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
  const [pickup, setPickup] = useState(today);
  const [ret, setRet] = useState(inTwo);
  const [hotel, setHotel] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");

  const goToCars = () => {
    const params = new URLSearchParams({ pickup, return: ret, mode: tab });
    if (tab === "hotel" && hotel) params.set("hotel", hotel);
    if (tab === "hotel" && deliveryCity) params.set("city", deliveryCity);
    navigate(`/automobiliai?${params.toString()}`);
    setTimeout(() => window.scrollTo({ top: 300, behavior: "smooth" }), 100);
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "cars", label: "Automobiliai", icon: Car },
    { key: "long", label: "Ilgesnė nuoma", icon: CalendarClock },
    { key: "hotel", label: "Pristatymas Lietuvoje", icon: Hotel },
  ];

  const showHotel = tab === "hotel";

  return (
    <section className="relative bg-[hsl(220_27%_8%)] text-white min-h-[100svh] lg:h-[100svh] flex flex-col overflow-hidden">
      {/* Hero fills remaining space */}
      <div className="relative flex-1 flex flex-col overflow-hidden min-h-[560px]">
        {/* Background car image — object-position tuned per breakpoint so the vehicle stays visible on the right */}
        <img
          src={heroCar.url}
          alt="Premium automobilių nuoma Druskininkuose"
          width={1920}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover opacity-100 object-[82%_65%] sm:object-[80%_60%] md:object-[78%_center] lg:object-[72%_center] xl:object-[68%_center] 2xl:object-[68%_center]"
          style={{ filter: "brightness(1.08) contrast(1.06) saturate(1.08)" }}
        />
        {/* Directional overlay — darker on the left where text sits, near-clear on the right so the vehicle stays bright */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(4,15,11,0.52) 0%, rgba(4,15,11,0.28) 42%, rgba(4,15,11,0.08) 74%, rgba(4,15,11,0.12) 100%)",
          }}
        />
        {/* Ambient background glows */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/3 h-[45vh] w-[45vh] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[40vh] w-[40vh] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute top-1/2 -left-24 h-[30vh] w-[30vh] rounded-full bg-primary/5 blur-[90px]" />
        </div>

        <div className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-[calc(5rem+2vh)] pb-[3vh]">
          {/* Search widget — absolute on mobile so it can grow without pushing the background */}
          <div className="absolute max-md:top-[calc(5rem+2vh)] max-md:left-4 max-md:right-4 max-md:z-20 lg:static rounded-3xl bg-white shadow-elegant p-4 sm:p-4 lg:p-5 w-full lg:mt-5">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-3 lg:mb-4">
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
                <Field label="Miestas arba adresas" icon={<MapPin className="h-4 w-4 text-muted-foreground" />}>
                  <input
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    placeholder="Pvz. Vilnius, Gedimino pr. 5"
                    className="w-full h-full bg-transparent outline-none text-card-foreground font-medium placeholder:text-muted-foreground"
                  />
                </Field>
              )}
              <DateField label="Paėmimo data" value={pickup} onChange={setPickup} />
              <DateField
                label="Grąžinimo data"
                value={ret}
                onChange={setRet}
                minDate={new Date(`${pickup}T12:00:00`)}
              />
              <div className="flex flex-col">
                <span aria-hidden="true" className="block text-xs font-medium mb-1.5 invisible select-none">.</span>
                <Button
                  variant="hero"
                  size="lg"
                  onClick={goToCars}
                  className="h-12 lg:h-14 rounded-xl w-full justify-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                >
                  Rodyti automobilius
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showHotel && (
              <div className="mt-3 text-xs sm:text-sm text-muted-foreground inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Pristatome visoje Lietuvoje. Pristatymo kaina bus parodyta prieš rezervuojant.
              </div>
            )}
          </div>

          {/* Tagline — absolute at bottom on mobile so it stays anchored while the form grows */}
          <div className="absolute max-md:bottom-[3vh] max-md:left-4 max-md:right-4 max-md:z-10 lg:static lg:mt-auto lg:pt-[4vh] lg:mb-32 lg:mb-40 w-full lg:px-4 sm:lg:px-5 lg:px-6 lg:relative top-[20px] lg:-top-[30px]">
            <div className="inline-flex items-center gap-2 text-white text-xs sm:text-sm font-bold tracking-[0.22em] uppercase border-b-2 border-primary pb-2 mb-3 lg:mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <MapPin className="h-4 w-4 text-primary" />
              Druskininkai
            </div>
            <h1
              className="hero-title font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]"
              style={{
                maxWidth: "clamp(300px, 72vw, 640px)",
                fontSize: "clamp(30px, 7vw, 58px)",
                lineHeight: 1.05,
              }}
            >
              <span className="block whitespace-nowrap">KELIAUKITE STILINGAI.</span>
              <span className="block whitespace-nowrap">MĖGAUKITĖS LAISVE.</span>
            </h1>

          </div>

        </div>
      </div>

      {/* Green feature band — more spacing, last item aligned with the booking button */}
      <div className="bg-primary-dark text-primary-foreground flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-5 lg:py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-8 text-[11px] md:text-[11px] lg:text-[13px] xl:text-sm">
            <Feature icon={<Gem className="h-3 w-3 md:h-3.5 md:w-3.5" />} label="Prižiūrėti automobiliai" />
            <Feature icon={<MapPin className="h-3 w-3 md:h-3.5 md:w-3.5" />} label="Atsiėmimas Druskininkuose" />
            <Feature icon={<Hotel className="h-3 w-3 md:h-3.5 md:w-3.5" />} label="Pristatymas visoje Lietuvoje" />
            <Feature icon={<LifeBuoy className="h-3 w-3 md:h-3.5 md:w-3.5" />} label="Pagalba nuomos metu" />
          </div>
        </div>
      </div>

    </section>
  );
}

function Field({ label, icon, hint, children, inputRef }: { label: string; icon: React.ReactNode; hint?: string; children: React.ReactNode; inputRef?: React.RefObject<HTMLInputElement> }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 h-12 lg:h-14 cursor-pointer" onClick={() => inputRef?.current?.focus()}>
        {icon}
        <div className="flex-1 min-w-0 relative h-full flex items-center">{children}</div>
      </div>
      {hint && (
        <span className="mt-1 block text-[11px] text-muted-foreground/80">{hint}</span>
      )}
    </label>
  );
}

function Feature({ icon, label, className }: { icon: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={`flex items-center gap-1.5 md:gap-2 justify-center min-w-0 ${className || ""}`}>
      <span className="inline-flex h-5 w-5 md:h-7 md:w-7 items-center justify-center rounded-full bg-primary-foreground/10 border border-primary-foreground/20 flex-shrink-0">
        {icon}
      </span>
      <span className="font-medium whitespace-nowrap truncate">{label}</span>
    </div>
  );
}
