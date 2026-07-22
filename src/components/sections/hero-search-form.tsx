import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar as CalendarIcon, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";

const STORAGE_KEY = "carbonus-hero-search";

function todayISO(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
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
  return {
    pickupLocation: "druskininkai-office",
    returnLocation: "druskininkai-office",
    pickupDate: todayISO(1),
    returnDate: todayISO(3),
    pickupTime: "10:00",
    returnTime: "10:00",
  };
}

export function HeroSearchForm() {
  const { t, language } = useTranslations();
  const navigate = useNavigate();
  const [state, setState] = useState<SearchState>(readInitial);

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

  const inputCls =
    "w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none";
  const fieldCls =
    "flex flex-col gap-1 rounded-xl border border-border/60 bg-background/95 px-4 py-3 text-left transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20";
  const labelCls =
    "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-white/20 bg-background/85 p-3 shadow-2xl backdrop-blur-xl sm:p-4"
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
        {/* Pickup location */}
        <div className={`${fieldCls} lg:col-span-3`}>
          <label className={labelCls}>
            <MapPin className="h-3 w-3" /> {t("hero.form.pickupLocation")}
          </label>
          <select
            className={inputCls}
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
        <div className={`${fieldCls} lg:col-span-3`}>
          <label className={labelCls}>
            <MapPin className="h-3 w-3" /> {t("hero.form.returnLocation")}
          </label>
          <select
            className={inputCls}
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
        <div className={`${fieldCls} lg:col-span-2`}>
          <label className={labelCls}>
            <CalendarIcon className="h-3 w-3" /> {t("hero.form.pickupDate")}
          </label>
          <input
            type="date"
            className={inputCls}
            value={state.pickupDate}
            min={todayISO()}
            onChange={(e) => update({ pickupDate: e.target.value })}
          />
        </div>

        {/* Pickup time */}
        <div className={fieldCls}>
          <label className={labelCls}>
            <Clock className="h-3 w-3" /> {t("hero.form.pickupTime")}
          </label>
          <input
            type="time"
            className={inputCls}
            step={900}
            value={state.pickupTime}
            onChange={(e) => update({ pickupTime: e.target.value })}
          />
        </div>

        {/* Return date */}
        <div className={`${fieldCls} lg:col-span-2`}>
          <label className={labelCls}>
            <CalendarIcon className="h-3 w-3" /> {t("hero.form.returnDate")}
          </label>
          <input
            type="date"
            className={inputCls}
            value={state.returnDate}
            min={state.pickupDate || todayISO()}
            onChange={(e) => update({ returnDate: e.target.value })}
          />
        </div>

        {/* Return time */}
        <div className={fieldCls}>
          <label className={labelCls}>
            <Clock className="h-3 w-3" /> {t("hero.form.returnTime")}
          </label>
          <input
            type="time"
            className={inputCls}
            step={900}
            value={state.returnTime}
            onChange={(e) => update({ returnTime: e.target.value })}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        variant="hero"
        className="mt-3 w-full gap-2 text-base"
      >
        <Search className="h-4 w-4" />
        {t("hero.form.submit")}
      </Button>
    </form>
  );
}
