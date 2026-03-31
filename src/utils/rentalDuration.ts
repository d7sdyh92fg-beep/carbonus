/**
 * Rental duration calculation based on industry standard (Hertz, Europcar, SIXT):
 * - 1 rental day = 24 hours from pickup to return
 * - Grace period: 29 minutes (courtesy time before extra day is charged)
 * - Days = ceil((returnDateTime - pickupDateTime - graceMinutes) / 24h)
 * - Minimum: 1 day
 */

export const GRACE_PERIOD_MINUTES = 29;

/**
 * Calculate rental days based on actual pickup/return datetime with grace period.
 * 
 * @param pickupDate - Pickup date string (yyyy-MM-dd) or Date object
 * @param pickupTime - Pickup time string (HH:mm)
 * @param returnDate - Return date string (yyyy-MM-dd) or Date object
 * @param returnTime - Return time string (HH:mm)
 * @param graceMinutes - Grace period in minutes (default: 29)
 * @returns Number of rental days (minimum 1)
 */
export function calculateRentalDays(
  pickupDate: string | Date,
  pickupTime: string,
  returnDate: string | Date,
  returnTime: string,
  graceMinutes: number = GRACE_PERIOD_MINUTES
): number {
  const pickup = buildDateTime(pickupDate, pickupTime);
  const returnDt = buildDateTime(returnDate, returnTime);

  const durationMs = returnDt.getTime() - pickup.getTime();
  if (durationMs <= 0) return 1;

  const graceMs = graceMinutes * 60 * 1000;
  const effectiveMs = Math.max(0, durationMs - graceMs);
  const dayMs = 24 * 60 * 60 * 1000;

  return Math.max(1, Math.ceil(effectiveMs / dayMs));
}

function buildDateTime(date: string | Date, time: string): Date {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  d.setHours(hours, minutes, 0, 0);
  return d;
}
