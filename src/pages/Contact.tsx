import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Clock3,
  Headphones,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { useToast } from "@/hooks/use-toast";
import { useTranslations } from "@/hooks/use-translations";
import { supabase } from "@/integrations/supabase/client";
import { trackContactForm, trackEmailClick, trackPhoneCall } from "@/lib/analytics";

const Contact = () => {
  const { t, language } = useTranslations();
  const { toast } = useToast();
  const isEnglish = language === "en";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const copy = isEnglish
    ? {
        eyebrow: "GET IN TOUCH",
        title: "We are ready to help",
        subtitle: "Ask about a car, dates or rental terms. We will respond clearly and help you choose the best option.",
        direct: "Choose the most convenient way to reach us",
        response: "We usually reply within 2 hours during business hours.",
        formEyebrow: "SEND A MESSAGE",
        mapEyebrow: "DRUSKININKAI",
        mapTitle: "Our home base",
        mapText: "We arrange car pickup and return in Druskininkai, and provide rental services throughout Lithuania.",
        directions: "Get directions",
        emergencyLabel: "Help on the road",
        required: "Fields marked with * are required.",
      }
    : {
        eyebrow: "SUSISIEKITE",
        title: "Esame pasiruošę jums padėti",
        subtitle: "Klauskite apie automobilį, datas ar nuomos sąlygas. Atsakysime aiškiai ir padėsime pasirinkti tinkamiausią variantą.",
        direct: "Pasirinkite patogiausią būdą susisiekti",
        response: "Darbo metu dažniausiai atsakome per 2 valandas.",
        formEyebrow: "PARAŠYKITE MUMS",
        mapEyebrow: "DRUSKININKAI",
        mapTitle: "Mūsų namai",
        mapText: "Automobilių atsiėmimą ir grąžinimą organizuojame Druskininkuose, o nuomos paslaugas teikiame visoje Lietuvoje.",
        directions: "Rodyti maršrutą",
        emergencyLabel: "Pagalba kelyje",
        required: "* pažymėtus laukus būtina užpildyti.",
      };

  const handleInputChange = (field: string, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.subject || !formData.message) {
        toast({ title: t("contact.errorTitle"), description: t("contact.errorDesc"), variant: "destructive" });
        return;
      }

      const { error } = await supabase.functions.invoke("send-contact-email", { body: formData });
      if (error) throw error;

      toast({ title: t("contact.successTitle"), description: t("contact.successDesc") });
      trackContactForm({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        subject: formData.subject,
      });
      setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: "", message: "" });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("contact.errorNetwork");
      toast({ title: t("contact.errorTitle"), description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const details = [
    {
      Icon: Phone,
      label: t("contact.info.phone.title"),
      value: "+370 698 18 781",
      note: t("contact.info.phone.description"),
      href: "tel:+37069818781",
      onClick: () => trackPhoneCall("+370 698 18 781"),
    },
    {
      Icon: Mail,
      label: t("contact.info.email.title"),
      value: "info@carbonus.lt",
      note: t("contact.info.email.description"),
      href: "mailto:info@carbonus.lt",
      onClick: () => trackEmailClick("info@carbonus.lt"),
    },
    {
      Icon: MapPin,
      label: t("contact.info.address.title"),
      value: t("contact.info.address.location"),
      note: t("contact.info.address.description"),
      href: "https://www.google.com/maps/dir//Druskininkai",
      onClick: undefined,
    },
  ];

  const services = [
    { Icon: CarFront, title: t("contact.services.booking.title"), text: t("contact.services.booking.description") },
    { Icon: Headphones, title: t("contact.services.support.title"), text: t("contact.services.support.description") },
    { Icon: CalendarDays, title: t("contact.services.consultation.title"), text: t("contact.services.consultation.description") },
  ];

  const fieldClass = "mt-2 h-12 w-full rounded-[14px] border border-[#dce6e1] bg-[#f8faf9] px-4 text-[14px] text-[#17231f] outline-none transition placeholder:text-[#94a29c] focus:border-[hsl(var(--carbonus-green))]/60 focus:ring-4 focus:ring-[hsl(var(--carbonus-green))]/10";

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#111b18]">
      <SEOHead
        title={isEnglish ? "Contact Carbonus car rental" : "Kontaktai – Carbonus automobilių nuoma"}
        description={isEnglish ? "Questions about a booking, delivery or rental terms? Reach the Carbonus team by phone or email." : "Kilo klausimų dėl rezervacijos, pristatymo ar nuomos sąlygų? Susisiekite su Carbonus telefonu arba el. paštu."}
        canonical={`https://carbonus.lt/${isEnglish ? "contact" : "kontaktai"}`}
        keywords="Carbonus kontaktai, automobilių nuoma Druskininkuose, automobilio rezervacija"
      />
      <LanguageLinks ltPath="/kontaktai" enPath="/contact" />
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#dce6e1] bg-[#f3f7f5] pb-16 pt-[78px]">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full bg-[hsl(var(--carbonus-green))]/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1320px] gap-12 px-6 pb-4 pt-16 md:px-6 lg:grid-cols-[1fr_0.72fr] lg:items-start lg:pt-20">
            <div className="max-w-[760px]">
              <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--carbonus-green-dark))]">{copy.eyebrow}</p>
              <h1 className="mt-5 text-[34px] font-bold leading-[1.06] tracking-[-0.04em] sm:text-[44px] lg:text-[54px]">{copy.title}</h1>
              <p className="mt-6 max-w-[650px] text-[16px] leading-7 text-[#64756e] sm:text-[17px]">{copy.subtitle}</p>
            </div>

            <div className="rounded-[26px] bg-[hsl(var(--carbonus-green-deep))] p-6 text-white shadow-[0_22px_60px_rgba(3,53,34,0.2)] sm:p-7">
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">{copy.direct}</p>
              <a href="tel:+37069818781" onClick={() => trackPhoneCall("+370 698 18 781")} className="mt-5 flex items-center justify-between rounded-[16px] bg-white px-5 py-4 text-[hsl(var(--carbonus-green-deep))] transition hover:bg-[#edf8f2]">
                <span className="flex items-center gap-3 text-[16px] font-bold"><Phone className="h-5 w-5" />+370 698 18 781</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="mailto:info@carbonus.lt" onClick={() => trackEmailClick("info@carbonus.lt")} className="mt-3 flex items-center gap-3 rounded-[16px] border border-white/15 px-5 py-4 text-[14px] font-semibold text-white transition hover:bg-white/10">
                <Mail className="h-5 w-5 text-[hsl(var(--carbonus-green))]" />info@carbonus.lt
              </a>
              <p className="mt-4 text-[12px] leading-5 text-white/58">{copy.response}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-6 py-14 md:px-6 lg:py-18">
          <div className="grid gap-4 md:grid-cols-3">
            {details.map(({ Icon, label, value, note, href, onClick }) => (
              <a key={label} href={href} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} onClick={onClick} className="group rounded-[22px] border border-[#e0e8e4] bg-white p-5 shadow-[0_12px_36px_rgba(14,47,35,0.05)] transition hover:-translate-y-1 hover:shadow-[0_18px_44px_rgba(14,47,35,0.09)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]"><Icon className="h-5 w-5" /></span>
                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#7b8b84]">{label}</p>
                <p className="mt-1 text-[18px] font-bold text-[#17231f] transition group-hover:text-[hsl(var(--carbonus-green-dark))]">{value}</p>
                <p className="mt-2 text-[12px] leading-5 text-[#7b8b84]">{note}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="border-y border-[#e1e9e5] bg-white py-20 lg:py-24">
          <div className="mx-auto grid max-w-[1320px] gap-10 px-6 md:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
            <div className="rounded-[28px] border border-[#e0e8e4] bg-white p-6 shadow-[0_20px_60px_rgba(14,47,35,0.07)] sm:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]"><MessageSquareText className="h-5 w-5" /></span>
                <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--carbonus-green-dark))]">{copy.formEyebrow}</p><h2 className="mt-1 text-[28px] font-bold tracking-[-0.03em]">{t("contact.form.title")}</h2></div>
              </div>
              <p className="mt-5 max-w-[650px] text-[14px] leading-6 text-[#6a7b74]">{t("contact.form.description")}</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-[12px] font-semibold text-[#34463f]">{t("contact.form.firstName")}<input className={fieldClass} value={formData.firstName} onChange={(event) => handleInputChange("firstName", event.target.value)} placeholder={t("contact.form.placeholders.firstName")} required /></label>
                  <label className="text-[12px] font-semibold text-[#34463f]">{t("contact.form.lastName")}<input className={fieldClass} value={formData.lastName} onChange={(event) => handleInputChange("lastName", event.target.value)} placeholder={t("contact.form.placeholders.lastName")} required /></label>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="text-[12px] font-semibold text-[#34463f]">{t("contact.form.email")}<input type="email" className={fieldClass} value={formData.email} onChange={(event) => handleInputChange("email", event.target.value)} placeholder={t("contact.form.placeholders.email")} required /></label>
                  <label className="text-[12px] font-semibold text-[#34463f]">{t("contact.form.phone")}<input type="tel" className={fieldClass} value={formData.phone} onChange={(event) => handleInputChange("phone", event.target.value)} placeholder={t("contact.form.placeholders.phone")} /></label>
                </div>
                <label className="block text-[12px] font-semibold text-[#34463f]">{t("contact.form.subject")}<input className={fieldClass} value={formData.subject} onChange={(event) => handleInputChange("subject", event.target.value)} placeholder={t("contact.form.placeholders.subject")} required /></label>
                <label className="block text-[12px] font-semibold text-[#34463f]">{t("contact.form.message")}<textarea className={`${fieldClass} h-auto min-h-[145px] resize-y py-3.5`} value={formData.message} onChange={(event) => handleInputChange("message", event.target.value)} placeholder={t("contact.form.placeholders.message")} required /></label>
                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-[11px] text-[#87968f]">{copy.required}</p>
                  <button type="submit" disabled={isSubmitting} className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[hsl(var(--carbonus-green-dark))] px-7 text-[13px] font-bold text-white transition hover:bg-[hsl(var(--carbonus-green-deep))] disabled:cursor-not-allowed disabled:opacity-60">
                    {isSubmitting ? t("contact.form.sending") : t("contact.form.submit")}<Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>

            <div className="flex flex-col gap-5">
              <div className="overflow-hidden rounded-[28px] border border-[#e0e8e4] bg-[#f3f7f5] shadow-[0_20px_60px_rgba(14,47,35,0.07)]">
                <div className="h-[300px] overflow-hidden lg:h-[345px]">
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d148840.77893341!2d23.7739!3d54.0165!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46e0243f0ebefebf%3A0x71e8f0c8a6c6a6a!2sDruskininkai!5e0!3m2!1sen!2slt!4v1234567890123!5m2!1sen!2slt" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Carbonus Druskininkai" />
                </div>
                <div className="p-6 sm:p-7">
                  <p className="text-[11px] font-bold uppercase tracking-[0.17em] text-[hsl(var(--carbonus-green-dark))]">{copy.mapEyebrow}</p>
                  <h2 className="mt-2 text-[26px] font-bold tracking-[-0.03em]">{copy.mapTitle}</h2>
                  <p className="mt-3 text-[13px] leading-6 text-[#6a7b74]">{copy.mapText}</p>
                  <div className="mt-5 flex flex-wrap gap-3 text-[12px] font-semibold text-[#53645d]"><span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />{t("contact.info.hours.weekdays")}</span><span>{t("contact.info.hours.weekends")}</span></div>
                  <a href="https://www.google.com/maps/dir//Druskininkai" target="_blank" rel="noreferrer" className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-[hsl(var(--carbonus-green))]/30 bg-white px-5 text-[12px] font-bold text-[hsl(var(--carbonus-green-dark))] transition hover:bg-[hsl(var(--carbonus-green-soft))]">{copy.directions}<ArrowRight className="h-4 w-4" /></a>
                </div>
              </div>

              <div className="rounded-[24px] bg-[hsl(var(--carbonus-green-deep))] p-6 text-white">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-white/10 text-[hsl(var(--carbonus-green))]"><ShieldCheck className="h-5 w-5" /></span>
                  <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/55">{copy.emergencyLabel}</p><p className="mt-2 text-[15px] font-semibold">{t("contact.emergency.description")}</p><a href="tel:+37069818781" onClick={() => trackPhoneCall("+370 698 18 781")} className="mt-3 inline-block text-[20px] font-bold">+370 698 18 781</a><p className="mt-1 text-[11px] text-white/55">{t("contact.emergency.availability")}</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-6 py-20 md:px-6 lg:py-24">
          <div className="mb-10 max-w-[620px]"><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--carbonus-green-dark))]">{t("contact.services.title")}</p><h2 className="mt-3 text-[30px] font-bold tracking-[-0.035em] sm:text-[38px]">{isEnglish ? "From your first question to the road" : "Nuo pirmo klausimo iki kelionės"}</h2></div>
          <div className="grid gap-5 md:grid-cols-3">
            {services.map(({ Icon, title, text }) => <article key={title} className="rounded-[24px] border border-[#e0e8e4] bg-white p-6 shadow-[0_14px_40px_rgba(14,47,35,0.05)]"><span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]"><Icon className="h-5 w-5" /></span><h3 className="mt-5 text-[18px] font-bold">{title}</h3><p className="mt-3 text-[13px] leading-6 text-[#6a7b74]">{text}</p></article>)}
          </div>
        </section>
      </main>

      <V3Footer />
    </div>
  );
};

export default Contact;
