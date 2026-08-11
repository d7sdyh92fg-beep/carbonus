import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  ChevronDown,
  Clock3,
  CreditCard,
  FileText,
  HelpCircle,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
import { FAQSchema } from "@/components/seo/StructuredData";
import { useTranslations } from "@/hooks/use-translations";
import { translations } from "@/i18n/translations";

const FAQ = () => {
  const { t, language } = useTranslations();
  const isEnglish = language === "en";
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = isEnglish
      ? "FAQ – Carbonus car rental"
      : "DUK – Carbonus automobilių nuoma";
  }, [isEnglish]);

  const currentTranslations = translations[language];
  const faqCategories = useMemo(
    () => [
      { id: "booking", title: t("faq.categories.booking"), icon: CalendarDays, questions: currentTranslations.faq.questions.booking },
      { id: "documents", title: t("faq.categories.documents"), icon: FileText, questions: currentTranslations.faq.questions.documents },
      { id: "payment", title: t("faq.categories.payment"), icon: CreditCard, questions: currentTranslations.faq.questions.payment },
      { id: "insurance", title: t("faq.categories.insurance"), icon: ShieldCheck, questions: currentTranslations.faq.questions.insurance },
      { id: "usage", title: t("faq.categories.usage"), icon: CarFront, questions: currentTranslations.faq.questions.usage },
      { id: "return", title: t("faq.categories.return"), icon: Clock3, questions: currentTranslations.faq.questions.return },
    ],
    [currentTranslations, t],
  );

  const allFAQs = faqCategories.flatMap((category) =>
    category.questions.map((faq) => ({ question: faq.question, answer: faq.answer })),
  );

  const visibleCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase(language);
    return faqCategories
      .filter((category) => activeCategory === "all" || category.id === activeCategory)
      .map((category) => ({
        ...category,
        questions: category.questions.filter((faq) =>
          !query || `${faq.question} ${faq.answer}`.toLocaleLowerCase(language).includes(query),
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [activeCategory, faqCategories, language, searchTerm]);

  const visibleQuestionCount = visibleCategories.reduce((sum, category) => sum + category.questions.length, 0);

  const toggleItem = (id: string) => {
    setOpenItems((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setActiveCategory("all");
  };

  const copy = isEnglish
    ? {
        eyebrow: "HELP CENTRE",
        title: "Answers before you set off",
        subtitle: "Everything you need to know about booking, payment, insurance and returning your Carbonus rental car.",
        search: "Search for an answer",
        all: "All topics",
        answers: "answers",
        noTitle: "We could not find an answer",
        noText: "Try another phrase or browse all topics.",
        clear: "Clear search",
        contactEyebrow: "STILL HAVE A QUESTION?",
        contactTitle: "Talk to a real person",
        contactText: "Call or email us. We will explain the rental terms clearly and help you choose the right car.",
        contactButton: "Contact us",
      }
    : {
        eyebrow: "PAGALBOS CENTRAS",
        title: "Atsakymai prieš leidžiantis į kelią",
        subtitle: "Viskas, ką reikia žinoti apie automobilio rezervaciją, apmokėjimą, draudimą ir grąžinimą.",
        search: "Ieškoti atsakymo",
        all: "Visos temos",
        answers: "atsakymai",
        noTitle: "Atsakymo neradome",
        noText: "Pabandykite kitą frazę arba peržiūrėkite visas temas.",
        clear: "Išvalyti paiešką",
        contactEyebrow: "DAR TURITE KLAUSIMŲ?",
        contactTitle: "Pasikalbėkite su žmogumi",
        contactText: "Paskambinkite arba parašykite. Aiškiai paaiškinsime nuomos sąlygas ir padėsime pasirinkti automobilį.",
        contactButton: "Susisiekti",
      };

  const contactPath = isEnglish ? "/contact" : "/kontaktai";

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#111b18]">
      <SEOHead
        title={isEnglish ? "FAQ – Carbonus car rental" : "DUK – dažnai užduodami klausimai | Carbonus"}
        description={copy.subtitle}
        canonical={`https://carbonus.lt/${isEnglish ? "faq" : "duk"}`}
        keywords="automobilių nuoma DUK, rezervacija, nuomos sąlygos, draudimas, automobilio grąžinimas"
      />
      <LanguageLinks ltPath="/duk" enPath="/faq" />
      <FAQSchema faqs={allFAQs} />
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#dce6e1] bg-[#f3f7f5] pb-16 pt-[78px]">
          <div className="pointer-events-none absolute -right-40 -top-40 h-[590px] w-[590px] rounded-full bg-[hsl(var(--carbonus-green))]/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1280px] gap-12 px-6 pb-4 pt-16 md:px-10 lg:grid-cols-[1fr_0.72fr] lg:items-end lg:pt-20">
            <div className="max-w-[780px]">
              <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--carbonus-green-dark))]">{copy.eyebrow}</p>
              <h1 className="mt-5 text-[42px] font-bold leading-[1.04] tracking-[-0.045em] sm:text-[54px] lg:text-[66px]">{copy.title}</h1>
              <p className="mt-6 max-w-[680px] text-[16px] leading-7 text-[#64756e] sm:text-[17px]">{copy.subtitle}</p>
            </div>

            <div className="rounded-[26px] border border-white bg-white/85 p-6 shadow-[0_22px_60px_rgba(14,47,35,0.09)] backdrop-blur-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]"><Search className="h-5 w-5" /></span>
              <label className="mt-5 block text-[11px] font-bold uppercase tracking-[0.15em] text-[#6a7b74]" htmlFor="faq-search">{copy.search}</label>
              <div className="relative mt-2">
                <input id="faq-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder={copy.search} className="h-12 w-full rounded-[14px] border border-[#dce6e1] bg-[#f8faf9] pl-4 pr-10 text-[14px] outline-none transition focus:border-[hsl(var(--carbonus-green))]/60 focus:ring-4 focus:ring-[hsl(var(--carbonus-green))]/10" />
                {searchTerm && <button type="button" onClick={() => setSearchTerm("")} aria-label={copy.clear} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#7c8d86] hover:bg-[#edf2ef]"><X className="h-4 w-4" /></button>}
              </div>
              <p className="mt-3 text-[12px] text-[#7c8d86]">{visibleQuestionCount} {copy.answers}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1280px] px-6 py-16 md:px-10 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[285px_1fr] lg:items-start lg:gap-14">
            <aside className="lg:sticky lg:top-[104px]">
              <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-[#778880]">{isEnglish ? "Browse by topic" : "Pasirinkite temą"}</p>
              <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                <button type="button" onClick={() => setActiveCategory("all")} className={`flex min-h-12 shrink-0 items-center gap-3 rounded-[14px] px-4 text-left text-[13px] font-semibold transition ${activeCategory === "all" ? "bg-[hsl(var(--carbonus-green-dark))] text-white shadow-[0_12px_28px_rgba(3,103,58,0.2)]" : "border border-[#e0e8e4] bg-white text-[#53645d] hover:border-[hsl(var(--carbonus-green))]/35"}`}><HelpCircle className="h-[18px] w-[18px]" />{copy.all}</button>
                {faqCategories.map(({ id, title, icon: Icon }) => (
                  <button key={id} type="button" onClick={() => setActiveCategory(id)} className={`flex min-h-12 shrink-0 items-center gap-3 rounded-[14px] px-4 text-left text-[13px] font-semibold transition ${activeCategory === id ? "bg-[hsl(var(--carbonus-green-dark))] text-white shadow-[0_12px_28px_rgba(3,103,58,0.2)]" : "border border-[#e0e8e4] bg-white text-[#53645d] hover:border-[hsl(var(--carbonus-green))]/35"}`}><Icon className="h-[18px] w-[18px]" />{title}</button>
                ))}
              </div>
            </aside>

            <div className="min-w-0">
              {visibleCategories.length > 0 ? (
                <div className="space-y-10">
                  {visibleCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <section key={category.id}>
                        <div className="mb-4 flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]"><Icon className="h-[18px] w-[18px]" /></span>
                          <div><h2 className="text-[22px] font-bold tracking-[-0.025em]">{category.title}</h2><p className="mt-0.5 text-[11px] text-[#819089]">{category.questions.length} {copy.answers}</p></div>
                        </div>
                        <div className="overflow-hidden rounded-[24px] border border-[#e0e8e4] bg-white shadow-[0_16px_45px_rgba(14,47,35,0.05)]">
                          {category.questions.map((faq, index) => {
                            const id = `${category.id}-${index}`;
                            const isOpen = openItems.includes(id);
                            return (
                              <div key={id} className="border-b border-[#e6ece9] last:border-b-0">
                                <button type="button" onClick={() => toggleItem(id)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left transition hover:bg-[#f8faf9] sm:px-6">
                                  <span className="text-[14px] font-semibold leading-6 text-[#263730] sm:text-[15px]">{faq.question}</span>
                                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dce6e1] text-[hsl(var(--carbonus-green-dark))] transition ${isOpen ? "rotate-180 bg-[hsl(var(--carbonus-green-soft))]" : "bg-white"}`}><ChevronDown className="h-4 w-4" /></span>
                                </button>
                                <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                                  <div className="overflow-hidden"><p className="px-5 pb-6 pr-14 text-[13px] leading-7 text-[#687a72] sm:px-6 sm:pr-20">{faq.answer}</p></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[26px] border border-dashed border-[#cddbd4] bg-white px-6 py-20 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--carbonus-green-soft))] text-[hsl(var(--carbonus-green-dark))]"><Search className="h-6 w-6" /></span>
                  <h2 className="mt-5 text-[24px] font-bold">{copy.noTitle}</h2>
                  <p className="mt-2 text-[14px] text-[#6a7b74]">{copy.noText}</p>
                  <button type="button" onClick={resetFilters} className="mt-6 rounded-full bg-[hsl(var(--carbonus-green-dark))] px-6 py-3 text-[13px] font-bold text-white">{copy.clear}</button>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 md:px-10 lg:pb-28">
          <div className="relative mx-auto grid max-w-[1280px] gap-9 overflow-hidden rounded-[32px] bg-[hsl(var(--carbonus-green-deep))] px-7 py-12 text-white sm:px-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-16 lg:py-14">
            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[42px] border-white/[0.045]" />
            <div className="relative max-w-[720px]">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">{copy.contactEyebrow}</p>
              <h2 className="mt-3 text-[31px] font-bold tracking-[-0.035em] sm:text-[40px]">{copy.contactTitle}</h2>
              <p className="mt-4 max-w-[620px] text-[14px] leading-6 text-white/65">{copy.contactText}</p>
              <div className="mt-6 flex flex-wrap gap-4 text-[13px] font-semibold"><a href="tel:+37069818781" className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />+370 698 18 781</a><a href="mailto:info@carbonus.lt" className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />info@carbonus.lt</a></div>
            </div>
            <Link to={contactPath} className="relative inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-7 text-[13px] font-bold text-[hsl(var(--carbonus-green-deep))] transition hover:bg-[#edf8f2]">{copy.contactButton}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>

      <V3Footer />
    </div>
  );
};

export default FAQ;
