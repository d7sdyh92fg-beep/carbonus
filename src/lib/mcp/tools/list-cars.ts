import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { notAuthenticated, supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_cars",
  title: "List fleet cars",
  description: "List Carbonus rental cars with pricing, category and availability flags.",
  inputSchema: {
    only_available: z
      .boolean()
      .default(false)
      .describe("Return only cars currently marked as available."),
    limit: z.number().int().min(1).max(100).default(50).describe("Maximum number of cars to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ only_available, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("cars")
      .select(
        "id,name,category,year,passengers,fuel,transmission,price_per_day,price_tier1,price_tier2,price_tier3,deposit_amount,is_available,is_premium,license_plate",
      )
      .order("name")
      .limit(limit);
    if (only_available) query = query.eq("is_available", true);

    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { cars: data ?? [] },
    };
  },
});
