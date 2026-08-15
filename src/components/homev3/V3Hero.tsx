import { Star } from "lucide-react";
import heroAsset from "@/assets/hero-spacetourer-road.png.asset.json";
import { V3SearchBar } from "./V3SearchBar";
import { useLanguage } from "@/hooks/use-language";

const heroCopy = {
  lt: {
    eyebrow: "Keliaukite patogiai. Mokėkite protingai.",
    title1: "Jūsų kelionė prasideda",
    title2: "su Carbonus",
    description:
      "Modernūs, patikimi ir ekonomiški automobiliai nuomai Druskininkuose ir visoje Lietuvoje.",
    imageAlt: "Carbonus nuomojamas Citroën SpaceTourer keleivinis mikroautobusas prie ežero",
    googleRating: "Google įvertinimas",
  },
  en: {
    eyebrow: "Travel comfortably. Pay smart.",
    title1: "Your journey starts",
    title2: "with Carbonus",
    description:
      "Modern, reliable and economical rental cars in Druskininkai and all across Lithuania.",
    imageAlt: "Citroën SpaceTourer passenger van rented from Carbonus by a lake",
    googleRating: "Google rating",
  },
  ru: {
    eyebrow: "Путешествуйте с комфортом. Платите разумно.",
    title1: "Ваше путешествие начинается",
    title2: "с Carbonus",
    description:
      "Современные, надёжные и экономичные автомобили напрокат в Друскининкай и по всей Литве.",
    imageAlt: "Пассажирский микроавтобус Citroën SpaceTourer в аренду от Carbonus у озера",
    googleRating: "Рейтинг Google",
  },
} as const;

export function V3Hero() {
  const { language } = useLanguage();
  const c = heroCopy[language] ?? heroCopy.lt;

  return (
    <section className="relative bg-white pt-[92px] sm:pt-[100px] lg:pt-[72px]">
      {/* Background photo */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroAsset.url}
          alt={c.imageAlt}
          className="h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent sm:via-white/70 lg:from-white lg:via-white/55 lg:to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1320px] px-6 pb-8 lg:pb-14">
        <div className="min-h-[360px] pt-6 sm:min-h-[440px] sm:pt-10 lg:min-h-[clamp(420px,34vw,540px)] lg:pt-[clamp(40px,5vw,86px)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--carbonus-green-dark))] sm:text-[clamp(10px,0.84vw,13px)] sm:tracking-[0.18em]">
            {c.eyebrow}
          </p>
          <h1 className="mt-4 max-w-[420px] text-[32px] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground sm:mt-6 sm:text-[clamp(36px,3.6vw,56px)]">
            {c.title1}
            <br className="hidden sm:block" /> {c.title2}
            <span className="text-carbonus-green">.</span>
          </h1>
          <div className="mt-4 h-[4px] w-10 rounded-full bg-carbonus-green sm:mt-5" />
          <p className="mt-4 max-w-[430px] text-[14px] leading-[1.75] text-muted-foreground sm:mt-5 sm:text-[clamp(13px,0.98vw,16px)] sm:leading-[1.8]">
            {c.description}
          </p>
        </div>

        <div className="relative z-20 mt-6 w-full lg:mt-10 lg:w-[clamp(680px,58vw,900px)]">
          <V3SearchBar />
          <a
            href="https://www.google.com/maps/search/?api=1&query=Carbonus+Druskininkai"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-2 rounded-full px-1 py-1 text-[12px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbonus-green focus-visible:ring-offset-2"
          >
            <span className="flex items-center gap-[2px]" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-carbonus-green text-carbonus-green" />
              ))}
            </span>
            <span className="font-bold text-foreground">5.0</span>
            <span>{c.googleRating}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
