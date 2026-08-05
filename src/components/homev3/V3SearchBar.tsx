import { MapPin, ChevronDown } from "lucide-react";

const FIELDS = ["Pasirinkite vietą", "Paėmimo data", "Grąžinimo data"];

export function V3SearchBar() {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] bg-white p-4 shadow-[0_18px_50px_rgba(16,24,40,0.14)] sm:flex-row sm:items-center sm:gap-1 sm:p-3 sm:pl-5">
      {FIELDS.map((label) => (
        <button
          key={label}
          className="flex flex-1 items-center gap-2 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/60"
        >
          <MapPin className="h-4 w-4 shrink-0 text-[hsl(var(--carbonus-green))]" />
          <span className="flex-1 truncate text-[14px] text-muted-foreground">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </button>
      ))}
      <button className="rounded-[10px] bg-[hsl(var(--carbonus-green-dark))] px-10 py-4 text-[15px] font-semibold text-white ring-4 ring-white transition-colors hover:bg-[hsl(var(--carbonus-green-deep))]">
        Ieškoti
      </button>
    </div>
  );
}
