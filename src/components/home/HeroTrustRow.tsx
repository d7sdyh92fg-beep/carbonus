import { RefreshCcw, BadgeCheck, Headphones } from "lucide-react";

const items = [
  { icon: RefreshCcw, title: "Nemokamas atšaukimas", text: "Iki 24 val. prieš paėmimą" },
  { icon: BadgeCheck, title: "Be paslėptų mokesčių", text: "Kaina, kurią matote – galutinė" },
  { icon: Headphones, title: "24/7 klientų pagalba", text: "Esame čia, kad padėtume" },
];

export function HeroTrustRow() {
  return (
    <div className="w-full mt-8 grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-white/10">
      {items.map(({ icon: Icon, title, text }, i) => (
        <div
          key={title}
          className={`flex items-center justify-center gap-3 py-3 md:py-2 px-4 ${i > 0 ? "border-t border-white/10 md:border-t-0" : ""}`}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-[hsl(var(--carbonus-green))] shrink-0">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-white text-[13px] font-bold leading-tight">{title}</div>
            <div className="text-white/60 text-[12px] leading-[1.4] mt-0.5">{text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
