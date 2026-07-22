import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar as CalendarIcon, Clock, Search } from "lucide-react";
import { format } from "date-fns";
import { lt as ltLocale, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/hooks/use-translations";

const STORAGE_KEY = "carbonus-hero-search";

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function addDays(base: Date, n: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}
function parseISO(s?: string): Date | undefined {
  if (!s) return undefined;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return undefined;
  return new Date(y, m - 1, d);
}

interface SearchState {
  pickupLocation: string;
  returnLocation: string;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
}

function readInitial(): SearchState {
  if (typeof window !== "undefined") {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      /* ignore */
    }
  }
  const today = new Date();
  return {
    pickupLocation: "druskininkai-office",
    returnLocation: "druskininkai-office",
    pickupDate: isoDate(addDays(today, 1)),
    returnDate: isoDate(addDays(today, 3)),
    pickupTime: "10:00",
    returnTime: "10:00",
  };
}

export function HeroSearchForm() {
  const { t, language } = useTranslations();
  const navigate = useNavigate();
  const [state, setState] = useState<SearchState>(readInitial);
  const dateLocale = language === "lt" ? ltLocale : enUS;

  const update = (patch: Partial<SearchState>) =>
    setState((prev) => ({ ...prev, ...patch }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
    const params = new URLSearchParams({
      pickup: state.pickupDate,
      pickupTime: state.pickupTime,
      return: state.returnDate,
      returnTime: state.returnTime,
      pickupLoc: state.pickupLocation,
      returnLoc: state.returnLocation,
    });
    const base = language === "en" ? "/cars" : "/automobiliai";
    navigate(`${base}?${params.toString()}`);
  };

  // Warm cream outer surface with crisp white inner fields for depth and contrast
  const fieldCls =
    "flex min-h-[70px] flex-col justify-between gap-1 rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-left transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20";
  const labelCls =
    "flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-primary-dark/80";
  const valueCls =
    "h-[22px] text-[15px] font-semibold leading-[22px] text-foreground bg-transparent focus:outline-none";

  const formatDate = (iso: string) =>
    parseISO(iso)
      ? format(parseISO(iso)!, language === "lt" ? "yyyy-MM-dd" : "PPP", {
          locale: dateLocale,
        })
      : "";

  const timeOptions: string[] = [];
  for (let h = 8; h <= 20; h++) {
    for (const m of [0, 30]) {
      timeOptions.push(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
    }
  }

  const showHotelHint =
    state.pickupLocation === "druskininkai-hotel" ||
    state.returnLocation === "druskininkai-hotel";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-white/40 p-3 shadow-[0_24px_70px_rgba(3,25,18,0.24)] backdrop-blur-md sm:p-4"
      style={{ background: "rgba(244, 242, 236, 0.97)" }}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
        {/* Pickup location */}
        <div className={cn(fieldCls, "lg:col-span-3")}>
          <label className={labelCls}>
            <MapPin className="h-3.5 w-3.5" /> {t("hero.form.pickupLocation")}
          </label>
          <select
            className={cn(valueCls, "w-full")}
            value={state.pickupLocation}
            onChange={(e) => update({ pickupLocation: e.target.value })}
          >
            <option value="druskininkai-office">
              {t("hero.form.locationDruskininkai")}
            </option>
            <option value="druskininkai-hotel">
              {t("hero.form.locationHotel")}
            </option>
          </select>
        </div>

        {/* Return location */}
        <div className={cn(fieldCls, "lg:col-span-3")}>
          <label className={labelCls}>
            <MapPin className="h-3.5 w-3.5" /> {t("hero.form.returnLocation")}
          </label>
          <select
            className={cn(valueCls, "w-full")}
            value={state.returnLocation}
            onChange={(e) => update({ returnLocation: e.target.value })}
          >
            <option value="druskininkai-office">
              {t("hero.form.locationDruskininkai")}
            </option>
            <option value="druskininkai-hotel">
              {t("hero.form.locationHotel")}
            </option>
          </select>
        </div>

        {/* Pickup date */}
        <div className={cn(fieldCls, "lg:col-span-2")}>
          <label className={labelCls}>
            <CalendarIcon className="h-3.5 w-3.5" /> {t("hero.form.pickupDate")}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={cn(valueCls, "text-left")}>
                {formatDate(state.pickupDate)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={dateLocale}
                weekStartsOn={1}
                selected={parseISO(state.pickupDate)}
                onSelect={(d) => {
                  if (!d) return;
                  const next: Partial<SearchState> = { pickupDate: isoDate(d) };
                  if (parseISO(state.returnDate)! < d) {
                    next.returnDate = isoDate(addDays(d, 2));
                  }
                  update(next);
                }}
                disabled={{ before: new Date() }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Pickup time */}
        <div className={fieldCls}>
          <label className={labelCls}>
            <Clock className="h-3.5 w-3.5" /> {t("hero.form.pickupTime")}
          </label>
          <select
            className={cn(valueCls, "w-full")}
            value={state.pickupTime}
            onChange={(e) => update({ pickupTime: e.target.value })}
          >
            {timeOptions.map((tm) => (
              <option key={tm} value={tm}>
                {tm}
              </option>
            ))}
          </select>
        </div>

        {/* Return date */}
        <div className={cn(fieldCls, "lg:col-span-2")}>
          <label className={labelCls}>
            <CalendarIcon className="h-3.5 w-3.5" /> {t("hero.form.returnDate")}
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className={cn(valueCls, "text-left")}>
                {formatDate(state.returnDate)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                locale={dateLocale}
                weekStartsOn={1}
                selected={parseISO(state.returnDate)}
                onSelect={(d) => d && update({ returnDate: isoDate(d) })}
                disabled={{ before: parseISO(state.pickupDate) || new Date() }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Return time */}
        <div className={fieldCls}>
          <label className={labelCls}>
            <Clock className="h-3.5 w-3.5" /> {t("hero.form.returnTime")}
          </label>
          <select
            className={cn(valueCls, "w-full")}
            value={state.returnTime}
            onChange={(e) => update({ returnTime: e.target.value })}
          >
            {timeOptions.map((tm) => (
              <option key={tm} value={tm}>
                {tm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showHotelHint && (
        <p className="mt-2 px-1 text-[12px] leading-snug text-primary-dark/70">
          {language === "lt"
            ? "Pristatymo mokestis bus parodytas prieš rezervuojant."
            : "Delivery fee will be shown before you book."}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        variant="hero"
        className="mt-3 h-[52px] w-full gap-2 text-base font-semibold"
      >
        <Search className="h-4 w-4" />
        {t("hero.form.submit")}
      </Button>
    </form>
  );
}
