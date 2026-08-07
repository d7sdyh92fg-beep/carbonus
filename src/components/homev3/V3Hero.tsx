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
  },
  en: {
    eyebrow: "Travel comfortably. Pay smart.",
    title1: "Your journey starts",
    title2: "with Carbonus.",
    description:
      "Modern, reliable and economical rental cars in Druskininkai and all across Lithuania.",
    imageAlt: "Citroën SpaceTourer passenger van rented from Carbonus",
  },
  ru: {
    eyebrow: "Путешествуйте с комфортом. Платите разумно.",
    title1: "Ваше путешествие начинается",
    title2: "с Carbonus.",
    description:
      "Современные, надёжные и экономичные автомобили напрокат в Друскининкай и по всей Литве.",
    imageAlt: "Пассажирский микроавтобус Citroën SpaceTourer в аренду от Carbonus",
  },
} as const;

export function V3Hero() {
  const { language } = useLanguage();
  const c = heroCopy[language] ?? heroCopy.lt;

  return (
    <section className="relative bg-white pt-8 sm:pt-10 lg:pt-[78px]">
      <div className="absolute inset-0 bg-[hsl(210_20%_96%)] lg:bottom-auto lg:h-[612px]" />

      <div className="relative mx-auto max-w-[1140px] px-6 lg:min-h-[660px]">
        <div className="grid gap-10 lg:h-[642px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
          <div className="pt-10 lg:pt-[112px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--carbonus-green-dark))] sm:text-[12px]">
              {c.eyebrow}
            </p>
            <h1 className="mt-6 max-w-[440px] text-[34px] font-extrabold leading-[1.15] tracking-[-0.025em] text-foreground sm:text-[42px]">
              {c.title1}
              <br className="hidden sm:block" /> {c.title2}
            </h1>
            <div className="mt-5 h-[4px] w-10 rounded-full bg-carbonus-green" />
            <p className="mt-5 max-w-[430px] text-[14px] leading-[1.8] text-muted-foreground">
              {c.description}
            </p>
          </div>

          <div className="relative">
            <div className="relative h-[330px] overflow-hidden rounded-[28px] bg-carbonus-green sm:h-[430px] lg:h-[630px] lg:rounded-t-none">
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
              <div className="pointer-events-none absolute left-14 top-10 grid grid-cols-4 gap-2 opacity-25">
                {Array.from({ length: 12 }).map((_, index) => (
                  <span key={index} className="block h-3 w-[3px] rounded-full bg-white" />
                ))}
              </div>
            </div>

            <div className="pointer-events-none absolute left-[-33%] top-1/2 w-[170%] max-w-none -translate-y-[60%]">
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

        <div className="relative z-20 -mt-7 w-full pb-10 lg:absolute lg:bottom-[54px] lg:left-6 lg:mt-0 lg:w-[780px] lg:pb-0">
          <V3SearchBar />
        </div>
      </div>
    </section>
  );
}
