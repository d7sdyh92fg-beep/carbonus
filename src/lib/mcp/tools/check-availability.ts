import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format")
  .describe("Date in YYYY-MM-DD format (local time).");

export default defineTool({
  name: "check_availability",
  title: "Check car availability",
  description: "Check whether a specific car is free for a rental period (YYYY-MM-DD dates).",
  inputSchema: {
    car_id: z.string().trim().min(1).describe("Car id from list_cars."),
    start_date: dateSchema,
    end_date: dateSchema,
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ car_id, start_date, end_date }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase.rpc("check_car_availability", {
      p_car_id: car_id,
      p_start_date: start_date,
      p_end_date: end_date,
    });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { availability: data },
    };
  },
});
