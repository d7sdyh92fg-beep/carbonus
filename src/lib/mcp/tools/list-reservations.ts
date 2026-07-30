import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_reservations",
  title: "List reservations",
  description:
    "List Carbonus reservations, optionally filtered by status, car or date range. Access follows the signed-in user's permissions.",
  inputSchema: {
    status: z
      .string()
      .trim()
      .nullable()
      .default(null)
      .describe("Filter by reservation status, e.g. confirmed, picked_up, returned."),
    car_id: z.string().trim().nullable().default(null).describe("Filter by car id."),
    from_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .default(null)
      .describe("Only reservations ending on or after this YYYY-MM-DD date."),
    to_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .default(null)
      .describe("Only reservations starting on or before this YYYY-MM-DD date."),
    limit: z.number().int().min(1).max(200).default(50).describe("Maximum rows to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, car_id, from_date, to_date, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("reservations")
      .select(
        "id,car_id,car_name,customer_id,start_date,end_date,pickup_time,return_time,rental_days,status,payment_method,total_amount,deposit_amount,created_at",
      )
      .is("deleted_at", null)
      .order("start_date", { ascending: false })
      .limit(limit);

    if (status) query = query.eq("status", status);
    if (car_id) query = query.eq("car_id", car_id);
    if (from_date) query = query.gte("end_date", from_date);
    if (to_date) query = query.lte("start_date", to_date);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { reservations: data ?? [] },
    };
  },
});
