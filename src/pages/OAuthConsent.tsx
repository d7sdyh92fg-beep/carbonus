import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) return setError("Missing authorization_id");
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      const { data, error } = await (supabase.auth as any).oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) return setError(error.message);
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    const oauth = (supabase.auth as any).oauth;
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorizationId)
      : await oauth.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      return setError("Autorizacijos serveris negrąžino nukreipimo adreso.");
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        {error ? (
          <>
            <h1 className="text-xl font-semibold text-foreground">Nepavyko</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </>
        ) : !details ? (
          <p className="text-sm text-muted-foreground">Kraunama…</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold text-foreground">
              Prijungti {details.client?.name ?? "programą"} prie Carbonus
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {details.client?.name ?? "Ši programa"} galės naudotis Carbonus įrankiais jūsų vardu.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                disabled={busy}
                onClick={() => decide(true)}
                className="flex-1 h-11 rounded-full bg-primary text-primary-foreground font-semibold disabled:opacity-50"
              >
                Patvirtinti
              </button>
              <button
                disabled={busy}
                onClick={() => decide(false)}
                className="flex-1 h-11 rounded-full border border-border text-foreground font-semibold disabled:opacity-50"
              >
                Atmesti
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
