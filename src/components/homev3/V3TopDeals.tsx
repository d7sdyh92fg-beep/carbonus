import { Link } from "react-router-dom";
import { ArrowUpRight, Cog, Fuel, UsersRound } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import mercedesSlk from "@/assets/car-galleries/mercedes-slk/01-EXTERIOR-FRONT.png";
import kiaHatchback from "@/assets/car-galleries/kia-ceed-hecbekas/01-EXTERIOR-FRONT.png";
import citroenSpaceTourer from "@/assets/car-galleries/citroen-spacetourer/01-EXTERIOR-FRONT.png";
import hyundaiBayon from "@/assets/car-galleries/hyundai-bayon-cross/01-EXTERIOR-FRONT.png";

const CARS = [
  {
    id: "6",
    slug: "mercedes-benz-slk-nuoma",
    brand: "Mercedes-Benz",
    year: 2015,
    category: "Kabrioletas",
    name: "Mercedes-Benz SLK",
    price: 90,
    seats: 2,
    transmission: "Automatinė",
    fuel: "Benzinas",
    img: mercedesSlk,
  },
  {
    id: "7",
    slug: "citroen-spacetourer-nuoma",
    brand: "Citroën",
    year: 2026,
    category: "Vienatūris",
    name: "Citroën SpaceTourer",
    price: 60,
    seats: 8,
    transmission: "Automatinė",
    fuel: "Dyzelinas",
    img: citroenSpaceTourer,
  },
  {
    id: "8",
    slug: "hyundai-bayon-cross-nuoma",
    brand: "Hyundai",
    year: 2026,
    category: "Krosoveris",
    name: "Hyundai Bayon Cross",
    price: 50,
    seats: 5,
    transmission: "Automatinė",
    fuel: "Benzinas",
    img: hyundaiBayon,
  },
  {
    id: "5",
    slug: "kia-ceed-hecbekas-nuoma",
    brand: "KIA",
    year: 2020,
    category: "Hečbekas",
    name: "KIA CEED Hečbekas",
    price: 30,
    seats: 5,
    transmission: "Mechaninė",
    fuel: "Dyzelinas",
    img: kiaHatchback,
  },
];

const COPY = {
  lt: {
    eyebrow: "Mūsų autoparkas",
    heading: "Išsirinkite automobilį savo kelionei",
    sub: "Visi mūsų automobiliai prižiūrėti, apdrausti ir paruošti saugiai kelionei.",
    from: "nuo",
    perDay: "/ dieną",
    seats: "vietos",
    view: "Peržiūrėti automobilį",
    viewAll: "Peržiūrėti visą autoparką",
    sideAlt: (n: string) => `${n} automobilis iš šono`,
    categories: {
      Kabrioletas: "Kabrioletas",
      Krosoveris: "Krosoveris",
      Vienatūris: "Vienatūris",
      Hečbekas: "Hečbekas",
    } as Record<string, string>,
    transmissions: { "Automatinė": "Automatinė", "Mechaninė": "Mechaninė" } as Record<string, string>,
    fuels: { Benzinas: "Benzinas", Dyzelinas: "Dyzelinas" } as Record<string, string>,
  },
  en: {
    eyebrow: "Our fleet",
    heading: "Pick the right car for your trip",
    sub: "All our cars are maintained, insured and ready for a safe journey.",
    from: "from",
    perDay: "/ day",
    seats: "seats",
    view: "View car",
    viewAll: "View the whole fleet",
    sideAlt: (n: string) => `${n} car side view`,
    categories: {
      Kabrioletas: "Convertible",
      Krosoveris: "Crossover",
      Vienatūris: "Minivan",
      Hečbekas: "Hatchback",
    } as Record<string, string>,
    transmissions: { "Automatinė": "Automatic", "Mechaninė": "Manual" } as Record<string, string>,
    fuels: { Benzinas: "Petrol", Dyzelinas: "Diesel" } as Record<string, string>,
  },
  ru: {
    eyebrow: "Наш автопарк",
    heading: "Выберите автомобиль для своей поездки",
    sub: "Все наши автомобили обслужены, застрахованы и готовы к безопасной поездке.",
    from: "от",
    perDay: "/ сутки",
    seats: "мест",
    view: "Смотреть автомобиль",
    viewAll: "Смотреть весь автопарк",
    sideAlt: (n: string) => `${n} — вид сбоку`,
    categories: {
      Kabrioletas: "Кабриолет",
      Krosoveris: "Кроссовер",
      Vienatūris: "Минивэн",
      Hečbekas: "Хэтчбек",
    } as Record<string, string>,
    transmissions: { "Automatinė": "Автомат", "Mechaninė": "Механика" } as Record<string, string>,
    fuels: { Benzinas: "Бензин", Dyzelinas: "Дизель" } as Record<string, string>,
  },
} as const;

