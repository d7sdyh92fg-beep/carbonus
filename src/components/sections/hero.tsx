import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/use-translations";
import { trackEvent } from "@/lib/analytics";
import { ArrowRight, MapPin } from "lucide-react";
import heroScene from "@/assets/hero-druskininkai.jpg";

export function Hero(_: { carImage?: string }) {
  const navigate = useNavigate();
  const { t, language } = useTranslations();
  const startRef = useRef<HTMLInputElement>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const searchStartedRef = useRef(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    trackEvent("hero_view", { language });
  }, [language]);

  const handleDateChange = (which: "start" | "end", value: string) => {
    if (which === "start") setStart(value);
    else setEnd(value);
    if (!searchStartedRef.current) {
      searchStartedRef.current = true;
      trackEvent("hero_search_started");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end || end <= start) {
      startRef.current?.focus();
      return;
    }
    const days = Math.max(
      1,
      Math.ceil(
        (new Date(end + "T12:00:00").getTime() - new Date(start + "T12:00:00").getTime()) /
          (1000 * 60 * 60 * 24)
      )
    );
    trackEvent("search_availability", { start, end, days });
    const path = language === "en" ? "/cars" : "/automobiliai";
    navigate(`${path}?start=${start}&end=${end}`);
  };

  const scrollToFleet = () => {
    const el = document.getElementById("cars");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative isolate w-full overflow-hidden min-h-[100svh] lg:min-h-[760px] flex flex-col"
      aria-label={t("hero.badge")}
    >
      {/* Full-bleed cinematic background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroScene}
          alt={t("hero.imageAlt")}
          width={1920}
          height={1200}
          fetchPriority="high"
          decoding="async"
          className="w-full h-full object-cover object-center animate-hero-zoom motion-reduce:animate-none"
        />
        {/* Text-side darkening (left) + gentle base darkening for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
      </div>

      {/* Content column */}
      <div className="relative z-10 flex-1 flex items-center pt-24 md:pt-28 pb-40 md:pb-44">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-[640px] space-y-5 md:space-y-7 text-white">
            <span
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-wide text-white/90 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5 opacity-0 animate-hero-in [animation-delay:60ms]"
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden />
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] tracking-tight opacity-0 animate-hero-in [animation-delay:140ms]">
              <span className="block">{t("hero.title1")}</span>
              <span className="block text-primary drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                {t("hero.title2")}
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-white/85 max-w-xl leading-relaxed opacity-0 animate-hero-in [animation-delay:220ms]">
              {t("hero.description")}
            </p>
            <div className="opacity-0 animate-hero-in [animation-delay:300ms]">
              <button
                type="button"
                onClick={scrollToFleet}
                className="group inline-flex items-center gap-1.5 text-sm sm:text-base text-white/90 hover:text-white underline-offset-4 hover:underline transition-colors"
              >
                {t("hero.secondaryCta")}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal glass reservation bar */}
      <div className="relative z-10 pb-6 md:pb-10 opacity-0 animate-hero-in [animation-delay:420ms]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-white/15 bg-black/40 backdrop-blur-md shadow-2xl p-3 sm:p-4"
            aria-label={t("hero.formCta")}
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 md:gap-2 items-end">
              <div className="text-left">
                <Label htmlFor="hero-start" className="text-[11px] uppercase tracking-wide text-white/70 px-1">
                  {t("hero.pickupDate")}
                </Label>
                <Input
                  id="hero-start"
                  ref={startRef}
                  type="date"
                  min={todayStr}
                  value={start}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="mt-1 bg-white/95 border-transparent text-foreground h-11"
                  required
                />
              </div>
              <div className="text-left">
                <Label htmlFor="hero-end" className="text-[11px] uppercase tracking-wide text-white/70 px-1">
                  {t("hero.returnDate")}
                </Label>
                <Input
                  id="hero-end"
                  type="date"
                  min={start || todayStr}
                  value={end}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="mt-1 bg-white/95 border-transparent text-foreground h-11"
                  required
                />
              </div>
              <div className="text-left">
                <Label htmlFor="hero-location" className="text-[11px] uppercase tracking-wide text-white/70 px-1">
                  {t("hero.location")}
                </Label>
                <div className="relative mt-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden />
                  <Input
                    id="hero-location"
                    type="text"
                    defaultValue={t("hero.locationDefault")}
                    readOnly
                    className="bg-white/95 border-transparent text-foreground h-11 pl-9"
                  />
                </div>
              </div>
              <Button type="submit" variant="hero" size="lg" className="h-11 md:h-[46px] w-full md:w-auto md:px-6">
                {t("hero.formCta")}
              </Button>
            </div>
          </form>
          <p className="text-[11px] sm:text-xs text-white/70 text-center mt-3">
            {t("hero.trust")}
          </p>
        </div>
      </div>
    </section>
  );
}
