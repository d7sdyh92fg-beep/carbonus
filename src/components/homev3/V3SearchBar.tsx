import { useState } from "react";
import { MapPin, CalendarDays, Info, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import { PickupMode, TIME_OPTIONS, emptyLocation, toSearchParams } from "@/lib/rentalSearch";

const barCopy = {
  lt: {
    whereGet: "Kur norite gauti automobilį?",
    office: "Carbonus ofisas",
    delivery: "Pristatymas į vietą",
    pickupDate: "Paėmimo data",
    returnDate: "Grąžinimo data",
    search: "Ieškoti automobilių",
    infoOffice: "Automobilį galite atsiimti ir grąžinti Carbonus Druskininkuose be pristatymo mokesčio.",
    infoDelivery: "Tikslią vietą (miestą, viešbutį ar adresą) ir grąžinimo vietą nurodysite kitame žingsnyje.",
  },
  en: {
    whereGet: "Where would you like to get the car?",
    office: "Carbonus office",
    delivery: "Delivery to your location",
    pickupDate: "Pick-up date",
    returnDate: "Return date",
    search: "Search cars",
    infoOffice: "You can pick up and return the car at Carbonus in Druskininkai with no delivery fee.",
    infoDelivery: "You will enter the exact location (city, hotel or address) and the return location in the next step.",
  },
  ru: {
    whereGet: "Где вы хотите получить автомобиль?",
    office: "Офис Carbonus",
    delivery: "Доставка на место",
    pickupDate: "Дата получения",
    returnDate: "Дата возврата",
    search: "Искать автомобили",
    infoOffice: "Автомобиль можно получить и вернуть в офисе Carbonus в Друскининкай без платы за доставку.",
    infoDelivery: "Точное место (город, отель или адрес) и место возврата вы укажете на следующем шаге.",
  },
} as const;

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const fmt = (s: string) => format(new Date(`${s}T12:00:00`), "yyyy-MM-dd", { locale: lt });

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors",
        active ? "bg-carbonus-green-dark text-white" : "bg-muted text-foreground hover:bg-muted/80",
      )}
    >
      {children}
    </button>
  );
}

function DateTimeField({
  dateLabel,
  date,
  time,
  onDate,
  onTime,
  minDate,
}: {
  dateLabel: string;
  date: string;
  time: string;
  onDate: (v: string) => void;
  onTime: (v: string) => void;
  minDate?: Date;
}) {
  const [open, setOpen] = useState(false);
  const selected = new Date(`${date}T12:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const min = minDate ?? today;
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-[56px] w-full min-w-0 items-center gap-2.5 rounded-lg px-3 text-left transition-colors hover:bg-muted/60"
          >
            <CalendarDays className="h-5 w-5 shrink-0 text-carbonus-green" />
            <span className="min-w-0">
              <span className="block text-[11px] font-medium text-muted-foreground">{dateLabel}</span>
              <span className="block truncate text-[14px] font-semibold text-foreground">{fmt(date)}</span>
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="z-[90] w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(d) => {
              if (d) {
                onDate(toISO(d));
                setOpen(false);
              }
            }}
            disabled={(d) => d < min}
            locale={lt}
            className="pointer-events-auto p-3"
          />
        </PopoverContent>
      </Popover>
      <div className="w-[100px]">
        <Select value={time} onValueChange={onTime}>
          <SelectTrigger className="h-[56px] rounded-lg border-0 bg-transparent">
            <span className="flex items-center gap-1.5 text-[14px] font-semibold">
              <Clock className="h-4 w-4 text-carbonus-green" />
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent className="z-[90] max-h-64">
            {TIME_OPTIONS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function V3SearchBar() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const c = (barCopy as any)[language] ?? barCopy.lt;

  const today = toISO(new Date());
  const tomorrow = toISO(new Date(Date.now() + 86400000));

  const [pickupMode, setPickupMode] = useState<PickupMode>("office");
  const [pickupDate, setPickupDate] = useState(today);
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [returnTime, setReturnTime] = useState("10:00");

  const onPickupDate = (v: string) => {
    setPickupDate(v);
    if (new Date(`${returnDate}T12:00:00`) <= new Date(`${v}T12:00:00`)) {
      const nR = new Date(`${v}T12:00:00`);
      nR.setDate(nR.getDate() + 1);
      setReturnDate(toISO(nR));
    }
  };

  const submit = () => {
    const pickupLocation = emptyLocation(pickupMode);
    const params = toSearchParams({
      pickup: pickupLocation,
      returnMode: "same",
      returnLocation: pickupLocation,
      period: { pickupDate, pickupTime, returnDate, returnTime },
      pricing: { deliveryFee: 0, collectionFee: 0, logisticsTotal: 0 },
    });
    navigate(`/laisvi-automobiliai?${params.toString()}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  return (
    <div className="rounded-[14px] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.14)]">
      <div className="flex flex-col gap-2 p-4 sm:p-3 sm:pl-5 lg:flex-row lg:items-center lg:gap-0">
        {/* Pickup mode */}
        <div className="flex min-w-0 flex-1 items-start gap-3 rounded-lg px-1 py-2 sm:px-3">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-carbonus-green" />
          <div className="min-w-0 flex-1">
            <span className="block text-[11px] font-medium text-muted-foreground">{c.whereGet}</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Pill active={pickupMode === "office"} onClick={() => setPickupMode("office")}>
                {c.office}
              </Pill>
              <Pill active={pickupMode === "delivery"} onClick={() => setPickupMode("delivery")}>
                {c.delivery}
              </Pill>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 lg:border-l lg:border-border lg:px-2">
          <DateTimeField
            dateLabel={c.pickupDate}
            date={pickupDate}
            time={pickupTime}
            onDate={onPickupDate}
            onTime={setPickupTime}
          />
        </div>

        <div className="min-w-0 flex-1 lg:border-l lg:border-border lg:px-2">
          <DateTimeField
            dateLabel={c.returnDate}
            date={returnDate}
            time={returnTime}
            onDate={setReturnDate}
            onTime={setReturnTime}
            minDate={new Date(`${pickupDate}T12:00:00`)}
          />
        </div>

        <button
          type="button"
          onClick={submit}
          className="h-14 shrink-0 rounded-[10px] bg-carbonus-green-dark px-8 text-[16px] font-semibold text-white transition-colors hover:bg-carbonus-green-deep lg:ml-2"
        >
          {c.search}
        </button>
      </div>

      <div className="flex items-start gap-2 rounded-b-[14px] border-t border-border bg-[hsl(var(--carbonus-green-soft))]/60 px-5 py-3">
        <Info className="mt-[2px] h-4 w-4 shrink-0 text-carbonus-green" />
        <p className="text-[12px] leading-[1.6] text-muted-foreground">
          {pickupMode === "office" ? c.infoOffice : c.infoDelivery}
        </p>
      </div>
    </div>
  );
}
