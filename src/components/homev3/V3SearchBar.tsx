import { useEffect, useMemo, useState } from "react";
import { MapPin, CalendarDays, Info, Clock, Loader2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/use-language";
import {
  CITIES,
  OFFICE_CITY,
  PickupMode,
  RentalLocation,
  ReturnMode,
  TIME_OPTIONS,
  calculateLogisticsTotal,
  emptyLocation,
  toSearchParams,
} from "@/lib/rentalSearch";

const barCopy = {
  lt: {
    whereGet: "Kur norite gauti automobilį?",
    office: "Carbonus ofisas",
    delivery: "Pristatymas į vietą",
    officeHint: "Carbonus bazė Druskininkuose",
    city: "Miestas",
    cityPlaceholder: "Pasirinkite miestą",
    address: "Adresas arba vietos pavadinimas",
    addressPlaceholder: "Viešbutis, gatvė arba adresas",
    pickupDate: "Paėmimo data",
    deliveryDate: "Pristatymo data",
    pickupTime: "Laikas",
    returnDate: "Grąžinimo data",
    returnTime: "Laikas",
    whereReturn: "Kur grąžinsite automobilį?",
    same: "Ta pati vieta",
    returnOffice: "Carbonus ofisas",
    other: "Kita vieta",
    returnCity: "Grąžinimo miestas",
    deliveryFee: "Pristatymas",
    collectionFee: "Atsiėmimas",
    logistics: "Logistika iš viso",
    calculating: "Skaičiuojama pristatymo kaina…",
    unsupported: "Šios pristatymo vietos kainos automatiškai apskaičiuoti nepavyko.",
    search: "Ieškoti automobilių",
    errCity: "Pasirinkite miestą",
    errAddress: "Įveskite adresą arba vietos pavadinimą",
    errDates: "Grąžinimo data negali būti anksčiau už paėmimo datą",
    infoOffice: "Automobilį galite atsiimti ir grąžinti Carbonus Druskininkuose be pristatymo mokesčio.",
    infoDelivery: "Automobilį galime pristatyti į jūsų pasirinktą vietą ir po nuomos atsiimti. Kaina apskaičiuojama automatiškai.",
    infoPriced: (a: string, n: number) => `Pristatymas ir atsiėmimas (${a}): ${n} €`,
  },
  en: {
    whereGet: "Where would you like to get the car?",
    office: "Carbonus office",
    delivery: "Delivery to your location",
    officeHint: "Carbonus base in Druskininkai",
    city: "City",
    cityPlaceholder: "Select a city",
    address: "Address or place name",
    addressPlaceholder: "Hotel, street or address",
    pickupDate: "Pick-up date",
    deliveryDate: "Delivery date",
    pickupTime: "Time",
    returnDate: "Return date",
    returnTime: "Time",
    whereReturn: "Where will you return the car?",
    same: "Same location",
    returnOffice: "Carbonus office",
    other: "Another location",
    returnCity: "Return city",
    deliveryFee: "Delivery",
    collectionFee: "Collection",
    logistics: "Logistics total",
    calculating: "Calculating delivery price…",
    unsupported: "We could not automatically calculate the price for this location.",
    search: "Search cars",
    errCity: "Select a city",
    errAddress: "Enter an address or place name",
    errDates: "Return date cannot be before the pick-up date",
    infoOffice: "You can pick up and return the car at Carbonus in Druskininkai with no delivery fee.",
    infoDelivery: "We can deliver the car to your chosen location and collect it after the rental. The price is calculated automatically.",
    infoPriced: (a: string, n: number) => `Delivery and collection (${a}): €${n}`,
  },
  ru: {
    whereGet: "Где вы хотите получить автомобиль?",
    office: "Офис Carbonus",
    delivery: "Доставка на место",
    officeHint: "База Carbonus в Друскининкай",
    city: "Город",
    cityPlaceholder: "Выберите город",
    address: "Адрес или название места",
    addressPlaceholder: "Отель, улица или адрес",
    pickupDate: "Дата получения",
    deliveryDate: "Дата доставки",
    pickupTime: "Время",
    returnDate: "Дата возврата",
    returnTime: "Время",
    whereReturn: "Где вы вернёте автомобиль?",
    same: "То же место",
    returnOffice: "Офис Carbonus",
    other: "Другое место",
    returnCity: "Город возврата",
    deliveryFee: "Доставка",
    collectionFee: "Забор",
    logistics: "Логистика всего",
    calculating: "Рассчитываем стоимость доставки…",
    unsupported: "Не удалось автоматически рассчитать стоимость для этого места.",
    search: "Искать автомобили",
    errCity: "Выберите город",
    errAddress: "Введите адрес или название места",
    errDates: "Дата возврата не может быть раньше даты получения",
    infoOffice: "Автомобиль можно получить и вернуть в офисе Carbonus в Друскининкай без платы за доставку.",
    infoDelivery: "Мы можем доставить автомобиль в выбранное вами место и забрать его после аренды. Стоимость рассчитывается автоматически.",
    infoPriced: (a: string, n: number) => `Доставка и забор (${a}): ${n} €`,
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-medium text-muted-foreground">{children}</label>;
}

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive">
      <AlertCircle className="h-3 w-3" /> {children}
    </p>
  );
}

