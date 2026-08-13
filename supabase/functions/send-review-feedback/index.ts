import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewFeedbackRequest {
  rating: number;
  name?: string;
  email?: string;
  phone?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const raw: ReviewFeedbackRequest = await req.json();

    const esc = (v: unknown, max = 2000) =>
      String(v ?? "")
        .slice(0, max)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const rating = Number(raw.rating);
    const name = esc(raw.name, 120);
    const email = esc(raw.email, 200);
    const phone = esc(raw.phone, 50);
    const message = esc(raw.message, 5000);

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: "Neteisingas įvertinimas" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!message || message.trim().length < 3) {
      return new Response(JSON.stringify({ error: "Parašykite atsiliepimą" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: "Neteisingas el. pašto adresas" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    await resend.emails.send({
      from: "Carbonus Atsiliepimai <info@carbonus.lt>",
      to: ["info@carbonus.lt"],
      subject: `Naujas atsiliepimas (${rating}/5) iš svetainės`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto;">
          <h2 style="color:#16a34a; margin-bottom: 4px;">Naujas kliento atsiliepimas</h2>
          <p style="font-size: 24px; margin: 0 0 16px; color:#f59e0b;">${stars} <span style="color:#111; font-size:16px;">(${rating}/5)</span></p>
          ${name ? `<p><strong>Vardas:</strong> ${name}</p>` : ""}
          ${email ? `<p><strong>El. paštas:</strong> ${email}</p>` : ""}
          ${phone ? `<p><strong>Telefonas:</strong> ${phone}</p>` : ""}
          <div style="background:#f5f5f5; padding:16px; border-left:4px solid #16a34a; margin:16px 0;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <p style="color:#666; font-size:12px;">Gauta iš carbonus.lt atsiliepimų formos.</p>
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("send-review-feedback error:", error);
    return new Response(JSON.stringify({ error: "Nepavyko išsiųsti atsiliepimo" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
