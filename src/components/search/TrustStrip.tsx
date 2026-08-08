import { Headphones, Truck, CalendarCheck } from "lucide-react";
import { SearchCopy } from "./searchCopy";

const ICONS = [Headphones, Truck, CalendarCheck];

export function TrustStrip({ c }: { c: SearchCopy }) {
  return (
    <div className="grid grid-cols-1 gap-5 rounded-[18px] border border-black/[0.04] bg-white p-5 shadow-[0_14px_38px_rgba(16,24,40,0.06)] sm:grid-cols-3">
      {c.trust.map((item, i) => {
        const Icon = ICONS[i];
        return (
          <div key={item.title} className="flex items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--carbonus-green)/0.10)]">
              <Icon className="h-5 w-5 text-carbonus-green-dark" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-foreground">{item.title}</p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{item.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
