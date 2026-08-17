import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";
const ADMIN_EMAIL = "info@carbonus.lt";

async function isAuthorized(req: Request, token: string | null): Promise<boolean> {
  const cronHeader = req.headers.get("x-cron-secret") ?? "";
  if (CRON_SECRET && cronHeader === CRON_SECRET) return true;
  const auth = req.headers.get("Authorization") ?? "";
  if (SERVICE_KEY && auth === `Bearer ${SERVICE_KEY}`) return true;
  if (token) {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
    const { data } = await admin.from("cron_auth").select("id").eq("name", "return-watchdog").eq("token", token).maybeSingle();
    if (data) return true;
  }
  return false;
}

/** Combines return_date + return_time into a UTC timestamp (Lithuania = UTC+3 in summer, UTC+2 winter). */
function returnTimestamp(dateStr: string, timeStr: string | null): Date {
  const time = (timeStr ?? "18:00:00").slice(0, 8);
  // Treat stored local time as Europe/Vilnius. Offset resolved via Intl for correctness.
  const naive = new Date(`${dateStr}T${time}Z`);
  const offsetMinutes = vilniusOffsetMinutes(naive);
  return new Date(naive.getTime() - offsetMinutes * 60_000);
}

function vilniusOffsetMinutes(date: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Vilnius",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour === "24" ? "00" : parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return (asUTC - date.getTime()) / 60_000;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  let payload: Record<string, unknown> = {};
  try {
    payload = await req.json();
  } catch (_) {
    payload = {};
  }

  if (!(await isAuthorized(req, (payload?.token as string) ?? null))) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const now = new Date();
  const summary = { checked: 0, due_soon: 0, overdue: 0, client_reminders: 0, admin_alerts: 0, errors: [] as string[] };

  try {
    const horizon = new Date(now.getTime() + 36 * 3600_000).toISOString().slice(0, 10);

    const { data: rows, error } = await supabase
      .from("reservations")
      .select(
        "id, car_name, status, return_stage, return_date, end_date, return_time, return_reminder_sent_at, admin_return_alert_sent_at, language, customer_id, customers(first_name, last_name, email)",
      )
      .in("status", ["picked_up", "paid"])
      .is("deleted_at", null)
      .lte("return_date", horizon);

    if (error) throw error;

    for (const r of rows ?? []) {
      summary.checked++;
      const dateStr = (r.return_date as string) || (r.end_date as string);
      if (!dateStr) continue;
      const dueAt = returnTimestamp(dateStr, r.return_time as string | null);
      const hoursLeft = (dueAt.getTime() - now.getTime()) / 3600_000;

      let stage: string | null = null;
      if (hoursLeft <= 0) stage = "overdue";
      else if (hoursLeft <= 24) stage = "due_soon";

      if (!stage) continue;
      if (stage === "due_soon") summary.due_soon++;
      else summary.overdue++;

      const patch: Record<string, unknown> = {};
      if (r.return_stage !== stage && r.return_stage !== "inspecting" && r.return_stage !== "resolved") {
        patch.return_stage = stage;
      }

      const customer = (r as any).customers;
      const customerName = customer ? `${customer.first_name} ${customer.last_name}` : "";

      // 1) Client reminder 24h before (once)
      if (stage === "due_soon" && !r.return_reminder_sent_at && customer?.email) {
        try {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/send-return-reminder`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
            body: JSON.stringify({
              reservationId: r.id,
              customerEmail: customer.email,
              customerName,
              carName: r.car_name,
              endDate: dateStr,
              language: r.language ?? "lt",
            }),
          });
          if (res.ok) {
            patch.return_reminder_sent_at = now.toISOString();
            summary.client_reminders++;
          } else {
            summary.errors.push(`reminder ${r.id}: ${res.status}`);
          }
        } catch (e) {
          summary.errors.push(`reminder ${r.id}: ${(e as Error).message}`);
        }
      }

      // 2) Admin alert when return is imminent (<=2h) or overdue (once)
      if ((stage === "overdue" || hoursLeft <= 2) && !r.admin_return_alert_sent_at) {
        try {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/send-return-summary`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${SERVICE_KEY}` },
            body: JSON.stringify({
              type: stage === "overdue" ? "overdue_alert" : "due_alert",
              to: ADMIN_EMAIL,
              reservationId: r.id,
              carName: r.car_name,
              customerName,
              dueAt: dueAt.toISOString(),
              returnDate: dateStr,
              returnTime: (r.return_time as string) ?? "",
            }),
          });
          if (res.ok) {
            patch.admin_return_alert_sent_at = now.toISOString();
            summary.admin_alerts++;
          } else {
            summary.errors.push(`admin alert ${r.id}: ${res.status}`);
          }
        } catch (e) {
          summary.errors.push(`admin alert ${r.id}: ${(e as Error).message}`);
        }
      }

      if (Object.keys(patch).length > 0) {
        const { error: upErr } = await supabase.from("reservations").update(patch).eq("id", r.id);
        if (upErr) summary.errors.push(`update ${r.id}: ${upErr.message}`);
      }
    }

    console.log("return-watchdog summary", summary);
    return new Response(JSON.stringify({ success: true, ...summary }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("return-watchdog error", e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
