import { ArrowUpRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminCarCardProps {
  car: {
    id: string;
    name: string;
    image: string;
    year?: number;
    category?: string;
    passengers?: number;
    fuel?: string;
    transmission?: string;
    priceHigh?: number | null;
    priceLow?: number | null;
  };
  onManage: () => void;
  className?: string;
}

export function AdminCarCard({ car, onManage, className }: AdminCarCardProps) {
  const specs = [car.fuel, car.transmission].filter(Boolean).join(" • ");
  const priceLabel =
    car.priceHigh && car.priceLow
      ? `${Math.round(Number(car.priceHigh))}-${Math.round(Number(car.priceLow))}€/d.`
      : car.priceHigh
        ? `${Math.round(Number(car.priceHigh))}€/d.`
        : null;

  return (
    <button
      type="button"
      onClick={onManage}
      className={cn(
        "group flex w-full flex-col overflow-hidden rounded-2xl border border-black/[0.05] bg-white text-left shadow-[0_4px_14px_rgba(16,24,40,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(16,24,40,0.12)]",
        className
      )}
    >
      <div className="w-full p-3">
        <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-[14px]">
          {car.category && (
            <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold capitalize text-muted-foreground shadow-sm">
              {car.category}
            </span>
          )}
          <img
            src={car.image}
            alt={car.name}
            loading="lazy"
            className="h-full w-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </div>



      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-[15px] font-bold leading-tight tracking-[-0.02em] text-foreground">
            {car.name}
          </h3>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>

        {car.passengers ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {car.passengers} vietos
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <p className="truncate text-xs text-muted-foreground">{specs}</p>
          {priceLabel && (
            <p className="shrink-0 text-sm font-bold text-primary">{priceLabel}</p>
          )}
        </div>
      </div>
    </button>
  );
}
