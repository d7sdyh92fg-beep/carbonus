import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Settings2,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import BookingCalendar from "@/components/booking/BookingCalendar";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslations } from "@/hooks/use-translations";
import bayonFront from "@/assets/car-galleries/hyundai-bayon-cross/01-EXTERIOR-FRONT.png";
import bayonRear from "@/assets/car-galleries/hyundai-bayon-cross/02-EXTERIOR-REAR.png";
import bayonInterior from "@/assets/car-galleries/hyundai-bayon-cross/03-INTERIOR-FRONT-CABIN.png";
import bayonPassengerCabin from "@/assets/car-galleries/hyundai-bayon-cross/04-INTERIOR-REAR-CABIN.png";
import bayonScenic from "@/assets/car-galleries/hyundai-bayon-cross/05-SCENIC.png";

type SelectedPackage = {
  type: "romantic" | "wedding";
  name: string;
  price: number;
  priceDisplay: string;
} | null;

type Pricing = {
  is_premium?: boolean | null;
  price_tier1?: number | null;
  price_tier2?: number | null;
  price_tier3?: number | null;
  price_weekend?: number | null;
  price_package_romantic?: string | null;
  price_package_wedding?: string | null;
};

interface BayonDetailPageProps {
  pricing?: Pricing | null;
  selectedPackage: SelectedPackage;
  onSelectedPackageChange: (value: SelectedPackage) => void;
}

const GALLERY = [
  { src: bayonFront, lt: "Hyundai Bayon Cross iš priekio", en: "Hyundai Bayon Cross front view", cover: false, imageClass: "scale-[1.08]" },
  { src: bayonRear, lt: "Hyundai Bayon Cross iš galo", en: "Hyundai Bayon Cross rear view", cover: false, imageClass: "scale-[1.08]" },
  { src: bayonInterior, lt: "Hyundai Bayon Cross priekinis salonas", en: "Hyundai Bayon Cross front cabin", cover: true, imageClass: "" },
  { src: bayonPassengerCabin, lt: "Hyundai Bayon Cross galinis salonas", en: "Hyundai Bayon Cross rear cabin", cover: true, imageClass: "" },
];

