import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2, MapPin, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadGoogleMaps, hasGoogleMapsKey } from "@/lib/googleMaps";
import { EMPTY_LOCATION, PlaceLocation } from "@/lib/logisticsPricing";

interface Suggestion {
  id: string;
  primary: string;
  secondary: string;
  /** Google place id, when the suggestion came from Places API */
  placeId?: string;
  fallback?: PlaceLocation;
}

/** Offline fallback list (used if Google Places is unavailable). */
const FALLBACK_PLACES: PlaceLocation[] = [
  { placeName: "Grand SPA Lietuva", address: "V. Kudirkos g. 45, Druskininkai", city: "Druskininkai", country: "Lietuva", lat: 54.0146, lng: 23.9764 },
  { placeName: "SPA Vilnius Druskininkai", address: "K. Dineikos g. 1, Druskininkai", city: "Druskininkai", country: "Lietuva", lat: 54.0113, lng: 23.9705 },
  { placeName: "Europa Royale Druskininkai", address: "Vilniaus al. 7, Druskininkai", city: "Druskininkai", country: "Lietuva", lat: 54.0163, lng: 23.9718 },
  { placeName: "Aqua Park Druskininkai", address: "Vilniaus al. 13, Druskininkai", city: "Druskininkai", country: "Lietuva", lat: 54.0122, lng: 23.9646 },
  { placeName: "Druskininkų autobusų stotis", address: "Gardino g. 1, Druskininkai", city: "Druskininkai", country: "Lietuva", lat: 54.0175, lng: 23.9787 },
  { placeName: "Radisson Blu Hotel Lietuva", address: "Konstitucijos pr. 20, Vilnius", city: "Vilnius", country: "Lietuva", lat: 54.6944, lng: 25.2724 },
  { placeName: "Vilniaus oro uostas", address: "Rodūnios kelias 10A, Vilnius", city: "Vilnius", country: "Lietuva", lat: 54.6404, lng: 25.2807 },
  { placeName: "Kauno oro uostas", address: "Karmėlava, Kaunas", city: "Kaunas", country: "Lietuva", lat: 54.9639, lng: 24.0848 },
  { placeName: "Kaunas, centras", address: "Laisvės al., Kaunas", city: "Kaunas", country: "Lietuva", lat: 54.8985, lng: 23.9036 },
  { placeName: "Klaipėdos kruizinių laivų terminalas", address: "Pilies g. 4, Klaipėda", city: "Klaipėda", country: "Lietuva", lat: 55.7033, lng: 21.1236 },
  { placeName: "Palangos oro uostas", address: "Liepojos pl. 1, Palanga", city: "Palanga", country: "Lietuva", lat: 55.9733, lng: 21.0939 },
  { placeName: "Panevėžys, centras", address: "Laisvės a., Panevėžys", city: "Panevėžys", country: "Lietuva", lat: 55.7333, lng: 24.35 },
  { placeName: "Šiauliai, centras", address: "Vilniaus g., Šiauliai", city: "Šiauliai", country: "Lietuva", lat: 55.9333, lng: 23.3167 },
  { placeName: "Alytus, centras", address: "Rotušės a., Alytus", city: "Alytus", country: "Lietuva", lat: 54.3963, lng: 24.0458 },
  { placeName: "Radisson Collection Hotel", address: "Elizabetes iela 55, Ryga", city: "Ryga", country: "Latvija", lat: 56.9536, lng: 24.1163 },
  { placeName: "Rygos oro uostas", address: "Mārupes nov., Ryga", city: "Ryga", country: "Latvija", lat: 56.9236, lng: 23.9711 },
  { placeName: "Warsaw Marriott Hotel", address: "Al. Jerozolimskie 65/79, Varšuva", city: "Varšuva", country: "Lenkija", lat: 52.2288, lng: 21.0027 },
];

const cityFromComponents = (components: any[]): string => {
  if (!components) return "";
  const byType = (type: string) =>
    components.find((c: any) => (c.types || []).includes(type))?.longText ||
    components.find((c: any) => (c.types || []).includes(type))?.long_name ||
    "";
  return byType("locality") || byType("postal_town") || byType("administrative_area_level_2") || "";
};

const countryFromComponents = (components: any[]): string => {
  if (!components) return "";
  const c = components.find((x: any) => (x.types || []).includes("country"));
  return c?.longText || c?.long_name || "";
};

export type LocationSearchStatus = "idle" | "loading" | "success" | "error";

interface Props {
  label: string;
  placeholder: string;
  value: PlaceLocation | null;
  onChange: (location: PlaceLocation | null) => void;
  /** Restrict suggestions around Druskininkai */
  restrictToDruskininkai?: boolean;
  error?: string | null;
  freeDeliveryLabel?: string;
  noResultsLabel: string;
  clearLabel: string;
}

