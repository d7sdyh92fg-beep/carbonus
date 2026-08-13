import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, ExternalLink, Send, CheckCircle2, Gift, Copy, Check, Info } from "lucide-react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/use-translations";
import { supabase } from "@/integrations/supabase/client";
import { GOOGLE_REVIEW_URL } from "@/lib/reviewLink";

const PROMO_CODE = "ACIU10";


const Review = () => {
  const { language } = useTranslations();
  const isEnglish = language === "en";
  const { toast } = useToast();

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(PROMO_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };


  const copy = isEnglish
    ? {
        eyebrow: "YOUR OPINION",
        title: "How was your rental?",
        subtitle: "Rate your experience in one click. It takes less than a minute.",
        pick: "Choose a rating",
        greatTitle: "Thank you! We are glad you enjoyed it",
        greatText: "Would you share it on Google? It helps other drivers choose us.",
        greatCta: "Leave a Google review",
        lowTitle: "Thank you for your honesty",
        lowText: "Tell us what we should improve — this message goes straight to our team, not to Google.",
        name: "Name",
        email: "Email (optional)",
        phone: "Phone (optional)",
        message: "Your feedback",
        messagePh: "What could we do better?",
        submit: "Send feedback",
        thanksTitle: "Feedback sent",
        thanksText: "Thank you — we will look into it and contact you if needed.",
        again: "Change rating",
        stars: (n: number) => `${n} of 5`,
        promoBanner: "Leave a review and get a 10% discount code for your next rental",
        promoTitle: "Your 10% discount code",
        promoText: "Use this code when booking your next rental. Valid for 6 months, one use per client.",
        promoReveal: "I left the review — show my code",
        promoCopy: "Copy code",
        promoCopied: "Copied",
        termsShort: "Valid 6 months · one use per client · minimum rental 3 days",
        termsLink: "View terms",
        termsTitle: "Discount code terms",
        termsIntro: "The ACIU10 code gives a 10% discount on the rental price under these conditions:",
        termsList: [
          "Validity: 6 months from the day the review was left.",
          "One-time use: one code per client and per reservation, non-transferable.",
          "Minimum order: rental of at least 3 days (72 h).",
          "The discount applies to the rental price only — it does not apply to delivery/return fees, deposit, fuel or fines.",
          "Cannot be combined with other discounts or special offers.",
          "The code has no cash value and cannot be exchanged for money.",
          "Enter the code when booking or tell it to us before the contract is signed — it cannot be applied afterwards.",
          "Carbonus may cancel the code in case of abuse or fake reviews.",
        ],
        termsRulesLink: "Full rental terms",
        termsClose: "Got it",

      }

    : {
        eyebrow: "JŪSŲ NUOMONĖ",
        title: "Kaip sekėsi nuoma?",
        subtitle: "Įvertinkite patirtį vienu paspaudimu. Užtruks mažiau nei minutę.",
        pick: "Pasirinkite įvertinimą",
        greatTitle: "Dėkojame! Smagu, kad patiko",
        greatText: "Gal pasidalintumėte tuo Google? Tai padeda kitiems vairuotojams pasirinkti mus.",
        greatCta: "Palikti atsiliepimą Google",
        lowTitle: "Dėkojame už atvirumą",
        lowText: "Parašykite, ką turėtume pagerinti — ši žinutė ateis tiesiai mūsų komandai, ne į Google.",
        name: "Vardas",
        email: "El. paštas (nebūtina)",
        phone: "Telefonas (nebūtina)",
        message: "Jūsų atsiliepimas",
        messagePh: "Ką galėtume padaryti geriau?",
        submit: "Siųsti atsiliepimą",
        thanksTitle: "Atsiliepimas išsiųstas",
        thanksText: "Dėkojame — peržiūrėsime ir prireikus susisieksime.",
        again: "Keisti įvertinimą",
        stars: (n: number) => `${n} iš 5`,
        promoBanner: "Palikite atsiliepimą ir gaukite 10% nuolaidos kodą kitai nuomai",
        promoTitle: "Jūsų 10% nuolaidos kodas",
        promoText: "Panaudokite šį kodą užsakydami kitą nuomą. Galioja 6 mėn., vienam klientui – vieną kartą.",
        promoReveal: "Palikau atsiliepimą — rodyti kodą",
        promoCopy: "Kopijuoti kodą",
        promoCopied: "Nukopijuota",
        termsShort: "Galioja 6 mėn. · vienkartinis panaudojimas · min. nuoma 3 paros",
        termsLink: "Peržiūrėti sąlygas",
        termsTitle: "Nuolaidos kodo sąlygos",
        termsIntro: "Kodas ACIU10 suteikia 10% nuolaidą nuomos kainai šiomis sąlygomis:",
        termsList: [
          "Galiojimo terminas: 6 mėn. nuo atsiliepimo palikimo dienos.",
          "Vienkartinis naudojimas: vienas kodas vienam klientui ir vienai rezervacijai, neperleidžiamas.",
          "Minimalus užsakymas: nuoma ne trumpesnė nei 3 paros (72 val.).",
          "Nuolaida taikoma tik automobilio nuomos kainai — netaikoma pristatymo/grąžinimo mokesčiui, depozitui, kurui ar baudoms.",
          "Nesumuojama su kitomis nuolaidomis ar akcijomis.",
          "Kodas neturi piniginės vertės ir į pinigus nekeičiamas.",
          "Kodą nurodykite rezervacijos metu arba pasakykite mums iki sutarties pasirašymo — vėliau pritaikyti nebegalima.",
          "Carbonus turi teisę anuliuoti kodą piktnaudžiavimo ar netikrų atsiliepimų atveju.",
        ],
        termsRulesLink: "Pilnos nuomos taisyklės",
        termsClose: "Supratau",

      };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast({
        title: isEnglish ? "Please write a few words" : "Parašykite kelis žodžius",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("send-review-feedback", {
        body: { rating, ...form },
      });
      if (error) throw error;
      await logPromoClaim({
        action: "feedback_sent",
        rating,
        name: form.name,
        email: form.email,
        phone: form.phone,
        language,
      });
      setSent(true);

    } catch (err) {
      console.error(err);
      toast({
        title: isEnglish ? "Could not send" : "Nepavyko išsiųsti",
        description: isEnglish ? "Please try again shortly." : "Pabandykite dar kartą po kelių minučių.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const termsTrigger = (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-carbonus-green-dark underline underline-offset-4"
        >
          <Info className="h-4 w-4" />
          {copy.termsLink}
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{copy.termsTitle}</DialogTitle>
          <DialogDescription>{copy.termsIntro}</DialogDescription>
        </DialogHeader>
        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
          {copy.termsList.map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-carbonus-green-dark" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link
          to={isEnglish ? "/rental-agreement" : "/nuomos-sutartis"}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-carbonus-green-dark underline underline-offset-4"
        >
          {copy.termsRulesLink}
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </DialogContent>
    </Dialog>
  );


  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={isEnglish ? "Leave a review | Carbonus" : "Palikite atsiliepimą | Carbonus"}
        description={
          isEnglish
            ? "Rate your Carbonus car rental experience and share it on Google in one click."
            : "Įvertinkite Carbonus automobilių nuomos patirtį ir pasidalinkite ja Google vienu paspaudimu."
        }
      />
      <Header />

      <main className="pt-16 lg:pt-20">
        <section className="mx-auto max-w-[1320px] px-4 py-14 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.24em] text-carbonus-green">{copy.eyebrow}</p>
            <h1 className="mt-3 text-[38px] font-bold leading-tight text-foreground lg:text-[54px]">{copy.title}</h1>
            <p className="mt-4 text-base text-muted-foreground">{copy.subtitle}</p>
            <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-carbonus-green-soft px-4 py-2 text-sm font-semibold text-carbonus-green-dark">
              <Gift className="h-4 w-4" />
              {copy.promoBanner}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{copy.termsShort}</p>
            <div className="mt-2 flex justify-center">{termsTrigger}</div>
          </div>



          <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-sm lg:p-10">
            {/* Stars */}
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">{copy.pick}</p>
              <div className="mt-4 flex justify-center gap-1.5" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => {
                  const active = (hover || rating) >= n;
                  return (
                    <button
                      key={n}
                      type="button"
                      aria-label={copy.stars(n)}
                      onMouseEnter={() => setHover(n)}
                      onClick={() => {
                        setRating(n);
                        setSent(false);
                      }}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 lg:h-12 lg:w-12 ${
                          active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              {rating > 0 && <p className="mt-3 text-sm text-muted-foreground">{copy.stars(rating)}</p>}
            </div>

            {/* 5 stars -> Google */}
            {rating === 5 && !sent && (
              <div className="mt-8 rounded-2xl bg-carbonus-green-soft p-6 text-center">
                <h2 className="text-xl font-semibold text-foreground">{copy.greatTitle}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{copy.greatText}</p>
                <Button asChild size="lg" className="mt-5 bg-carbonus-green-dark hover:bg-carbonus-green-deep">
                  <a
                    href={GOOGLE_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setRevealed(true);
                      void logPromoClaim({ action: "google_click", rating, language });
                    }}
                  >
                    {copy.greatCta}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                {!revealed && (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setRevealed(true);
                        void logPromoClaim({ action: "revealed", rating, language });
                      }}
                      className="mt-4 text-sm font-medium text-carbonus-green-dark underline underline-offset-4"
                    >
                      {copy.promoReveal}
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* Reward code */}
            {(revealed || sent) && (
              <div className="mt-6 rounded-2xl border border-carbonus-green/30 bg-carbonus-green-soft p-6 text-center">
                <Gift className="mx-auto h-8 w-8 text-carbonus-green-dark" />
                <h3 className="mt-3 text-lg font-semibold text-foreground">{copy.promoTitle}</h3>
                <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                  <span className="rounded-xl border border-dashed border-carbonus-green-dark bg-card px-6 py-3 text-2xl font-bold tracking-[0.2em] text-carbonus-green-dark">
                    {PROMO_CODE}
                  </span>
                  <Button variant="outline" onClick={copyCode}>
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? copy.promoCopied : copy.promoCopy}
                  </Button>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{copy.promoText}</p>
                <p className="mt-1 text-xs text-muted-foreground">{copy.termsShort}</p>
                <div className="mt-3">{termsTrigger}</div>

              </div>
            )}


            {/* 1-4 stars -> internal form */}
            {rating > 0 && rating < 5 && !sent && (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="rounded-2xl bg-muted/50 p-5">
                  <h2 className="text-lg font-semibold text-foreground">{copy.lowTitle}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{copy.lowText}</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    placeholder={copy.name}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder={copy.email}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <Input
                  placeholder={copy.phone}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <Textarea
                  required
                  rows={5}
                  placeholder={copy.messagePh}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-carbonus-green-dark hover:bg-carbonus-green-deep"
                >
                  {copy.submit}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            )}

            {sent && (
              <div className="mt-8 rounded-2xl bg-carbonus-green-soft p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-carbonus-green-dark" />
                <h2 className="mt-4 text-xl font-semibold text-foreground">{copy.thanksTitle}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{copy.thanksText}</p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setSent(false);
                    setRating(0);
                    setForm({ name: "", email: "", phone: "", message: "" });
                  }}
                >
                  {copy.again}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <V3Footer />
    </div>
  );
};

export default Review;
