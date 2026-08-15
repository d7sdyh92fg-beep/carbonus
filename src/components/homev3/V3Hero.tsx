import { Star } from "lucide-react";
import heroAsset from "@/assets/hero-spacetourer-lake.png.asset.json";
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
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={heroAsset.url}
          alt={c.imageAlt}
          className="h-full w-full object-cover object-center"
        />
        {/* Ornaments on the green blob */}
        <svg
          className="pointer-events-none absolute right-0 top-0 hidden h-[88%] w-[30%] md:block"
          viewBox="0 0 300 500"
          fill="none"
          preserveAspectRatio="xMaxYMin slice"
          aria-hidden="true"
        >
          <defs>
            <path
              id="hero-petal"
              d="M0 6C0 2.7 2.7 0 6 0h30c14 0 24 10 24 23 0 12-8 21-19 24L7 58C3 59 0 56 0 52V6z"
            />
          </defs>
          <g stroke="white" strokeOpacity="0.45" strokeWidth="3.5" fill="none">
            {[
              { x: 30, y: 40, s: 0.75, r: -18, d: 0.15 },
              { x: 130, y: 20, s: 0.6, r: 24, d: 0.35 },
              { x: 215, y: 60, s: 0.85, r: -8, d: 0.5 },
              { x: 75, y: 130, s: 0.55, r: 40, d: 0.7 },
              { x: 175, y: 155, s: 0.7, r: -30, d: 0.9 },
              { x: 255, y: 200, s: 0.5, r: 12, d: 1.1 },
              { x: 40, y: 235, s: 0.65, r: -50, d: 1.25 },
              { x: 150, y: 285, s: 0.8, r: 18, d: 1.4 },
              { x: 240, y: 345, s: 0.6, r: -22, d: 1.6 },
              { x: 90, y: 380, s: 0.5, r: 60, d: 1.8 },
            ].map((o, i) => (
              <use
                key={i}
                href="#hero-petal"
                className="hero-ornament"
                transform={`translate(${o.x} ${o.y}) rotate(${o.r}) scale(${o.s})`}
                style={{ animationDelay: `${o.d}s, ${o.d + 0.9}s` }}
              />
            ))}
          </g>
        </svg>

        {/* Left-side + bottom fade for text legibility */}
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-hero-overlay-sweep-left absolute inset-0 bg-gradient-to-r from-white via-white/90 via-[45%] to-transparent to-[65%]" />
          <div className="animate-hero-overlay-sweep-bottom absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white via-white/60 via-[25%] to-transparent to-[50%]" />
        </div>

      </div>


      <div className="relative mx-auto max-w-[1320px] px-6 pb-8 lg:pb-14">
        <div className="hero-content-enter min-h-[360px] pt-[144px] sm:min-h-[440px] sm:pt-[160px] lg:min-h-[clamp(420px,34vw,540px)] lg:pt-[clamp(160px,calc(5vw+120px),206px)]">
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

          <div className="relative z-20 mt-6 w-full translate-y-5 lg:mt-10 lg:w-[clamp(680px,58vw,900px)]">
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
      </div>
    </section>
  );
}

