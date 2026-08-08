import servicesCar from "@/assets/homev3-services-skoda-hero-v3.png";
import { Truck, MapPinned, ReceiptText } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const COPY = {
  lt: {
    eyebrow: "Kodėl rinktis Carbonus?",
    heading: "Patirkite geriausią nuomos patirtį su Carbonus",
    imageAlt: "Žalias Škoda nuomos automobilis",
    items: [
      { title: "Nemokamas pristatymas Druskininkuose", text: "Automobilį atvešime į jūsų viešbutį ar kitą pasirinktą adresą Druskininkuose – be papildomo mokesčio." },
      { title: "Pristatymas į kitus miestus", text: "Pristatome ir atsiimame visoje Lietuvoje už aiškiai nurodytą papildomą mokestį." },
      { title: "Aiški kainodara be paslėptų mokesčių", text: "Galutinę kainą matote iš karto – jokių netikėtų priemokų rezervuojant ar atsiimant." },
    ],
  },
  en: {
    eyebrow: "Why choose Carbonus?",
    heading: "Enjoy the best rental experience with Carbonus",
    imageAlt: "Green Škoda rental car",
    items: [
      { title: "Free delivery in Druskininkai", text: "We bring the car to your hotel or any chosen address in Druskininkai at no extra cost." },
      { title: "Delivery to other cities", text: "We deliver and collect across Lithuania for a clearly stated additional fee." },
      { title: "Clear pricing, no hidden fees", text: "You see the final price upfront – no surprise charges when booking or picking up." },
    ],
  },
  ru: {
    eyebrow: "Почему Carbonus?",
    heading: "Получите лучший опыт аренды с Carbonus",
    imageAlt: "Зелёный автомобиль Škoda напрокат",
    items: [
      { title: "Бесплатная доставка в Друскининкай", text: "Привезём автомобиль в ваш отель или по указанному адресу в Друскининкай без доплаты." },
      { title: "Доставка в другие города", text: "Доставляем и забираем по всей Литве за чётко указанную дополнительную плату." },
      { title: "Прозрачные цены без скрытых платежей", text: "Итоговую цену видите сразу – никаких неожиданных доплат." },
    ],
  },
} as const;

const ICONS = [Truck, MapPinned, ReceiptText];

export function V3BestServices() {
  const { language } = useLanguage();
  const c = COPY[language] ?? COPY.lt;

  return (
    <section className="overflow-hidden bg-white pb-8 pt-12 sm:pb-10 sm:pt-16 lg:pb-12 lg:pt-20">
      <div className="mx-auto grid max-w-[1580px] items-center gap-8 px-6 lg:min-h-[600px] lg:grid-cols-[minmax(0,3fr)_minmax(400px,2fr)] lg:gap-0 lg:px-0">
        <div className="relative mx-auto aspect-[3/2] w-full overflow-hidden rounded-[26px] lg:h-[560px] lg:aspect-auto lg:rounded-none lg:rounded-r-[36px]">
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

          <div className="mt-8 space-y-6">
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
