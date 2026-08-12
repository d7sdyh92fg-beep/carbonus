import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlaceLocation, ROAD_FACTOR, haversineKm } from "@/lib/logisticsPricing";

type Direction = "from_base" | "to_base";

const cache = new Map<string, number>();

const keyFor = (lat: number, lng: number, direction: Direction) =>
  `${direction}:${lat.toFixed(4)},${lng.toFixed(4)}`;

async function fetchDistanceKm(lat: number, lng: number, direction: Direction): Promise<number> {
  const key = keyFor(lat, lng, direction);
  const cached = cache.get(key);
  if (cached != null) return cached;

  let km: number | null = null;
  try {
    const { data, error } = await supabase.functions.invoke("driving-distance", {
      body: { lat, lng, direction },
    });
    if (error) throw error;
    if (typeof data?.distanceKm === "number") km = data.distanceKm;
  } catch (e) {
    console.warn("Driving distance lookup failed, using estimate:", e);
  }

  // Fallback: straight-line distance adjusted by an average road factor so the
  // customer still gets an immediate, close-enough price.
  if (km == null) km = Math.round(haversineKm(lat, lng) * ROAD_FACTOR * 10) / 10;

  cache.set(key, km);
  return km;
}

/**
 * Driving distance in km between the Carbonus base and a location.
 * `direction` = "to_base" for the collection leg.
 */
export function useDrivingDistance(location: PlaceLocation | null, direction: Direction = "from_base") {
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const lat = location?.lat ?? null;
  const lng = location?.lng ?? null;

  useEffect(() => {
    let active = true;

    if (lat == null || lng == null) {
      setDistanceKm(null);
      setLoading(false);
      return;
    }

    const cached = cache.get(keyFor(lat, lng, direction));
    if (cached != null) {
      setDistanceKm(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchDistanceKm(lat, lng, direction).then((km) => {
      if (!active) return;
      setDistanceKm(km);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [lat, lng, direction]);

  return { distanceKm, loading };
}
