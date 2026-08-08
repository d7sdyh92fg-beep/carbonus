import { useEffect, useRef, useState } from "react";
import { Crosshair, MapPin } from "lucide-react";
import { loadGoogleMaps, hasGoogleMapsKey } from "@/lib/googleMaps";
import { CARBONUS_OFFICE, PlaceLocation } from "@/lib/logisticsPricing";

interface MapMarker {
  location: PlaceLocation;
  label: string;
  variant: "office" | "delivery" | "collection";
}

interface Props {
  markers: MapMarker[];
  hint: string;
  unavailableLabel: string;
}

const PIN = (color: string) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="46" viewBox="0 0 36 46"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 16.2 27 16.9 27.6a1.7 1.7 0 0 0 2.2 0C19.8 45 36 30.6 36 18 36 8.06 27.94 0 18 0z" fill="${color}"/><circle cx="18" cy="18" r="6.4" fill="#fff"/></svg>`,
  )}`;

export function DeliveryMap({ markers, hint, unavailableLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const [failed, setFailed] = useState(!hasGoogleMapsKey());

  useEffect(() => {
    if (!hasGoogleMapsKey()) return;
    let cancelled = false;

    loadGoogleMaps()
      .then((maps: any) => {
        if (cancelled || !ref.current) return;
        if (!mapRef.current) {
          mapRef.current = new maps.Map(ref.current, {
            center: { lat: CARBONUS_OFFICE.lat, lng: CARBONUS_OFFICE.lng },
            zoom: 13,
            disableDefaultUI: true,
            zoomControl: true,
            fullscreenControl: false,
            clickableIcons: false,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const maps = (window as any).google?.maps;
    if (!maps || !mapRef.current) return;

    markerRefs.current.forEach((m) => m.setMap(null));
    markerRefs.current = [];

    const bounds = new maps.LatLngBounds();
    markers
      .filter((m) => m.location.lat != null && m.location.lng != null)
      .forEach((m) => {
        const position = { lat: m.location.lat as number, lng: m.location.lng as number };
        const color =
          m.variant === "office" ? "#1f2937" : m.variant === "delivery" ? "#16a34a" : "#0f766e";
        const marker = new maps.Marker({
          map: mapRef.current,
          position,
          title: `${m.label} — ${m.location.placeName}`,
          icon: {
            url: PIN(color),
            scaledSize: new maps.Size(30, 38),
            anchor: new maps.Point(15, 38),
          },
        });
        markerRefs.current.push(marker);
        bounds.extend(position);
      });

    if (markerRefs.current.length === 1) {
      mapRef.current.setCenter(bounds.getCenter());
      mapRef.current.setZoom(14);
    } else if (markerRefs.current.length > 1) {
      mapRef.current.fitBounds(bounds, 64);
    }
  }, [markers]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[260px] w-full overflow-hidden rounded-[16px] border border-border bg-[hsl(210_20%_96%)] sm:h-[300px] lg:h-full lg:min-h-[420px]">
        {failed ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <MapPin className="h-6 w-6 text-carbonus-green-dark" />
            <p className="text-[13px] text-muted-foreground">{unavailableLabel}</p>
            <ul className="mt-2 space-y-1 text-[13px] font-medium text-foreground">
              {markers.map((m) => (
                <li key={m.variant}>
                  {m.label}: {m.location.placeName}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div ref={ref} className="h-full w-full" aria-label="Žemėlapis" />
        )}
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-[13px] font-medium text-muted-foreground">
        <Crosshair className="h-4 w-4 text-carbonus-green-dark" />
        {hint}
      </p>
    </div>
  );
}
