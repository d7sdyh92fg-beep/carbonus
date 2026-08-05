import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { path } = await req.json();
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await supabase.storage.from("contracts").createSignedUrl(path, 600);
  return new Response(JSON.stringify({ url: data?.signedUrl, error: error?.message }), { headers: { "Content-Type": "application/json" } });
});
