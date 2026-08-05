import heroCar from "@/assets/hero-suv-shadow.jpg";
import { HeroBookingForm } from "./HeroBookingForm";
import { HeroTrustRow } from "./HeroTrustRow";

export function Hero() {
  return (
    <section className="relative bg-white overflow-hidden pt-[110px] pb-14">
      {/* subtle ambient */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-1/4 h-[60vh] w-[60vh] rounded-full bg-[hsl(var(--carbonus-green)/0.10)] blur-[130px]" />
      </div>

      <div className="relative z-10 w-full max-w-[1520px] mx-auto px-6 md:px-12">
        <div className="grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 items-center">
          {/* Left: copy */}
          <div className="max-w-[560px] lg:pb-24">
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


          {/* Right: green panel with real car overflowing it */}
          <div className="relative">
            <div className="relative rounded-[32px] bg-gradient-to-br from-[hsl(var(--carbonus-green))] to-[hsl(var(--carbonus-green-dark))] aspect-[16/11] lg:aspect-[16/12] overflow-visible">
              {/* decorative tyre-track hint */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-[32px] opacity-[0.12]"
                style={{
                  background:
                    "repeating-linear-gradient(115deg, rgba(255,255,255,0.9) 0 2px, transparent 2px 16px)",
                  maskImage: "radial-gradient(120% 80% at 80% 90%, black 0%, transparent 70%)",
                  WebkitMaskImage: "radial-gradient(120% 80% at 80% 90%, black 0%, transparent 70%)",
                }}
              />
              <div className="absolute inset-y-0 -left-[16%] right-[-4%] flex items-center">
                <div className="relative w-full group">
                  <span
                    aria-hidden
                    className="absolute left-[14%] right-[14%] bottom-[10%] h-8 rounded-[50%] blur-2xl bg-black/45"
                  />
                  <img
                    src={heroCar}
                    alt="Carbonus – premium automobilių nuoma"
                    width={1536}
                    height={1024}
                    fetchPriority="high"
                    className="relative w-full h-auto object-contain transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02] drop-shadow-[0_38px_45px_rgba(0,0,0,0.42)]"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Booking bar — centered */}
        <div className="relative z-20 mx-auto -mt-6 lg:-mt-16 lg:max-w-[1180px] rounded-2xl bg-white shadow-[0_24px_70px_rgba(2,18,20,0.14)] border border-[hsl(var(--carbonus-dark))]/[0.05] p-2 lg:p-3">
          <HeroBookingForm />
        </div>

      </div>

      {/* Trust band below hero */}
      <div className="relative z-10 mt-12 border-y border-[hsl(var(--carbonus-dark))]/10 bg-[hsl(var(--carbonus-green-soft))]/60">
        <div className="w-full max-w-[1520px] mx-auto px-6 md:px-12">
          <HeroTrustRow />
        </div>
      </div>
    </section>
  );
}

