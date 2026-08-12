import { Users, Settings, Fuel } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CarCardData {
  id: string;
  name: string;
  image: string;
  year: number;
  category: string;
  passengers: number;
  transmission: string;
  fuel: string;
}

interface CarCardProps {
  car: CarCardData;
  price: string;
  priceFrom: string;
  pricePerDay: string;
  categoryLabel: string;
  transmissionLabel: string;
  fuelLabel: string;
  cta: React.ReactNode;
  imageLoaded?: boolean;
  onImageLoad?: () => void;
  size?: "default" | "lg";
}

export function CarCard({
  car,
  price,
  priceFrom,
  pricePerDay,
  categoryLabel,
  transmissionLabel,
  fuelLabel,
  cta,
  imageLoaded = true,
  onImageLoad,
  size = "default",
}: CarCardProps) {
  const isLg = size === "lg";
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-black/[0.04] bg-white p-3 shadow-[0_14px_38px_rgba(16,24,40,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(16,24,40,0.12)]">
      <div className="relative flex aspect-[3/2] items-center justify-center overflow-hidden rounded-[15px] bg-[#f4f6f5]">
        <img
          src={car.image}
          alt={car.name}
          loading="lazy"
          width={1536}
          height={1024}
          data-allow-save="true"
          onLoad={onImageLoad}
          className={cn(
            "h-full w-full object-cover mix-blend-multiply transition-all duration-500 group-hover:scale-[1.025]",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-4">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border px-2 py-1 text-[11px] font-medium text-muted-foreground">
            {car.year}
          </span>
          <span className="rounded-md bg-[hsl(var(--carbonus-green)/0.08)] px-2 py-1 text-[11px] font-semibold text-[hsl(var(--carbonus-green-dark))]">
            {categoryLabel}
          </span>
        </div>

        <h3 className="mt-3 text-[16px] font-bold tracking-[-0.02em] text-foreground">
          {car.name}
        </h3>

        <p className="mt-2.5 flex items-baseline gap-1.5 text-[19px] font-extrabold text-[hsl(var(--carbonus-green))]">
          {priceFrom} {price}
          <span className="text-[12px] font-medium text-muted-foreground">{pricePerDay}</span>
        </p>

        <div className="mt-4 grid grid-cols-3 gap-1 border-t border-border pt-3.5 text-[10px] text-muted-foreground">
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Users className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
            {car.passengers}
          </span>
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Settings className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
            {transmissionLabel}
          </span>
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Fuel className="h-4 w-4 text-[hsl(var(--carbonus-green-dark))]" />
            {fuelLabel}
          </span>
        </div>

        <div className="mt-5">{cta}</div>
      </div>
    </article>
  );
}
