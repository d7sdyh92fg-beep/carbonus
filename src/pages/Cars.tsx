import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CarFront,
  Check,
  Fuel,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslations } from "@/hooks/use-translations";
import { supabase } from "@/integrations/supabase/client";
import { trackFilterCars, trackSearch, trackViewCar, trackViewCarList } from "@/lib/analytics";
import { getCarSlugFromId } from "@/utils/carSlugs";
import citroenSpacetourerSide from "@/assets/fleet-citroen-spacetourer-side-v2.png";
import hyundaiBayonSide from "@/assets/fleet-hyundai-bayon-white-roof-v3.png";
import kiaCeedHatchbackSide from "@/assets/fleet-kia-ceed-hatchback-side-v2.png";
import kiaCeedWagonSide from "@/assets/fleet-kia-ceed-wagon-side-v2.png";
import mercedesSlkSide from "@/assets/fleet-mercedes-slk-open-top-v3.png";
import vwPassatSide from "@/assets/fleet-volkswagen-passat-side-v2.png";

type Language = "lt" | "en";

interface CarItem {
  id: string;
  name: string;
  englishName: string;
  category: string;
  categoryEn: string;
  passengers: number;
  fuel: string;
  fuelEn: string;
  transmission: string;
  transmissionEn: string;
  year: number;
  fallbackPrice: number;
  image: string;
  imageClass: string;
}

const CARS: CarItem[] = [
  {
    id: "6",
    name: "Mercedes-Benz SLK",
    englishName: "Mercedes-Benz SLK",
    category: "Kabrioletas",
    categoryEn: "Convertible",
    passengers: 2,
    fuel: "Benzinas",
    fuelEn: "Petrol",
    transmission: "Automatinė",
    transmissionEn: "Automatic",
    year: 2015,
    fallbackPrice: 90,
    image: mercedesSlkSide,
    imageClass: "scale-[0.90] group-hover:scale-[0.925]",
  },
  {
    id: "7",
    name: "Citroën SpaceTourer",
    englishName: "Citroën SpaceTourer",
    category: "Vienatūris",
    categoryEn: "People carrier",
    passengers: 8,
    fuel: "Dyzelinas",
    fuelEn: "Diesel",
    transmission: "Automatinė",
    transmissionEn: "Automatic",
    year: 2026,
    fallbackPrice: 60,
    image: citroenSpacetourerSide,
    imageClass: "scale-[0.90] group-hover:scale-[0.925]",
  },
  {
    id: "8",
    name: "Hyundai Bayon Cross",
    englishName: "Hyundai Bayon Cross",
    category: "Krosoveris",
    categoryEn: "Crossover",
    passengers: 5,
    fuel: "Benzinas",
    fuelEn: "Petrol",
    transmission: "Automatinė",
    transmissionEn: "Automatic",
    year: 2026,
    fallbackPrice: 50,
    image: hyundaiBayonSide,
    imageClass: "scale-[0.90] group-hover:scale-[0.925]",
  },
  {
    id: "5",
    name: "KIA CEED Hečbekas",
    englishName: "KIA CEED Hatchback",
    category: "Hečbekas",
    categoryEn: "Hatchback",
    passengers: 5,
    fuel: "Dyzelinas",
    fuelEn: "Diesel",
    transmission: "Mechaninė",
    transmissionEn: "Manual",
    year: 2020,
    fallbackPrice: 30,
    image: kiaCeedHatchbackSide,
    imageClass: "scale-[0.90] group-hover:scale-[0.925]",
  },
  {
    id: "4",
    name: "KIA CEED Universalas",
    englishName: "KIA CEED Estate",
    category: "Universalas",
    categoryEn: "Estate",
    passengers: 5,
    fuel: "Benzinas",
    fuelEn: "Petrol",
    transmission: "Mechaninė",
    transmissionEn: "Manual",
    year: 2013,
    fallbackPrice: 30,
    image: kiaCeedWagonSide,
    imageClass: "scale-[0.90] group-hover:scale-[0.925]",
  },
  {
    id: "3",
    name: "Volkswagen Passat",
    englishName: "Volkswagen Passat",
    category: "Sedanas",
    categoryEn: "Saloon",
    passengers: 5,
    fuel: "Dyzelinas",
    fuelEn: "Diesel",
    transmission: "Mechaninė",
    transmissionEn: "Manual",
    year: 2012,
    fallbackPrice: 30,
    image: vwPassatSide,
    imageClass: "scale-[0.90] group-hover:scale-[0.925]",
  },
];

