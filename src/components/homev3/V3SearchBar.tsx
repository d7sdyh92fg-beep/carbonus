import { useState } from "react";
import { MapPin, CalendarDays, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/hooks/use-language";

const barCopy = {
  lt: {
    pickupLocation: "Paėmimo vieta",
    office: "Carbonus ofisas",
    delivery: "Pristatymas kitur",
    placeholder: "Įrašykite adresą ar viešbutį",
    pickupDate: "Paėmimo data",
    returnDate: "Grąžinimo data",
    search: "Ieškoti",
    info: "Esame Druskininkuose. Jei automobilį norite atsiimti kitur Lietuvoje, taikomas papildomas atvežimo mokestis. Mielai pristatysime į jūsų pasirinktą vietą.",
  },
  en: {
    pickupLocation: "Pick-up location",
    office: "Carbonus office",
    delivery: "Delivery elsewhere",
    placeholder: "Enter an address or hotel",
    pickupDate: "Pick-up date",
    returnDate: "Return date",
    search: "Search",
    info: "We are based in Druskininkai. If you would like to pick up the car elsewhere in Lithuania, an additional delivery fee applies. We will gladly deliver it to your chosen location.",
  },
  ru: {
    pickupLocation: "Место получения",
    office: "Офис Carbonus",
    delivery: "Доставка в другое место",
    placeholder: "Укажите адрес или отель",
    pickupDate: "Дата получения",
    returnDate: "Дата возврата",
    search: "Искать",
    info: "Мы находимся в Друскининкай. Если вы хотите забрать автомобиль в другом месте Литвы, взимается дополнительная плата за доставку. Мы с удовольствием доставим его по указанному вами адресу.",
  },
} as const;

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmt = (s: string) => format(new Date(`${s}T12:00:00`), "yyyy-MM-dd", { locale: lt });

export function V3SearchBar() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const c = barCopy[language] ?? barCopy.lt;
  const today = toISO(new Date());
  const tomorrow = toISO(new Date(Date.now() + 86400000));

  const [locationMode, setLocationMode] = useState<"office" | "custom">("office");
  const [customLocation, setCustomLocation] = useState("");
  const [pickup, setPickup] = useState(today);
  const [ret, setRet] = useState(tomorrow);
  const [openP, setOpenP] = useState(false);
  const [openR, setOpenR] = useState(false);

  const submit = () => {
    const params = new URLSearchParams({ pickup, return: ret, mode: "cars" });
    const location = locationMode === "office" ? "Carbonus ofisas" : customLocation.trim().slice(0, 120);
    if (location) params.set("location", location);
    navigate(`/laisvi-automobiliai?${params.toString()}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  return (
    <div className="rounded-[14px] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.14)]">
      <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-0 sm:p-2 sm:pl-5">
        {/* Location */}
        <div className="flex min-w-0 flex-1 items-start gap-3 rounded-lg px-3 py-3">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-carbonus-green" />
          <div className="min-w-0 flex-1">
            <label className="block text-[11px] font-medium text-muted-foreground">{c.pickupLocation}</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setLocationMode("office")}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  locationMode === "office"
                    ? "bg-carbonus-green-dark text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {c.office}
              </button>
              <button
                type="button"
                onClick={() => setLocationMode("custom")}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  locationMode === "custom"
                    ? "bg-carbonus-green-dark text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {c.delivery}
              </button>
            </div>
            {locationMode === "custom" && (
              <input
                id="v3-location"
                type="text"
                value={customLocation}
                maxLength={120}
                onChange={(e) => setCustomLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={c.placeholder}
                className="mt-2 w-full bg-transparent text-[13px] font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
              />
            )}
          </div>
        </div>

        {/* Pickup date */}
        <Popover open={openP} onOpenChange={setOpenP}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/60 sm:border-l sm:border-border"
            >
              <CalendarDays className="h-5 w-5 shrink-0 text-carbonus-green" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">{c.pickupDate}</span>
                <span className="block truncate text-[14px] font-semibold text-foreground">{fmt(pickup)}</span>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="z-[80] w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(`${pickup}T12:00:00`)}
              defaultMonth={new Date(`${pickup}T12:00:00`)}
              onSelect={(d) => {
                if (!d) return;
                const nP = toISO(d);
                setPickup(nP);
                if (new Date(`${ret}T12:00:00`) <= d) {
                  const nR = new Date(d);
                  nR.setDate(nR.getDate() + 1);
                  setRet(toISO(nR));
                }
                setOpenP(false);
              }}
              disabled={(d) => {
                const t = new Date();
                t.setHours(0, 0, 0, 0);
                return d < t;
              }}
              locale={lt}
              className="pointer-events-auto p-3"
            />
          </PopoverContent>
        </Popover>

        {/* Return date */}
        <Popover open={openR} onOpenChange={setOpenR}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/60 sm:border-l sm:border-border"
            >
              <CalendarDays className="h-5 w-5 shrink-0 text-carbonus-green" />
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-medium text-muted-foreground">{c.returnDate}</span>
                <span className="block truncate text-[14px] font-semibold text-foreground">{fmt(ret)}</span>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="z-[80] w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(`${ret}T12:00:00`)}
              defaultMonth={new Date(`${ret}T12:00:00`)}
              onSelect={(d) => {
                if (d) {
                  setRet(toISO(d));
                  setOpenR(false);
                }
              }}
              disabled={(d) => d < new Date(`${pickup}T12:00:00`)}
              locale={lt}
              className="pointer-events-auto p-3"
            />
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={submit}
          className="h-16 rounded-[10px] bg-carbonus-green-dark px-10 text-[16px] font-semibold text-white ring-4 ring-white transition-colors hover:bg-carbonus-green-deep sm:h-20"
        >
          {c.search}
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-b-[14px] border-t border-border bg-[hsl(var(--carbonus-green-soft))]/60 px-5 py-3">
        <Info className="mt-[2px] h-4 w-4 shrink-0 text-carbonus-green" />
        <p className="text-[12px] leading-[1.6] text-muted-foreground">
          {c.info}
        </p>
      </div>
    </div>
  );
}