export function V3TopDeals() {
  const { language } = useLanguage();
  const c = COPY[language] ?? COPY.lt;
  return (
    <section id="autoparkas" className="overflow-hidden bg-[hsl(210_20%_99%)] py-12 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-6">
        <div className="text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {c.eyebrow}
          </p>
          <h2 className="mx-auto mt-3 max-w-[620px] text-[30px] font-extrabold leading-[1.16] tracking-[-0.025em] text-foreground sm:text-[36px] lg:text-[40px]">
            {c.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-[560px] text-[14px] leading-relaxed text-muted-foreground">
            {c.sub}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CARS.map((car) => (
            <article
              key={car.id}
              className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-black/[0.04] bg-white p-3 shadow-[0_14px_38px_rgba(16,24,40,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(16,24,40,0.12)]"
            >
              <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-[15px] bg-[#f4f6f5]">
                <img
                  src={car.img}
                  alt={c.sideAlt(car.name)}
                  loading="lazy"
                  width={1536}
                  height={1024}
                  className="h-full w-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.025]"
                />
              </div>

              <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
                    {car.year}
                  </span>
                  <span className="rounded-md bg-[hsl(var(--carbonus-green)/0.08)] px-2 py-1 text-[11px] font-semibold text-[hsl(var(--carbonus-green-dark))]">
                    {c.categories[car.category] ?? car.category}
                  </span>
                </div>

                <h3 className="mt-3 text-[16px] font-bold tracking-[-0.02em] text-foreground">
                  {car.name}
                </h3>

                <p className="mt-2.5 flex items-baseline gap-1.5 text-[19px] font-extrabold text-[hsl(var(--carbonus-green))]">
                  {c.from} {car.price} €
                  <span className="text-[12px] font-medium text-muted-foreground">{c.perDay}</span>
                </p>

                <div className="mt-4 grid grid-cols-3 gap-1 border-t border-border pt-3.5 text-[10px] text-muted-foreground">
                  <span className="flex flex-col items-center gap-1.5 text-center">
                    <UsersRound className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
                    {car.seats} {c.seats}
                  </span>
                  <span className="flex flex-col items-center gap-1.5 text-center">
                    <Cog className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
                    {c.transmissions[car.transmission] ?? car.transmission}
                  </span>
                  <span className="flex flex-col items-center gap-1.5 text-center">
                    <Fuel className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
                    {c.fuels[car.fuel] ?? car.fuel}
                  </span>
                </div>

                <Link
                  to={`/automobiliai/${car.slug}`}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green-dark))] px-4 py-2.5 text-[12px] font-semibold text-white shadow-[0_10px_22px_hsl(var(--carbonus-green)/0.18)] transition-colors hover:bg-[hsl(var(--carbonus-green-deep))]"
                >
                  {c.view}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/automobiliai"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-[hsl(var(--carbonus-green-dark))] bg-white px-8 py-3 text-[15px] font-bold text-[hsl(var(--carbonus-green-dark))] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[hsl(var(--carbonus-green-dark))] hover:text-white hover:shadow-[0_12px_26px_hsl(var(--carbonus-green)/0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carbonus-green focus-visible:ring-offset-2"
          >
            {c.viewAll}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
