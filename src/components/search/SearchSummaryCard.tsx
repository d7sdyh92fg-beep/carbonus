import { useEffect } from "react";
import { CalendarDays, ChevronDown, MapPin, Pencil } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { SearchCopy } from "./searchCopy";
import { PickupMode } from "@/hooks/use-search-state";
import { firstAllowedTime, isTimeAllowed, minBookingDay } from "@/lib/bookingTime";


const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const TIMES = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, "0");
  const m = i % 2 === 0 ? "00" : "30";
  return `${h}:${m}`;
});

interface Props {
  c: SearchCopy;
  pickupMode: PickupMode;
  onPickupModeChange: (mode: PickupMode) => void;
  pickupDate: string;
  returnDate: string;
  pickupTime: string;
  returnTime: string;
  onPickupDateChange: (v: string) => void;
  onReturnDateChange: (v: string) => void;
  onPickupTimeChange: (v: string) => void;
  onReturnTimeChange: (v: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSummaryCard({
  c,
  pickupMode,
  onPickupModeChange,
  pickupDate,
  returnDate,
  pickupTime,
  returnTime,
  onPickupDateChange,
  onReturnDateChange,
  onPickupTimeChange,
  onReturnTimeChange,
  open,
  onOpenChange,
}: Props) {
  // Enforce the 1-hour lead time: bump invalid selections to the first allowed slot.
  useEffect(() => {
    if (!isTimeAllowed(pickupDate, pickupTime)) {
      const next = firstAllowedTime(pickupDate, TIMES);
      if (next) onPickupTimeChange(next);
    }
  }, [pickupDate, pickupTime, onPickupTimeChange]);

  useEffect(() => {
    if (!isTimeAllowed(returnDate, returnTime)) {
      const next = firstAllowedTime(returnDate, TIMES);
      if (next) onReturnTimeChange(next);
    }
  }, [returnDate, returnTime, onReturnTimeChange]);

  const locationTitle =
    pickupMode === "office" ? c.modeOffice : pickupMode === "druskininkai" ? c.modeDruskininkai : c.modeOther;
  const locationSub =
    pickupMode === "office" ? c.officeSummary : pickupMode === "druskininkai" ? c.druskininkaiSummary : c.otherSummary;



  const modePill = (mode: PickupMode, label: string) => (
    <button
      key={mode}
      type="button"
      aria-pressed={pickupMode === mode}
      onClick={() => onPickupModeChange(mode)}
      className={cn(
        "min-h-[34px] whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-colors",
        pickupMode === mode
          ? "border-carbonus-green-dark bg-carbonus-green-dark text-white"
          : "border-carbonus-green/35 bg-white text-foreground hover:bg-carbonus-green/10",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-[18px] border border-black/[0.04] bg-white p-4 shadow-[0_14px_38px_rgba(16,24,40,0.08)] sm:p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center md:gap-0">
        <div className="flex items-start gap-3 md:pr-6">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-carbonus-green-dark" />
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-muted-foreground">{c.pickupLocation}</p>
            <p className="truncate text-[16px] font-bold text-foreground">{locationTitle}</p>
            <p className="truncate text-[12px] text-muted-foreground">{locationSub}</p>
          </div>
        </div>

        <SummaryDate icon label={c.pickupLabel} date={pickupDate} time={pickupTime} />
        <SummaryDate label={c.returnLabel} date={returnDate} time={returnTime} />

        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-carbonus-green/40 px-4 py-2.5 text-[14px] font-semibold text-carbonus-green-dark transition-colors hover:bg-carbonus-green/10 md:ml-6"
          aria-expanded={open}
        >
          <Pencil className="h-4 w-4" />
          {c.editSearch}
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open && (
        <div className="mt-5 border-t border-border pt-5">
          <p className="text-[13px] font-semibold text-foreground">{c.pickupLocation}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {modePill("office", c.modeOffice)}
            {modePill("druskininkai", c.modeDruskininkai)}
            {modePill("other", c.modeOther)}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DateTimeField
              label={c.pickupLabel}
              date={pickupDate}
              time={pickupTime}
              minDate={minBookingDay()}
              onDateChange={onPickupDateChange}
              onTimeChange={onPickupTimeChange}
            />
            <DateTimeField
              label={c.returnLabel}
              date={returnDate}
              time={returnTime}
              minDate={
                new Date(`${pickupDate}T12:00:00`) > minBookingDay()
                  ? new Date(`${pickupDate}T12:00:00`)
                  : minBookingDay()
              }
              onDateChange={onReturnDateChange}
              onTimeChange={onReturnTimeChange}
            />

          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-carbonus-green-dark px-6 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-carbonus-green-deep"
            >
              {c.apply}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryDate({ label, date, time }: { label: string; date: string; time: string; icon?: boolean }) {
  return (
    <div className="flex items-start gap-3 md:border-l md:border-border md:px-6">
      <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-carbonus-green-dark" />
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-muted-foreground">{label}</p>
        <p className="text-[16px] font-bold text-foreground">{date}</p>
        <p className="text-[12px] text-muted-foreground">{time}</p>
      </div>
    </div>
  );
}

function DateTimeField({
  label,
  date,
  time,
  minDate,
  onDateChange,
  onTimeChange,
}: {
  label: string;
  date: string;
  time: string;
  minDate?: Date;
  onDateChange: (v: string) => void;
  onTimeChange: (v: string) => void;
}) {
  const allowedTimes = TIMES.filter((t) => isTimeAllowed(date, t));
  const timeOptions = allowedTimes.length ? allowedTimes : [time];
  return (
    <div>
      <p className="text-[13px] font-semibold text-foreground">{label}</p>
      <div className="mt-2 flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex min-h-[46px] flex-1 items-center gap-2 rounded-xl border border-border bg-white px-3 text-left text-[14px] font-medium text-foreground transition-colors hover:border-carbonus-green"
            >
              <CalendarDays className="h-4 w-4 text-carbonus-green-dark" />
              {date}
            </button>
          </PopoverTrigger>
          <PopoverContent className="z-[80] w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={new Date(`${date}T12:00:00`)}
              defaultMonth={new Date(`${date}T12:00:00`)}
              onSelect={(d) => d && onDateChange(toISO(d))}
              disabled={{ before: minDate ?? minBookingDay() }}
              className="pointer-events-auto p-3"
            />
          </PopoverContent>
        </Popover>

        <select
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          aria-label={`${label} – laikas`}
          className="min-h-[46px] rounded-xl border border-border bg-white px-3 text-[14px] font-medium text-foreground outline-none transition-colors hover:border-carbonus-green"
        >
          {timeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
    </div>

  );
}
