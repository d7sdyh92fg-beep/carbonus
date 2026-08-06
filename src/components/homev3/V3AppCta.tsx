import { Link } from "react-router-dom";
import citroen from "@/assets/citroen-spacetourer-side-clean.png";
import { ArrowRight, Check, MessageCircle } from "lucide-react";

export function V3AppCta() {
  return (
    <section className="bg-white px-6 pb-28 pt-24 lg:pb-36 lg:pt-32">
      <div className="relative mx-auto min-h-[360px] max-w-[1140px] overflow-hidden rounded-[24px] bg-[linear-gradient(120deg,hsl(var(--carbonus-green-dark))_0%,hsl(var(--carbonus-green))_58%,hsl(var(--carbonus-green-light))_100%)] shadow-[0_28px_70px_rgba(5,122,70,0.20)]">
        <div className="pointer-events-none absolute -right-16 -top-28 h-[340px] w-[340px] rounded-full border-[70px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-28 left-[42%] h-[280px] w-[280px] rounded-full border-[55px] border-white/[0.07]" />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] opacity-[0.09] lg:block"
          style={{
            backgroundImage: "repeating-linear-gradient(90deg,#fff 0 10px,transparent 10px 28px)",
            maskImage: "repeating-linear-gradient(0deg,#000 0 14px,transparent 14px 27px)",
            WebkitMaskImage: "repeating-linear-gradient(0deg,#000 0 14px,transparent 14px 27px)",
            transform: "skewX(-18deg)",
          }}
        />

        <div className="relative z-10 flex min-h-[360px] flex-col justify-center px-8 py-12 sm:px-14 lg:w-[58%] lg:px-16">
          <div className="mb-5 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-white/75">
            <span className="h-2 w-2 rounded-full bg-white" />
            Laikas keliauti
          </div>
          <h2 className="max-w-[520px] text-[32px] font-extrabold leading-[1.12] tracking-[-0.025em] text-white sm:text-[40px] lg:text-[44px]">
            Jūsų kitas automobilis jau laukia
          </h2>
          <p className="mt-5 max-w-[510px] text-[15px] leading-7 text-white/80 sm:text-[16px]">
            Išsirinkite prižiūrėtą, pilnai apdraustą automobilį ir rezervuokite jį vos per kelias minutes.
          </p>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-medium text-white/85">
            {["Aiškios kainos", "Greitas užsakymas", "Jokių paslėptų mokesčių"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <Check className="h-4 w-4" strokeWidth={2.5} />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/automobiliai"
              className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-[14px] font-bold text-[hsl(var(--carbonus-green-dark))] shadow-[0_12px_28px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(0,0,0,0.18)]"
            >
              Rinktis automobilį
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/kontaktai"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/35 bg-white/10 px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" />
              Susisiekti
            </Link>
          </div>
        </div>

        <div className="relative z-10 mx-auto -mt-5 w-[88%] max-w-[520px] pb-8 lg:absolute lg:-right-8 lg:bottom-3 lg:mt-0 lg:w-[52%] lg:max-w-none lg:pb-0">
          <div className="absolute bottom-[12%] left-[8%] h-[17%] w-[82%] rounded-[50%] bg-black/30 blur-2xl" />
          <img
            src={citroen}
            alt="Citroën SpaceTourer automobilis"
            loading="lazy"
            width={1376}
            height={768}
            className="relative w-full object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.25)] transition-transform duration-500 hover:-translate-y-1 hover:scale-[1.015]"
          />
        </div>
      </div>
    </section>
  );
}
