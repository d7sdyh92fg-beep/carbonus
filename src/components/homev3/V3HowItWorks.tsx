import { Fragment } from "react";
import { MapPin, CalendarCheck, CalendarHeart } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

const COPY = {
  lt: {
    eyebrow: "Kaip tai veikia",
    heading: "Carbonus nuoma – trys paprasti žingsniai",
    steps: [
      { title: "Pasirinkite vietą", text: "Atsiimkite Druskininkuose arba rinkitės pristatymą." },
      { title: "Pasirinkite datas", text: "Nurodykite nuomos laikotarpį." },
      { title: "Rezervuokite", text: "Pasirinkite automobilį ir patvirtinkite rezervaciją." },
    ],
  },
  en: {
    eyebrow: "How it works",
    heading: "Carbonus rental – three simple steps",
    steps: [
      { title: "Choose a location", text: "Pick up in Druskininkai or choose delivery." },
      { title: "Choose your dates", text: "Set your rental period." },
      { title: "Book it", text: "Pick a car and confirm your reservation." },
    ],
  },
  ru: {
    eyebrow: "Как это работает",
    heading: "Аренда Carbonus – три простых шага",
    steps: [
      { title: "Выберите место", text: "Заберите в Друскининкай или выберите доставку." },
      { title: "Выберите даты", text: "Укажите период аренды." },
      { title: "Забронируйте", text: "Выберите автомобиль и подтвердите бронирование." },
    ],
  },
} as const;

const ICONS = [MapPin, CalendarCheck, CalendarHeart];

function Dashes({ flip }: { flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 160 40"
      className={`hidden h-10 w-[160px] shrink-0 self-start md:block ${flip ? "mt-6 -scale-y-100" : "mt-6"}`}
      fill="none"
    >
      <path
        d="M2 6C40 40 120 40 158 6"
        stroke="hsl(var(--carbonus-green))"
        strokeOpacity="0.5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 10"
      />
    </svg>
  );
}

export function V3HowItWorks() {
  const { language } = useLanguage();
  const c = COPY[language] ?? COPY.lt;

  return (
    <section className="bg-white py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-[1060px] px-6 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {c.eyebrow}
        </p>
        <h2 className="mt-3 text-[28px] font-extrabold tracking-tight text-foreground sm:text-[32px]">
          {c.heading}
        </h2>

        <div className="mt-12 flex flex-col items-center justify-center gap-10 md:flex-row md:items-start md:gap-3">
          {c.steps.map((step, i) => {
            const Icon = ICONS[i];
            const active = i === 1;
            return (
              <Fragment key={step.title}>
                <div className="max-w-[250px] text-center">
                  <div
                    className={`mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-xl border-2 border-white ${
                      active
                        ? "bg-carbonus-green shadow-[0_14px_30px_hsl(var(--carbonus-green)/0.38)]"
                        : "bg-muted shadow-[0_12px_26px_rgba(16,24,40,0.10)]"
                    }`}
                  >
                    <Icon className={`h-7 w-7 ${active ? "text-white" : "text-carbonus-green"}`} />
                  </div>
                  <h3 className="mt-5 text-[17px] font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-[14px] leading-[1.6] text-foreground/70 sm:text-[15px]">{step.text}</p>
                </div>
                {i < c.steps.length - 1 && <Dashes flip={i === 1} />}
              </Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