export function BayonDetailPage({ pricing, selectedPackage, onSelectedPackageChange }: BayonDetailPageProps) {
  const [activeImage, setActiveImage] = useState(0);
  const { t, language } = useTranslations();
  const isEnglish = language === "en";

  const copy = isEnglish
    ? {
        premium: "New city crossover",
        title: "Hyundai Bayon Cross",
        subtitle: "Modern comfort for the city and effortless journeys beyond it.",
        description:
          "A brand-new five-seat city crossover with an economical turbo petrol engine, smooth 7DCT automatic transmission and modern driver technology. A practical, comfortable choice for daily trips, weekend escapes and longer journeys across Lithuania.",
        gallery: "Vehicle gallery",
        galleryHint: "Select a photo to view it larger",
        from: "from",
        perDay: "/ day",
        reserve: "Check availability",
        transparent: "Clear price and booking confirmation before payment",
        highlightTitle: "Ready for every city and weekend route",
        highlightItems: ["Economical 1.0 T-GDi engine", "7DCT automatic transmission", "Modern driver technology"],
        bookingTitle: "Reserve your Hyundai Bayon Cross",
        bookingText: "Choose suitable dates and submit your reservation request.",
        detailsTitle: "Everything important in one place",
        featuresTitle: "Equipment and comfort",
        specsTitle: "Technical details",
        year: "Year",
        passengers: "Seats",
        gearbox: "Transmission",
        fuel: "Fuel",
        doors: "Doors",
        trunk: "Luggage space",
        engine: "Engine",
        petrol: "Petrol",
        automatic: "Automatic",
        back: "All cars",
      }
    : {
        premium: "Naujas miesto krosoveris",
        title: "Hyundai Bayon Cross",
        subtitle: "Modernus komfortas miestui ir lengvoms kelionėms už jo ribų.",
        description:
          "Visiškai naujas penkiavietis miesto krosoveris su ekonomišku turbobenzininiu varikliu, sklandžia 7DCT automatine pavarų dėže ir moderniomis vairuotojo technologijomis. Patogus pasirinkimas kasdienėms išvykoms, savaitgalio poilsiui ir ilgesnėms kelionėms po Lietuvą.",
        gallery: "Automobilio galerija",
        galleryHint: "Pasirinkite nuotrauką ir peržiūrėkite ją didesnę",
        from: "nuo",
        perDay: "/ dieną",
        reserve: "Tikrinti užimtumą",
        transparent: "Aiški kaina ir rezervacijos patvirtinimas prieš apmokėjimą",
        highlightTitle: "Sukurtas miestui ir savaitgalio kelionėms",
        highlightItems: ["Ekonomiškas 1.0 T-GDi variklis", "7DCT automatinė pavarų dėžė", "Modernios vairuotojo technologijos"],
        bookingTitle: "Rezervuokite Hyundai Bayon Cross",
        bookingText: "Pasirinkite tinkamas datas ir pateikite rezervacijos užklausą.",
        detailsTitle: "Visa svarbiausia informacija vienoje vietoje",
        featuresTitle: "Įranga ir komfortas",
        specsTitle: "Techniniai duomenys",
        year: "Metai",
        passengers: "Vietų skaičius",
        gearbox: "Pavarų dėžė",
        fuel: "Kuras",
        doors: "Durys",
        trunk: "Bagažinė",
        engine: "Variklis",
        petrol: "Benzinas",
        automatic: "Automatinė",
        back: "Visi automobiliai",
      };

  const lowestPrice = pricing?.price_tier3 ?? pricing?.price_tier1 ?? 50;
  const highestPrice = pricing?.price_tier1 ?? 50;
  const priceLabel = lowestPrice === highestPrice ? `€${lowestPrice}` : `€${lowestPrice}–€${highestPrice}`;

  const showPrevious = () => setActiveImage((current) => (current - 1 + GALLERY.length) % GALLERY.length);
  const showNext = () => setActiveImage((current) => (current + 1) % GALLERY.length);
  const scrollToBooking = () => document.getElementById("booking-section")?.scrollIntoView({ behavior: "smooth", block: "start" });

  const features = Array.from({ length: 8 }, (_, index) => t(`carData.8.feature${index + 1}`));
  const featureGroups = [
    { title: isEnglish ? "Comfort" : "Komfortas", items: features.slice(0, 3) },
    { title: isEnglish ? "Technology" : "Technologijos", items: features.slice(3, 6) },
    { title: isEnglish ? "Exterior" : "Eksterjeras", items: features.slice(6) },
  ];
  const specs = [
    [copy.year, "2026"],
    [copy.passengers, "5"],
    [copy.gearbox, copy.automatic],
    [copy.fuel, copy.petrol],
    [copy.doors, "5"],
    [copy.trunk, "411 L"],
    [copy.engine, "1.0L T-GDi 100 AG"],
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-foreground">
      <SEOHead
        title={t("carDetail.metaTitle").replace("{carName}", copy.title)}
        description={t("carDetail.metaDescription").replace("{carName}", copy.title)}
        canonical={`https://carbonus.lt/${isEnglish ? "cars/hyundai-bayon-cross-rental" : "automobiliai/hyundai-bayon-cross-nuoma"}`}
        ogImage={bayonFront}
        ogType="product"
        keywords="Hyundai Bayon Cross nuoma, miesto krosoverio nuoma, automobilio nuoma Druskininkuose, Carbonus"
      />
      <LanguageLinks ltPath="/automobiliai/hyundai-bayon-cross-nuoma" enPath="/cars/hyundai-bayon-cross-rental" />
      <Header />

      <main className="pt-[78px]">
        <section className="bg-[hsl(210_20%_96%)] pb-10 pt-7 sm:pb-12 sm:pt-9">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-6">
            <nav className="flex flex-wrap items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.07em] text-foreground/60" aria-label="Breadcrumb">
              <Link to={isEnglish ? "/cars" : "/automobiliai"} className="inline-flex min-h-10 items-center gap-2 rounded-lg pr-2 transition hover:text-[hsl(var(--carbonus-green-dark))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--carbonus-green))]">
                <ArrowLeft className="h-3.5 w-3.5" /> {copy.back}
              </Link>
              <span>/</span>
              <span className="text-[hsl(var(--carbonus-green-dark))]">Hyundai Bayon Cross</span>
            </nav>

            <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1.14fr)_minmax(430px,0.86fr)] lg:items-start lg:gap-8">
              <div>
                <div className="relative overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_24px_60px_rgba(15,23,42,0.09)]">
                  <div className="relative flex h-[350px] items-center justify-center overflow-hidden bg-white sm:h-[500px] lg:h-[560px]">
                    <img
                      src={GALLERY[activeImage].src}
                      alt={isEnglish ? GALLERY[activeImage].en : GALLERY[activeImage].lt}
                      width={1200}
                      height={900}
                      loading={activeImage === 0 ? "eager" : "lazy"}
                      fetchPriority={activeImage === 0 ? "high" : "auto"}
                      decoding="async"
                      className={`h-full w-full transition-transform duration-300 ${GALLERY[activeImage].cover ? "object-cover" : "object-contain"} ${GALLERY[activeImage].imageClass}`}
                    />
                    <button onClick={showPrevious} aria-label="Ankstesnė nuotrauka" className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-transparent bg-transparent text-[hsl(var(--carbonus-green-dark))] drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] transition hover:scale-110 hover:bg-[hsl(var(--carbonus-green)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--carbonus-green))]">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button onClick={showNext} aria-label="Kita nuotrauka" className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-transparent bg-transparent text-[hsl(var(--carbonus-green-dark))] drop-shadow-[0_1px_2px_rgba(255,255,255,0.95)] transition hover:scale-110 hover:bg-[hsl(var(--carbonus-green)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--carbonus-green))]">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <span className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-black/70 px-3.5 py-2 text-[12px] font-semibold text-white shadow-lg backdrop-blur">
                      {activeImage + 1} / {GALLERY.length}
                    </span>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {GALLERY.map((image, index) => (
                    <button
                      key={image.src}
                      onClick={() => setActiveImage(index)}
                      aria-label={isEnglish ? image.en : image.lt}
                      aria-current={activeImage === index ? "true" : undefined}
                      className={`relative h-[96px] overflow-hidden rounded-2xl border-2 bg-white transition sm:h-[118px] ${activeImage === index ? "border-[hsl(var(--carbonus-green))] bg-[hsl(var(--carbonus-green)/0.06)] shadow-[0_10px_24px_hsl(var(--carbonus-green)/0.18)]" : "border-transparent opacity-75 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--carbonus-green))]"}`}
                    >
                      <img src={image.src} alt="" width={320} height={220} loading="lazy" decoding="async" className={`h-full w-full ${image.cover ? "object-cover" : "object-contain p-1 scale-[1.45]"}`} />
                      {index >= 2 && (
                        <span className="absolute bottom-1.5 left-1.5 rounded bg-black/65 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
                          {index === 2 ? (isEnglish ? "Front cabin" : "Priekinis salonas") : (isEnglish ? "Rear cabin" : "Galinė salono dalis")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[12px] text-muted-foreground">
                  <span className="font-semibold text-foreground">{copy.gallery}</span>
                  <span className="hidden sm:block">{copy.galleryHint}</span>
                </div>
              </div>

              <aside className="rounded-[28px] border border-border/70 bg-white p-7 shadow-[0_22px_55px_rgba(15,23,42,0.08)] sm:p-9 lg:sticky lg:top-[98px]">
                <div className="flex flex-wrap items-center gap-2 text-[12px] font-bold uppercase tracking-[0.07em] text-amber-700">
                  <Users className="h-4 w-4" />
                  <span>{copy.premium}</span>
                  <span className="text-border">·</span>
                  <span className="text-[hsl(var(--carbonus-green-dark))]">2026</span>
                </div>
                <h1 className="mt-5 text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-[44px]">{copy.title}</h1>
                <p className="mt-4 text-[16px] font-medium leading-relaxed text-foreground/75">{copy.subtitle}</p>

                <div className="mt-7 border-y border-border py-6">
                  <div className="flex items-end gap-2">
                    <span className="pb-1 text-[13px] text-muted-foreground">{copy.from}</span>
                    <span className="text-[40px] font-extrabold leading-none tracking-[-0.03em] text-[hsl(var(--carbonus-green))]">{priceLabel}</span>
                    <span className="pb-1 text-[13px] text-muted-foreground">{copy.perDay}</span>
                  </div>
                  {pricing?.price_tier1 != null && (
                    <div className="mt-5 space-y-3 border-t border-border pt-4 text-[13px]">
                      {pricing.price_tier3 != null && <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t("carDetail.mercPricing.weekday7")}</span><b className="text-right">{pricing.price_tier3} €</b></div>}
                      {pricing.price_tier2 != null && <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t("carDetail.mercPricing.weekday3")}</span><b className="text-right">{pricing.price_tier2} €</b></div>}
                      <div className="flex justify-between gap-4"><span className="text-muted-foreground">{t("carDetail.mercPricing.weekday1")}</span><b className="text-right">{pricing.price_tier1} €</b></div>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    { Icon: Users, value: "5", label: copy.passengers },
                    { Icon: Settings2, value: copy.automatic, label: copy.gearbox },
                    { Icon: Fuel, value: copy.petrol, label: copy.fuel },
                  ].map(({ Icon, value, label }) => (
                    <div key={label} className="rounded-xl bg-[hsl(210_20%_96%)] p-3 text-center">
                      <Icon className="mx-auto h-4 w-4 text-[hsl(var(--carbonus-green))]" />
                      <p className="mt-2 truncate text-[12px] font-bold">{value}</p>
                      <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                <button onClick={scrollToBooking} className="mt-7 inline-flex h-[60px] w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green-dark))] px-6 text-[16px] font-bold text-white shadow-[0_18px_34px_hsl(var(--carbonus-green-dark)/0.22)] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--carbonus-green-deep))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--carbonus-green))] focus-visible:ring-offset-2">
                  {copy.reserve} <ArrowRight className="h-4 w-4" />
                </button>
                <p className="mt-4 flex items-start gap-2 text-[12px] font-medium leading-relaxed text-foreground/60">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--carbonus-green))]" /> {copy.transparent}
                </p>
              </aside>
            </div>

            <div className="mt-20 grid gap-7 sm:mt-24 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div className="order-last lg:order-first">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--carbonus-green-dark))]">Hyundai Bayon Cross</p>
                <h2 className="mt-3 text-[30px] font-extrabold tracking-[-0.025em] sm:text-[36px]">{copy.highlightTitle}</h2>
                <p className="mt-4 max-w-[680px] text-[15px] leading-[1.8] text-muted-foreground">{copy.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {copy.highlightItems.map((item) => (
                    <span key={item} className="inline-flex min-h-[42px] items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-[13px] font-semibold shadow-sm">
                      <Check className="h-4 w-4 text-[hsl(var(--carbonus-green))]" /> {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="order-first aspect-[16/10] w-full overflow-hidden rounded-[24px] bg-[#eee7dc] shadow-[0_18px_45px_rgba(15,23,42,0.12)] lg:order-last">
                <img src={bayonScenic} alt={isEnglish ? "Hyundai Bayon Cross scenic drive" : "Hyundai Bayon Cross kelionėje"} width={1536} height={1024} loading="lazy" decoding="async" className="h-full w-full object-cover object-center" />
              </div>
            </div>
          </div>
        </section>

        <section id="booking-section" className="scroll-mt-24 bg-[hsl(210_20%_97%)] py-16 sm:py-[72px]">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-6">
            <div className="mx-auto mb-7 max-w-[650px] text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(var(--carbonus-green)/0.1)] text-[hsl(var(--carbonus-green))]"><CalendarDays className="h-5 w-5" /></span>
              <h2 className="mt-5 text-[30px] font-extrabold tracking-[-0.025em] sm:text-[38px]">{copy.bookingTitle}</h2>
              <p className="mt-3 text-[15px] text-muted-foreground">{copy.bookingText}</p>
            </div>
            <BookingCalendar carId="8" carName="Hyundai Bayon Cross" carImage={bayonFront} selectedPackage={selectedPackage} onClearPackage={() => onSelectedPackageChange(null)} />
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[1140px] px-5 sm:px-6">
            <div className="mx-auto max-w-[700px] text-center">
              <h2 className="text-[28px] font-extrabold tracking-[-0.025em] sm:text-[34px]">{copy.detailsTitle}</h2>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <article className="rounded-[24px] border border-border/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-8">
                <h3 className="text-[21px] font-bold">{copy.featuresTitle}</h3>
                <div className="mt-6 space-y-6">
                  {featureGroups.map((group) => (
                    <div key={group.title}>
                      <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[hsl(var(--carbonus-green-dark))]">{group.title}</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.items.map((feature) => (
                          <div key={feature} className="flex min-h-[48px] items-start gap-3 rounded-xl bg-[hsl(210_20%_97%)] p-3.5 text-[13px] leading-snug">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--carbonus-green))]" /> {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
              <article className="rounded-[24px] border border-border/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] sm:p-8">
                <h3 className="text-[21px] font-bold">{copy.specsTitle}</h3>
                <div className="mt-5 divide-y divide-border">
                  {specs.map(([label, value], index) => (
                    <div key={label} className="flex items-center justify-between py-3.5 text-[14px]">
                      <span className="flex items-center gap-2 text-muted-foreground">{index === 0 && <Gauge className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />}{label}</span>
                      <b className="min-w-[130px] text-right font-semibold tabular-nums">{value}</b>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>

      <div className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-4 rounded-2xl border border-white/60 bg-white/95 px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.2)] backdrop-blur lg:hidden">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{copy.from}</p>
          <p className="text-[17px] font-extrabold text-[hsl(var(--carbonus-green-dark))]">{priceLabel}<span className="ml-1 text-[11px] font-medium text-muted-foreground">{copy.perDay}</span></p>
        </div>
        <button onClick={scrollToBooking} className="h-12 rounded-xl bg-[hsl(var(--carbonus-green-dark))] px-5 text-[13px] font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--carbonus-green))]">
          {copy.reserve}
        </button>
      </div>

      <V3Footer />
    </div>
  );
}
