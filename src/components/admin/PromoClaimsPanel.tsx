import { useEffect, useMemo, useState } from "react";
import { Gift, Star, ExternalLink, MessageSquare, RefreshCw, Trash2, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PromoClaim {
  id: string;
  code: string;
  rating: number | null;
  action: string;
  source: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  language: string;
  redeemed: boolean;
  redeemed_at: string | null;
  created_at: string;
}

const ACTION_LABELS: Record<string, string> = {
  revealed: "Kodas parodytas",
  google_click: "Perėjo į Google",
  feedback_sent: "Vidinis atsiliepimas",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("lt-LT", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export const PromoClaimsPanel = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<PromoClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("promo_code_claims")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) {
      toast({ title: "Nepavyko įkelti duomenų", description: error.message, variant: "destructive" });
    } else {
      setClaims((data ?? []) as PromoClaim[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const google = claims.filter((c) => c.action === "google_click").length;
    const feedback = claims.filter((c) => c.action === "feedback_sent").length;
    const redeemed = claims.filter((c) => c.redeemed).length;
    return {
      total: claims.length,
      google,
      feedback,
      redeemed,
      conversion: claims.length ? Math.round((redeemed / claims.length) * 100) : 0,
    };
  }, [claims]);

  const toggleRedeemed = async (claim: PromoClaim) => {
    const next = !claim.redeemed;
    const { error } = await supabase
      .from("promo_code_claims")
      .update({ redeemed: next, redeemed_at: next ? new Date().toISOString() : null })
      .eq("id", claim.id);
    if (error) {
      toast({ title: "Nepavyko atnaujinti", description: error.message, variant: "destructive" });
      return;
    }
    setClaims((prev) =>
      prev.map((c) =>
        c.id === claim.id ? { ...c, redeemed: next, redeemed_at: next ? new Date().toISOString() : null } : c,
      ),
    );
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("promo_code_claims").delete().eq("id", id);
    if (error) {
      toast({ title: "Nepavyko ištrinti", description: error.message, variant: "destructive" });
      return;
    }
    setClaims((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Nuolaidos kodai (ACIU10)</h2>
          <p className="text-sm text-muted-foreground">Konversijos iš /atsiliepimas puslapio</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atnaujinti
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { label: "Iš viso", value: stats.total, icon: Gift },
          { label: "Į Google", value: stats.google, icon: ExternalLink },
          { label: "Vidiniai", value: stats.feedback, icon: MessageSquare },
          { label: "Panaudota", value: stats.redeemed, icon: Check },
          { label: "Konversija", value: `${stats.conversion}%`, icon: Star },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-carbonus-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Kraunama…</p>
          ) : claims.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Kol kas nėra užfiksuotų kodo išdavimų.</p>
          ) : (
            <div className="divide-y">
              {claims.map((claim) => (
                <div key={claim.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{ACTION_LABELS[claim.action] ?? claim.action}</Badge>
                      {claim.rating ? (
                        <span className="inline-flex items-center gap-1 text-sm font-medium">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {claim.rating}/5
                        </span>
                      ) : null}
                      <span className="text-xs uppercase text-muted-foreground">{claim.language}</span>
                      {claim.redeemed && <Badge className="bg-carbonus-green-dark">Panaudota</Badge>}
                    </div>
                    <p className="mt-1 truncate text-sm">
                      {claim.name || "—"}
                      {claim.email ? ` · ${claim.email}` : ""}
                      {claim.phone ? ` · ${claim.phone}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">{formatDate(claim.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant={claim.redeemed ? "secondary" : "outline"} onClick={() => toggleRedeemed(claim)}>
                      {claim.redeemed ? "Atšaukti" : "Pažymėti panaudotą"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(claim.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PromoClaimsPanel;
