import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Shield, Phone } from "lucide-react";
import ctaSuv from "@/assets/cta-suv.png.asset.json";

export function V3AppCta() {
  return (
    <section className="bg-[hsl(210_20%_97%)] px-6 py-24 lg:py-32">
      <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] bg-[hsl(var(--carbonus-dark))] shadow-[0_32px_80px_rgba(6,25,27,0.22)]">
        {/* Decorative gradient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full opacity-[0.18]"
          style={{ background: "radial-gradient(circle, hsl(var(--carbonus-green)) 0%, transparent 70%)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -right-32 h-[520px] w-[520px] rounded-full opacity-[0.10]"
          style={{ background: "radial-gradient(circle, hsl(var(--carbonus-green)) 0%, transparent 70%)" }}
        />

        <div className="relative z-10 grid items-center lg:grid-cols-[1fr_46%]">
          {/* Left content */}
          <div className="px-8 py-14 sm:px-12 lg:px-16 lg:py-20">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">
              <Calendar className="h-3.5 w-3.5" />
              Rezervuokite per 2 minutes
            </div>

            <h2 className="max-w-[520px] text-[32px] font-extrabold leading-[1.1] tracking-[-0.025em] text-white sm:text-[40px] lg:text-[46px]">
              Pasiruošę keliauti? <span className="text-[hsl(var(--carbonus-green))]">Jūsų automobilis laukia.</span>
            </h2>

            <p className="mt-5 max-w-[500px] text-[15px] leading-7 text-white/70 sm:text-[16px]">
              Išsirinkite patikrintą automobilį, užsakykite internetu ir atsiimkite patogiu metu. Visos kainos matomos iš karto.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/automobiliai"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green))] px-7 py-3 text-[14px] font-bold text-[hsl(var(--carbonus-dark))] shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[hsl(var(--carbonus-green-hover))] hover:shadow-[0_16px_34px_rgba(0,0,0,0.22)]"
              >
                Rodyti automobilius
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="tel:+37069818781"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/[0.06] px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
              >
                <Phone className="h-4 w-4" />
                +370 698 18 781
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-white/70">
              <span className="inline-flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
                Pilnas draudimas
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
                Lankstus atšaukimas
              </span>
            </div>
          </div>

          {/* Right car image */}
          <div className="relative hidden items-center justify-center lg:flex lg:min-h-[420px]">
            <div className="absolute bottom-[10%] h-[18%] w-[78%] rounded-[50%] bg-black/40 blur-2xl" />
            <img
              src={ctaSuv.url}
              alt="Premium automobilis nuomai"
              loading="lazy"
              width={800}
              height={500}
              className="relative z-10 w-[108%] max-w-none object-contain drop-shadow-[0_28px_40px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:scale-[1.02] hover:-translate-y-1"
              style={{ transform: "translateX(-4%)" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
