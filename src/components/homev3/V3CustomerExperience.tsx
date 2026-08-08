import topCar from "@/assets/homev3-car-topdown.png";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { CalendarCheck, CreditCard, MapPin, ShieldCheck, Wrench, FileText, type LucideIcon } from "lucide-react";

const COPY = {
  lt: {
    heading: "Viskas, ko reikia sklandžiai nuomai",
    sub: "Kiekvieną kelionę pradedame nuo paprastos rezervacijos ir patikimo automobilio.",
    carAlt: "Automobilis iš viršaus",
    left: ["Paprasta rezervacija", "Lankstus atsiskaitymas", "Patogus atsiėmimas"],
    right: ["Apdraustas autoparkas", "Reguliariai prižiūrėtas parkas", "Aiškios nuomos sąlygos"],
  },
  en: {
    heading: "Everything you need for a smooth rental",
    sub: "Every trip starts with a simple booking and a reliable car.",
    carAlt: "Car seen from above",
    left: ["Simple booking", "Flexible payment", "Convenient pickup"],
    right: ["Fully insured fleet", "Regularly serviced cars", "Clear rental terms"],
  },
  ru: {
    heading: "Всё, что нужно для комфортной аренды",
    sub: "Каждая поездка начинается с простого бронирования и надёжного автомобиля.",
    carAlt: "Автомобиль сверху",
    left: ["Простое бронирование", "Гибкая оплата", "Удобное получение"],
    right: ["Застрахованный автопарк", "Регулярное обслуживание", "Понятные условия аренды"],
  },
} as const;

const LEFT_ICONS = [CalendarCheck, CreditCard, MapPin];
const RIGHT_ICONS = [ShieldCheck, Wrench, FileText];

function Item({
  icon: Icon,
  title,
  align,
}: {
  icon: LucideIcon;
  title: string;
  align: "left" | "right";
}) {
  return (
    <div className={`flex flex-col items-center ${align === "right" ? "lg:items-start" : "lg:items-end"}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-[14px] border-2 border-white bg-[hsl(210_16%_96%)] shadow-[0_12px_28px_rgba(16,24,40,0.10)] transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
        <Icon className="h-6 w-6 text-[hsl(var(--carbonus-green))]" />
      </div>
      <p
        className={`mt-4 flex min-h-[54px] w-full max-w-[190px] items-start justify-center text-center text-[16px] font-semibold leading-[1.35] text-foreground ${
          align === "right" ? "lg:items-start lg:justify-start lg:text-left" : "lg:items-start lg:justify-end lg:text-right"
        }`}
      >
        {title}
      </p>
    </div>
  );
}

function Connector({ dir, active, delay }: { dir: "left" | "right"; active: boolean; delay: number }) {
  const lineStyle = {
    transition: "stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDelay: `${delay}ms`,
  };
  const dotStyle = {
    opacity: active ? 1 : 0,
    transition: "opacity 250ms ease",
    transitionDelay: `${delay + 700}ms`,
  };

  return (
    <svg viewBox="0 0 160 38" className="hidden h-10 w-[160px] lg:block" fill="none">
      {dir === "left" ? (
        <>
          <path
            d="M2 6H88L150 32"
            pathLength="1"
            stroke="hsl(var(--carbonus-green-dark))"
            strokeOpacity="0.72"
            strokeWidth="2"
            strokeDasharray="1"
            strokeDashoffset={active ? 0 : 1}
            style={lineStyle}
          />
          <circle cx="154" cy="33" r="4" fill="white" stroke="hsl(var(--carbonus-green-dark))" strokeWidth="2.5" style={dotStyle} />
        </>
      ) : (
        <>
          <path
            d="M158 6H72L10 32"
            pathLength="1"
            stroke="hsl(var(--carbonus-green-dark))"
            strokeOpacity="0.72"
            strokeWidth="2"
            strokeDasharray="1"
            strokeDashoffset={active ? 0 : 1}
            style={lineStyle}
          />
          <circle cx="6" cy="33" r="4" fill="white" stroke="hsl(var(--carbonus-green-dark))" strokeWidth="2.5" style={dotStyle} />
        </>
      )}
    </svg>
  );
}

export function V3CustomerExperience() {
  const { language } = useLanguage();
  const c = COPY[language] ?? COPY.lt;
  const LEFT = c.left.map((title, i) => ({ icon: LEFT_ICONS[i], title }));
  const RIGHT = c.right.map((title, i) => ({ icon: RIGHT_ICONS[i], title }));
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="overflow-hidden bg-white pb-12 pt-8 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
      <div className="mx-auto max-w-[1240px] px-6">
        <div
          className={`text-center transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <h2 className="mx-auto max-w-[820px] text-balance text-[30px] font-extrabold leading-[1.16] tracking-[-0.025em] text-foreground sm:text-[36px] lg:text-[40px]">
            {c.heading}
          </h2>
          <p className="mx-auto mt-4 max-w-[500px] text-[14px] leading-[1.7] text-muted-foreground">
            {c.sub}
          </p>
        </div>


        <div className="mt-8 grid grid-cols-2 items-start gap-8 sm:mt-10 sm:gap-10 md:grid-cols-[1fr_280px_1fr] md:items-center md:gap-0 lg:grid-cols-[1fr_380px_1fr]">
          {/* left column */}
          <div className="contents md:flex md:h-[480px] md:flex-col md:justify-between md:gap-0 lg:h-[590px]">

            {LEFT.map((item, index) => (
              <div
                key={item.title}
                className={`flex items-start justify-center gap-3 transition-all duration-700 ease-out md:justify-end ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: `${200 + index * 140}ms` }}
              >
                <Item {...item} align="left" />
                <div className="md:mt-5">
                  <Connector dir="left" active={isVisible} delay={300 + index * 140} />
                </div>
              </div>
            ))}
          </div>

          {/* car */}
          <div
            className={`order-first col-span-2 mx-auto w-[220px] transition-all duration-1000 ease-out sm:w-[250px] md:order-none md:col-span-1 md:w-[270px] lg:w-[370px] ${
              isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-[0.96] opacity-0"
            }`}
            style={{ transitionDelay: "220ms" }}
          >
            <img
              src={`${topCar}?v=3`}
              alt={c.carAlt}
              loading="eager"
              decoding="async"
              width={912}
              height={1408}
              className="w-full drop-shadow-[0_34px_34px_rgba(0,0,0,0.22)]"
            />
          </div>

          {/* right column */}
          <div className="contents md:flex md:h-[480px] md:flex-col md:justify-between md:gap-0 lg:h-[590px]">

            {RIGHT.map((item, index) => (
              <div
                key={item.title}
                className={`flex items-start justify-center gap-3 transition-all duration-700 ease-out md:justify-start ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: `${270 + index * 140}ms` }}
              >
                <div className="md:mt-5">
                  <Connector dir="right" active={isVisible} delay={370 + index * 140} />
                </div>
                <Item {...item} align="right" />
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
