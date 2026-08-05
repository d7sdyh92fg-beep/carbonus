import { Apple, Play } from "lucide-react";

export function V3StoreButtons({ variant = "light" }: { variant?: "light" | "onColor" }) {
  const base =
    "flex items-center gap-2.5 rounded-lg px-4 py-2.5 shadow-[0_4px_14px_rgba(0,0,0,0.06)] bg-white";
  return (
    <div className="flex flex-wrap gap-3">
      <button className={base}>
        <Apple className="h-6 w-6 text-foreground" fill="currentColor" strokeWidth={0} />
        <span className="text-left leading-tight">
          <span className="block text-[9px] text-muted-foreground">Download on the</span>
          <span className="block text-[13px] font-semibold text-foreground">Apple Store</span>
        </span>
      </button>
      <button className={base}>
        <Play className="h-5 w-5 text-[hsl(var(--carbonus-green))]" fill="currentColor" strokeWidth={0} />
        <span className="text-left leading-tight">
          <span className="block text-[9px] text-muted-foreground">Get it from</span>
          <span className="block text-[13px] font-semibold text-foreground">Google Play</span>
        </span>
      </button>
      {variant === "onColor" && null}
    </div>
  );
}
