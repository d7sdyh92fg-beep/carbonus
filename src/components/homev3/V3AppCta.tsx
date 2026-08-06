import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import ctaCar from "@/assets/car-mustang.jpg";

export function V3AppCta() {
  return (
    <section className="bg-white px-6 py-20 lg:py-28">
      <div className="relative mx-auto grid max-w-[1280px] items-center overflow-hidden rounded-[32px] bg-[hsl(210_20%_97%)] shadow-[0_24px_70px_rgba(2,18,20,0.10)] lg:grid-cols-[1.15fr_1fr]">
        {/* Left: car image */}
        <div className="relative h-[300px] overflow-hidden sm:h-[360px] lg:h-[420px]">
          <img
            src={ctaCar}
            alt="Premium automobilis nuomai"
            loading="lazy"
            width={900}
            height={600}
            className="h-full w-full object-cover object-center"
          />
          {/* Subtle gradient overlay on the right edge blending into green panel */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-transparent to-[hsl(var(--carbonus-green-dark))] lg:block"
          />
        </div>

        {/* Right: green content panel */}
        <div className="bg-[hsl(var(--carbonus-green-dark))] px-8 py-12 sm:px-12 lg:px-14 lg:py-16">
          <h2 className="max-w-[360px] text-[30px] font-extrabold leading-[1.1] tracking-[-0.02em] text-white sm:text-[38px] lg:text-[44px]">
            Pasiruošę kelionei?
          </h2>

          <p className="mt-4 max-w-[360px] text-[15px] leading-[1.65] text-white/85 sm:text-[16px]">
            Užsakykite automobilį jau dabar.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/automobiliai"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-7 py-3 text-[14px] font-bold text-[hsl(var(--carbonus-dark))] shadow-[0_12px_28px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
            >
              Rodyti automobilius
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <a
              href="tel:+37069818781"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <Phone className="h-4 w-4" />
              +370 698 18 781
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
