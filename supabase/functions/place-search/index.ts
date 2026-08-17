// Places API (New) proxy through the Lovable connector gateway.
// Used by the delivery location search so it works on any domain
// (the browser key is referrer-restricted and cannot be used here).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";
const BASE = { latitude: 54.0201, longitude: 23.9723 }; // Druskininkai office

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const action = body?.action === "details" ? "details" : "autocomplete";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) return json({ error: "MAPS_NOT_CONFIGURED" }, 503);

    const auth = {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
    };

    if (action === "autocomplete") {
      const input = String(body?.input ?? "").trim().slice(0, 200);
      if (input.length < 2) return json({ suggestions: [] });

      const payload: Record<string, unknown> = {
        input,
        languageCode: "lt",
        includedRegionCodes: ["lt", "lv", "pl", "ee"],
      };
      if (body?.nearBase) {
        payload.locationBias = { circle: { center: BASE, radius: 20000 } };
      }

      const res = await fetch(`${GATEWAY_URL}/places/v1/places:autocomplete`, {
        method: "POST",
        headers: { ...auth, "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const details = await res.text();
        console.error(`Autocomplete failed [${res.status}]: ${details}`);
        return json({ error: "AUTOCOMPLETE_FAILED", status: res.status, details }, res.status);
      }
      const data = await res.json();
      const suggestions = (data?.suggestions ?? [])
        .filter((s: any) => s?.placePrediction)
        .slice(0, 6)
        .map((s: any) => ({
          placeId: s.placePrediction.placeId,
          primary: s.placePrediction.structuredFormat?.mainText?.text ?? s.placePrediction.text?.text ?? "",
          secondary: s.placePrediction.structuredFormat?.secondaryText?.text ?? "",
        }));
      return json({ suggestions });
    }

    const placeId = String(body?.placeId ?? "").trim();
    if (!placeId) return json({ error: "MISSING_PLACE_ID" }, 400);

    const res = await fetch(
      `${GATEWAY_URL}/places/v1/places/${encodeURIComponent(placeId)}?languageCode=lt`,
      {
        headers: {
          ...auth,
          "X-Goog-FieldMask": "displayName,formattedAddress,location,addressComponents",
        },
      },
    );
    if (!res.ok) {
      const details = await res.text();
      console.error(`Place details failed [${res.status}]: ${details}`);
      return json({ error: "DETAILS_FAILED", status: res.status, details }, res.status);
    }
    const p = await res.json();
    const comp = (type: string) =>
      (p?.addressComponents ?? []).find((c: any) => (c.types ?? []).includes(type))?.longText ?? "";

    return json({
      place: {
        placeName: p?.displayName?.text ?? "",
        address: p?.formattedAddress ?? "",
        city: comp("locality") || comp("postal_town") || comp("administrative_area_level_2"),
        country: comp("country"),
        lat: p?.location?.latitude ?? null,
        lng: p?.location?.longitude ?? null,
      },
    });
  } catch (error) {
    console.error("place-search error:", error);
    return json({ error: "UNEXPECTED_ERROR", details: String(error) }, 500);
  }
});
