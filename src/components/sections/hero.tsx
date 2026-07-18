import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "@/hooks/use-translations";
import { trackEvent } from "@/lib/analytics";
import hyundaiBayonSide from "@/assets/hyundai-bayon-side-clean.png";

interface HeroProps {
  carImage?: string;
}

export function Hero({ carImage }: HeroProps) {
  const navigate = useNavigate();
  const { t, language } = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  const startRef = useRef<HTMLInputElement>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [highlight, setHighlight] = useState(false);
  const searchStartedRef = useRef(false);

  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    trackEvent("hero_view", { language });
  }, [language]);

  const focusForm = () => {
    trackEvent("click_hero_booking");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlight(true);
    setTimeout(() => {
      startRef.current?.focus();
    }, 400);
    setTimeout(() => setHighlight(false), 1400);
  };

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

  return (
    <section className="relative min-h-[60vh] md:min-h-screen pt-12 md:pt-16 flex items-start md:items-center overflow-hidden bg-transparent md:bg-gradient-to-br md:from-background md:to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10 w-full">
        {/* Left Content */}
        <div className="space-y-6 md:space-y-8 animate-fade-in relative z-10 text-center lg:text-left pt-4 md:pt-0">
          <div className="space-y-4 md:space-y-6">
            <span className="inline-block text-xs sm:text-sm font-medium uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
              {t("hero.badge")}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
              <span className="block text-foreground">{t("hero.title1")}</span>
              <span className="block text-primary">{t("hero.title2")}</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
              {t("hero.description")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Button variant="hero" size="lg" onClick={focusForm}>
              {t("hero.cta")}
            </Button>
          </div>

          {/* Reservation form */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className={`mt-4 rounded-xl border border-border/60 bg-background/70 backdrop-blur-md shadow-lg p-4 sm:p-5 transition-all duration-500 ${
              highlight ? "ring-2 ring-primary/60 shadow-xl" : ""
            }`}
            aria-label={t("hero.formCta")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="text-left">
                <Label htmlFor="hero-start" className="text-xs text-muted-foreground">
                  {t("hero.pickupDate")}
                </Label>
                <Input
                  id="hero-start"
                  ref={startRef}
                  type="date"
                  min={todayStr}
                  value={start}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
              <div className="text-left">
                <Label htmlFor="hero-end" className="text-xs text-muted-foreground">
                  {t("hero.returnDate")}
                </Label>
                <Input
                  id="hero-end"
                  type="date"
                  min={start || todayStr}
                  value={end}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  className="mt-1"
                  required
                />
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full mt-3">
              {t("hero.formCta")}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              {t("hero.trust")}
            </p>
          </form>
        </div>

        {/* Right Content - Car Image */}
        <div className="hidden lg:block relative animate-slide-up -ml-0 lg:-ml-12">
          <div className="absolute inset-0 rounded-full bg-primary/15 blur-[90px] scale-110"></div>
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-3xl scale-125"></div>
          {/* Overlay to soften vehicle side for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-transparent pointer-events-none z-10"></div>

          <div className="relative z-0">
            <img
              src={carImage || hyundaiBayonSide}
              alt="Carbonus Hyundai Bayon – automobilių nuoma Druskininkuose"
              width={1200}
              height={800}
              fetchPriority="high"
              className="w-full max-w-3xl mx-auto object-contain scale-110"
            />
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="hidden lg:block absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
