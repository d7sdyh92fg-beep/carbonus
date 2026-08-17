import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { requireAdmin, adminAuthFailureResponse } from "../_shared/adminAuth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompletionRequest {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  startDate?: string;
  endDate?: string;
  depositAmount?: number;
  language?: string;
}

const REVIEW_URL = "https://carbonus.lt/atsiliepimas";

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return adminAuthFailureResponse(auth, corsHeaders);

    const data: CompletionRequest = await req.json();
    if (!data?.customerEmail || !data?.reservationId) {
      return new Response(JSON.stringify({ error: "customerEmail ir reservationId privalomi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isLT = (data.language || "lt") === "lt";
    const deposit = data.depositAmount ? `€${Number(data.depositAmount).toFixed(0)}` : "";

    const html = isLT
      ? `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color:#15803d;">✅ Nuoma sėkmingai užbaigta</h1>
        <p>Sveiki, ${data.customerName}!</p>
        <p>Automobilis <strong>${data.carName}</strong> priimtas ir patikra atlikta. Ačiū, kad rinkotės Carbonus!</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:20px 0;">
          <p style="margin:0;"><strong>Nuomos laikotarpis:</strong> ${data.startDate ?? ""} – ${data.endDate ?? ""}</p>
          ${deposit ? `<p style="margin:8px 0 0;"><strong>Užstatas:</strong> ${deposit} – pažymėtas grąžintinu.</p>` : ""}
        </div>
        <div style="background:#dcfce7;padding:16px;border-radius:8px;border-left:4px solid #22c55e;">
          <p style="margin:0;"><strong>⭐ Palikite atsiliepimą</strong></p>
          <p style="margin:8px 0 12px;">Jūsų nuomonė mums labai svarbi – tai užtruks vos minutę.</p>
          <a href="${REVIEW_URL}" style="display:inline-block;background:#15803d;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;">Palikti atsiliepimą</a>
        </div>
        <p style="margin-top:24px;">Klausimai: info@carbonus.lt · +370 6 98 18 781</p>
        <p style="color:#6b7280;font-size:14px;">Iki kito karto!<br>Carbonus komanda</p>
      </div>`
      : `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color:#15803d;">✅ Rental completed</h1>
        <p>Hello, ${data.customerName}!</p>
        <p>Your <strong>${data.carName}</strong> has been returned and inspected. Thank you for choosing Carbonus!</p>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:20px 0;">
          <p style="margin:0;"><strong>Rental period:</strong> ${data.startDate ?? ""} – ${data.endDate ?? ""}</p>
          ${deposit ? `<p style="margin:8px 0 0;"><strong>Deposit:</strong> ${deposit} – marked for refund.</p>` : ""}
        </div>
        <div style="background:#dcfce7;padding:16px;border-radius:8px;border-left:4px solid #22c55e;">
          <p style="margin:0;"><strong>⭐ Leave a review</strong></p>
          <p style="margin:8px 0 12px;">It only takes a minute and helps us a lot.</p>
          <a href="${REVIEW_URL}" style="display:inline-block;background:#15803d;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none;">Leave a review</a>
        </div>
        <p style="margin-top:24px;">Questions: info@carbonus.lt · +370 6 98 18 781</p>
        <p style="color:#6b7280;font-size:14px;">See you next time!<br>Carbonus Team</p>
      </div>`;

    const emailResponse = await resend.emails.send({
      from: "Carbonus <info@carbonus.lt>",
      to: [data.customerEmail],
      subject: isLT ? "✅ Nuoma užbaigta – ačiū, kad rinkotės Carbonus" : "✅ Rental completed – thank you for choosing Carbonus",
      html,
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-completion-email error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