const FILTERS = ["Visi", "Kabrioletas", "Krosoveris", "Vienatūris", "Hečbekas", "Universalas", "Sedanas"];

const FILTER_LABELS_EN: Record<string, string> = {
  Visi: "All",
  Kabrioletas: "Convertible",
  Krosoveris: "Crossover",
  Vienatūris: "People carrier",
  Hečbekas: "Hatchback",
  Universalas: "Estate",
  Sedanas: "Saloon",
};

const copy = {
  lt: {
    eyebrow: "MŪSŲ AUTOPARKAS",
    title: "Atraskite tinkamiausią automobilį",
    subtitle: "Nuo miesto automobilio iki erdvaus šeimos vienatūrio – išsirinkite jums tinkamiausią ir rezervuokite paprastai.",
    inspected: "Prižiūrėti automobiliai",
    insured: "Pilnai apdraustas parkas",
    pricing: "Aiškios nuomos kainos",
    search: "Ieškoti pagal modelį",
    found: "Rasti automobiliai",
    from: "nuo",
    day: "/ dieną",
    seats: "vietos",
    view: "Peržiūrėti automobilį",
    emptyTitle: "Automobilių neradome",
    emptyText: "Pakeiskite paiešką arba pasirinkite kitą kėbulo tipą.",
    clear: "Išvalyti filtrus",
    ctaEyebrow: "PADĖSIME IŠSIRINKTI",
    ctaTitle: "Nežinote, kuris automobilis jums tinkamiausias?",
    ctaText: "Pasakykite, kur ir su kuo keliausite – pasiūlysime patogiausią variantą ir aiškią kainą.",
    contact: "Susisiekti",
    call: "Skambinti +370 698 18 781",
  },
  en: {
    eyebrow: "OUR FLEET",
    title: "Find the car that fits you",
    subtitle: "From a compact city car to a spacious family van – choose the right car and book it with ease.",
    inspected: "Carefully maintained",
    insured: "Fully insured fleet",
    pricing: "Clear rental prices",
    search: "Search by model",
    found: "Cars found",
    from: "from",
    day: "/ day",
    seats: "seats",
    view: "View this car",
    emptyTitle: "No cars found",
    emptyText: "Try a different search or choose another body type.",
    clear: "Clear filters",
    ctaEyebrow: "WE WILL HELP YOU CHOOSE",
    ctaTitle: "Not sure which car is right for you?",
    ctaText: "Tell us where and with whom you are travelling, and we will suggest the most comfortable option at a clear price.",
    contact: "Contact us",
    call: "Call +370 698 18 781",
  },
};

