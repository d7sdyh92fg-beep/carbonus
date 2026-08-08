/**
 * Temporary (frontend-only) logistics pricing for car delivery / collection.
 *
 * One flat fee per operation (delivery OR collection), based on city zones.
 * When a real backend pricing API exists, only `feeForLocation` needs to change –
 * the whole UI keeps working unchanged.
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

/** Fee per single operation (delivery or collection), in EUR. */
const CITY_FEES: Record<string, number> = {
  druskininkai: 0,
  vilnius: 50,
  kaunas: 50,
  alytus: 50,
  varena: 50,
  lazdijai: 50,
  marijampole: 50,
  panevezys: 100,
  siauliai: 100,
  klaipeda: 100,
  utena: 100,
  telsiai: 100,
  taurage: 100,
  palanga: 100,
  riga: 150,
  ryga: 150,
  warsaw: 200,
  warszawa: 200,
  varsuva: 200,
};

const normalizeCity = (city: string) =>
  city
    .toLowerCase()
    .trim()
    .replace(/ė/g, "e")
    .replace(/ą/g, "a")
    .replace(/į/g, "i")
    .replace(/ų/g, "u")
    .replace(/ū/g, "u")
    .replace(/č/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/[^a-z]/g, "");

const distanceKm = (lat: number, lng: number) => {
  const R = 6371;
  const dLat = ((lat - CARBONUS_OFFICE.lat) * Math.PI) / 180;
  const dLng = ((lng - CARBONUS_OFFICE.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((CARBONUS_OFFICE.lat * Math.PI) / 180) *
      Math.cos((lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

export type FeeResult =
  | { status: "free"; amount: 0 }
  | { status: "priced"; amount: number }
  | { status: "quote"; amount: null }
  | { status: "unknown"; amount: null };

/** Fee for a single operation at a given location. */
export function feeForLocation(location: PlaceLocation | null): FeeResult {
  if (!location || (!location.city && !location.address && location.lat == null)) {
    return { status: "unknown", amount: null };
  }

  const key = normalizeCity(location.city || location.address);
  if (key in CITY_FEES) {
    const amount = CITY_FEES[key];
    return amount === 0 ? { status: "free", amount: 0 } : { status: "priced", amount };
  }

  // Try a partial match (e.g. "Vilniaus m. sav.")
  const partial = Object.keys(CITY_FEES).find((c) => key.includes(c));
  if (partial) {
    const amount = CITY_FEES[partial];
    return amount === 0 ? { status: "free", amount: 0 } : { status: "priced", amount };
  }

  if (location.lat != null && location.lng != null) {
    const km = distanceKm(location.lat, location.lng);
    if (km <= 15) return { status: "free", amount: 0 };
    if (km <= 150) return { status: "priced", amount: 50 };
    if (km <= 300) return { status: "priced", amount: 100 };
    if (km <= 450) return { status: "priced", amount: 150 };
    return { status: "quote", amount: null };
  }

  return { status: "quote", amount: null };
}

export function calculateDeliveryFee(
  pickupMode: "office" | "druskininkai" | "other",
  location: PlaceLocation | null,
): FeeResult {
  if (pickupMode === "office") return { status: "free", amount: 0 };
  if (pickupMode === "druskininkai") {
    return location?.address ? { status: "free", amount: 0 } : { status: "unknown", amount: null };
  }
  return feeForLocation(location);
}

export function calculateCollectionFee(
  pickupMode: "office" | "druskininkai" | "other",
  returnMode: "same" | "office" | "different",
  pickupLocation: PlaceLocation | null,
  returnLocation: PlaceLocation | null,
): FeeResult {
  if (pickupMode === "office") return { status: "free", amount: 0 };
  if (returnMode === "office") return { status: "free", amount: 0 };
  const target = returnMode === "same" ? pickupLocation : returnLocation;
  if (pickupMode === "druskininkai") {
    return target?.address ? { status: "free", amount: 0 } : { status: "unknown", amount: null };
  }
  return feeForLocation(target);
}

export function calculateLogisticsTotal(delivery: FeeResult, collection: FeeResult): FeeResult {
  if (delivery.status === "quote" || collection.status === "quote") {
    return { status: "quote", amount: null };
  }
  if (delivery.status === "unknown" || collection.status === "unknown") {
    return { status: "unknown", amount: null };
  }
  const total = (delivery.amount ?? 0) + (collection.amount ?? 0);
  return total === 0 ? { status: "free", amount: 0 } : { status: "priced", amount: total };
}
