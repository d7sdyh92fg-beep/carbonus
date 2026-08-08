/**
 * Rental search state, mock logistics pricing and URL (de)serialization.
 *
 * Everything price-related lives here so the mock calculation can later be
 * swapped for a backend/Maps call without touching any UI component.
 */

export type PickupMode = "office" | "delivery";
export type ReturnMode = "same" | "office" | "delivery";

export interface RentalLocation {
  type: PickupMode;
  city: string;
  address: string;
  placeName: string;
  lat: number | null;
  lng: number | null;
  country: string;
}

export interface RentalPeriod {
  pickupDate: string; // yyyy-MM-dd
  pickupTime: string; // HH:mm
  returnDate: string;
  returnTime: string;
}

export interface RentalPricing {
  deliveryFee: number;
  collectionFee: number;
  logisticsTotal: number;
}

export interface RentalSearch {
  pickup: RentalLocation;
  returnLocation: RentalLocation & { mode: ReturnMode };
  rentalPeriod: RentalPeriod;
  pricing: RentalPricing;
}

/* ---------------- Cities ---------------- */

export interface CityOption {
  id: string;
  label: string;
  country: string;
  /** mock one-way logistics service price, null = cannot be calculated */
  fee: number | null;
}

export const CITIES: CityOption[] = [
  { id: "druskininkai", label: "Druskininkai", country: "LT", fee: 25 },
  { id: "vilnius", label: "Vilnius", country: "LT", fee: 65 },
  { id: "kaunas", label: "Kaunas", country: "LT", fee: 55 },
  { id: "klaipeda", label: "Klaipėda", country: "LT", fee: 95 },
  { id: "siauliai", label: "Šiauliai", country: "LT", fee: 75 },
  { id: "panevezys", label: "Panevėžys", country: "LT", fee: 70 },
  { id: "riga", label: "Ryga", country: "LV", fee: 120 },
  { id: "warsaw", label: "Varšuva", country: "PL", fee: 200 },
  { id: "other", label: "Kita vieta", country: "", fee: null },
];

export const OFFICE_CITY = "Druskininkai";
export const OFFICE_LABEL = "Carbonus ofisas, Druskininkai";

export const findCity = (label: string) =>
  CITIES.find((c) => c.label.toLowerCase() === (label || "").toLowerCase());

export const emptyLocation = (type: PickupMode = "office"): RentalLocation => ({
  type,
  city: type === "office" ? OFFICE_CITY : "",
  address: "",
  placeName: "",
  lat: null,
  lng: null,
  country: "LT",
});

/* ---------------- Pricing (mock, replaceable by API) ---------------- */

export type FeeStatus = "idle" | "calculating" | "success" | "error";

export interface FeeResult {
  status: Extract<FeeStatus, "success" | "error">;
  fee: number;
}

/** Price of a single logistics leg (delivery OR collection). */
export function calculateLocationFee(location: RentalLocation | null): FeeResult {
  if (!location) return { status: "error", fee: 0 };
  if (location.type === "office") return { status: "success", fee: 0 };
  const city = findCity(location.city);
  if (!city || city.fee == null) return { status: "error", fee: 0 };
  return { status: "success", fee: city.fee };
}

export function calculateLogisticsTotal(
  pickup: RentalLocation | null,
  returnLocation: RentalLocation | null,
): RentalPricing & { status: Extract<FeeStatus, "success" | "error"> } {
  const d = calculateLocationFee(pickup);
  const c = calculateLocationFee(returnLocation);
  return {
    deliveryFee: d.fee,
    collectionFee: c.fee,
    logisticsTotal: d.fee + c.fee,
    status: d.status === "error" || c.status === "error" ? "error" : "success",
  };
}

/** Resolves the effective return location given the chosen return mode. */
export function resolveReturnLocation(
  pickup: RentalLocation,
  mode: ReturnMode,
  custom: RentalLocation,
): RentalLocation {
  if (mode === "same") return { ...pickup };
  if (mode === "office") return emptyLocation("office");
  return custom;
}

/* ---------------- URL serialization ---------------- */

export interface SearchParamsShape {
  pickup: string;
  return: string;
  pickupTime: string;
  returnTime: string;
  pickupMode: PickupMode;
  pickupCity: string;
  pickupAddress: string;
  returnMode: ReturnMode;
  returnCity: string;
  returnAddress: string;
  deliveryFee: number;
  collectionFee: number;
}

export function toSearchParams(s: {
  pickup: RentalLocation;
  returnMode: ReturnMode;
  returnLocation: RentalLocation;
  period: RentalPeriod;
  pricing: RentalPricing;
}): URLSearchParams {
  const p = new URLSearchParams({
    pickup: s.period.pickupDate,
    return: s.period.returnDate,
    pickupTime: s.period.pickupTime,
    returnTime: s.period.returnTime,
    mode: "cars",
    pickupMode: s.pickup.type,
    pickupCity: s.pickup.city,
    pickupAddress: s.pickup.address,
    returnMode: s.returnMode,
    returnCity: s.returnLocation.city,
    returnAddress: s.returnLocation.address,
    deliveryFee: String(s.pricing.deliveryFee),
    collectionFee: String(s.pricing.collectionFee),
  });
  return p;
}

export function readSearchParams(params: URLSearchParams) {
  const pickupMode = (params.get("pickupMode") as PickupMode) || "office";
  const returnMode = (params.get("returnMode") as ReturnMode) || "same";
  const pickup: RentalLocation = {
    ...emptyLocation(pickupMode),
    city: params.get("pickupCity") || (pickupMode === "office" ? OFFICE_CITY : ""),
    address: params.get("pickupAddress") || "",
  };
  const returnType: PickupMode = returnMode === "delivery" ? "delivery" : "office";
  const returnLocation: RentalLocation =
    returnMode === "same"
      ? { ...pickup }
      : {
          ...emptyLocation(returnType),
          city: params.get("returnCity") || (returnType === "office" ? OFFICE_CITY : ""),
          address: params.get("returnAddress") || "",
        };
  const deliveryFee = Number(params.get("deliveryFee") || 0) || 0;
  const collectionFee = Number(params.get("collectionFee") || 0) || 0;
  return {
    pickupMode,
    pickup,
    returnMode,
    returnLocation,
    pricing: {
      deliveryFee,
      collectionFee,
      logisticsTotal: deliveryFee + collectionFee,
    } as RentalPricing,
  };
}

/** Human label for a location, e.g. "Vilnius · Radisson Blu". */
export function locationLabel(loc: RentalLocation): string {
  if (loc.type === "office") return OFFICE_LABEL;
  const parts = [loc.city, loc.address].filter(Boolean);
  return parts.join(" · ") || "Nenurodyta";
}

export const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const totalMin = 7 * 60 + i * 30;
  const h = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const m = String(totalMin % 60).padStart(2, "0");
  return `${h}:${m}`;
});
