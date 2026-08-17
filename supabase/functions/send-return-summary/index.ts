import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { requireAdmin, adminAuthFailureResponse } from "../_shared/adminAuth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SummaryRequest {
  type: "due_alert" | "overdue_alert" | "completed_summary" | "issue_summary";
  to?: string;
  reservationId: string;
  carName: string;
  customerName: string;
  dueAt?: string;
  returnDate?: string;
  returnTime?: string;
  mileageEnd?: number | null;
  fuelLevel?: string | null;
  notes?: string | null;
  issues?: string[];
  extraCharge?: number;
}

const ISSUE_LABELS: Record<string, string> = {
  damage: "Naujas pažeidimas",
  fuel: "Trūksta kuro",
  cleaning: "Reikalingas valymas",
  mileage: "Viršyta rida",
  late: "Pavėluotas grąžinimas",
  documents: "Trūksta dokumentų ar raktų",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return adminAuthFailureResponse(auth, corsHeaders);

    const data: SummaryRequest = await req.json();
    if (!data?.type || !data?.reservationId) {
      return new Response(JSON.stringify({ error: "type ir reservationId privalomi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const to = data.to || "info@carbonus.lt";
    const shortId = data.reservationId.slice(0, 8).toUpperCase();

    let subject = "";
    let body = "";

    if (data.type === "due_alert" || data.type === "overdue_alert") {
      const overdue = data.type === "overdue_alert";
      subject = overdue
        ? `⚠️ VĖLUOJA grąžinimas – ${data.carName} (${shortId})`
        : `⏰ Netrukus grąžinimas – ${data.carName} (${shortId})`;
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${overdue ? "#dc2626" : "#0f766e"};">
            ${overdue ? "Automobilis vėluoja grąžinti" : "Automobilis grąžinamas netrukus"}
          </h2>
          <p><strong>Automobilis:</strong> ${data.carName}</p>
          <p><strong>Klientas:</strong> ${data.customerName || "—"}</p>
          <p><strong>Grąžinimo laikas:</strong> ${data.returnDate ?? ""} ${data.returnTime ?? ""}</p>
          <p><strong>Rezervacija:</strong> ${shortId}</p>
          <p style="margin-top:20px;">Atidaryk administratoriaus skydelį ir paspausk „Pradėti grąžinimo patikrą“.</p>
        </div>`;
    } else {
      const isIssue = data.type === "issue_summary";
      subject = isIssue
        ? `🛠️ Grąžinimas su problema – ${data.carName} (${shortId})`
        : `✅ Rezervacija užbaigta – ${data.carName} (${shortId})`;
      const issueList = (data.issues ?? []).map((i) => `<li>${ISSUE_LABELS[i] ?? i}</li>`).join("");
      body = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${isIssue ? "#b45309" : "#15803d"};">
            ${isIssue ? "Grąžinimo patikra: reikia sprendimo" : "Grąžinimo patikra baigta"}
          </h2>
          <p><strong>Automobilis:</strong> ${data.carName}</p>
          <p><strong>Klientas:</strong> ${data.customerName || "—"}</p>
          <p><strong>Rezervacija:</strong> ${shortId}</p>
          <p><strong>Rida:</strong> ${data.mileageEnd ?? "—"} km</p>
          <p><strong>Kuro lygis:</strong> ${data.fuelLevel ?? "—"}</p>
          ${issueList ? `<p><strong>Problemos:</strong></p><ul>${issueList}</ul>` : ""}
          ${data.extraCharge ? `<p><strong>Papildomas mokestis:</strong> €${Number(data.extraCharge).toFixed(2)}</p>` : ""}
          ${data.notes ? `<p><strong>Pastabos:</strong> ${data.notes}</p>` : ""}
        </div>`;
    }

    const emailResponse = await resend.emails.send({
      from: "Carbonus <info@carbonus.lt>",
      to: [to],
      subject,
      html: body,
    });

    return new Response(JSON.stringify({ success: true, emailId: emailResponse }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("send-return-summary error", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
