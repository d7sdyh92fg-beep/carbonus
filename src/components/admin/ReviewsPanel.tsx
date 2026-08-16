import { useEffect, useMemo, useState } from "react";
import {
  Star,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  QrCode,
  Send,
  Mail,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { GOOGLE_REVIEW_URL } from "@/lib/reviewLink";

const REVIEW_PAGE_URL = "https://carbonus.lt/atsiliepimas";

const SMS_TEMPLATE = `Sveiki! Ačiū, kad rinkotės Carbonus 🚗 Jei viskas patiko, įvertinkite mus čia: ${REVIEW_PAGE_URL} — už atsiliepimą dovanojame 10% nuolaidos kodą kitai nuomai.`;

const EMAIL_SUBJECT = "Kaip sekėsi su Carbonus automobiliu?";
const EMAIL_BODY = `Sveiki,

ačiū, kad rinkotės Carbonus! Būtume dėkingi už trumpą įvertinimą – užtrunka mažiau nei minutę:

${REVIEW_PAGE_URL}

Už atsiliepimą dovanojame 10% nuolaidos kodą kitai nuomai.

Pagarbiai,
MB Carbonus
+370 600 00000 | info@carbonus.lt`;

interface PromoClaim {
  id: string;
  rating: number | null;
  action: string;
  created_at: string;
  name: string | null;
}

const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ title: "Nukopijuota", description: label });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Nepavyko nukopijuoti", variant: "destructive" });
    }
  };
  return (
    <div className="rounded-xl border bg-muted/40 p-3">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="flex-1 break-all rounded-lg bg-background px-3 py-2 text-sm">{value}</code>
        <div className="flex gap-2">
          <Button size="sm" onClick={copy}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            Kopijuoti
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={value} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Atidaryti
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const ReviewsPanel = () => {
  const { toast } = useToast();
  const [claims, setClaims] = useState<PromoClaim[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("promo_code_claims")
      .select("id, rating, action, created_at, name")
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
    const rated = claims.filter((c) => typeof c.rating === "number");
    const avg = rated.length
      ? (rated.reduce((s, c) => s + (c.rating || 0), 0) / rated.length).toFixed(1)
      : "—";
    const google = claims.filter((c) => c.action === "google_click").length;
    const internal = claims.filter((c) => c.action === "feedback_sent").length;
    const last30 = claims.filter(
      (c) => Date.now() - new Date(c.created_at).getTime() < 30 * 24 * 3600 * 1000,
    ).length;
    return { total: claims.length, avg, google, internal, last30 };
  }, [claims]);

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Nukopijuota", description: label });
    } catch {
      toast({ title: "Nepavyko nukopijuoti", variant: "destructive" });
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(
    REVIEW_PAGE_URL,
  )}`;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Atsiliepimai</h2>
          <p className="text-sm text-muted-foreground">
            Nuoroda klientams, Google puslapis ir įvertinimų suvestinė
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Atnaujinti
        </Button>
      </div>

      {/* Nuorodos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4" /> Nuorodos siuntimui
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <CopyRow label="Atsiliepimų puslapis (siųsti klientams)" value={REVIEW_PAGE_URL} />
          <CopyRow label="Tiesioginė Google atsiliepimo nuoroda" value={GOOGLE_REVIEW_URL} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Šablonai */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" /> Paruošti tekstai
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                SMS / WhatsApp
              </p>
              <p className="whitespace-pre-wrap rounded-xl border bg-muted/40 p-3 text-sm">{SMS_TEMPLATE}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(SMS_TEMPLATE, "SMS tekstas")}>
                  <Copy className="mr-2 h-4 w-4" /> Kopijuoti
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={`sms:?&body=${encodeURIComponent(SMS_TEMPLATE)}`}>
                    <Smartphone className="mr-2 h-4 w-4" /> Siųsti SMS
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(SMS_TEMPLATE)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" /> WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                El. laiškas
              </p>
              <p className="whitespace-pre-wrap rounded-xl border bg-muted/40 p-3 text-sm">{EMAIL_BODY}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copyText(EMAIL_BODY, "Laiško tekstas")}>
                  <Copy className="mr-2 h-4 w-4" /> Kopijuoti
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(
                      EMAIL_BODY,
                    )}`}
                  >
                    <Mail className="mr-2 h-4 w-4" /> Rašyti laišką
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR + statistika */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <QrCode className="h-4 w-4" /> QR kodas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3">
              <img
                src={qrUrl}
                alt="QR kodas į Carbonus atsiliepimų puslapį"
                className="rounded-xl border bg-white p-2"
                width={220}
                height={220}
                data-allow-save="true"
              />
              <p className="text-center text-xs text-muted-foreground">
                Atspausdinkite ir palikite automobilyje – klientas nuskenuoja ir palieka atsiliepimą.
              </p>
              <Button size="sm" variant="outline" asChild>
                <a href={qrUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Atsisiųsti / atidaryti
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Star className="h-4 w-4" /> Suvestinė
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Vid. įvertinimas</p>
                <p className="text-xl font-bold">{stats.avg}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Iš viso vertinimų</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Perėjo į Google</p>
                <p className="text-xl font-bold">{stats.google}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Vidiniai (1–4★)</p>
                <p className="text-xl font-bold">{stats.internal}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">Per 30 d.</p>
                <p className="text-xl font-bold">{stats.last30}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Paskutiniai įvertinimai */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Paskutiniai įvertinimai</CardTitle>
        </CardHeader>
        <CardContent>
          {claims.length === 0 ? (
            <p className="text-sm text-muted-foreground">Kol kas įvertinimų nėra.</p>
          ) : (
            <div className="space-y-2">
              {claims.slice(0, 12).map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-4 w-4 ${
                            (c.rating ?? 0) >= s ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-medium">{c.name || "Anoniminis"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {c.action === "google_click"
                        ? "Google"
                        : c.action === "feedback_sent"
                          ? "Vidinis"
                          : "Kodas parodytas"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString("lt-LT")}
                    </span>
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
