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
        {/* Ornament: subtle grain texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
        {/* Ornament: topographic lines + glows on the green blob area */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[45%] select-none overflow-hidden">
          <svg
            viewBox="0 0 400 800"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 h-full w-full stroke-white/15 fill-none opacity-25"
            preserveAspectRatio="none"
          >
            <path d="M-50,100 Q150,50 450,150" strokeWidth="1.5" />
            <path d="M-50,200 Q180,120 450,250" strokeWidth="1.5" />
            <path d="M-50,300 Q200,200 450,350" strokeWidth="1.5" />
            <path d="M-50,400 Q220,300 450,450" strokeWidth="1.5" />
            <path d="M-50,500 Q240,400 450,550" strokeWidth="1.5" />
            <path d="M-50,600 Q260,500 450,650" strokeWidth="1.5" />
            <path d="M-50,700 Q280,600 450,750" strokeWidth="1.5" />
            <path d="M100,150 Q120,130 140,150 T180,170" strokeWidth="0.5" opacity="0.5" />
            <path d="M200,350 Q220,330 240,350 T280,370" strokeWidth="0.5" opacity="0.5" />
          </svg>
          <div className="absolute -right-16 top-0 h-64 w-64 rounded-full bg-carbonus-green/25 blur-[80px]" />
          <div className="absolute bottom-1/4 left-0 h-48 w-48 rounded-full bg-carbonus-green-deep/30 blur-[60px]" />
        </div>
      </div>


      <div className="relative mx-auto max-w-[1320px] px-6 pb-8 lg:pb-14">
        <div className="min-h-[360px] pt-[144px] sm:min-h-[440px] sm:pt-[160px] lg:min-h-[clamp(420px,34vw,540px)] lg:pt-[clamp(160px,calc(5vw+120px),206px)]">


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
    </section>
  );
}

