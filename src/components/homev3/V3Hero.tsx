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
          className="h-full w-full object-cover object-[70%_5%] sm:object-[62%_center] lg:object-center"
        />
        {/* Left-side + bottom fade for text legibility */}
        <div className="pointer-events-none absolute inset-0">
          <div className="animate-hero-overlay-sweep-left absolute inset-0 bg-gradient-to-r from-white via-white/95 via-[55%] to-white/25 sm:via-white/92 sm:via-[50%] sm:to-white/10 sm:to-[74%] lg:via-white/90 lg:via-[45%] lg:to-transparent lg:to-[65%]" />
          <div className="animate-hero-overlay-sweep-bottom absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-white via-white/75 via-[30%] to-transparent to-[65%] sm:h-1/2 sm:via-white/60 sm:via-[25%] sm:to-[50%]" />
        </div>
      </div>


      <div className="relative mx-auto max-w-[1320px] px-5 pb-8 sm:px-6 lg:pb-14">
        <div className="hero-content-enter min-h-[300px] pt-[72px] sm:min-h-[400px] sm:pt-[110px] lg:min-h-[clamp(420px,34vw,540px)] lg:pt-[clamp(160px,calc(5vw+120px),206px)]">
          <p className="text-[10px] font-bold uppercase leading-[1.5] tracking-[0.12em] text-[hsl(var(--carbonus-green-dark))] sm:text-[clamp(10px,0.84vw,13px)] sm:tracking-[0.18em]">
            {c.eyebrow}
          </p>
          <h1 className="mt-3 max-w-[320px] text-[30px] font-extrabold leading-[1.12] tracking-[-0.03em] text-foreground sm:mt-6 sm:max-w-none sm:text-[clamp(36px,3.6vw,56px)]">
            {c.title1}
            <br className="hidden sm:block" /> {c.title2}
            <span className="text-carbonus-green">.</span>
          </h1>
          <div className="mt-4 h-[4px] w-10 rounded-full bg-carbonus-green sm:mt-5" />
          <p className="mt-4 max-w-[300px] text-[13px] leading-[1.7] text-muted-foreground sm:mt-5 sm:max-w-[430px] md:max-w-[340px] sm:text-[clamp(13px,0.98vw,16px)] sm:leading-[1.8]">
            {c.description.split(" ").slice(0, 4).join(" ")}
            <br className="hidden md:block lg:hidden" />
            {" "}{c.description.split(" ").slice(4).join(" ")}
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

