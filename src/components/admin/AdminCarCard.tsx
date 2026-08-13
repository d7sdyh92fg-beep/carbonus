import { Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminCarCardProps {
  car: {
    id: string;
    name: string;
    image: string;
    year: number;
  };
  onManage: () => void;
  className?: string;
}

export function AdminCarCard({ car, onManage, className }: AdminCarCardProps) {
  return (
    <div
      className={cn(
        "group flex w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-[14px] border border-black/[0.04] bg-white p-2 shadow-[0_6px_18px_rgba(16,24,40,0.05)] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(16,24,40,0.1)] sm:gap-3 sm:rounded-[16px] sm:p-2.5",
        className
      )}
    >
      <div className="relative aspect-[4/3] h-[56px] w-auto flex-shrink-0 overflow-hidden rounded-[10px] bg-[#f4f6f5] sm:h-[64px] sm:rounded-[12px] lg:h-[72px]">
        <img
          src={car.image}
          alt={car.name}
          loading="lazy"
          className="h-full w-full object-cover mix-blend-multiply"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className="w-fit rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
          {car.year}
        </span>
        <h3 className="mt-1 truncate text-[13px] font-bold leading-tight tracking-[-0.02em] text-foreground sm:text-[15px]">
          {car.name}
        </h3>
      </div>

      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onManage();
        }}
        className="h-8 w-8 flex-shrink-0 p-0 text-xs sm:w-auto sm:px-2.5"
        aria-label="Valdyti"
      >
        <Settings2 className="h-3.5 w-3.5 sm:mr-1" />
        <span className="hidden sm:inline">Valdyti</span>
      </Button>
    </div>
  );
}
