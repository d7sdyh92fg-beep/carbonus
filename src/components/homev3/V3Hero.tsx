import heroCar from "@/assets/hero-suv-green.png";
import { V3StoreButtons } from "./V3StoreButtons";
import { V3SearchBar } from "./V3SearchBar";

export function V3Hero() {
  return (
    <section className="relative bg-[hsl(210_20%_96%)] pb-24 lg:pb-0">
      <div className="relative mx-auto max-w-[1180px] px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {/* Left copy */}
          <div className="pt-8 lg:pb-40 lg:pt-4">
            <h1 className="max-w-[460px] text-[34px] font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-[42px]">
              Ieškote, kaip sutaupyti
              <br className="hidden sm:block" /> nuomojantis automobilį?
            </h1>
            <div className="mt-5 h-[3px] w-10 rounded-full bg-[hsl(var(--carbonus-green))]" />
            <p className="mt-5 max-w-[400px] text-[14px] leading-relaxed text-muted-foreground">
              Atraskite Carbonus automobilių nuomos pasiūlymus visoje Lietuvoje.
              Rinkitės iš plataus automobilių pasirinkimo ir vietinių akcijų.
            </p>
            <div className="mt-7">
              <V3StoreButtons />
            </div>
          </div>

          {/* Right green card */}
          <div className="relative">
            <div className="relative h-[300px] overflow-hidden rounded-[28px] bg-[hsl(var(--carbonus-green-dark))] sm:h-[400px] lg:h-[480px]">
              {/* tire tread graphic, lower-right */}
              <div
                className="pointer-events-none absolute -bottom-10 right-[-40px] h-[320px] w-[320px] rotate-[28deg] opacity-[0.10]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, #fff 0 14px, transparent 14px 34px)",
                  maskImage:
                    "repeating-linear-gradient(0deg, #000 0 18px, transparent 18px 30px)",
                  WebkitMaskImage:
                    "repeating-linear-gradient(0deg, #000 0 18px, transparent 18px 30px)",
                }}
              />
              {/* decorative dashes, top-left */}
              <div className="pointer-events-none absolute left-8 top-8 grid grid-cols-4 gap-2 opacity-25">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="block h-3 w-[3px] rounded-full bg-white" />
                ))}
              </div>
            </div>

            {/* Car overlapping the left edge */}
            <img
              src={heroCar}
              alt="Carbonus nuomojamas visureigis"
              width={1200}
              height={800}
              className="pointer-events-none absolute left-[-30%] top-1/2 w-[136%] max-w-none -translate-y-[58%] drop-shadow-[0_38px_36px_rgba(0,0,0,0.35)]"
            />
          </div>
        </div>

        {/* Floating search bar */}
        <div className="relative z-10 -mt-8 w-full lg:absolute lg:bottom-[-40px] lg:left-6 lg:right-auto lg:mt-0 lg:w-[720px]">
          <V3SearchBar />
        </div>
      </div>
      <div className="hidden h-[40px] lg:block" />
    </section>
  );
}
