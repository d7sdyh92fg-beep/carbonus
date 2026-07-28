import { ShieldCheck, BadgeDollarSign, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/carbonus-hero.png.asset.json";
import { HeroBookingForm } from "./HeroBookingForm";
import { HeroTrustRow } from "./HeroTrustRow";

const miniFeatures = [
  { icon: ShieldCheck, label: "Nauji automobiliai" },
  { icon: BadgeDollarSign, label: "Skaidrios kainos" },
  { icon: Zap, label: "Greitas rezervavimas" },
];

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative bg-[hsl(var(--carbonus-dark))] text-white overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg.url}
          alt="Carbonus – premium automobilių nuoma"
          className="w-full h-full object-cover object-[center_center]"
          fetchPriority="high"
        />
        {/* Left gradient for readability */}
        <div aria-hidden className="absolute inset-0" style={{
          background: "linear-gradient(90deg, rgba(3,18,20,0.96) 0%, rgba(3,18,20,0.82) 32%, rgba(3,18,20,0.28) 64%, rgba(3,18,20,0.12) 100%)"
        }} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-40" style={{
          background: "linear-gradient(180deg, rgba(2,15,17,0.52) 0%, rgba(2,15,17,0.05) 100%)"
        }} />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-56" style={{
          background: "linear-gradient(0deg, rgba(3,18,20,0.80) 0%, rgba(3,18,20,0) 100%)"
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12 pt-[126px] pb-[64px] lg:pb-[92px] min-h-[690px] flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-[500px]">
            <div className="text-[12px] font-semibold uppercase tracking-[0.13em] text-white/60 mb-4">
              Keliaukite patogiai. Mokėkite protingai.
            </div>
            <h1 className="font-extrabold text-white leading-[1.04] tracking-[-0.035em]" style={{ fontSize: "clamp(38px, 5.4vw, 58px)" }}>
              <span className="block">Jūsų kelionė</span>
              <span className="block">prasideda su</span>
              <span className="block text-[hsl(var(--carbonus-green))]">Carbonus.</span>
            </h1>
            <p className="mt-5 text-white/75 text-base leading-[1.65] max-w-[430px]">
              Modernūs, patikimi ir ekonomiški automobiliai nuomai Druskininkuose ir visoje Lietuvoje.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
              {miniFeatures.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-[13px] text-white/85">
                  <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[hsl(var(--carbonus-green)/0.15)] border border-[hsl(var(--carbonus-green)/0.35)]">
                    <Icon className="h-3.5 w-3.5 text-[hsl(var(--carbonus-green))]" aria-hidden />
                  </span>
                  {label}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => document.getElementById("popular-cars")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-7 inline-flex items-center gap-2 h-12 px-6 rounded-lg text-white text-sm font-bold bg-gradient-to-br from-[hsl(var(--carbonus-green))] to-[hsl(var(--carbonus-green-hover))] hover:-translate-y-0.5 hover:brightness-110 transition-all shadow-[0_10px_30px_hsl(var(--carbonus-green)/0.3)]"
            >
              Rasti automobilį <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Booking form at bottom */}
        <div className="mt-10 lg:mt-14">
          <HeroBookingForm />
          <HeroTrustRow />
        </div>
      </div>
    </section>
  );
}
