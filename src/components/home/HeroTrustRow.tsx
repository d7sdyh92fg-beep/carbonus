import { RefreshCcw, BadgeCheck, Headphones } from "lucide-react";

const items = [
  { icon: RefreshCcw, title: "Nemokamas atšaukimas", text: "Iki 24 val. prieš paėmimą" },
  { icon: BadgeCheck, title: "Be paslėptų mokesčių", text: "Kaina, kurią matote – galutinė" },
  { icon: Headphones, title: "24/7 klientų pagalba", text: "Esame čia, kad padėtume" },
];

export function HeroTrustRow() {
  return (
    <div className="w-full mt-3 grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-[hsl(var(--carbonus-dark))]/10">
      {items.map(({ icon: Icon, title, text }, i) => (
        <div
          key={title}
          className={`flex items-center justify-center gap-3 py-3 md:py-2 px-4 ${i > 0 ? "border-t border-[hsl(var(--carbonus-dark))]/10 md:border-t-0" : ""}`}
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--carbonus-green-soft))] border border-[hsl(var(--carbonus-green))]/25 text-[hsl(var(--carbonus-green-dark))] shrink-0">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <div className="text-[hsl(var(--carbonus-dark))] text-[13px] font-bold leading-tight">{title}</div>
            <div className="text-[hsl(var(--carbonus-dark))]/60 text-[12px] leading-[1.4] mt-0.5">{text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
