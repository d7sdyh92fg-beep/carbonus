/** Loads the Google Maps JS API once (async, with callback) and resolves when ready. */

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

let loaderPromise: Promise<typeof google.maps> | null = null;

export const hasGoogleMapsKey = () => Boolean(BROWSER_KEY);

export function loadGoogleMaps(): Promise<typeof google.maps> {
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise((resolve, reject) => {
    if (!BROWSER_KEY) {
      reject(new Error("Google Maps browser key is not configured"));
      return;
    }
    if (typeof window === "undefined") {
      reject(new Error("Google Maps can only load in the browser"));
      return;
    }
    if ((window as any).google?.maps?.Map) {
      resolve((window as any).google.maps);
      return;
    }

    const callbackName = "__carbonusInitGoogleMaps";
    (window as any)[callbackName] = () => {
      resolve((window as any).google.maps);
    };

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: BROWSER_KEY,
      loading: "async",
      libraries: "places,marker",
      callback: callbackName,
      language: "lt",
      region: "LT",
    });
    if (TRACKING_ID) params.set("channel", TRACKING_ID);
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}
