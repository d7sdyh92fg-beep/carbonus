import servicesCar from "@/assets/homev3-services-skoda-hero-v3.png";
import { Tag, Wallet, Headphones } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const COPY = {
  lt: {
    eyebrow: "Kodėl rinktis Carbonus?",
    heading: "Patirkite geriausią nuomos patirtį su Carbonus",
    imageAlt: "Žalias Škoda nuomos automobilis",
    items: [
      { title: "Pasiūlymai kiekvienam biudžetui", text: "Konkurencingos kainos nuo ekonomiškų iki premium klasės automobilių." },
      { title: "Geriausios kainos garantija", text: "Radote pigiau? Pasiūlysime tokią pačią arba geresnę kainą." },
      { title: "Pagalba 24/7", text: "Susisiekite bet kuriuo paros metu – padėsime kelyje ir konsultuosime." },
    ],
  },
  en: {
    eyebrow: "Why choose Carbonus?",
    heading: "Enjoy the best rental experience with Carbonus",
    imageAlt: "Green Škoda rental car",
    items: [
      { title: "Options for every budget", text: "Competitive prices from economy to premium class cars." },
      { title: "Best price guarantee", text: "Found it cheaper? We will match or beat that price." },
      { title: "24/7 support", text: "Contact us any time of day – we help on the road and advise you." },
    ],
  },
  ru: {
    eyebrow: "Почему Carbonus?",
    heading: "Получите лучший опыт аренды с Carbonus",
    imageAlt: "Зелёный автомобиль Škoda напрокат",
    items: [
      { title: "Предложения для любого бюджета", text: "Конкурентные цены от эконом- до премиум-класса." },
      { title: "Гарантия лучшей цены", text: "Нашли дешевле? Предложим такую же или лучшую цену." },
      { title: "Поддержка 24/7", text: "Свяжитесь в любое время суток – поможем в дороге и проконсультируем." },
    ],
  },
} as const;

const ICONS = [Tag, Wallet, Headphones];

export function V3BestServices() {
  const { language } = useLanguage();
  const c = COPY[language] ?? COPY.lt;

  return (
    <section className="overflow-hidden bg-white py-16 lg:py-20">
      <div className="mx-auto grid max-w-[1580px] items-center gap-12 px-6 lg:min-h-[700px] lg:grid-cols-[minmax(0,3fr)_minmax(400px,2fr)] lg:gap-0 lg:px-0">
        <div className="relative mx-auto aspect-[3/2] w-full overflow-hidden rounded-[26px] lg:h-[650px] lg:aspect-auto lg:rounded-none lg:rounded-r-[36px]">
          <img
            src={servicesCar}
            alt={c.imageAlt}
            loading="lazy"
            width={1536}
            height={1024}
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div className="lg:px-14 xl:px-20">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {c.eyebrow}
          </p>
          <h2 className="mt-3 max-w-[420px] text-[28px] font-extrabold leading-[1.2] tracking-tight text-foreground sm:text-[32px]">
            {c.heading}
          </h2>
          <div className="mt-5 h-[3px] w-10 rounded-full bg-[hsl(var(--carbonus-green))]" />

          <div className="mt-10 space-y-8">
            {c.items.map((item, i) => {
              const Icon = ICONS[i];
              return (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted shadow-[0_8px_18px_rgba(16,24,40,0.06)]">
                    <Icon className="h-5 w-5 text-[hsl(var(--carbonus-green))]" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 max-w-[320px] text-[13px] leading-relaxed text-muted-foreground">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
