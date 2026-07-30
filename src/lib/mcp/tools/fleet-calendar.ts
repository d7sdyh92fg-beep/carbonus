import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format");

export default defineTool({
  name: "fleet_calendar",
  title: "Fleet calendar",
  description:
    "Return booked and manually blocked date ranges for the whole fleet within a period, to see which cars are free.",
  inputSchema: {
    start_date: dateSchema.describe("Period start, YYYY-MM-DD."),
    end_date: dateSchema.describe("Period end, YYYY-MM-DD."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ start_date, end_date }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);

    const [booked, blocked] = await Promise.all([
      supabase
        .from("reservation_availability")
        .select("car_id,start_date,end_date")
        .lte("start_date", end_date)
        .gte("end_date", start_date),
      supabase
        .from("car_blocked_dates")
        .select("car_id,start_date,end_date")
        .lte("start_date", end_date)
        .gte("end_date", start_date),
    ]);

    const error = booked.error ?? blocked.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const result = { booked: booked.data ?? [], blocked: blocked.data ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result,
    };
  },
});
