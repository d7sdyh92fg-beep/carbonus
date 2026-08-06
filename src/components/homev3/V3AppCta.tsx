import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Shield, Phone, Check } from "lucide-react";
import ctaSuv from "@/assets/cta-suv.png.asset.json";

export function V3AppCta() {
  return (
    <section className="overflow-hidden bg-[hsl(210_20%_97%)] px-6 py-20 lg:py-28">
      <div className="relative mx-auto grid max-w-[1280px] items-center overflow-hidden rounded-[32px] bg-white shadow-[0_24px_70px_rgba(2,18,20,0.10)] lg:grid-cols-[1fr_1.05fr]">
        {/* Left: content */}
        <div className="px-8 py-12 sm:px-12 lg:px-16 lg:py-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[hsl(var(--carbonus-green-dark))]">
            Pasiruoškite kelionei
          </p>

          <h2 className="mt-4 max-w-[460px] text-[28px] font-extrabold leading-[1.15] tracking-[-0.02em] text-[hsl(var(--carbonus-dark))] sm:text-[36px] lg:text-[42px]">
            Jūsų automobilis laukia jau dabar
          </h2>

          <div className="mt-5 h-[4px] w-10 rounded-full bg-[hsl(var(--carbonus-green))]" />

          <p className="mt-5 max-w-[470px] text-[15px] leading-[1.75] text-[hsl(var(--carbonus-dark))]/70">
            Išsirinkite patikrintą automobilį, užsakykite internetu ir atsiimkite patogiu metu. Visos kainos matomos iš karto, be paslėptų mokesčių.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/automobiliai"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green))] px-7 py-3 text-[14px] font-bold text-[hsl(var(--carbonus-dark))] shadow-[0_12px_28px_rgba(2,18,20,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[hsl(var(--carbonus-green-hover))] hover:shadow-[0_16px_34px_rgba(2,18,20,0.18)]"
            >
              Rodyti automobilius
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:+37069818781"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--carbonus-dark))]/15 bg-white px-6 py-3 text-[14px] font-bold text-[hsl(var(--carbonus-dark))] shadow-[0_4px_14px_rgba(2,18,20,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[hsl(var(--carbonus-green-soft))]/30 hover:border-[hsl(var(--carbonus-green))]/30"
            >
              <Phone className="h-4 w-4" />
              +370 698 18 781
            </a>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-[hsl(var(--carbonus-dark))]/70">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
              Pilnas draudimas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
              Lankstus atšaukimas
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
              24/7 pagalba kelyje
            </span>
          </div>
        </div>

        {/* Right: green card with car */}
        <div className="relative hidden items-center justify-center overflow-hidden bg-[hsl(var(--carbonus-green))] lg:flex lg:min-h-[460px]">
          {/* Decorative tire tread pattern */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -right-16 h-[280px] w-[280px] rotate-[28deg] opacity-[0.12]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, #fff 0 14px, transparent 14px 34px)",
              maskImage:
                "repeating-linear-gradient(0deg, #000 0 18px, transparent 18px 30px)",
              WebkitMaskImage:
                "repeating-linear-gradient(0deg, #000 0 18px, transparent 18px 30px)",
            }}
          />
          {/* Decorative vertical dashes */}
          <div aria-hidden className="pointer-events-none absolute left-8 top-10 grid grid-cols-4 gap-2 opacity-25">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="block h-3 w-[3px] rounded-full bg-white" />
            ))}
          </div>

          {/* Car shadow */}
          <span
            aria-hidden
            className="absolute bottom-[16%] left-[12%] right-[12%] h-[9%] rounded-full bg-black/35 blur-[18px]"
          />
          <img
            src={ctaSuv.url}
            alt="Premium automobilis nuomai"
            loading="lazy"
            width={800}
            height={500}
            className="relative z-10 w-[108%] max-w-none object-contain drop-shadow-[0_28px_40px_rgba(0,0,0,0.30)] transition-transform duration-500 hover:scale-[1.02] hover:-translate-y-1"
            style={{ transform: "translateX(-4%)" }}
          />
        </div>
      </div>
    </section>
  );
}
