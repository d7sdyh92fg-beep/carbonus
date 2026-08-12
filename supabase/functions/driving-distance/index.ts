// Returns the DRIVING distance (km) from the Carbonus base in Druskininkai
// to a given coordinate, using the Google Routes API through the Lovable
// connector gateway.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

const BASE = { latitude: 54.0201, longitude: 23.9723 }; // M. K. Čiurlionio g. 51, Druskininkai

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const lat = Number(body?.lat);
    const lng = Number(body?.lng);
    // "to_base" reverses the direction (collection leg); distance is usually
    // symmetric but one-way streets / ferries can differ.
    const direction = body?.direction === "to_base" ? "to_base" : "from_base";

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return new Response(JSON.stringify({ error: "INVALID_COORDINATES" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!LOVABLE_API_KEY || !GOOGLE_MAPS_API_KEY) {
      return new Response(JSON.stringify({ error: "MAPS_NOT_CONFIGURED" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const point = { latitude: lat, longitude: lng };
    const origin = direction === "to_base" ? point : BASE;
    const destination = direction === "to_base" ? BASE : point;

    const response = await fetch(`${GATEWAY_URL}/routes/directions/v2:computeRoutes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
      },
      body: JSON.stringify({
        origin: { location: { latLng: origin } },
        destination: { location: { latLng: destination } },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
        units: "METRIC",
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Routes API failed [${response.status}]: ${errorBody}`);
      return new Response(
        JSON.stringify({ error: "ROUTES_REQUEST_FAILED", status: response.status, details: errorBody }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await response.json();
    const meters = data?.routes?.[0]?.distanceMeters;
    if (typeof meters !== "number") {
      console.error("No route returned:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "NO_ROUTE" }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        distanceKm: Math.round((meters / 1000) * 10) / 10,
        durationSeconds: Number(String(data?.routes?.[0]?.duration ?? "0").replace("s", "")) || null,
        direction,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("driving-distance error:", error);
    return new Response(JSON.stringify({ error: "UNEXPECTED_ERROR", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
