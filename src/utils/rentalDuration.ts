/**
 * Rental duration calculation based on industry standard (Hertz, Europcar, SIXT):
 * - 1 rental day = 24 hours from pickup to return
 * - Days = ceil((returnDateTime - pickupDateTime) / 24h)
 * - Minimum: 1 day
 * 
 * Grace period (e.g. 2 hours) is NOT included in the base calculation.
 * It exists as an administrative/service flexibility applied manually
 * by staff when the customer returns slightly late.
 */

export const GRACE_PERIOD_MINUTES = 120; // 2h – for reference/admin use only, not applied in calculation

/**
 * Calculate rental days based on actual pickup/return datetime.
 * Pure 24-hour periods, no grace period applied.
 * 
 * @param pickupDate - Pickup date string (yyyy-MM-dd) or Date object
 * @param pickupTime - Pickup time string (HH:mm)
 * @param returnDate - Return date string (yyyy-MM-dd) or Date object
 * @param returnTime - Return time string (HH:mm)
 * @returns Number of rental days (minimum 1)
 */
export function calculateRentalDays(
  pickupDate: string | Date,
  pickupTime: string,
  returnDate: string | Date,
  returnTime: string,
): number {
  const pickup = buildDateTime(pickupDate, pickupTime);
  const returnDt = buildDateTime(returnDate, returnTime);

  const durationMs = returnDt.getTime() - pickup.getTime();
  if (durationMs <= 0) return 1;

  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.ceil(durationMs / dayMs));
}

function buildDateTime(date: string | Date, time: string): Date {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  d.setHours(hours, minutes, 0, 0);
  return d;
}
