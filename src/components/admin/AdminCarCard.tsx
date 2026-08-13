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
        "group flex items-center gap-3 overflow-hidden rounded-[16px] border border-black/[0.04] bg-white p-2.5 shadow-[0_8px_24px_rgba(16,24,40,0.06)] transition-all duration-200 hover:shadow-[0_12px_32px_rgba(16,24,40,0.1)]",
        className
      )}
    >
      <div className="relative h-[72px] w-[100px] flex-shrink-0 overflow-hidden rounded-[12px] bg-[#f4f6f5]">
        <img
          src={car.image}
          alt={car.name}
          loading="lazy"
          className="h-full w-full object-cover mix-blend-multiply"
        />
      </div>
      <div className="flex flex-1 flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {car.year}
          </span>
        </div>
        <h3 className="mt-1 text-[15px] font-bold leading-tight tracking-[-0.02em] text-foreground truncate">
          {car.name}
        </h3>
      </div>
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onManage();
        }}
        className="h-8 px-2.5 text-xs flex-shrink-0"
      >
        <Settings2 className="h-3.5 w-3.5 mr-1" />
        Valdyti
      </Button>
    </div>
  );
}
