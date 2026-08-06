import { MapPin, CalendarDays, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FIELDS = [
  { label: "Pasirinkite vietą", icon: MapPin },
  { label: "Paėmimo data", icon: CalendarDays },
  { label: "Grąžinimo data", icon: CalendarDays },
];

export function V3SearchBar() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2 rounded-[14px] bg-white p-4 shadow-[0_18px_50px_rgba(16,24,40,0.14)] sm:flex-row sm:items-center sm:gap-0 sm:p-2 sm:pl-5 lg:h-[96px]">
      {FIELDS.map(({ label, icon: Icon }, index) => (
        <button
          key={label}
          type="button"
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/60 ${index > 0 ? "sm:border-l sm:border-border" : ""}`}
        >
          <Icon className="h-5 w-5 shrink-0 text-carbonus-green" />
          <span className="flex-1 truncate text-[14px] text-muted-foreground">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ))}
      <button
        type="button"
        onClick={() => navigate("/laisvi-automobiliai")}
        className="h-16 rounded-[10px] bg-carbonus-green-dark px-10 text-[16px] font-semibold text-white ring-4 ring-white transition-colors hover:bg-carbonus-green-deep sm:h-20"
      >
        Ieškoti
      </button>
    </div>
  );
}
