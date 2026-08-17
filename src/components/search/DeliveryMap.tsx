import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair } from "lucide-react";
import { CARBONUS_OFFICE, PlaceLocation } from "@/lib/logisticsPricing";

interface MapMarker {
  location: PlaceLocation;
  label: string;
  variant: "office" | "delivery" | "collection";
}

interface Props {
  markers: MapMarker[];
  hint: string;
  unavailableLabel?: string;
}

const COLORS: Record<MapMarker["variant"], string> = {
  office: "#1f2937",
  delivery: "#16a34a",
  collection: "#0f766e",
};

const pinIcon = (color: string) =>
  L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 36 46"><path d="M18 0C8.06 0 0 8.06 0 18c0 12.6 16.2 27 16.9 27.6a1.7 1.7 0 0 0 2.2 0C19.8 45 36 30.6 36 18 36 8.06 27.94 0 18 0z" fill="${color}"/><circle cx="18" cy="18" r="6.4" fill="#fff"/></svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });

export function DeliveryMap({ markers, hint }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      center: [CARBONUS_OFFICE.lat, CARBONUS_OFFICE.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    // Ensure correct sizing inside flex/grid containers.
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const points: L.LatLngExpression[] = [];

    markers
      .filter((m) => m.location.lat != null && m.location.lng != null)
      .forEach((m) => {
        const pos: L.LatLngExpression = [m.location.lat as number, m.location.lng as number];
        L.marker(pos, { icon: pinIcon(COLORS[m.variant]), title: m.label })
          .bindPopup(`<strong>${m.label}</strong><br/>${m.location.placeName ?? ""}`)
          .addTo(layer);
        points.push(pos);
      });

    if (points.length === 1) {
      map.setView(points[0], 14);
    } else if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [48, 48] });
    }
    map.invalidateSize();
  }, [markers]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative h-[260px] w-full overflow-hidden rounded-[16px] border border-border bg-[hsl(210_20%_96%)] sm:h-[300px] lg:h-full lg:min-h-[420px]">
        <div ref={ref} className="h-full w-full" aria-label="Žemėlapis" />
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-[13px] font-medium text-muted-foreground">
        <Crosshair className="h-4 w-4 text-carbonus-green-dark" />
        {hint}
      </p>
    </div>
  );
}
