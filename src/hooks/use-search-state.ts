import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EMPTY_LOCATION, PlaceLocation } from "@/lib/logisticsPricing";

export type PickupMode = "office" | "druskininkai" | "other";
export type ReturnMode = "same" | "office" | "different";

const toISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const readLocation = (params: URLSearchParams, prefix: string): PlaceLocation | null => {
  const address = params.get(`${prefix}Address`);
  if (!address) return null;
  const lat = params.get(`${prefix}Lat`);
  const lng = params.get(`${prefix}Lng`);
  return {
    placeName: params.get(`${prefix}Place`) || address,
    address,
    city: params.get(`${prefix}City`) || "",
    country: params.get(`${prefix}Country`) || "",
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null,
  };
};

const writeLocation = (
  params: URLSearchParams,
  prefix: string,
  location: PlaceLocation | null,
) => {
  const keys = ["Place", "Address", "City", "Country", "Lat", "Lng"];
  keys.forEach((k) => params.delete(`${prefix}${k}`));
  if (!location?.address) return;
  params.set(`${prefix}Place`, location.placeName || location.address);
  params.set(`${prefix}Address`, location.address);
  if (location.city) params.set(`${prefix}City`, location.city);
  if (location.country) params.set(`${prefix}Country`, location.country);
  if (location.lat != null) params.set(`${prefix}Lat`, String(location.lat));
  if (location.lng != null) params.set(`${prefix}Lng`, String(location.lng));
};

/** Single source of truth for the search / delivery state, synced with the URL. */
export function useSearchState() {
  const [params, setParams] = useSearchParams();

  const today = minBookingDayISO();
  const tomorrow = toISO(new Date(new Date(`${today}T12:00:00`).getTime() + 86400000));


  const rawMode = params.get("mode");
  const pickupMode: PickupMode =
    rawMode === "druskininkai" || rawMode === "other" ? rawMode : "office";
  const returnModeRaw = params.get("returnMode");
  const returnMode: ReturnMode =
    returnModeRaw === "office" || returnModeRaw === "different" ? returnModeRaw : "same";

  const pickupDate = params.get("pickup") || today;
  const returnDate = params.get("return") || tomorrow;
  const pickupTime = params.get("pickupTime") || "10:00";
  const returnTime = params.get("returnTime") || "10:00";

  const pickupLocation = useMemo(() => readLocation(params, "pickup"), [params]);
  const returnLocation = useMemo(() => readLocation(params, "ret"), [params]);

  const update = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params);
      mutate(next);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const setPickupMode = (mode: PickupMode) =>
    update((p) => {
      p.set("mode", mode);
      if (mode === "office") {
        writeLocation(p, "pickup", null);
        writeLocation(p, "ret", null);
        p.delete("returnMode");
      }
    });

  const setDates = (next: {
    pickupDate?: string;
    returnDate?: string;
    pickupTime?: string;
    returnTime?: string;
  }) =>
    update((p) => {
      if (next.pickupDate) p.set("pickup", next.pickupDate);
      if (next.returnDate) p.set("return", next.returnDate);
      if (next.pickupTime) p.set("pickupTime", next.pickupTime);
      if (next.returnTime) p.set("returnTime", next.returnTime);
    });

  /** Moves the return date along when the pickup date shifts. */
  const setPickupDateKeepingDuration = (value: string) => {
    const oldP = new Date(`${pickupDate}T12:00:00`).getTime();
    const oldR = new Date(`${returnDate}T12:00:00`).getTime();
    const diffDays = Math.max(1, Math.round((oldR - oldP) / 86400000));
    const newR = new Date(`${value}T12:00:00`);
    newR.setDate(newR.getDate() + diffDays);
    setDates({ pickupDate: value, returnDate: toISO(newR) });
  };

  const setPickupLocation = (location: PlaceLocation | null) =>
    update((p) => writeLocation(p, "pickup", location));

  const setReturnLocation = (location: PlaceLocation | null) =>
    update((p) => writeLocation(p, "ret", location));

  const setReturnMode = (mode: ReturnMode) =>
    update((p) => {
      p.set("returnMode", mode);
      if (mode !== "different") writeLocation(p, "ret", null);
    });

  return {
    pickupMode,
    setPickupMode,
    pickupLocation: pickupLocation ?? null,
    setPickupLocation,
    returnMode,
    setReturnMode,
    returnLocation: returnLocation ?? null,
    setReturnLocation,
    pickupDate,
    returnDate,
    pickupTime,
    returnTime,
    setDates,
    setPickupDateKeepingDuration,
    emptyLocation: EMPTY_LOCATION,
  };
}
