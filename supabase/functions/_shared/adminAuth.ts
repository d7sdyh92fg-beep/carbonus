import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface AdminAuthResult {
  ok: boolean;
  userId?: string;
  /** true when the caller authenticated with the service role key (internal function-to-function call) */
  internal?: boolean;
  status?: number;
  error?: string;
}

/**
 * Verifies that the caller is either:
 *  - an authenticated user holding the `admin` role in public.user_roles, or
 *  - an internal call authenticated with the service role key.
 *
 * Every admin-only edge function must call this before doing any work.
 */
export async function requireAdmin(req: Request): Promise<AdminAuthResult> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const token = authHeader.slice("Bearer ".length).trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

  if (serviceKey && token === serviceKey) {
    return { ok: true, internal: true };
  }

  const authClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData?.user) {
    return { ok: false, status: 401, error: "Unauthorized" };
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data: roleData } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleData) {
    return { ok: false, status: 403, error: "Forbidden: admin access required" };
  }

  return { ok: true, userId: userData.user.id };
}

export function adminAuthFailureResponse(
  result: AdminAuthResult,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(JSON.stringify({ error: result.error ?? "Unauthorized", success: false }), {
    status: result.status ?? 401,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
