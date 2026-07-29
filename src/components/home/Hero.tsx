import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/carbonus-hero-suv.png.asset.json";
import { HeroBookingForm } from "./HeroBookingForm";
import { HeroTrustRow } from "./HeroTrustRow";

export function Hero() {
  const navigate = useNavigate();
  return (
    <section className="relative bg-[hsl(var(--carbonus-dark))] text-white overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroBg.url}
          alt="Carbonus – premium automobilių nuoma"
          className="w-full h-full object-cover"
          style={{ objectPosition: "58% calc(50% - 20px)" }}
          fetchPriority="high"
        />
        {/* Left gradient for readability — lighter on the right so vehicle stays visible */}
        <div aria-hidden className="absolute inset-0" style={{
          background: "linear-gradient(90deg, rgba(2,18,20,0.96) 0%, rgba(2,18,20,0.82) 30%, rgba(2,18,20,0.34) 57%, rgba(2,18,20,0.12) 100%)"
        }} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-40" style={{
          background: "linear-gradient(180deg, rgba(2,15,17,0.52) 0%, rgba(2,15,17,0.05) 100%)"
        }} />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-56" style={{
          background: "linear-gradient(0deg, rgba(3,18,20,0.80) 0%, rgba(3,18,20,0) 100%)"
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-[140px] pb-[64px] lg:pb-[92px] min-h-[700px] flex flex-col">
        <div className="flex-1 flex flex-col justify-center">
          <div className="max-w-[510px] mt-10">
            <div className="text-[12px] font-semibold uppercase tracking-[0.13em] text-white/[0.68] mb-6">
              Keliaukite patogiai. Mokėkite protingai.
            </div>
            <h1 className="font-extrabold text-white" style={{ fontSize: "clamp(38px, 4.4vw, 62px)", lineHeight: 1.04, letterSpacing: "-0.01em", fontWeight: 800 }}>
              <span className="block">Jūsų kelionė</span>
              <span className="block">prasideda su</span>
              <span className="block text-[hsl(var(--carbonus-green))]">Carbonus.</span>
            </h1>
            <p className="mt-7 text-white/75 text-base leading-[1.65] max-w-[450px]">
              Modernūs, patikimi ir ekonomiški automobiliai nuomai Druskininkuose ir visoje Lietuvoje.
            </p>

            <button
              type="button"
              onClick={() => document.getElementById("popular-cars")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-[61px] inline-flex items-center gap-2 h-12 px-6 rounded-lg text-white text-sm font-bold bg-gradient-to-br from-[hsl(var(--carbonus-green))] to-[hsl(var(--carbonus-green-hover))] hover:-translate-y-0.5 hover:brightness-110 transition-all shadow-[0_10px_30px_hsl(var(--carbonus-green)/0.3)]"
            >
              Rasti automobilį <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Booking form at bottom */}
        <div className="mt-[89px] lg:mt-[121px]">
          <HeroBookingForm />
          <HeroTrustRow />
        </div>
      </div>
    </section>
  );
}

