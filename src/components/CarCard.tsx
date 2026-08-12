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
    <article className={cn(
      "group flex h-full flex-col overflow-hidden rounded-[20px] border border-black/[0.04] bg-white shadow-[0_14px_38px_rgba(16,24,40,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_48px_rgba(16,24,40,0.12)]",
      isLg ? "p-4" : "p-3"
    )}>
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

      <div className={cn("flex flex-1 flex-col px-1 pb-1", isLg ? "pt-5" : "pt-4")}>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-md border border-border px-2 py-1 font-medium text-muted-foreground", isLg ? "text-[12px]" : "text-[11px]")}>
            {car.year}
          </span>
          <span className={cn("rounded-md bg-[hsl(var(--carbonus-green)/0.08)] px-2 py-1 font-semibold text-[hsl(var(--carbonus-green-dark))]", isLg ? "text-[12px]" : "text-[11px]")}>
            {categoryLabel}
          </span>
        </div>

        <h3 className={cn("mt-3 font-bold tracking-[-0.02em] text-foreground", isLg ? "text-[18px]" : "text-[16px]")}>
          {car.name}
        </h3>

        <p className={cn("mt-2.5 flex items-baseline gap-1.5 font-extrabold text-[hsl(var(--carbonus-green))]", isLg ? "text-[22px]" : "text-[19px]")}>
          {priceFrom} {price}
          <span className={cn("font-medium text-muted-foreground", isLg ? "text-[13px]" : "text-[12px]")}>{pricePerDay}</span>
        </p>

        <div className={cn("mt-4 grid grid-cols-3 gap-1 border-t border-border pt-3.5 text-muted-foreground", isLg ? "text-[11px]" : "text-[10px]")}>
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Users className={cn("text-[hsl(var(--carbonus-green-dark))]", isLg ? "h-[18px] w-[18px]" : "h-4 w-4")} />
            {car.passengers}
          </span>
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Settings className={cn("text-[hsl(var(--carbonus-green-dark))]", isLg ? "h-[18px] w-[18px]" : "h-4 w-4")} />
            {transmissionLabel}
          </span>
          <span className="flex flex-col items-center gap-1.5 text-center">
            <Fuel className={cn("text-[hsl(var(--carbonus-green-dark))]", isLg ? "h-[18px] w-[18px]" : "h-4 w-4")} />
            {fuelLabel}
          </span>
        </div>

        <div className={cn("", isLg ? "mt-6" : "mt-5")}>{cta}</div>
      </div>
    </article>
  );
}
