import heroCar from "@/assets/hero-suv-green.png";
import { HeroBookingForm } from "./HeroBookingForm";
import { HeroTrustRow } from "./HeroTrustRow";

export function Hero() {
  return (
    <section className="relative bg-[hsl(210_20%_97%)] overflow-hidden pt-[78px] pb-16">
      <div className="relative z-10 w-full max-w-[1520px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-14 items-start">
          {/* Left: copy */}
          <div className="max-w-[560px] lg:pb-28">
            <div className="text-[12px] font-semibold uppercase tracking-[0.13em] text-[hsl(var(--carbonus-green-dark))] mb-10">
              Keliaukite patogiai. Mokėkite protingai.
            </div>
            <h1
              className="font-extrabold text-[hsl(var(--carbonus-dark))]"
              style={{ fontSize: "clamp(30px, 3.2vw, 46px)", lineHeight: 1.08, letterSpacing: "-0.02em", fontWeight: 800 }}
            >
              <span className="block">Jūsų kelionė prasideda</span>
              <span className="block">su <span className="text-[hsl(var(--carbonus-green-dark))]">Carbonus.</span></span>
            </h1>
            <p className="mt-10 text-[hsl(var(--carbonus-dark))]/70 text-base leading-[1.65] max-w-[470px]">
              Modernūs, patikimi ir ekonomiški automobiliai nuomai Druskininkuose ir visoje Lietuvoje.
            </p>
          </div>

          {/* Right: green card with the SUV layered in front */}
          <div className="relative lg:pb-24">
            <div className="relative rounded-[28px] bg-[hsl(var(--carbonus-green))] aspect-[16/11] lg:aspect-[16/10.5]">
              {/* tire tread graphic, lower-right */}
              <div
                aria-hidden
                className="absolute bottom-0 right-0 w-[46%] h-[52%] rounded-br-[28px] opacity-[0.10]"
                style={{
                  background:
                    "repeating-linear-gradient(115deg, #fff 0 3px, transparent 3px 14px), repeating-linear-gradient(25deg, #fff 0 2px, transparent 2px 22px)",
                }}
              />
              {/* small vertical dashes, top-left */}
              <div aria-hidden className="absolute top-8 left-8 flex gap-2 opacity-[0.18]">
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="block w-[3px] h-7 rounded-full bg-white" />
                ))}
              </div>

              {/* SUV extending past the left edge */}
              <div className="absolute inset-y-0 -left-[18%] right-[2%] flex items-center">
                <div className="relative w-full">
                  <span
                    aria-hidden
                    className="absolute left-[12%] right-[12%] bottom-[14%] h-9 rounded-[50%] blur-2xl bg-black/50"
                  />
                  <img
                    src={heroCar}
                    alt="Carbonus – premium visureigio nuoma"
                    width={1536}
                    height={1024}
                    fetchPriority="high"
                    className="relative w-full h-auto object-contain drop-shadow-[0_34px_40px_rgba(0,0,0,0.38)]"
                  />
                </div>
              </div>
            </div>

            {/* Floating white search bar overlapping the lower-left of the card */}
            <div className="relative z-20 -mt-10 lg:absolute lg:bottom-6 lg:-left-[34%] lg:right-[10%] lg:mt-0 rounded-[22px] bg-white shadow-[0_24px_70px_rgba(2,18,20,0.14)] p-2 lg:p-3">
              <HeroBookingForm />
            </div>
          </div>
        </div>
      </div>

      {/* Trust band below hero */}
      <div className="relative z-10 mt-16 lg:mt-24 border-y border-[hsl(var(--carbonus-dark))]/10 bg-white">
        <div className="w-full max-w-[1520px] mx-auto px-6 md:px-12">
          <HeroTrustRow />
        </div>
      </div>
    </section>
  );
}


