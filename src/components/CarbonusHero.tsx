import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import CinematicHeroMedia from "./CinematicHeroMedia";
import heroVideoAsset from "@/assets/hero-bg.mp4.asset.json";


type AvailabilitySearch = {
  pickupDate: string;
  returnDate: string;
};

type CarbonusHeroProps = {
  heroImage?: string;
  onSearch?: (search: AvailabilitySearch) => void;
  minDate?: string;
};

const DEFAULT_HERO_IMAGE = "/images/carbonus-hero-v3.webp";

function getLocalIsoDate(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function pushAnalytics(event: string, params: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

export default function CarbonusHero({
  heroImage = DEFAULT_HERO_IMAGE,
  onSearch,
  minDate,
}: CarbonusHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const searchStartedRef = useRef(false);

  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [error, setError] = useState("");

  const prefersReducedMotion = useReducedMotion();
  const effectiveMinDate = useMemo(() => minDate ?? getLocalIsoDate(), [minDate]);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, -24],
  );
  const contentOpacity = useTransform(scrollYProgress, [0, 0.78], [1, 0.72]);

  useEffect(() => {
    pushAnalytics("hero_view");
  }, []);

  function markSearchStarted(): void {
    if (searchStartedRef.current) return;
    searchStartedRef.current = true;
    pushAnalytics("hero_search_started");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setError("");

    pushAnalytics("click_hero_booking");

    if (!pickupDate || !returnDate) {
      setError("Pasirinkite atsiėmimo ir grąžinimo datas.");
      pickupInputRef.current?.focus();
      return;
    }

    if (returnDate < pickupDate) {
      setError("Grąžinimo data negali būti ankstesnė už atsiėmimo datą.");
      return;
    }

    const payload = { pickupDate, returnDate };
    pushAnalytics("search_availability", payload);

    if (onSearch) {
      onSearch(payload);
      return;
    }

    window.dispatchEvent(
      new CustomEvent<AvailabilitySearch>("carbonus:availability-search", {
        detail: payload,
      }),
    );

    document.querySelector("#available-cars")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section
      ref={heroRef}
      aria-labelledby="carbonus-hero-title"
      className="relative isolate min-h-[760px] overflow-hidden bg-slate-950 text-white lg:min-h-[100svh]"
    >
      <HeroVideoBackground src={heroVideoAsset.url} poster={heroImage} />


      {/* Kairėje stipresnis kontrastas tekstui, dešinėje paliekamas gyvas vaizdas. */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(3,12,9,0.93)_0%,rgba(3,12,9,0.80)_35%,rgba(3,12,9,0.34)_63%,rgba(3,12,9,0.10)_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,rgba(3,8,7,0.18)_0%,rgba(3,8,7,0.03)_48%,rgba(3,8,7,0.82)_100%)]" />




      <div className="relative mx-auto flex min-h-[760px] w-full max-w-7xl flex-col px-5 pb-6 pt-28 sm:px-8 lg:min-h-[100svh] lg:px-10 lg:pb-8 lg:pt-36">
        <motion.div
          className="max-w-[650px]"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 inline-flex rounded-full border border-emerald-200/25 bg-emerald-950/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-emerald-100 backdrop-blur-md sm:text-sm"
          >
            Jūsų kelionė prasideda Druskininkuose
          </motion.p>

          <motion.h1
            id="carbonus-hero-title"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.72,
              delay: prefersReducedMotion ? 0 : 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-[12ch] text-balance text-5xl font-black leading-[0.98] tracking-[-0.045em] text-white sm:text-6xl lg:text-[5.25rem]"
          >
            Daugiau laisvės{" "}
            <span className="text-emerald-300">kiekvienai kelionei.</span>
          </motion.h1>

          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.68,
              delay: prefersReducedMotion ? 0 : 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-6 max-w-[58ch] text-pretty text-base leading-7 text-slate-200 sm:text-lg sm:leading-8"
          >
            Atraskite Druskininkus ir Lietuvą savo tempu. Pasirinkite tinkamą
            automobilį, o mes pristatysime jį ten, kur apsistojote.
          </motion.p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.72,
            delay: prefersReducedMotion ? 0 : 0.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mt-10 w-full rounded-[1.4rem] border border-white/[0.15] bg-slate-950/[0.58] p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5 lg:mt-auto"
        >
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_minmax(240px,0.85fr)] md:items-end">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-100">
                Atsiėmimo data
              </span>
              <input
                ref={pickupInputRef}
                type="date"
                min={effectiveMinDate}
                value={pickupDate}
                onFocus={markSearchStarted}
                onChange={(event) => {
                  setPickupDate(event.target.value);
                  if (returnDate && event.target.value > returnDate) {
                    setReturnDate("");
                  }
                }}
                className="h-14 w-full rounded-xl border border-white/[0.15] bg-white/10 px-4 text-base text-white outline-none [color-scheme:dark] transition focus:border-emerald-300 focus:bg-white/[0.14] focus:ring-4 focus:ring-emerald-400/[0.15]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-100">
                Grąžinimo data
              </span>
              <input
                type="date"
                min={pickupDate || effectiveMinDate}
                value={returnDate}
                onFocus={markSearchStarted}
                onChange={(event) => setReturnDate(event.target.value)}
                className="h-14 w-full rounded-xl border border-white/[0.15] bg-white/10 px-4 text-base text-white outline-none [color-scheme:dark] transition focus:border-emerald-300 focus:bg-white/[0.14] focus:ring-4 focus:ring-emerald-400/[0.15]"
              />
            </label>

            <motion.button
              type="submit"
              whileHover={prefersReducedMotion ? undefined : { y: -2, scale: 1.01 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
              className="h-14 rounded-xl bg-emerald-500 px-6 text-base font-bold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-300/[0.35]"
            >
              Rodyti laisvus automobilius
            </motion.button>
          </div>

          <p
            aria-live="polite"
            className={`mt-3 min-h-5 text-sm ${
              error ? "text-rose-200" : "text-transparent"
            }`}
          >
            {error || "Rezervacijos paieška paruošta"}
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-3 text-xs font-medium text-slate-300 sm:text-sm">
            <span>Realus laisvumas</span>
            <span aria-hidden="true" className="text-emerald-300">
              ·
            </span>
            <span>Aiški kaina ir užstatas</span>
            <span aria-hidden="true" className="text-emerald-300">
              ·
            </span>
            <span>Pristatymas Druskininkuose</span>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
