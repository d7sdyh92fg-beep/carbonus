import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon, MapPin, ArrowRight, Search, Sparkles, Tag, Zap, ShieldCheck, Wallet, LifeBuoy, ChevronDown } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import heroCar from "@/assets/hero-carbonus-suv.png.asset.json";

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatLt = (dateStr: string) =>
  format(new Date(`${dateStr}T12:00:00`), "yyyy-MM-dd", { locale: lt });

function DarkDateField({
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full text-left rounded-xl bg-white/[0.04] border border-white/10 hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors px-4 py-3"
        >
          <div className="text-[11px] text-white/60 mb-1 font-medium">{label}</div>
          <div className="flex items-center gap-2 text-white">
            <CalendarIcon className="h-4 w-4 text-white/70 shrink-0" />
            <span className="font-medium truncate">{formatLt(value)}</span>
            <CalendarIcon className="h-4 w-4 text-white/40 ml-auto" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto z-[80]" align="start">
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
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
  );
}

export function Hero() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const inOne = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [pickup, setPickup] = useState(today);
  const [ret, setRet] = useState(inOne);

  const goToCars = () => {
    const params = new URLSearchParams({ pickup, return: ret, mode: "cars" });
    navigate(`/laisvi-automobiliai?${params.toString()}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const chips = [
    { icon: Sparkles, label: "Nauji automobiliai" },
    { icon: Tag, label: "Skaidrios kainos" },
    { icon: Zap, label: "Greitas rezervavimas" },
  ];

  const benefits = [
    { icon: ShieldCheck, title: "Nemokamas atsiėmimas", sub: "Iki 24 val. prieš paėmimą" },
    { icon: Wallet, title: "Be paslėptų mokesčių", sub: "Kaina, kurią matote – galutinė" },
    { icon: LifeBuoy, title: "24/7 klientų pagalba", sub: "Esame čia, kad padėtume" },
  ];

  return (
    <section className="relative bg-[#0E1512] text-white overflow-hidden">
      {/* Background car image on the right */}
      <div className="absolute inset-0">
        <img
          src={heroCar.url}
          alt="Carbonus – automobilių nuoma Druskininkuose"
          className="absolute inset-y-0 right-0 h-full w-full object-cover object-[70%_center] md:w-[70%] md:object-[center_center]"
        />
        {/* Gradient from left to fade into car */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #0E1512 0%, #0E1512 28%, rgba(14,21,18,0.85) 42%, rgba(14,21,18,0.25) 62%, rgba(14,21,18,0) 80%)",
          }}
        />
        {/* Bottom fade so search bar sits on darker area */}
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-64"
          style={{ background: "linear-gradient(180deg, rgba(14,21,18,0) 0%, #0E1512 85%)" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-8 md:pb-12">
        {/* Content */}
        <div className="max-w-xl">
          <p className="text-[11px] md:text-xs uppercase tracking-[0.22em] text-white/60 mb-5">
            Keliaukite patogiai, mokėkite protingai.
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-bold leading-[1.05] tracking-tight">
            Jūsų kelionė<br />prasideda su<br />
            <span className="text-primary">Carbonus.</span>
          </h1>
          <p className="mt-6 text-white/70 text-base md:text-lg max-w-md">
            Modernūs, patikimi ir ekonomiški automobiliai nuomai Druskininkuose ir visoje Lietuvoje.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {chips.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5 text-xs md:text-[13px] text-white/85"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-7">
            <Button
              onClick={goToCars}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-11 px-6 gap-2 font-semibold"
            >
              Rasti automobilį <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-14 md:mt-20 rounded-2xl bg-[#141C19]/90 backdrop-blur-md border border-white/10 shadow-2xl p-3 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr_1fr_auto] gap-3 items-stretch">
            {/* Location */}
            <button
              type="button"
              className="text-left rounded-xl bg-white/[0.04] border border-white/10 hover:border-primary/50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
            >
              <div className="text-[11px] text-white/60 mb-1 font-medium">Paėmimo vieta</div>
              <div className="flex items-center gap-2 text-white">
                <MapPin className="h-4 w-4 text-white/70 shrink-0" />
                <span className="font-medium">Druskininkai</span>
                <ChevronDown className="h-4 w-4 text-white/40 ml-auto" />
              </div>
            </button>

            <DarkDateField
              label="Paėmimo data"
              value={pickup}
              onChange={(v) => {
                const oldP = new Date(`${pickup}T12:00:00`).getTime();
                const oldR = new Date(`${ret}T12:00:00`).getTime();
                const diffDays = Math.max(1, Math.round((oldR - oldP) / 86400000));
                const newP = new Date(`${v}T12:00:00`);
                const newR = new Date(newP);
                newR.setDate(newR.getDate() + diffDays);
                setPickup(v);
                setRet(toISO(newR));
              }}
            />
            <DarkDateField
              label="Grąžinimo data"
              value={ret}
              onChange={setRet}
              minDate={new Date(`${pickup}T12:00:00`)}
            />

            <Button
              onClick={goToCars}
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-full min-h-[64px] px-6 md:px-8 gap-2 font-semibold text-base"
            >
              Ieškoti automobilių
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Benefits strip inside the widget */}
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 md:divide-x md:divide-white/10">
            {benefits.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-center gap-3 md:px-6 first:md:pl-2 last:md:pr-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white leading-tight">{title}</div>
                  <div className="text-[11px] text-white/55 leading-tight">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