/** Autocomplete-ready location picker (city + free text place). */
function LocationFields({
  value,
  onChange,
  copy,
  cityLabel,
  errors,
  idPrefix,
}: {
  value: RentalLocation;
  onChange: (l: RentalLocation) => void;
  copy: typeof barCopy["lt"];
  cityLabel: string;
  errors: { city?: string; address?: string };
  idPrefix: string;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <div>
        <FieldLabel>{cityLabel}</FieldLabel>
        <Select
          value={value.city || undefined}
          onValueChange={(v) => {
            const c = CITIES.find((x) => x.label === v);
            onChange({ ...value, city: v, country: c?.country || "LT", lat: null, lng: null });
          }}
        >
          <SelectTrigger id={`${idPrefix}-city`} className="mt-1 h-11 rounded-lg">
            <SelectValue placeholder={copy.cityPlaceholder} />
          </SelectTrigger>
          <SelectContent className="z-[90]">
            {CITIES.map((c) => (
              <SelectItem key={c.id} value={c.label}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError>{errors.city}</FieldError>
      </div>
      <div>
        <FieldLabel>{copy.address}</FieldLabel>
        <input
          id={`${idPrefix}-address`}
          type="text"
          value={value.address}
          maxLength={140}
          autoComplete="off"
          onChange={(e) => onChange({ ...value, address: e.target.value, placeName: e.target.value })}
          placeholder={copy.addressPlaceholder}
          className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-[14px] font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus:border-carbonus-green"
        />
        <FieldError>{errors.address}</FieldError>
      </div>
    </div>
  );
}

function DateTimeField({
  dateLabel,
  timeLabel,
  date,
  time,
  onDate,
  onTime,
  minDate,
}: {
  dateLabel: string;
  timeLabel: string;
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
            className="flex h-[52px] w-full min-w-0 items-center gap-2.5 rounded-lg border border-border px-3 text-left transition-colors hover:bg-muted/60"
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
      <div className="w-[104px]">
        <Select value={time} onValueChange={onTime}>
          <SelectTrigger className="h-[52px] rounded-lg">
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
        <span className="sr-only">{timeLabel}</span>
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
  const [pickupCustom, setPickupCustom] = useState<RentalLocation>(emptyLocation("delivery"));
  const [returnMode, setReturnMode] = useState<ReturnMode>("same");
  const [returnCustom, setReturnCustom] = useState<RentalLocation>(emptyLocation("delivery"));

  const [pickupDate, setPickupDate] = useState(today);
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnDate, setReturnDate] = useState(tomorrow);
  const [returnTime, setReturnTime] = useState("10:00");

  const [touched, setTouched] = useState(false);

  const pickupLocation: RentalLocation = useMemo(
    () => (pickupMode === "office" ? emptyLocation("office") : pickupCustom),
    [pickupMode, pickupCustom],
  );

  const returnLocation: RentalLocation = useMemo(() => {
    if (returnMode === "same") return { ...pickupLocation };
    if (returnMode === "office") return emptyLocation("office");
    return returnCustom;
  }, [returnMode, returnCustom, pickupLocation]);

  // Async-ready pricing state (idle → calculating → success/error)
  const [calcState, setCalcState] = useState<"idle" | "calculating" | "success" | "error">("success");
  const [pricing, setPricing] = useState({ deliveryFee: 0, collectionFee: 0, logisticsTotal: 0 });

  const pickupReady = pickupMode === "office" || (!!pickupLocation.city && !!pickupLocation.address.trim());
  const returnReady =
    returnMode !== "delivery" || (!!returnCustom.city && !!returnCustom.address.trim());

  useEffect(() => {
    if (!pickupReady || !returnReady) {
      setCalcState("idle");
      setPricing({ deliveryFee: 0, collectionFee: 0, logisticsTotal: 0 });
      return;
    }
    setCalcState("calculating");
    const timer = setTimeout(() => {
      const res = calculateLogisticsTotal(pickupLocation, returnLocation);
      setPricing({
        deliveryFee: res.deliveryFee,
        collectionFee: res.collectionFee,
        logisticsTotal: res.logisticsTotal,
      });
      setCalcState(res.status);
    }, 350);
    return () => clearTimeout(timer);
  }, [
    pickupReady,
    returnReady,
    pickupLocation.type,
    pickupLocation.city,
    pickupLocation.address,
    returnLocation.type,
    returnLocation.city,
    returnLocation.address,
  ]);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!touched) return e;
    if (pickupMode === "delivery") {
      if (!pickupCustom.city) e.pickupCity = c.errCity;
      if (!pickupCustom.address.trim()) e.pickupAddress = c.errAddress;
    }
    if (returnMode === "delivery") {
      if (!returnCustom.city) e.returnCity = c.errCity;
      if (!returnCustom.address.trim()) e.returnAddress = c.errAddress;
    }
    if (new Date(`${returnDate}T${returnTime}`) <= new Date(`${pickupDate}T${pickupTime}`)) {
      e.dates = c.errDates;
    }
    return e;
  }, [touched, pickupMode, pickupCustom, returnMode, returnCustom, pickupDate, pickupTime, returnDate, returnTime, c]);

  const canSubmit = pickupReady && returnReady && calcState === "success";

  const submit = () => {
    setTouched(true);
    const hasDateError = new Date(`${returnDate}T${returnTime}`) <= new Date(`${pickupDate}T${pickupTime}`);
    if (!pickupReady || !returnReady || hasDateError || calcState !== "success") return;
    const params = toSearchParams({
      pickup: pickupLocation,
      returnMode,
      returnLocation,
      period: { pickupDate, pickupTime, returnDate, returnTime },
      pricing,
    });
    navigate(`/laisvi-automobiliai?${params.toString()}`);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  const onPickupDate = (v: string) => {
    setPickupDate(v);
    if (new Date(`${returnDate}T12:00:00`) <= new Date(`${v}T12:00:00`)) {
      const nR = new Date(`${v}T12:00:00`);
      nR.setDate(nR.getDate() + 1);
      setReturnDate(toISO(nR));
    }
  };

  const showFees = calcState === "success" && pricing.logisticsTotal > 0;
  const areaLabel = returnMode === "same" ? pickupLocation.city : `${pickupLocation.city} → ${returnLocation.city}`;

  const infoText =
    calcState === "success" && pricing.logisticsTotal > 0
      ? c.infoPriced(areaLabel, pricing.logisticsTotal)
      : pickupMode === "office" && returnMode !== "delivery"
      ? c.infoOffice
      : c.infoDelivery;

  return (
    <div className="rounded-[14px] bg-white shadow-[0_18px_50px_rgba(16,24,40,0.14)]">
      <div className="p-4 sm:p-5">
        {/* Pickup location */}
        <div className="flex items-start gap-3">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-carbonus-green" />
          <div className="min-w-0 flex-1">
            <FieldLabel>{c.whereGet}</FieldLabel>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Pill active={pickupMode === "office"} onClick={() => setPickupMode("office")}>
                {c.office}
              </Pill>
              <Pill active={pickupMode === "delivery"} onClick={() => setPickupMode("delivery")}>
                {c.delivery}
              </Pill>
            </div>
            {pickupMode === "office" ? (
              <p className="mt-2 text-[12px] font-medium text-foreground">{c.officeHint}</p>
            ) : (
              <LocationFields
                value={pickupCustom}
                onChange={setPickupCustom}
                copy={c}
                cityLabel={c.city}
                errors={{ city: errors.pickupCity, address: errors.pickupAddress }}
                idPrefix="pickup"
              />
            )}
          </div>
        </div>

        {/* Dates */}
        <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <DateTimeField
              dateLabel={pickupMode === "delivery" ? c.deliveryDate : c.pickupDate}
              timeLabel={c.pickupTime}
              date={pickupDate}
              time={pickupTime}
              onDate={onPickupDate}
              onTime={setPickupTime}
            />
          </div>
          <div>
            <DateTimeField
              dateLabel={c.returnDate}
              timeLabel={c.returnTime}
              date={returnDate}
              time={returnTime}
              onDate={setReturnDate}
              onTime={setReturnTime}
              minDate={new Date(`${pickupDate}T12:00:00`)}
            />
            <FieldError>{errors.dates}</FieldError>
          </div>
        </div>

        {/* Return location */}
        <div className="mt-4 flex items-start gap-3 border-t border-border pt-4">
          <MapPin className="mt-1 h-5 w-5 shrink-0 text-carbonus-green" />
          <div className="min-w-0 flex-1">
            <FieldLabel>{c.whereReturn}</FieldLabel>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <Pill active={returnMode === "same"} onClick={() => setReturnMode("same")}>
                {c.same}
              </Pill>
              {pickupMode === "delivery" && (
                <Pill active={returnMode === "office"} onClick={() => setReturnMode("office")}>
                  {c.returnOffice}
                </Pill>
              )}
              <Pill active={returnMode === "delivery"} onClick={() => setReturnMode("delivery")}>
                {c.other}
              </Pill>
            </div>
            {returnMode === "delivery" && (
              <LocationFields
                value={returnCustom}
                onChange={setReturnCustom}
                copy={c}
                cityLabel={c.returnCity}
                errors={{ city: errors.returnCity, address: errors.returnAddress }}
                idPrefix="return"
              />
            )}
          </div>
        </div>

        {/* Logistics summary + CTA */}
        <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 text-[13px]">
            {calcState === "calculating" && (
              <p className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {c.calculating}
              </p>
            )}
            {calcState === "error" && (
              <p className="flex items-start gap-2 font-medium text-destructive">
                <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" /> {c.unsupported}
              </p>
            )}
            {showFees && (
              <div className="space-y-1">
                {pricing.deliveryFee > 0 && (
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-muted-foreground">{c.deliveryFee}</span>
                    <span className="font-semibold text-foreground">+{pricing.deliveryFee} €</span>
                  </div>
                )}
                {pricing.collectionFee > 0 && (
                  <div className="flex items-center justify-between gap-6">
                    <span className="text-muted-foreground">{c.collectionFee}</span>
                    <span className="font-semibold text-foreground">+{pricing.collectionFee} €</span>
                  </div>
                )}
                <div className="flex items-center justify-between gap-6 border-t border-border pt-1">
                  <span className="font-medium text-foreground">{c.logistics}</span>
                  <span className="font-bold text-carbonus-green-dark">{pricing.logisticsTotal} €</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="h-14 w-full shrink-0 rounded-[10px] bg-carbonus-green-dark px-10 text-[16px] font-semibold text-white transition-colors hover:bg-carbonus-green-deep disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {c.search}
          </button>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-b-[14px] border-t border-border bg-[hsl(var(--carbonus-green-soft))]/60 px-5 py-3">
        <Info className="mt-[2px] h-4 w-4 shrink-0 text-carbonus-green" />
        <p className="text-[12px] leading-[1.6] text-muted-foreground">{infoText}</p>
      </div>
    </div>
  );
}
