import { Apple, Play } from "lucide-react";

export function V3StoreButtons({ variant = "light" }: { variant?: "light" | "onColor" }) {
  const base =
    "flex items-center gap-2.5 rounded-lg bg-white px-4 py-2.5 shadow-[0_6px_16px_rgba(0,0,0,0.08)] transition-transform hover:-translate-y-0.5";

  return (
    <div className="flex flex-wrap gap-3" data-variant={variant}>
      <button type="button" className={base} aria-label="Atsisiųsti iš App Store">
        <Apple className="h-6 w-6 text-foreground" fill="currentColor" strokeWidth={0} />
        <span className="text-left leading-tight">
          <span className="block text-[9px] text-muted-foreground">Download on the</span>
          <span className="block text-[13px] font-semibold text-foreground">App Store</span>
        </span>
      </button>
      <button type="button" className={base} aria-label="Atsisiųsti iš Google Play">
        <Play className="h-5 w-5 text-carbonus-green" fill="currentColor" strokeWidth={0} />
        <span className="text-left leading-tight">
          <span className="block text-[9px] text-muted-foreground">Get it on</span>
          <span className="block text-[13px] font-semibold text-foreground">Google Play</span>
        </span>
      </button>
    </div>
  );
}