const Cars = () => {
  const { language } = useTranslations();
  const activeLanguage = (language === "en" ? "en" : "lt") as Language;
  const text = copy[activeLanguage];
  const [selectedCategory, setSelectedCategory] = useState("Visi");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dbCars = [] } = useQuery({
    queryKey: ["cars-list-pricing"],
    queryFn: async () => {
      const { data } = await supabase.from("cars").select("id, price_tier3");
      return data || [];
    },
  });

  const prices = useMemo(
    () => new Map(dbCars.map((car) => [String(car.id), Number(car.price_tier3)])),
    [dbCars],
  );

  const filteredCars = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase(activeLanguage);
    return CARS.filter((car) => {
      const categoryMatches = selectedCategory === "Visi" || car.category === selectedCategory;
      const searchable = `${car.name} ${car.englishName} ${car.category} ${car.categoryEn}`.toLocaleLowerCase(activeLanguage);
      return categoryMatches && (!query || searchable.includes(query));
    });
  }, [activeLanguage, searchTerm, selectedCategory]);

  useEffect(() => {
    trackViewCarList(CARS);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) return;
    const timeout = window.setTimeout(() => trackSearch(searchTerm, "cars_page"), 500);
    return () => window.clearTimeout(timeout);
  }, [searchTerm]);

  const selectCategory = (category: string) => {
    setSelectedCategory(category);
    if (category !== "Visi") trackFilterCars("category", category);
  };

  const carPath = (car: CarItem) => {
    const slug = getCarSlugFromId(car.id, activeLanguage);
    return `${activeLanguage === "en" ? "/cars" : "/automobiliai"}/${slug}`;
  };

  const carPrice = (car: CarItem) => {
    const databasePrice = prices.get(car.id);
    return Number.isFinite(databasePrice) && databasePrice ? databasePrice : car.fallbackPrice;
  };

  const registerCarView = (car: CarItem) => {
    trackViewCar({
      id: car.id,
      name: activeLanguage === "en" ? car.englishName : car.name,
      category: activeLanguage === "en" ? car.categoryEn : car.category,
      price: `${carPrice(car)} EUR`,
      year: String(car.year),
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#111b18]">
      <SEOHead
        title={activeLanguage === "en" ? "Car rental fleet in Druskininkai | Carbonus" : "Automobilių nuoma Druskininkuose | Carbonus autoparkas"}
        description={activeLanguage === "en" ? "Explore the Carbonus rental fleet and choose a car for your trip in Druskininkai and across Lithuania." : "Atraskite Carbonus automobilių parką ir išsirinkite automobilį kelionei Druskininkuose bei visoje Lietuvoje."}
        canonical={`https://carbonus.lt/${activeLanguage === "en" ? "cars" : "automobiliai"}`}
        keywords="automobilių nuoma Druskininkuose, automobilių parkas, kabrioleto nuoma, mikroautobuso nuoma"
      />
      <LanguageLinks ltPath="/automobiliai" enPath="/cars" />
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#dce6e1] bg-[#f3f7f5] pt-[78px]">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] overflow-hidden lg:block">
            <div className="absolute -right-32 -top-40 h-[560px] w-[560px] rounded-full bg-[hsl(var(--carbonus-green))]/10 blur-3xl" />
            <div className="absolute bottom-0 right-16 h-48 w-80 rounded-t-[100px] border-x border-t border-[hsl(var(--carbonus-green))]/10" />
            <div className="absolute bottom-0 right-28 h-32 w-56 rounded-t-[80px] bg-white/50" />
          </div>

          <div className="relative mx-auto grid max-w-[1280px] gap-10 px-6 pb-16 pt-16 md:px-10 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:pb-20 lg:pt-20">
            <div className="max-w-[760px]">
              <p className="mb-5 text-[12px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--carbonus-green-dark))]">
                {text.eyebrow}
              </p>
              <h1 className="max-w-[720px] text-[42px] font-bold leading-[1.04] tracking-[-0.045em] text-[#111b18] sm:text-[54px] lg:text-[66px]">
                {text.title}
              </h1>
              <p className="mt-6 max-w-[650px] text-[16px] leading-7 text-[#64756e] sm:text-[17px]">
                {text.subtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 lg:justify-self-end">
              {[
                { Icon: Sparkles, label: text.inspected },
                { Icon: ShieldCheck, label: text.insured },
                { Icon: Check, label: text.pricing },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3.5 shadow-[0_12px_35px_rgba(20,65,45,0.06)] backdrop-blur-sm lg:min-w-[255px]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]">
                    <Icon className="h-[17px] w-[17px]" />
                  </span>
                  <span className="text-[13px] font-semibold text-[#25342f]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto max-w-[1280px] px-6 pb-5 pt-10 md:px-10 lg:pt-12">
          <div className="rounded-[24px] border border-[#e0e8e4] bg-white p-3 shadow-[0_18px_55px_rgba(12,55,38,0.07)] sm:p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative min-w-0 flex-1 xl:max-w-[310px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#789087]" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={text.search}
                  aria-label={text.search}
                  className="h-12 w-full rounded-[14px] border border-[#dde6e1] bg-[#f8faf9] pl-11 pr-10 text-[14px] text-[#17231f] outline-none transition focus:border-[hsl(var(--carbonus-green))]/60 focus:ring-4 focus:ring-[hsl(var(--carbonus-green))]/10"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")} aria-label={text.clear} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#789087] hover:bg-[#eef3f0]">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex min-w-0 gap-2 overflow-x-auto pb-1 xl:pb-0">
                {FILTERS.map((filter) => {
                  const active = filter === selectedCategory;
                  return (
                    <button
                      key={filter}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectCategory(filter)}
                      className={`h-10 shrink-0 rounded-full px-4 text-[13px] font-semibold transition ${
                        active
                          ? "bg-[hsl(var(--carbonus-green-dark))] text-white shadow-[0_8px_24px_rgba(3,103,58,0.22)]"
                          : "border border-[#e0e8e4] bg-white text-[#53645d] hover:border-[hsl(var(--carbonus-green))]/40 hover:text-[hsl(var(--carbonus-green-dark))]"
                      }`}
                    >
                      {activeLanguage === "en" ? FILTER_LABELS_EN[filter] : filter}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 pb-24 pt-8 md:px-10 lg:pb-28">
          <div className="mb-7 flex items-center justify-between">
            <p className="text-[14px] font-semibold text-[#53645d]">
              {text.found}: <span className="text-[#111b18]">{filteredCars.length}</span>
            </p>
            <span className="hidden items-center gap-2 text-[12px] font-medium text-[#7d8e87] sm:flex">
              <CarFront className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
              Carbonus
            </span>
          </div>

          {filteredCars.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCars.map((car) => {
                const displayName = activeLanguage === "en" ? car.englishName : car.name;
                const category = activeLanguage === "en" ? car.categoryEn : car.category;
                const fuel = activeLanguage === "en" ? car.fuelEn : car.fuel;
                const transmission = activeLanguage === "en" ? car.transmissionEn : car.transmission;
                return (
                  <article key={car.id} className="group overflow-hidden rounded-[26px] border border-[#e2e9e5] bg-white shadow-[0_16px_45px_rgba(14,47,35,0.06)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(14,47,35,0.11)]">
                    <Link to={carPath(car)} onClick={() => registerCarView(car)} className="block" aria-label={displayName}>
                      <div className="relative h-[245px] overflow-hidden bg-[linear-gradient(145deg,#f6f8f7_0%,#edf2ef_100%)] sm:h-[265px]">
                        <span className="absolute left-5 top-5 z-20 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#53645d] shadow-sm backdrop-blur-sm">
                          {car.year}
                        </span>
                        <span className="absolute right-5 top-5 z-20 rounded-full bg-[hsl(var(--carbonus-green-soft))] px-3 py-1.5 text-[11px] font-bold text-[hsl(var(--carbonus-green-dark))]">
                          {category}
                        </span>
                        <div className="absolute bottom-[13%] left-1/2 h-7 w-[74%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(17,35,28,0.27)_0%,rgba(17,35,28,0)_72%)] blur-[2px]" />
                        <img
                          src={car.image}
                          alt={displayName}
                          loading="lazy"
                          className={`relative z-10 h-full w-full object-cover object-center transition-transform duration-500 ease-out ${car.imageClass}`}
                        />
                      </div>
                    </Link>

                    <div className="p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[hsl(var(--carbonus-green-dark))]">{category}</p>
                          <h2 className="mt-1.5 text-[21px] font-bold tracking-[-0.025em] text-[#111b18]">{displayName}</h2>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] text-[#7b8b84]">{text.from}</p>
                          <p className="text-[24px] font-bold tracking-[-0.035em] text-[hsl(var(--carbonus-green))]">{carPrice(car)} €</p>
                          <p className="text-[11px] text-[#7b8b84]">{text.day}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-3 divide-x divide-[#e3ebe7] border-y border-[#e3ebe7] py-4">
                        <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                          <Users className="h-[17px] w-[17px] text-[hsl(var(--carbonus-green-dark))]" />
                          <span className="text-[11px] font-medium text-[#64756e]">{car.passengers} {text.seats}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                          <Settings2 className="h-[17px] w-[17px] text-[hsl(var(--carbonus-green-dark))]" />
                          <span className="text-[11px] font-medium text-[#64756e]">{transmission}</span>
                        </div>
                        <div className="flex flex-col items-center gap-1.5 px-2 text-center">
                          <Fuel className="h-[17px] w-[17px] text-[hsl(var(--carbonus-green-dark))]" />
                          <span className="text-[11px] font-medium text-[#64756e]">{fuel}</span>
                        </div>
                      </div>

                      <Link
                        to={carPath(car)}
                        onClick={() => registerCarView(car)}
                        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--carbonus-green-dark))] text-[13px] font-bold text-white transition hover:bg-[hsl(var(--carbonus-green-deep))]"
                      >
                        {text.view}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-[28px] border border-dashed border-[#cedbd4] bg-white px-6 py-20 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]">
                <Search className="h-6 w-6" />
              </span>
              <h2 className="mt-5 text-2xl font-bold text-[#111b18]">{text.emptyTitle}</h2>
              <p className="mx-auto mt-2 max-w-md text-[14px] leading-6 text-[#6a7b74]">{text.emptyText}</p>
              <button onClick={() => { setSearchTerm(""); setSelectedCategory("Visi"); }} className="mt-6 rounded-full bg-[hsl(var(--carbonus-green-dark))] px-6 py-3 text-[13px] font-bold text-white">
                {text.clear}
              </button>
            </div>
          )}
        </section>

        <section className="px-6 pb-24 md:px-10 lg:pb-28">
          <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] bg-[hsl(var(--carbonus-green-deep))] px-7 py-12 text-white sm:px-12 lg:flex lg:items-center lg:justify-between lg:px-16 lg:py-14">
            <div className="pointer-events-none absolute -right-14 -top-20 h-72 w-72 rounded-full border-[42px] border-white/[0.045]" />
            <div className="pointer-events-none absolute bottom-0 right-[28%] h-32 w-32 rounded-t-full bg-[hsl(var(--carbonus-green))]/20" />
            <div className="relative max-w-[690px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">{text.ctaEyebrow}</p>
              <h2 className="mt-3 text-[30px] font-bold leading-tight tracking-[-0.035em] sm:text-[38px]">{text.ctaTitle}</h2>
              <p className="mt-4 max-w-[620px] text-[15px] leading-6 text-white/68">{text.ctaText}</p>
            </div>
            <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:flex-col">
              <Link to={activeLanguage === "en" ? "/contact" : "/kontaktai"} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-7 text-[13px] font-bold text-[hsl(var(--carbonus-green-deep))] transition hover:bg-[#edf8f2]">
                {text.contact}<ArrowRight className="h-4 w-4" />
              </Link>
              <a href="tel:+37069818781" className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-7 text-[13px] font-semibold text-white transition hover:bg-white/10">
                {text.call}
              </a>
            </div>
          </div>
        </section>
      </main>

      <V3Footer />
    </div>
  );
};

export default Cars;
