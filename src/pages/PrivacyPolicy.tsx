import { CalendarDays, CheckCircle2, Cookie, Database, Eye, FileClock, LockKeyhole, Mail, ShieldCheck, UserCheck } from "lucide-react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { useTranslations } from "@/hooks/use-translations";

const PrivacyPolicy = () => {
  const { t, language } = useTranslations();
  const isEnglish = language === "en";

  const sections = [
    { id: "data", Icon: Database, title: t("privacyPolicy.sections.dataProcessed.title"), paragraphs: [t("privacyPolicy.sections.dataProcessed.paragraph1"), t("privacyPolicy.sections.dataProcessed.paragraph2")] },
    { id: "collection", Icon: Mail, title: t("privacyPolicy.sections.collection.title"), paragraphs: [t("privacyPolicy.sections.collection.paragraph1")] },
    { id: "disclosure", Icon: Eye, title: t("privacyPolicy.sections.disclosure.title"), paragraphs: [t("privacyPolicy.sections.disclosure.paragraph1")] },
    { id: "security", Icon: LockKeyhole, title: t("privacyPolicy.sections.security.title"), paragraphs: [t("privacyPolicy.sections.security.paragraph1"), t("privacyPolicy.sections.security.paragraph2")] },
    { id: "retention", Icon: FileClock, title: t("privacyPolicy.sections.retention.title"), paragraphs: [t("privacyPolicy.sections.retention.paragraph1")] },
    { id: "rights", Icon: UserCheck, title: t("privacyPolicy.sections.rights.title"), paragraphs: [t("privacyPolicy.sections.rights.paragraph1")] },
    { id: "cookies", Icon: Cookie, title: t("privacyPolicy.sections.cookies.title"), paragraphs: [t("privacyPolicy.sections.cookies.paragraph1")] },
    { id: "newsletter", Icon: Mail, title: t("privacyPolicy.sections.newsletter.title"), paragraphs: [t("privacyPolicy.sections.newsletter.paragraph1")] },
    { id: "changes", Icon: CalendarDays, title: t("privacyPolicy.sections.changes.title"), paragraphs: [t("privacyPolicy.sections.changes.paragraph1")] },
  ];

  const copy = isEnglish
    ? {
        eyebrow: "PRIVACY AT CARBONUS",
        title: "Your data, explained clearly",
        subtitle: "Learn what information we collect, why we need it and how you can exercise your privacy rights.",
        nav: "Policy contents",
        promise: "Our privacy principles",
        points: ["We collect only necessary data", "We protect it responsibly", "You remain in control"],
        questions: "Questions about your data?",
      }
    : {
        eyebrow: "PRIVATUMAS CARBONUS",
        title: "Jūsų duomenys – aiškiai ir suprantamai",
        subtitle: "Sužinokite, kokią informaciją renkame, kodėl jos reikia ir kaip galite pasinaudoti savo privatumo teisėmis.",
        nav: "Politikos turinys",
        promise: "Mūsų privatumo principai",
        points: ["Renkame tik būtinus duomenis", "Atsakingai juos saugome", "Kontrolė lieka jūsų rankose"],
        questions: "Turite klausimų dėl duomenų?",
      };

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#111b18]">
      <SEOHead title={t("privacyPolicy.metaTitle")} description={t("privacyPolicy.metaDescription")} canonical={`https://carbonus.lt/${isEnglish ? "privacy-policy" : "privatumo-politika"}`} keywords="Carbonus privatumo politika, asmens duomenys, slapukai, duomenų apsauga" />
      <LanguageLinks ltPath="/privatumo-politika" enPath="/privacy-policy" />
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#dce6e1] bg-[#f3f7f5] pb-16 pt-[78px]">
          <div className="pointer-events-none absolute -right-36 -top-44 h-[600px] w-[600px] rounded-full bg-[hsl(var(--carbonus-green))]/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1320px] gap-12 px-6 pb-4 pt-16 md:px-6 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:pt-20">
            <div className="max-w-[790px]">
              <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--carbonus-green-dark))]">{copy.eyebrow}</p>
              <h1 className="mt-5 text-[34px] font-bold leading-[1.06] tracking-[-0.04em] sm:text-[44px] lg:text-[54px]">{copy.title}</h1>
              <p className="mt-6 max-w-[680px] text-[16px] leading-7 text-[#64756e] sm:text-[17px]">{copy.subtitle}</p>
            </div>
            <div className="rounded-[26px] bg-[hsl(var(--carbonus-green-deep))] p-6 text-white shadow-[0_22px_60px_rgba(3,53,34,0.2)] sm:p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white/10 text-[hsl(var(--carbonus-green))]"><ShieldCheck className="h-5 w-5" /></span>
              <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">{copy.promise}</p>
              <div className="mt-4 space-y-3">{copy.points.map((point) => <p key={point} className="flex items-center gap-3 text-[13px] font-semibold"><CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--carbonus-green))]" />{point}</p>)}</div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-6 py-16 md:px-6 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[285px_1fr] lg:items-start lg:gap-14">
            <aside className="lg:sticky lg:top-[104px]">
              <div className="rounded-[22px] border border-[#e0e8e4] bg-white p-5 shadow-[0_14px_40px_rgba(14,47,35,0.05)]">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#778880]">{copy.nav}</p>
                <nav className="mt-4 space-y-1">
                  {sections.map(({ id, title }) => <a key={id} href={`#${id}`} className="block rounded-[10px] px-3 py-2.5 text-[12px] font-medium leading-5 text-[#5e7068] transition hover:bg-[hsl(var(--carbonus-green-soft))] hover:text-[hsl(var(--carbonus-green-dark))]">{title}</a>)}
                  <a href="#contact" className="block rounded-[10px] px-3 py-2.5 text-[12px] font-medium text-[#5e7068] transition hover:bg-[hsl(var(--carbonus-green-soft))] hover:text-[hsl(var(--carbonus-green-dark))]">{t("privacyPolicy.sections.contact.title")}</a>
                </nav>
              </div>
            </aside>

            <article className="min-w-0 rounded-[28px] border border-[#e0e8e4] bg-white p-6 shadow-[0_20px_60px_rgba(14,47,35,0.06)] sm:p-9 lg:p-12">
              <p className="border-b border-[#e5ece8] pb-8 text-[15px] leading-8 text-[#61736b]">{t("privacyPolicy.intro")}</p>
              <div className="divide-y divide-[#e5ece8]">
                {sections.map(({ id, Icon, title, paragraphs }) => (
                  <section key={id} id={id} className="scroll-mt-28 py-9 first:pt-9">
                    <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]"><Icon className="h-5 w-5" /></span><h2 className="text-[23px] font-bold leading-tight tracking-[-0.025em] sm:text-[26px]">{title}</h2></div>
                    <div className="mt-5 space-y-4">{paragraphs.map((paragraph, index) => <p key={index} className="text-[14px] leading-7 text-[#687a72]">{paragraph}</p>)}</div>
                  </section>
                ))}
                <section id="contact" className="scroll-mt-28 pt-9">
                  <div className="rounded-[22px] bg-[#f3f7f5] p-6 sm:p-7"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--carbonus-green-dark))]">{copy.questions}</p><h2 className="mt-2 text-[24px] font-bold tracking-[-0.025em]">{t("privacyPolicy.sections.contact.title")}</h2><p className="mt-4 text-[14px] leading-7 text-[#687a72]">{t("privacyPolicy.sections.contact.paragraph1")}</p><div className="mt-5 grid gap-2 text-[13px] font-semibold text-[#42554d] sm:grid-cols-2"><p>{t("privacyPolicy.sections.contact.email")}</p><p>{t("privacyPolicy.sections.contact.phone")}</p><p className="sm:col-span-2">{t("privacyPolicy.sections.contact.address")}</p></div></div>
                </section>
              </div>
              <p className="mt-8 border-t border-[#e5ece8] pt-6 text-[11px] text-[#87968f]">{t("privacyPolicy.lastUpdated")}</p>
            </article>
          </div>
        </section>
      </main>

      <V3Footer />
    </div>
  );
};

export default PrivacyPolicy;
