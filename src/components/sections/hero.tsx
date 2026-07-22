import { Phone, ShieldCheck, MapPin, Headphones, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import { HeroMedia } from "./hero-media";
import { HeroSearchForm } from "./hero-search-form";

export function Hero() {
  const { t } = useTranslations();

  const trustItems = [
    { icon: ShieldCheck, label: t("hero.trust.transparent") },
    { icon: MapPin, label: t("hero.trust.local") },
    { icon: Headphones, label: t("hero.trust.support") },
    { icon: Star, label: t("hero.trust.rating") },
  ];

  return (
    <section className="relative isolate flex min-h-[92vh] items-center overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      <HeroMedia />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6 text-white animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
            {t("hero.eyebrow")}
          </span>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="max-w-2xl text-lg text-white/85 sm:text-xl">
            {t("hero.description")}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="gap-2 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <a href="tel:+37060000000">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("hero.urgent")}{" "}
                </span>
                {t("hero.urgentCta")}
              </a>
            </Button>
          </div>
        </div>

        {/* Search form */}
        <div className="animate-scale-in">
          <HeroSearchForm />
        </div>

        {/* Trust bar */}
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-white/85">
          {trustItems.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary-light" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
