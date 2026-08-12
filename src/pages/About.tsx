import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import carInterior from "@/assets/car-interior.jpg";
import aboutCar from "@/assets/citroen-druskininkai-v3.png";
import { useTranslations } from "@/hooks/use-translations";

const About = () => {
  const { t, language } = useTranslations();

  useEffect(() => {
    document.title = t("about.meta.title");

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t("about.meta.description"));
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute("href", `https://carbonus.lt/${language === "en" ? "about" : "apie-mus"}`);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", t("about.meta.title"));
    document
      .querySelector('meta[property="og:url"]')
      ?.setAttribute("content", `https://carbonus.lt/${language === "en" ? "about" : "apie-mus"}`);
  }, [t, language]);

  const copy = language === "en"
    ? {
        eyebrow: "ABOUT CARBONUS",
        heroTitle: "Simple rental starts with trust.",
        heroText:
          "Carbonus is car rental in Druskininkai and across Lithuania for people who value clarity, comfort and a reliable car.",
        primaryCta: "Choose a car",
        secondaryCta: "Contact us",
        location: "Druskininkai · all Lithuania",
        stats: [
          { value: "6", label: "cars in our fleet" },
          { value: "5.0", label: "Google rating" },
          { value: "24/7", label: "online booking" },
        ],
        storyEyebrow: "OUR STORY",
        storyTitle: "More than a car. A smooth start to your journey.",
        storyText:
          "We are a young and growing team with real experience in car rental. We take care of every detail so choosing, booking and returning a car feels simple.",
        storyNote: "Modern service, clear terms and personal attention from the first question to the return of the car.",
        valuesEyebrow: "OUR VALUES",
        valuesTitle: "A rental experience built around you",
        valuesText: "The principles that guide every booking and every journey.",
        promiseEyebrow: "THE CARBONUS PROMISE",
        promiseTitle: "Comfortable travel. Smart choices.",
        promiseText:
          "A carefully maintained car, a clear offer and support when you need it — without unnecessary complexity.",
        promiseItems: ["Clear rental terms", "Maintained and insured fleet", "Simple, fast booking"],
        ctaTitle: "Ready for your next journey?",
        ctaText: "Explore the Carbonus fleet and choose the car that fits your plans.",
        ctaButton: "View cars",
      }
    : {
        eyebrow: "APIE CARBONUS",
        heroTitle: "Paprasta nuoma prasideda nuo pasitikėjimo.",
        heroText:
          "Carbonus – automobilių nuoma Druskininkuose ir visoje Lietuvoje žmonėms, kurie vertina aiškumą, patogumą ir patikimą automobilį.",
        primaryCta: "Išsirinkti automobilį",
        secondaryCta: "Susisiekti",
        location: "Druskininkai · visa Lietuva",
        stats: [
          { value: "6", label: "automobiliai parke" },
          { value: "5,0", label: "Google įvertinimas" },
          { value: "24/7", label: "rezervacija internetu" },
        ],
        storyEyebrow: "MŪSŲ ISTORIJA",
        storyTitle: "Ne tik automobilis. Sklandi kelionės pradžia.",
        storyText:
          "Esame jauna ir auganti komanda, turinti realios patirties automobilių nuomos srityje. Rūpinamės kiekviena detale, kad automobilio pasirinkimas, rezervacija ir grąžinimas būtų paprasti.",
        storyNote: "Modernus aptarnavimas, aiškios sąlygos ir asmeninis dėmesys nuo pirmo klausimo iki automobilio grąžinimo.",
        valuesEyebrow: "MŪSŲ VERTYBĖS",
        valuesTitle: "Nuomos patirtis, sukurta aplink jus",
        valuesText: "Principai, kuriais vadovaujamės kiekvienos rezervacijos ir kelionės metu.",
        promiseEyebrow: "CARBONUS PAŽADAS",
        promiseTitle: "Keliaukite patogiai. Mokėkite protingai.",
        promiseText:
          "Prižiūrėtas automobilis, aiškus pasiūlymas ir pagalba, kai jos reikia – be nereikalingo sudėtingumo.",
        promiseItems: ["Aiškios nuomos sąlygos", "Prižiūrėtas ir apdraustas parkas", "Paprastas ir greitas užsakymas"],
        ctaTitle: "Pasiruošę kitai kelionei?",
        ctaText: "Peržiūrėkite Carbonus autoparką ir išsirinkite jūsų planams tinkantį automobilį.",
        ctaButton: "Peržiūrėti automobilius",
      };

  const values = [
    { icon: Shield, title: t("about.values.safety.title"), description: t("about.values.safety.description") },
    { icon: Award, title: t("about.values.quality.title"), description: t("about.values.quality.description") },
    { icon: Clock, title: t("about.values.reliability.title"), description: t("about.values.reliability.description") },
    { icon: CheckCircle2, title: t("about.values.transparency.title"), description: t("about.values.transparency.description") },
  ];

  const carsPath = language === "en" ? "/cars" : "/automobiliai";
  const contactPath = language === "en" ? "/contact" : "/kontaktai";

  return (
    <div className="min-h-screen overflow-x-hidden bg-white font-sans text-foreground">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-[#dce6e1] bg-[#f3f7f5] pb-16 pt-[78px]">
          <div className="pointer-events-none absolute -right-48 -top-40 h-[620px] w-[620px] rounded-full bg-[hsl(var(--carbonus-green))]/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-6 pb-4 pt-16 md:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20 lg:pt-20">
            <div className="relative z-10">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--carbonus-green-dark))]">
                {copy.eyebrow}
              </p>
              <h1 className="mt-5 max-w-[600px] text-[42px] font-bold leading-[1.04] tracking-[-0.045em] sm:text-[54px] lg:text-[66px]">
                {copy.heroTitle}
              </h1>
              <div className="mt-6 h-1 w-12 rounded-full bg-[hsl(var(--carbonus-green))]" />
              <p className="mt-6 max-w-[500px] text-[16px] leading-[1.8] text-muted-foreground sm:text-[17px]">
                {copy.heroText}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={carsPath}
                  className="inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green-dark))] px-7 text-[15px] font-semibold text-white shadow-[0_16px_34px_hsl(var(--carbonus-green-dark)/0.18)] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--carbonus-green-deep))]"
                >
                  {copy.primaryCta} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to={contactPath}
                  className="inline-flex h-[52px] items-center justify-center rounded-xl border border-border bg-white px-7 text-[15px] font-semibold transition hover:border-[hsl(var(--carbonus-green))] hover:text-[hsl(var(--carbonus-green-dark))]"
                >
                  {copy.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 translate-x-5 translate-y-5 rounded-[38px] bg-[hsl(var(--carbonus-green))] opacity-20" />
              <div className="relative h-[350px] overflow-hidden rounded-[32px] bg-[hsl(var(--carbonus-green-dark))] shadow-[0_28px_65px_rgba(10,72,48,0.18)] sm:h-[460px] lg:h-[530px]">
                <img
                  src={aboutCar}
                  alt="Carbonus Citroën SpaceTourer kelyje"
                  className="h-full w-full object-cover object-[58%_center]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 flex items-center gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--carbonus-green)/0.12)] text-[hsl(var(--carbonus-green-dark))]">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <span className="text-[13px] font-semibold text-foreground">{copy.location}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto mt-12 grid max-w-[1320px] gap-3 px-6 md:grid-cols-3 md:px-6 lg:mt-14">
            {copy.stats.map((stat) => (
              <div key={stat.label} className="flex items-center gap-4 rounded-[20px] border border-white bg-white/85 px-5 py-4 shadow-[0_14px_38px_rgba(12,55,38,0.06)] backdrop-blur-sm">
                <span className="text-[28px] font-extrabold tracking-[-0.04em] text-[hsl(var(--carbonus-green-dark))]">{stat.value}</span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6c7d76]">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 sm:py-24 lg:py-28">
          <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 md:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:gap-24">
            <div className="relative">
              <div className="overflow-hidden rounded-[30px] shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
                <img src={carInterior} alt="Modernus nuomojamo automobilio interjeras" className="h-[360px] w-full object-cover sm:h-[460px]" />
              </div>
              <div className="absolute -bottom-5 -right-3 max-w-[250px] rounded-2xl border border-white/70 bg-white p-5 shadow-xl sm:right-6">
                <Sparkles className="h-5 w-5 text-[hsl(var(--carbonus-green))]" />
                <p className="mt-3 text-[13px] font-medium leading-relaxed text-foreground">{copy.storyNote}</p>
              </div>
            </div>

            <div className="pt-8 lg:pt-0">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--carbonus-green-dark))]">
                {copy.storyEyebrow}
              </p>
              <h2 className="mt-4 max-w-[500px] text-[32px] font-extrabold leading-[1.16] tracking-[-0.025em] sm:text-[40px]">
                {copy.storyTitle}
              </h2>
              <div className="mt-5 h-1 w-10 rounded-full bg-[hsl(var(--carbonus-green))]" />
              <p className="mt-6 text-[16px] leading-[1.85] text-muted-foreground">{copy.storyText}</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[t("about.visionPoints.technology.title"), t("about.visionPoints.safety.title")].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-[hsl(210_20%_96%)] p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--carbonus-green))]" />
                    <span className="text-[14px] font-semibold leading-snug">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[hsl(210_20%_97%)] py-20 sm:py-24">
          <div className="mx-auto max-w-[1320px] px-6 md:px-6">
            <div className="mx-auto max-w-[660px] text-center">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[hsl(var(--carbonus-green-dark))]">{copy.valuesEyebrow}</p>
              <h2 className="mt-4 text-[32px] font-extrabold leading-tight tracking-[-0.025em] sm:text-[40px]">{copy.valuesTitle}</h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{copy.valuesText}</p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-[24px] border border-border/70 bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(15,23,42,0.09)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--carbonus-green)/0.1)] text-[hsl(var(--carbonus-green))]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-[18px] font-bold">{title}</h3>
                  <p className="mt-3 text-[13px] leading-[1.75] text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[1320px] px-6 md:px-6">
            <div className="relative overflow-hidden rounded-[32px] bg-[hsl(var(--carbonus-green-dark))] px-7 py-12 text-white sm:px-12 lg:px-16 lg:py-16">
              <div className="pointer-events-none absolute -bottom-36 -right-20 h-[440px] w-[440px] rotate-[28deg] opacity-[0.08]" style={{ backgroundImage: "repeating-linear-gradient(90deg, #fff 0 14px, transparent 14px 34px)", maskImage: "repeating-linear-gradient(0deg, #000 0 18px, transparent 18px 30px)", WebkitMaskImage: "repeating-linear-gradient(0deg, #000 0 18px, transparent 18px 30px)" }} />
              <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                <div>
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/70">{copy.promiseEyebrow}</p>
                  <h2 className="mt-4 max-w-[470px] text-[31px] font-extrabold leading-[1.14] tracking-[-0.025em] sm:text-[40px]">{copy.promiseTitle}</h2>
                  <p className="mt-5 max-w-[500px] text-[15px] leading-[1.8] text-white/[0.72]">{copy.promiseText}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  {copy.promiseItems.map((item, index) => (
                    <div key={item} className="rounded-2xl border border-white/[0.12] bg-white/[0.07] p-5 backdrop-blur-sm">
                      <span className="text-[12px] font-bold text-[hsl(var(--carbonus-green-light))]">0{index + 1}</span>
                      <p className="mt-2 text-[14px] font-semibold leading-snug">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20 sm:pb-24">
          <div className="mx-auto max-w-[1320px] px-6 md:px-6">
            <div className="flex flex-col items-start justify-between gap-6 rounded-[28px] bg-[hsl(210_20%_96%)] px-7 py-10 sm:px-10 lg:flex-row lg:items-center lg:px-12">
              <div>
                <h2 className="text-[28px] font-extrabold tracking-tight sm:text-[34px]">{copy.ctaTitle}</h2>
                <p className="mt-2 text-[15px] text-muted-foreground">{copy.ctaText}</p>
              </div>
              <Link to={carsPath} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[hsl(var(--carbonus-green))] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_30px_hsl(var(--carbonus-green)/0.2)] transition hover:-translate-y-0.5 hover:bg-[hsl(var(--carbonus-green-dark))]">
                {copy.ctaButton} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <V3Footer />
    </div>
  );
};

export default About;
