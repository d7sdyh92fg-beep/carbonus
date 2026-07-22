import { Phone, ShieldCheck, MapPin, Headphones, Sparkles } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { HeroMedia } from "./hero-media";
import { HeroSearchForm } from "./hero-search-form";

export function Hero() {
  const { t } = useTranslations();

  // Note: replaced fake "4.9 Google" with a claim we can actually back up.
  const trustItems = [
    { icon: ShieldCheck, label: t("hero.trust.transparent") },
    { icon: MapPin, label: t("hero.trust.local") },
    { icon: Headphones, label: t("hero.trust.support") },
    { icon: Sparkles, label: t("hero.trust.clean") },
  ];

  // Split H1 so we can accent the second line
  const title = t("hero.title") as string;
  const [titleMain, titleAccent] = (() => {
    const marker = t("hero.titleAccent") as string;
    if (marker && title.includes(marker)) {
      return [title.replace(marker, "").trim(), marker];
    }
    return [title, ""];
  })();

  return (
    <section className="relative isolate flex min-h-[720px] items-center overflow-hidden pt-20 pb-10 md:min-h-[760px] md:pt-24 md:pb-14">
      <HeroMedia />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:gap-7 lg:px-8">
        <div className="max-w-[680px] space-y-5 text-white animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-light" />
            {t("hero.eyebrow")}
          </span>

          <h1 className="font-semibold tracking-tight text-white text-[38px] leading-[0.98] sm:text-5xl lg:text-[56px]">
            {titleMain}
            {titleAccent && (
              <span className="mt-[-2px] block text-primary-light font-semibold">
                {titleAccent}
              </span>
            )}
          </h1>

          <p className="max-w-[620px] text-lg leading-relaxed text-white/85 sm:text-xl">
            {t("hero.description")}
          </p>
        </div>

        {/* Search form */}
        <div className="animate-scale-in">
          <HeroSearchForm />
        </div>

        {/* Secondary phone action — subtle ghost link, below the form so it never competes with the CTA */}
        <a
          href="tel:+37060000000"
          className="-mt-1 inline-flex items-center gap-2 self-start text-sm font-medium text-white/85 transition hover:text-white"
        >
          <Phone className="h-4 w-4" />
          <span>
            {t("hero.urgent")}{" "}
            <span className="underline decoration-white/40 underline-offset-4">
              +370 600 00000
            </span>
          </span>
        </a>

        {/* Trust bar — glass capsules with even widths */}
        <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-2.5">
          {trustItems.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-sm font-medium text-white/95 backdrop-blur"
            >
              <Icon className="h-4 w-4 shrink-0 text-primary-light" />
              <span className="whitespace-nowrap">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
