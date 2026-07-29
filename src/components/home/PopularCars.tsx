import { useNavigate } from "react-router-dom";
import { ArrowRight, Star, Users, Fuel, CalendarDays, Settings2 } from "lucide-react";
import mercedesSlk from "@/assets/mercedes-slk-side-clean.png";
import citroen from "@/assets/citroen-spacetourer-side-clean.png";
import hyundai from "@/assets/hyundai-bayon-side-clean.png";
import vw from "@/assets/vw-passat-side-clean.png";
import kia from "@/assets/kia-ceed-hatchback-side-khaki.png";
import { getCarSlugFromId } from "@/utils/carSlugs";

type Car = {
  id: string; name: string; category: string; rating: number;
  seats: number; fuel: string; year: number; transmission: string;
  price: number; image: string;
};

const cars: Car[] = [
  { id: "6", name: "Mercedes-Benz SLK", category: "Kabrioletas", rating: 4.9, seats: 2, fuel: "Benzinas", year: 2015, transmission: "Automatinė", price: 100, image: mercedesSlk },
  { id: "7", name: "Citroën SpaceTourer", category: "Vienatūris", rating: 4.8, seats: 8, fuel: "Dyzelinas", year: 2026, transmission: "Automatinė", price: 80, image: citroen },
  { id: "8", name: "Hyundai Bayon Cross", category: "Visureigis", rating: 4.7, seats: 5, fuel: "Benzinas", year: 2020, transmission: "Automatinė", price: 30, image: hyundai },
  { id: "3", name: "Volkswagen Passat", category: "Sedanas", rating: 4.7, seats: 5, fuel: "Dyzelinas", year: 2012, transmission: "Mechaninė", price: 30, image: vw },
  { id: "5", name: "KIA CEED", category: "Hečbekas", rating: 4.6, seats: 5, fuel: "Dyzelinas", year: 2020, transmission: "Mechaninė", price: 30, image: kia },
];

function CarShadow({ carId }: { carId: string }) {
  const width = carId === "6" ? "w-[78%]" : "w-[92%]";
  return (
    <div
      className={`absolute left-1/2 -translate-x-1/2 ${width} h-5 rounded-[50%] z-0`}
      style={{
        bottom: "10%",
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, transparent 75%)",
        filter: "blur(6px)",
      }}
      aria-hidden
    />
  );
}


function CarCard({ car }: { car: Car }) {
  const navigate = useNavigate();
  const slug = getCarSlugFromId(car.id, "lt");
  const open = () => navigate(slug ? `/automobiliai/${slug}` : "/automobiliai");

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-[hsl(var(--border))] p-5 shadow-[0_8px_24px_rgba(18,35,29,0.06)] hover:shadow-[0_18px_40px_rgba(18,35,29,0.12)] hover:-translate-y-1 transition-all duration-200">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center h-7 rounded-full bg-[hsl(var(--carbonus-dark))] text-white text-[12px] font-semibold px-3">
          {car.category}
        </span>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#12191A]">
          <Star className="h-4 w-4" style={{ color: "#FFC44D", fill: "#FFC44D" }} />
          {car.rating.toFixed(1)}
        </span>
      </div>

      {/* Image */}
      <div className="relative mt-3 h-[150px] flex items-end justify-center">
        <CarShadow carId={car.id} />
        <img
          src={car.image}
          alt={car.name}
          data-allow-save="true"
          loading="lazy"
          className={[
            "w-[92%] max-w-[220px] max-h-[120px] object-contain object-bottom relative z-10 mix-blend-multiply transition-transform duration-300 group-hover:scale-[1.04]",
            (car.id === "8" || car.id === "5") ? "scale-[1.24] translate-y-3.5" : "",
          ].join(" ")}
          onContextMenu={(e) => e.stopPropagation()}
        />
      </div>

      {/* Title */}
      <h3 className="mt-4 text-[17px] font-bold text-[#12191A]">{car.name}</h3>

      {/* Meta */}
      <div className="mt-3 grid grid-cols-2 gap-y-2.5 gap-x-3 text-[13px] text-[#697475]">
        <span className="inline-flex items-center gap-2"><Users className="h-4 w-4" />{car.seats}</span>
        <span className="inline-flex items-center gap-2"><Fuel className="h-4 w-4" />{car.fuel}</span>
        <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{car.year}</span>
        <span className="inline-flex items-center gap-2"><Settings2 className="h-4 w-4" />{car.transmission}</span>
      </div>

      {/* Bottom */}
      <div className="mt-5 flex items-end justify-between">
        <div>
          <div className="text-[12px] text-[#8B9494] leading-none mb-1">nuo</div>
          <div className="text-[24px] font-extrabold text-[hsl(var(--carbonus-green))] leading-none">
            {car.price} € <span className="text-[13px] text-[#8B9494] font-medium">/d.</span>
          </div>
        </div>
        <button
          onClick={open}
          className="h-[38px] px-5 rounded-lg text-white text-[13px] font-bold bg-[hsl(var(--carbonus-green))] hover:bg-[hsl(var(--carbonus-green-hover))] transition"
        >
          Rinktis
        </button>
      </div>
    </div>
  );
}

export function PopularCars() {
  const navigate = useNavigate();
  return (
    <section id="popular-cars" className="bg-white pt-[72px] pb-[84px]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="text-[12px] uppercase tracking-[0.10em] font-bold text-[hsl(var(--carbonus-green))]">
              Populiariausi automobiliai
            </div>
            <h2 className="mt-2 font-extrabold tracking-[-0.025em] text-[#12191A]" style={{ fontSize: "clamp(26px, 3.4vw, 34px)", lineHeight: 1.18 }}>
              Rinkitės iš mūsų geriausių pasiūlymų
            </h2>
          </div>
          <button
            onClick={() => navigate("/automobiliai")}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[hsl(var(--carbonus-green))] hover:text-[hsl(var(--carbonus-green-hover))]"
          >
            Peržiūrėti visus automobilius <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cars.map((c) => <CarCard key={c.id} car={c} />)}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/automobiliai")}
            className="inline-flex items-center justify-center gap-2 h-[46px] w-full sm:w-[330px] rounded-lg bg-white border-2 border-[hsl(var(--carbonus-green))] text-[hsl(var(--carbonus-green))] font-bold text-sm hover:bg-[hsl(var(--carbonus-green-soft))] transition"
          >
            Žiūrėti daugiau automobilių <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
