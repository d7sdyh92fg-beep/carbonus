import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { MapPin, CalendarDays, ChevronDown, Search, Calendar as CalIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const formatLt = (dateStr: string) =>
  format(new Date(`${dateStr}T12:00:00`), "yyyy-MM-dd", { locale: lt });

function FieldShell({ label, icon, trailing, onClick, children }: {
  label: string; icon: React.ReactNode; trailing?: React.ReactNode; onClick?: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left rounded-lg bg-white/[0.055] border border-white/[0.06] hover:bg-white/[0.09] transition-colors h-[56px] px-3.5 py-2 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--carbonus-green)/0.4)]"
    >
      <span className="text-[hsl(var(--carbonus-green))] shrink-0">{icon}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[11px] font-medium text-white/60">{label}</span>
        <span className="block text-sm font-semibold text-white truncate">{children}</span>
      </span>
      {trailing && <span className="text-white/50 shrink-0">{trailing}</span>}
    </button>
  );
}


export function HeroBookingForm() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [pickup, setPickup] = useState(today);
  const [ret, setRet] = useState(tomorrow);
  const [openP, setOpenP] = useState(false);
  const [openR, setOpenR] = useState(false);

  const submit = () => {
    const params = new URLSearchParams({ pickup, return: ret, mode: "cars" });
    navigate(`/laisvi-automobiliai?${params.toString()}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  return (
    <div
      className="w-full backdrop-blur-xl shadow-[0_16px_50px_rgba(0,0,0,0.35)]"
      style={{
        minHeight: 82,
        padding: 13,
        borderRadius: 14,
        background: "rgba(10, 31, 32, 0.94)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-[10px] lg:gap-[10px]"
        style={{
          gridTemplateColumns: undefined,
        }}
      >
        <div className="hidden lg:grid col-span-full" style={{ display: "grid", gridTemplateColumns: "minmax(210px,1.15fr) minmax(190px,1fr) minmax(190px,1fr) minmax(220px,1.15fr)", gap: 10 }}>

        {/* Location */}
        <FieldShell
          label="Paėmimo vieta"
          icon={<MapPin className="h-4 w-4" />}
          trailing={<ChevronDown className="h-4 w-4" />}
        >
          Druskininkai
        </FieldShell>

        {/* Pickup */}
        <Popover open={openP} onOpenChange={setOpenP}>
          <PopoverTrigger asChild>
            <div>
              <FieldShell
                label="Paėmimo data"
                icon={<CalendarDays className="h-4 w-4" />}
                trailing={<CalIcon className="h-4 w-4" />}
                onClick={() => setOpenP(true)}
              >
                {formatLt(pickup)}
              </FieldShell>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[80]" align="start">
            <Calendar
              mode="single"
              selected={new Date(`${pickup}T12:00:00`)}
              defaultMonth={new Date(`${pickup}T12:00:00`)}
              onSelect={(d) => {
                if (!d) return;
                const oldP = new Date(`${pickup}T12:00:00`).getTime();
                const oldR = new Date(`${ret}T12:00:00`).getTime();
                const diff = Math.max(1, Math.round((oldR - oldP) / 86400000));
                const nP = toISO(d);
                const nR = new Date(d); nR.setDate(nR.getDate() + diff);
                setPickup(nP); setRet(toISO(nR)); setOpenP(false);
              }}
              disabled={(d) => { const t = new Date(); t.setHours(0,0,0,0); return d < t; }}
              locale={lt}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Return */}
        <Popover open={openR} onOpenChange={setOpenR}>
          <PopoverTrigger asChild>
            <div>
              <FieldShell
                label="Grąžinimo data"
                icon={<CalendarDays className="h-4 w-4" />}
                trailing={<CalIcon className="h-4 w-4" />}
                onClick={() => setOpenR(true)}
              >
                {formatLt(ret)}
              </FieldShell>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-[80]" align="start">
            <Calendar
              mode="single"
              selected={new Date(`${ret}T12:00:00`)}
              defaultMonth={new Date(`${ret}T12:00:00`)}
              onSelect={(d) => { if (d) { setRet(toISO(d)); setOpenR(false); } }}
              disabled={(d) => d < new Date(`${pickup}T12:00:00`)}
              locale={lt}
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Search */}
        <button
          type="button"
          onClick={submit}
          className="min-h-[54px] rounded-lg text-white text-sm font-bold inline-flex items-center justify-center gap-2 bg-gradient-to-br from-[hsl(var(--carbonus-green))] to-[hsl(var(--carbonus-green-hover))] hover:-translate-y-0.5 hover:brightness-110 transition-all shadow-[0_10px_30px_hsl(var(--carbonus-green)/0.3)]"
        >
          <Search className="h-4 w-4" /> Ieškoti automobilių
        </button>
      </div>
    </div>
  );
}
