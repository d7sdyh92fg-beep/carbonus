/**
 * Booking lead-time rules.
 * Pickup and return can never be selected earlier than 1 hour from now.
 */

export const MIN_LEAD_MINUTES = 60;

/** Earliest allowed pickup/return moment (now + 1h). */
export function minBookingDateTime(): Date {
  return new Date(Date.now() + MIN_LEAD_MINUTES * 60 * 1000);
}

/** Earliest allowed calendar day (midnight of the min datetime's day). */
export function minBookingDay(): Date {
  const d = minBookingDateTime();
  d.setHours(0, 0, 0, 0);
  return d;
}

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/** True when "YYYY-MM-DD" + "HH:mm" is at least 1 hour in the future. */
export function isTimeAllowed(dateISO: string, time: string): boolean {
  const min = minBookingDateTime();
  const [h, m] = time.split(":").map(Number);
  const dt = new Date(`${dateISO}T00:00:00`);
  dt.setHours(h, m, 0, 0);
  return dt.getTime() >= min.getTime() - 30 * 1000;
}

/** First allowed time from the list for the given day, or null. */
export function firstAllowedTime(dateISO: string, times: string[]): string | null {
  return times.find((t) => isTimeAllowed(dateISO, t)) ?? null;
}

export const minBookingDayISO = () => toISO(minBookingDay());