export function LocationSearchInput({
  label,
  placeholder,
  value,
  onChange,
  restrictToDruskininkai = false,
  error,
  freeDeliveryLabel,
  noResultsLabel,
  clearLabel,
}: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LocationSearchStatus>("idle");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<any>(null);

  const fallbackPool = useMemo(
    () =>
      restrictToDruskininkai
        ? FALLBACK_PLACES.filter((p) => p.city === "Druskininkai")
        : FALLBACK_PLACES,
    [restrictToDruskininkai],
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");

    const timer = window.setTimeout(async () => {
      const q = restrictToDruskininkai ? `${query} Druskininkai` : query;

      const useFallback = () => {
        const needle = query.toLowerCase();
        const matches = fallbackPool
          .filter(
            (p) =>
              p.placeName.toLowerCase().includes(needle) ||
              p.address.toLowerCase().includes(needle) ||
              p.city.toLowerCase().includes(needle),
          )
          .slice(0, 6)
          .map<Suggestion>((p) => ({
            id: `${p.placeName}-${p.address}`,
            primary: p.placeName,
            secondary: p.address,
            fallback: p,
          }));
        if (cancelled) return;
        setSuggestions(matches);
        setStatus("success");
      };

      if (!hasGoogleMapsKey()) {
        useFallback();
        return;
      }

      try {
        await loadGoogleMaps();
        const places: any = await (window as any).google.maps.importLibrary("places");
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new places.AutocompleteSessionToken();
        }
        const request: any = {
          input: q,
          sessionToken: sessionTokenRef.current,
          language: "lt",
          includedRegionCodes: ["lt", "lv", "pl", "ee"],
        };
        if (restrictToDruskininkai) {
          request.locationBias = {
            center: { lat: 54.0201, lng: 23.9723 },
            radius: 15000,
          };
        }
        const { suggestions: results } =
          await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
        if (cancelled) return;
        const mapped: Suggestion[] = (results || [])
          .filter((s: any) => s.placePrediction)
          .slice(0, 6)
          .map((s: any) => ({
            id: s.placePrediction.placeId,
            placeId: s.placePrediction.placeId,
            primary: s.placePrediction.mainText?.text || s.placePrediction.text?.text || "",
            secondary: s.placePrediction.secondaryText?.text || "",
          }));
        setSuggestions(mapped);
        setStatus(mapped.length ? "success" : "success");
      } catch {
        if (cancelled) return;
        useFallback();
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query, restrictToDruskininkai, fallbackPool]);

  const select = async (s: Suggestion) => {
    setOpen(false);
    if (s.fallback) {
      onChange(s.fallback);
      setQuery("");
      return;
    }
    setStatus("loading");
    try {
      const places: any = await (window as any).google.maps.importLibrary("places");
      const place = new places.Place({ id: s.placeId, requestedLanguage: "lt" });
      await place.fetchFields({
        fields: ["displayName", "formattedAddress", "location", "addressComponents"],
      });
      const loc: PlaceLocation = {
        placeName: place.displayName || s.primary,
        address: place.formattedAddress || s.secondary,
        city: cityFromComponents(place.addressComponents) || "",
        country: countryFromComponents(place.addressComponents) || "",
        lat: place.location?.lat?.() ?? null,
        lng: place.location?.lng?.() ?? null,
      };
      onChange(loc);
      setQuery("");
      setStatus("success");
      sessionTokenRef.current = null;
    } catch {
      onChange({ ...EMPTY_LOCATION, placeName: s.primary, address: s.secondary });
      setQuery("");
      setStatus("error");
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <label className="block text-[13px] font-semibold text-foreground">{label}</label>

      {value?.address ? (
        <div className="mt-2 flex items-start gap-3 rounded-xl border border-carbonus-green/40 bg-[hsl(var(--carbonus-green)/0.06)] p-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
            <MapPin className="h-4 w-4 text-carbonus-green-dark" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-foreground">{value.placeName}</p>
            <p className="truncate text-[13px] text-muted-foreground">{value.address}</p>
            {freeDeliveryLabel && (
              <p className="mt-1 flex items-center gap-1 text-[12px] font-semibold text-carbonus-green-dark">
                <Check className="h-3.5 w-3.5" /> {freeDeliveryLabel}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label={clearLabel}
            onClick={() => onChange(null)}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-white hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "mt-2 flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 transition-colors",
            error ? "border-destructive" : "border-border focus-within:border-carbonus-green",
          )}
        >
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        </div>
      )}

      {error && !value?.address && (
        <p className="mt-1.5 text-[12px] font-medium text-destructive">{error}</p>
      )}

      {open && !value?.address && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-white shadow-[0_18px_44px_rgba(16,24,40,0.16)]">
          {status === "loading" && suggestions.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-muted-foreground">…</p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-[13px] text-muted-foreground">{noResultsLabel}</p>
          ) : (
            suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => select(s)}
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-carbonus-green-dark" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-medium text-foreground">{s.primary}</span>
                  <span className="block truncate text-[12px] text-muted-foreground">{s.secondary}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
