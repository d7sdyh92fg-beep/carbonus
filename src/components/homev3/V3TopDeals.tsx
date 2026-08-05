import { useState } from "react";
import { Heart, Gauge, Cog, Fuel, ChevronLeft, ChevronRight } from "lucide-react";
import mercedesSlk from "@/assets/mercedes-slk-side-clean.png";
import citroen from "@/assets/citroen-spacetourer-side-clean.png";
import hyundai from "@/assets/hyundai-bayon-side-clean.png";
import kia from "@/assets/kia-ceed-hatchback-side-khaki.png";

const BRANDS = ["Mercedes-Benz", "Citroën", "Hyundai", "KIA", "Visi 20+"];

const CARS = [
  { year: "2016", name: "Mercedes-Benz SLK", price: "79 €", perMonth: "1 490 €", km: "20 tūkst.", box: "Automatinė", fuel: "Benzinas", img: mercedesSlk },
  { year: "2021", name: "Citroën SpaceTourer", price: "69 €", perMonth: "1 290 €", km: "30 tūkst.", box: "Automatinė", fuel: "Dyzelinas", img: citroen },
  { year: "2022", name: "Hyundai Bayon", price: "45 €", perMonth: "890 €", km: "15 tūkst.", box: "Mechaninė", fuel: "Benzinas", img: hyundai },
  { year: "2019", name: "KIA Ceed", price: "39 €", perMonth: "790 €", km: "45 tūkst.", box: "Automatinė", fuel: "Dyzelinas", img: kia },
];

export function V3TopDeals() {
  const [active, setActive] = useState(0);
  const [liked, setLiked] = useState(0);

  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Geriausi pasiūlymai
          </p>
          <h2 className="mx-auto mt-3 max-w-[520px] text-[28px] font-extrabold leading-[1.2] tracking-tight text-foreground sm:text-[32px]">
            Peržiūrėkite populiariausius mūsų parko automobilius
          </h2>
        </div>

        {/* Brand filters */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {BRANDS.map((brand, i) => (
            <button
              key={brand}
              onClick={() => setActive(i)}
              className={`rounded-lg px-5 py-2.5 text-[13px] font-medium transition-all ${
                active === i
                  ? "bg-[hsl(var(--carbonus-green))] text-white shadow-[0_10px_24px_hsl(var(--carbonus-green)/0.4)]"
                  : "bg-muted text-foreground/80 hover:bg-muted/70"
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CARS.map((car, i) => (
            <article
              key={car.name}
              className="overflow-hidden rounded-2xl bg-card p-3 shadow-[0_10px_36px_rgba(16,24,40,0.10)]"
            >
              <div className="relative flex h-[150px] items-center justify-center rounded-xl bg-muted/70 p-3">
                <img
                  src={car.img}
                  alt={car.name}
                  loading="lazy"
                  className="max-h-full w-full object-contain"
                />
                <button
                  onClick={() => setLiked(i)}
                  aria-label="Įsiminti"
                  className="absolute right-3 top-3"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      liked === i
                        ? "fill-[hsl(var(--carbonus-green))] text-[hsl(var(--carbonus-green))]"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </div>

              <div className="px-2 pb-1 pt-4">
                <span className="inline-block rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
                  {car.year}
                </span>
                <h3 className="mt-2 text-[15px] font-semibold text-foreground">{car.name}</h3>
                <p className="mt-2 flex items-center gap-2 text-[15px] font-bold text-[hsl(var(--carbonus-green))]">
                  {car.price}
                  <span className="text-border">|</span>
                  <span className="font-semibold text-foreground">
                    {car.perMonth}
                    <span className="text-[11px] font-normal text-muted-foreground">/mėn.</span>
                  </span>
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Gauge className="h-3.5 w-3.5" />{car.km}</span>
                  <span className="flex items-center gap-1"><Cog className="h-3.5 w-3.5" />{car.box}</span>
                  <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{car.fuel}</span>
                </div>

                <button className="mt-4 w-full rounded-lg bg-[hsl(var(--carbonus-green-dark))] py-3 text-[13px] font-semibold text-white transition-colors hover:bg-[hsl(var(--carbonus-green-deep))]">
                  Rezervuoti
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {[ChevronLeft, ChevronRight].map((Icon, i) => (
            <button
              key={i}
              aria-label={i === 0 ? "Atgal" : "Pirmyn"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-[hsl(var(--carbonus-green))] hover:text-[hsl(var(--carbonus-green))]"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
