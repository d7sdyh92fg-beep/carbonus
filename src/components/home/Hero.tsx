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


          {/* Right: car with natural shadow */}
          <div className="relative">
            <div className="relative group">
              <img
                src={heroCar}
                alt="Carbonus – premium automobilių nuoma"
                width={1536}
                height={1024}
                fetchPriority="high"
                className="w-full h-auto object-contain transition-transform duration-700 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02]"
              />
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

