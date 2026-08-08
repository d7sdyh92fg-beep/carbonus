import { useEffect, useMemo, useState } from "react";
import { MapPin, CalendarDays, Clock, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { lt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CITIES,
  PickupMode,
  RentalLocation,
  RentalPeriod,
  RentalPricing,
  ReturnMode,
  TIME_OPTIONS,
  calculateLogisticsTotal,
  emptyLocation,
} from "@/lib/rentalSearch";

const copy = {
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
  returnDate: "Grąžinimo data",
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
  apply: "Atnaujinti paiešką",
  errCity: "Pasirinkite miestą",
  errAddress: "Įveskite adresą arba vietos pavadinimą",
  errDates: "Grąžinimo data negali būti anksčiau už paėmimo datą",
};

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
        active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80",
      )}
    >
      {children}
    </button>
  );
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-medium text-muted-foreground">{children}</label>
);

function FieldError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-destructive">
      <AlertCircle className="h-3 w-3" /> {children}
    </p>
  );
}

function LocationFields({
  value,
  onChange,
  cityLabel,
  errors,
  idPrefix,
}: {
  value: RentalLocation;
  onChange: (l: RentalLocation) => void;
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
          <SelectTrigger id={`${idPrefix}-city`} className="mt-1 h-11 rounded-lg bg-background">
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
          className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-[14px] font-medium text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus:border-primary"
        />
        <FieldError>{errors.address}</FieldError>
      </div>
    </div>
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
            className="flex h-[52px] w-full min-w-0 items-center gap-2.5 rounded-lg border border-border bg-background px-3 text-left transition-colors hover:bg-muted/60"
          >
            <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
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
          <SelectTrigger className="h-[52px] rounded-lg bg-background">
            <span className="flex items-center gap-1.5 text-[14px] font-semibold">
              <Clock className="h-4 w-4 text-primary" />
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

export interface FullSearchValue {
  pickupMode: PickupMode;
  pickup: RentalLocation;
  returnMode: ReturnMode;
  returnLocation: RentalLocation;
  period: RentalPeriod;
}

export function FullSearchForm({
  value,
  onApply,
}: {
  value: FullSearchValue;
  onApply: (next: FullSearchValue & { pricing: RentalPricing }) => void;
}) {
  const [pickupMode, setPickupMode] = useState<PickupMode>(value.pickupMode);
  const [pickupCustom, setPickupCustom] = useState<RentalLocation>(
    value.pickup.type === "delivery" ? value.pickup : emptyLocation("delivery"),
  );
  const [returnMode, setReturnMode] = useState<ReturnMode>(value.returnMode);
  const [returnCustom, setReturnCustom] = useState<RentalLocation>(
    value.returnMode === "delivery" ? value.returnLocation : emptyLocation("delivery"),
  );
  const [pickupDate, setPickupDate] = useState(value.period.pickupDate);
  const [pickupTime, setPickupTime] = useState(value.period.pickupTime);
  const [returnDate, setReturnDate] = useState(value.period.returnDate);
  const [returnTime, setReturnTime] = useState(value.period.returnTime);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setPickupMode(value.pickupMode);
    setPickupCustom(value.pickup.type === "delivery" ? value.pickup : emptyLocation("delivery"));
    setReturnMode(value.returnMode);
    setReturnCustom(value.returnMode === "delivery" ? value.returnLocation : emptyLocation("delivery"));
    setPickupDate(value.period.pickupDate);
    setPickupTime(value.period.pickupTime);
    setReturnDate(value.period.returnDate);
    setReturnTime(value.period.returnTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    value.pickupMode,
    value.pickup.city,
    value.pickup.address,
    value.returnMode,
    value.returnLocation.city,
    value.returnLocation.address,
    value.period.pickupDate,
    value.period.pickupTime,
    value.period.returnDate,
    value.period.returnTime,
  ]);

  const pickupLocation: RentalLocation = useMemo(
    () => (pickupMode === "office" ? emptyLocation("office") : pickupCustom),
    [pickupMode, pickupCustom],
  );

  const returnLocation: RentalLocation = useMemo(() => {
    if (returnMode === "same") return { ...pickupLocation };
    if (returnMode === "office") return emptyLocation("office");
    return returnCustom;
  }, [returnMode, returnCustom, pickupLocation]);

  const pickupReady = pickupMode === "office" || (!!pickupLocation.city && !!pickupLocation.address.trim());
  const returnReady = returnMode !== "delivery" || (!!returnCustom.city && !!returnCustom.address.trim());

  const [calcState, setCalcState] = useState<"idle" | "calculating" | "success" | "error">("success");
  const [pricing, setPricing] = useState<RentalPricing>({ deliveryFee: 0, collectionFee: 0, logisticsTotal: 0 });

  useEffect(() => {
    if (!pickupReady || !returnReady) {
      setCalcState("idle");
      setPricing({ deliveryFee: 0, collectionFee: 0, logisticsTotal: 0 });
      return;
    }
    setCalcState("calculating");
    const timer = setTimeout(() => {
      const res = calculateLogisticsTotal(pickupLocation, returnLocation);
      setPricing({ deliveryFee: res.deliveryFee, collectionFee: res.collectionFee, logisticsTotal: res.logisticsTotal });
      setCalcState(res.status);
    }, 300);
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

  const dateError = new Date(`${returnDate}T${returnTime}`) <= new Date(`${pickupDate}T${pickupTime}`);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!touched) return e;
    if (pickupMode === "delivery") {
      if (!pickupCustom.city) e.pickupCity = copy.errCity;
      if (!pickupCustom.address.trim()) e.pickupAddress = copy.errAddress;
    }
    if (returnMode === "delivery") {
      if (!returnCustom.city) e.returnCity = copy.errCity;
      if (!returnCustom.address.trim()) e.returnAddress = copy.errAddress;
    }
    if (dateError) e.dates = copy.errDates;
    return e;
  }, [touched, pickupMode, pickupCustom, returnMode, returnCustom, dateError]);

  const onPickupDate = (v: string) => {
    setPickupDate(v);
    if (new Date(`${returnDate}T12:00:00`) <= new Date(`${v}T12:00:00`)) {
      const nR = new Date(`${v}T12:00:00`);
      nR.setDate(nR.getDate() + 1);
      setReturnDate(toISO(nR));
    }
  };

  const submit = () => {
    setTouched(true);
    if (!pickupReady || !returnReady || dateError || calcState !== "success") return;
    onApply({
      pickupMode,
      pickup: pickupLocation,
      returnMode,
      returnLocation,
      period: { pickupDate, pickupTime, returnDate, returnTime },
      pricing,
    });
  };

  const showFees = calcState === "success" && pricing.logisticsTotal > 0;

  return (
    <div>
      {/* Pickup location */}
      <div className="flex items-start gap-3">
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <FieldLabel>{copy.whereGet}</FieldLabel>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Pill active={pickupMode === "office"} onClick={() => setPickupMode("office")}>
              {copy.office}
            </Pill>
            <Pill active={pickupMode === "delivery"} onClick={() => setPickupMode("delivery")}>
              {copy.delivery}
            </Pill>
          </div>
          {pickupMode === "office" ? (
            <p className="mt-2 text-[12px] font-medium text-foreground">{copy.officeHint}</p>
          ) : (
            <LocationFields
              value={pickupCustom}
              onChange={setPickupCustom}
              cityLabel={copy.city}
              errors={{ city: errors.pickupCity, address: errors.pickupAddress }}
              idPrefix="res-pickup"
            />
          )}
        </div>
      </div>

      {/* Dates */}
      <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <DateTimeField
          dateLabel={pickupMode === "delivery" ? copy.deliveryDate : copy.pickupDate}
          date={pickupDate}
          time={pickupTime}
          onDate={onPickupDate}
          onTime={setPickupTime}
        />
        <div>
          <DateTimeField
            dateLabel={copy.returnDate}
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
        <MapPin className="mt-1 h-5 w-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <FieldLabel>{copy.whereReturn}</FieldLabel>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <Pill active={returnMode === "same"} onClick={() => setReturnMode("same")}>
              {copy.same}
            </Pill>
            {pickupMode === "delivery" && (
              <Pill active={returnMode === "office"} onClick={() => setReturnMode("office")}>
                {copy.returnOffice}
              </Pill>
            )}
            <Pill active={returnMode === "delivery"} onClick={() => setReturnMode("delivery")}>
              {copy.other}
            </Pill>
          </div>
          {returnMode === "delivery" && (
            <LocationFields
              value={returnCustom}
              onChange={setReturnCustom}
              cityLabel={copy.returnCity}
              errors={{ city: errors.returnCity, address: errors.returnAddress }}
              idPrefix="res-return"
            />
          )}
        </div>
      </div>

      {/* Summary + CTA */}
      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 text-[13px]">
          {calcState === "calculating" && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> {copy.calculating}
            </p>
          )}
          {calcState === "error" && (
            <p className="flex items-start gap-2 font-medium text-destructive">
              <AlertCircle className="mt-[2px] h-4 w-4 shrink-0" /> {copy.unsupported}
            </p>
          )}
          {showFees && (
            <div className="space-y-1">
              {pricing.deliveryFee > 0 && (
                <div className="flex items-center justify-between gap-6">
                  <span className="text-muted-foreground">{copy.deliveryFee}</span>
                  <span className="font-semibold text-foreground">+{pricing.deliveryFee} €</span>
                </div>
              )}
              {pricing.collectionFee > 0 && (
                <div className="flex items-center justify-between gap-6">
                  <span className="text-muted-foreground">{copy.collectionFee}</span>
                  <span className="font-semibold text-foreground">+{pricing.collectionFee} €</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-6 border-t border-border pt-1">
                <span className="font-medium text-foreground">{copy.logistics}</span>
                <span className="font-bold text-primary">{pricing.logisticsTotal} €</span>
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={calcState === "calculating"}
          className="h-12 w-full shrink-0 rounded-xl bg-primary px-8 text-[15px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {copy.apply}
        </button>
      </div>
    </div>
  );
}
