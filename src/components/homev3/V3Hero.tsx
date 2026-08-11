import { Star } from "lucide-react";
import heroCar from "@/assets/hero-citroen-spacetourer-reference.png";
import plateLogo from "@/assets/carplus-plate-logo.png";
import { V3SearchBar } from "./V3SearchBar";
import { useLanguage } from "@/hooks/use-language";

const heroCopy = {
  lt: {
    eyebrow: "Keliaukite patogiai. Mokėkite protingai.",
    title1: "Jūsų kelionė prasideda",
    title2: "su Carbonus.",
    description:
      "Modernūs, patikimi ir ekonomiški automobiliai nuomai Druskininkuose ir visoje Lietuvoje.",
    imageAlt: "Carbonus nuomojamas Citroën SpaceTourer keleivinis mikroautobusas",
    googleRating: "Google įvertinimas",
  },
  en: {
    eyebrow: "Travel comfortably. Pay smart.",
    title1: "Your journey starts",
    title2: "with Carbonus.",
    description:
      "Modern, reliable and economical rental cars in Druskininkai and all across Lithuania.",
    imageAlt: "Citroën SpaceTourer passenger van rented from Carbonus",
    googleRating: "Google rating",
  },
  ru: {
    eyebrow: "Путешествуйте с комфортом. Платите разумно.",
    title1: "Ваше путешествие начинается",
    title2: "с Carbonus.",
    description:
      "Современные, надёжные и экономичные автомобили напрокат в Друскининкай и по всей Литве.",
    imageAlt: "Пассажирский микроавтобус Citroën SpaceTourer в аренду от Carbonus",
    googleRating: "Рейтинг Google",
  },
} as const;

export function V3Hero() {
  const { language } = useLanguage();
  const c = heroCopy[language] ?? heroCopy.lt;

  return (
    <section className="relative bg-white pt-[96px] sm:pt-[104px] lg:pt-[78px]">
      <div className="absolute inset-0 bg-[hsl(210_20%_96%)] lg:bottom-auto lg:h-[clamp(440px,36.5vw,580px)]" />

      <div className="relative mx-auto max-w-[1320px] px-6 pb-10 lg:min-h-[clamp(480px,40vw,640px)] lg:pb-12">
        <div className="grid gap-8 sm:gap-10 lg:h-[clamp(480px,39.5vw,620px)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.0fr)] lg:items-start">
          <div className="pt-2 sm:pt-6 lg:pt-[clamp(72px,7.8vw,122px)]">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--carbonus-green-dark))] sm:text-[clamp(10px,0.84vw,13px)] sm:tracking-[0.18em]">
              {c.eyebrow}
            </p>
            <h1 className="mt-4 max-w-[440px] text-[30px] font-extrabold leading-[1.15] tracking-[-0.025em] text-foreground sm:mt-6 sm:text-[clamp(30px,2.92vw,46px)]">
              {c.title1}
              <br className="hidden sm:block" /> {c.title2}
            </h1>
            <div className="mt-4 h-[4px] w-10 rounded-full bg-carbonus-green sm:mt-5" />
            <p className="mt-4 max-w-[430px] text-[14px] leading-[1.75] text-muted-foreground sm:mt-5 sm:text-[clamp(13px,0.98vw,16px)] sm:leading-[1.8]">
              {c.description}
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="relative h-[220px] overflow-hidden rounded-[24px] bg-carbonus-green sm:h-[360px] sm:rounded-[28px] lg:h-[clamp(460px,37.5vw,600px)] lg:rounded-t-none">

              <div
                className="pointer-events-none absolute -bottom-10 right-[-45px] h-[380px] w-[380px] rotate-[28deg] opacity-[0.12]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #fff 0 14px, transparent 14px 34px)",
                  maskImage:
                    "repeating-linear-gradient(0deg, #000 0 18px, transparent 18px 30px)",
                  WebkitMaskImage:
                    "repeating-linear-gradient(0deg, #000 0 18px, transparent 18px 30px)",
                }}
              />
              <div className="pointer-events-none absolute left-6 top-6 grid grid-cols-4 gap-2 opacity-25 sm:left-14 sm:top-10">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span key={index} className="block h-3 w-[3px] rounded-full bg-white" />
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute left-0 top-1/2 w-full max-w-none -translate-y-1/2 scale-[7.25] lg:left-[-5%] lg:w-[110%] lg:-translate-y-[56%] lg:scale-[7.20] xl:left-[-10%] xl:w-[120%] xl:-translate-y-[58%] xl:scale-[7.16]">
              <span
                aria-hidden="true"
                className="absolute bottom-[13%] left-[17%] z-0 h-[10%] w-[69%] rounded-full bg-black/35 blur-[18px]"
              />
              <img
                src={heroCar}
                alt={c.imageAlt}
                width={1280}
                height={720}
                className="relative z-10 w-full"
              />
              <span
                aria-hidden="true"
                className="absolute left-[19.35%] top-[62.8%] z-20 flex h-[5.15%] w-[10.1%] items-center justify-center overflow-hidden bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),inset_0_-1px_2px_rgba(20,28,23,0.13),0_2px_3px_rgba(0,0,0,0.12)]"
                style={{
                  clipPath: "polygon(1% 0, 100% 9%, 96% 100%, 0 87%)",
                  transform: "perspective(220px) rotateY(11deg) rotateZ(1.6deg) skewY(0.7deg)",
                  transformOrigin: "left center",
                }}
              >
                <img
                  src={plateLogo}
                  alt=""
                  className="h-[76%] w-[78%] object-contain opacity-95"
                />
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-20 mt-4 w-full pb-8 sm:mt-6 lg:absolute lg:bottom-[clamp(14px,1.6vw,28px)] lg:left-6 lg:mt-0 lg:w-[clamp(640px,54vw,850px)] lg:pb-0">
          <V3SearchBar />
          <a
            href="https://www.google.com/maps/search/?api=1&query=Carbonus+Druskininkai"
            target="_blank"
            rel="noreferrer"
            className="mt-1.5 inline-flex items-center gap-2 rounded-full px-1 py-1 text-[12px] font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbonus-green focus-visible:ring-offset-2"
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
