import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import ctaCar from "@/assets/car-mercedes.jpg";
import { useLanguage } from "@/hooks/use-language";

const COPY = {
  lt: {
    title: "Rezervuokite automobilį jau šiandien",
    text: "Turite klausimų? Paskambinkite mums arba rezervuokite automobilį tiesiogiai internetu.",
    call: "Susisiekite su mumis",
    book: "Rezervuok dabar",
    imageAlt: "Prabangus automobilis",
  },
  en: {
    title: "Book your car today",
    text: "Have questions? Give us a call or book your car directly online.",
    call: "Contact us",
    book: "Book now",
    imageAlt: "Premium rental car",
  },
  ru: {
    title: "Забронируйте автомобиль уже сегодня",
    text: "Есть вопросы? Позвоните нам или забронируйте автомобиль онлайн.",
    call: "Свяжитесь с нами",
    book: "Забронировать",
    imageAlt: "Автомобиль премиум-класса",
  },
} as const;

export function V3SimpleCta() {
  const { language } = useLanguage();
  const c = COPY[language] ?? COPY.lt;

  return (
    <section className="bg-[hsl(210_20%_99%)] py-16 lg:py-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-6">
        <div className="overflow-hidden rounded-[24px] border border-black/[0.04] bg-white shadow-[0_14px_38px_rgba(16,24,40,0.08)]">
          <div className="grid lg:grid-cols-2">
            <div className="relative min-h-[260px] lg:min-h-[360px]">
              <img
                src={ctaCar}
                alt={c.imageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex flex-col justify-center p-8 lg:p-12">
              <h2 className="text-[26px] font-extrabold leading-tight tracking-[-0.025em] text-foreground sm:text-[32px]">
                {c.title}
              </h2>
              <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">{c.text}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="tel:+37069818781"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--carbonus-green-dark))] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[hsl(var(--carbonus-green-deep))]"
                >
                  <Phone className="h-4 w-4" />
                  {c.call}
                </a>
                <Link
                  to="/laisvi-automobiliai"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-[14px] font-semibold text-foreground transition-colors hover:bg-muted/60"
                >
                  {c.book}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
