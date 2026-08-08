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
    officeLabel: "Carbonus ofisas",
    officeDesc: "Automobilį atsiimsite ir grąžinsite Carbonus ofise Druskininkuose be papildomo mokesčio.",
    druskininkaiLabel: "Druskininkai",
    druskininkaiDesc: "Druskininkuose automobilį nemokamai pristatysime į jūsų viešbutį ar kitą pasirinktą adresą.",
    otherCityLabel: "Kitas miestas",
    otherCityDesc: "Automobilį galime pristatyti į kitą miestą už papildomą mokestį. Tikslią vietą ir kainą pasirinksite kitame žingsnyje.",
    placeholder: "Įrašykite miestą, adresą ar viešbutį",
    pickupDate: "Paėmimo data",
    returnDate: "Grąžinimo data",
    search: "Ieškoti",
    info: "Atsiėmimas Carbonus ofise Druskininkuose ir pristatymas Druskininkuose – nemokama. Kitur Lietuvoje taikomas papildomas atvežimo mokestis, kurį patvirtinsime kitame žingsnyje.",
  },
  en: {
    pickupLocation: "Pick-up location",
    officeLabel: "Carbonus office",
    officeDesc: "Pick up and return the car at the Carbonus office in Druskininkai with no extra fee.",
    druskininkaiLabel: "Druskininkai",
    druskininkaiDesc: "In Druskininkai, we will deliver the car for free to your hotel or chosen address.",
    otherCityLabel: "Other city",
    otherCityDesc: "We can deliver the car to another city for an additional fee. The exact location and price will be selected in the next step.",
    placeholder: "Enter city, address or hotel",
    pickupDate: "Pick-up date",
    returnDate: "Return date",
    search: "Search",
    info: "Pick-up at the Carbonus office in Druskininkai and delivery within Druskininkai are free. An additional delivery fee applies to other cities in Lithuania; the exact price will be confirmed in the next step.",
  },
  ru: {
    pickupLocation: "Место получения",
    officeLabel: "Офис Carbonus",
    officeDesc: "Заберите и верните автомобиль в офисе Carbonus в Друскининкай без дополнительной платы.",
    druskininkaiLabel: "Друскининкай",
    druskininkaiDesc: "В Друскининкай мы бесплатно доставим автомобиль в ваш отель или по указанному адресу.",
    otherCityLabel: "Другой город",
    otherCityDesc: "Мы можем доставить автомобиль в другой город за дополнительную плату. Точное место и цену вы выберете на следующем шаге.",
    placeholder: "Укажите город, адрес или отель",
    pickupDate: "Дата получения",
    returnDate: "Дата возврата",
    search: "Искать",
    info: "Получение автомобиля в офисе Carbonus в Друскининкай и доставка по Друскининкай – бесплатно. В другие города Литвы взимается дополнительная плата за доставку; точная цена будет подтверждена на следующем шаге.",
  },
} as const;

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmt = (s: string) => format(new Date(`${s}T12:00:00`), "yyyy-MM-dd", { locale: lt });

type LocationMode = "office" | "druskininkai" | "custom";

export function V3SearchBar() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const c = barCopy[language] ?? barCopy.lt;
  const today = toISO(new Date());
  const tomorrow = toISO(new Date(Date.now() + 86400000));

  const [locationMode, setLocationMode] = useState<LocationMode>("office");
  const [pickup, setPickup] = useState(today);
  const [ret, setRet] = useState(tomorrow);
  const [openP, setOpenP] = useState(false);
  const [openR, setOpenR] = useState(false);

  const modeDescription = {
    office: c.officeDesc,
    druskininkai: c.druskininkaiDesc,
    custom: c.otherCityDesc,
  }[locationMode];

  const submit = () => {
    const params = new URLSearchParams({ pickup, return: ret, mode: "cars" });
    const location =
      locationMode === "office"
        ? "Carbonus ofisas"
        : locationMode === "druskininkai"
        ? "Druskininkai"
        : customLocation.trim().slice(0, 120) || c.otherCityLabel;
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
                {c.officeLabel}
              </button>
              <button
                type="button"
                onClick={() => setLocationMode("druskininkai")}
                className={cn(
                  "rounded-full px-3 py-1 text-[12px] font-medium transition-colors",
                  locationMode === "druskininkai"
                    ? "bg-carbonus-green-dark text-white"
                    : "bg-muted text-foreground hover:bg-muted/80"
                )}
              >
                {c.druskininkaiLabel}
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
                {c.otherCityLabel}
              </button>
            </div>
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
        <p className="text-[12px] leading-[1.6] text-muted-foreground">{modeDescription}</p>
      </div>
    </div>
  );
}
