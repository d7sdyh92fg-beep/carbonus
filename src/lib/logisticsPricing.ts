/**
 * Logistics pricing for car delivery / collection.
 *
 * Everything is calculated relative to the Carbonus base in Druskininkai and
 * always uses DRIVING distance (never straight-line), km × tariff.
 *
 * Delivery and collection are two independent legs:
 *   totalLogisticsPrice = deliveryPrice + returnPrice
 */

export interface PlaceLocation {
  placeName: string;
  address: string;
  city: string;
  country: string;
  lat: number | null;
  lng: number | null;
}

export const EMPTY_LOCATION: PlaceLocation = {
  placeName: "",
  address: "",
  city: "",
  country: "",
  lat: null,
  lng: null,
};

export const CARBONUS_OFFICE = {
  placeName: "Carbonus ofisas",
  address: "M. K. Čiurlionio g. 51, Druskininkai",
  city: "Druskininkai",
  country: "Lietuva",
  lat: 54.0201,
  lng: 23.9723,
} satisfies PlaceLocation;

/**
 * Single place to change tariffs. The per-km rate already covers the full real
 * logistics cost (car delivery, a second car for the employee, the drive back,
 * fuel, staff time, wear) — the customer only ever sees the final price.
 */
export const DELIVERY_CONFIG = {
  pricePerKm: 1.6,
  minDeliveryPrice: 40,
  /** Fixed fee for deliveries inside Druskininkai. */
  localDeliveryPrice: 0,
};

/** Radius (km, driving) around the base still considered "Druskininkai area". */
export const LOCAL_RADIUS_KM = 15;

/** True when a place belongs to the Druskininkai area → logistics is free. */
export function isLocalLocation(
  location: PlaceLocation | null | undefined,
  distanceKm?: number | null,
): boolean {
  if (typeof distanceKm === "number" && distanceKm > 0 && distanceKm <= LOCAL_RADIUS_KM) return true;
  if (!location) return false;
  const haystack = `${location.placeName} ${location.address} ${location.city}`.toLowerCase();
  return haystack.includes("druskinink");
}

export type PickupType = "office" | "druskininkai" | "other";
export type ReturnType = "same_location" | "office" | "other";

/** Rounds to whole euros (prices are always shown without cents). */
const round = (value: number) => Math.round(value);

/** Price for one logistics leg to/from a location at `distanceKm` from the base. */
export function calculateLocationPrice(distanceKm: number | null | undefined): number {
  if (!distanceKm || distanceKm <= 0) return 0;
  return round(Math.max(DELIVERY_CONFIG.minDeliveryPrice, distanceKm * DELIVERY_CONFIG.pricePerKm));
}

export function calculateDeliveryPrice(
  pickupType: PickupType,
  distanceKm: number | null | undefined,
): number {
  if (pickupType === "office") return 0;
  if (pickupType === "druskininkai") return DELIVERY_CONFIG.localDeliveryPrice;
  if (pickupType === "other") return calculateLocationPrice(distanceKm);
  return 0;
}

export function calculateReturnPrice(
  returnType: ReturnType,
  deliveryPrice: number,
  returnDistanceKm: number | null | undefined,
  pickupType: PickupType = "other",
): number {
  // Nothing was delivered → nothing to collect.
  if (pickupType === "office") return 0;
  // Customer brings the car back to the Carbonus office himself.
  if (returnType === "office") return 0;
  // Carbonus collects the car from where it was delivered.
  if (returnType === "same_location") return deliveryPrice;
  if (returnType === "other") {
    if (pickupType === "druskininkai" && !returnDistanceKm) {
      return DELIVERY_CONFIG.localDeliveryPrice;
    }
    return calculateLocationPrice(returnDistanceKm);
  }
  return 0;
}

export function calculateTotalLogisticsPrice(deliveryPrice: number, returnPrice: number): number {
  return deliveryPrice + returnPrice;
}

/** Straight-line distance in km — only used as a fallback when routing fails. */
export function haversineKm(lat: number, lng: number): number {
  const R = 6371;
  const dLat = ((lat - CARBONUS_OFFICE.lat) * Math.PI) / 180;
  const dLng = ((lng - CARBONUS_OFFICE.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((CARBONUS_OFFICE.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Rough road-distance estimate used when the Routes API is unavailable. */
export const ROAD_FACTOR = 1.28;

// ---------------------------------------------------------------------------
// UI-facing result helpers
// ---------------------------------------------------------------------------

export type FeeResult =
  | { status: "free"; amount: 0 }
  | { status: "priced"; amount: number }
  | { status: "unknown"; amount: null };

const toFee = (amount: number): FeeResult =>
  amount === 0 ? { status: "free", amount: 0 } : { status: "priced", amount };

export interface LogisticsInput {
  pickupType: PickupType;
  returnType: ReturnType;
  deliveryLocation: PlaceLocation | null;
  returnLocation: PlaceLocation | null;
  deliveryDistanceKm: number | null;
  returnDistanceKm: number | null;
}

export interface LogisticsQuote {
  deliveryPrice: number;
  returnPrice: number;
  totalLogisticsPrice: number;
  delivery: FeeResult;
  collection: FeeResult;
  total: FeeResult;
  /** True when Carbonus physically collects the car (label: "Automobilio paėmimas"). */
  carbonusCollects: boolean;
}

export function buildLogisticsQuote(input: LogisticsInput): LogisticsQuote {
  const {
    pickupType,
    returnType,
    deliveryLocation,
    returnLocation,
    deliveryDistanceKm,
    returnDistanceKm,
  } = input;

  const needsDeliveryLocation = pickupType !== "office";
  const needsReturnLocation = pickupType !== "office" && returnType === "other";

  const deliveryKnown = !needsDeliveryLocation || Boolean(deliveryLocation?.address);
  const returnKnown = !needsReturnLocation || Boolean(returnLocation?.address);

  const deliveryLocal = isLocalLocation(deliveryLocation, deliveryDistanceKm);
  const returnLocal = isLocalLocation(returnLocation, returnDistanceKm);

  const deliveryPrice = deliveryKnown
    ? deliveryLocal && pickupType === "other"
      ? DELIVERY_CONFIG.localDeliveryPrice
      : calculateDeliveryPrice(pickupType, deliveryDistanceKm)
    : 0;
  const returnPrice = returnKnown
    ? returnType === "other" && returnLocal
      ? DELIVERY_CONFIG.localDeliveryPrice
      : calculateReturnPrice(returnType, deliveryPrice, returnDistanceKm, pickupType)
    : 0;

  const delivery: FeeResult = deliveryKnown ? toFee(deliveryPrice) : { status: "unknown", amount: null };
  const collection: FeeResult =
    deliveryKnown && returnKnown ? toFee(returnPrice) : { status: "unknown", amount: null };
  const total: FeeResult =
    deliveryKnown && returnKnown
      ? toFee(calculateTotalLogisticsPrice(deliveryPrice, returnPrice))
      : { status: "unknown", amount: null };

  return {
    deliveryPrice,
    returnPrice,
    totalLogisticsPrice: deliveryPrice + returnPrice,
    delivery,
    collection,
    total,
    carbonusCollects: pickupType !== "office" && returnType !== "office",
  };
}
