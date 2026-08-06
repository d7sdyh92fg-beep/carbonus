import topCar from "@/assets/homev3-car-topdown.png";
import { useEffect, useRef, useState } from "react";
import { Tag, Award, PiggyBank, MousePointerClick, CreditCard, Wrench } from "lucide-react";

const LEFT = [
  { icon: Tag, title: "Konkurencingos kainos" },
  { icon: PiggyBank, title: "Nuoma pagal jūsų biudžetą" },
  { icon: CreditCard, title: "Lankstūs atsiskaitymo būdai" },
];
const RIGHT = [
  { icon: Award, title: "Pilnai apdraustas parkas" },
  { icon: MousePointerClick, title: "Lengvas užsakymas" },
  { icon: Wrench, title: "Prižiūrėti automobiliai" },
];
function Item({
  icon: Icon,
  title,
  align,
}: {
  icon: typeof Tag;
  title: string;
  align: "left" | "right";
}) {
  return (
    <div className={`flex flex-col items-center ${align === "right" ? "lg:items-start" : "lg:items-end"}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-[14px] border-2 border-white bg-[hsl(210_16%_96%)] shadow-[0_12px_28px_rgba(16,24,40,0.10)] transition-transform duration-300 hover:-translate-y-1 hover:scale-105">
        <Icon className="h-6 w-6 text-[hsl(var(--carbonus-green))]" />
      </div>
      <p
        className={`mt-4 max-w-[190px] text-center text-[16px] font-semibold leading-[1.35] text-foreground ${
          align === "right" ? "lg:text-left" : "lg:text-right"
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
    <section ref={sectionRef} className="overflow-hidden bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-6">
        <div
          className={`text-center transition-all duration-700 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <h2 className="mx-auto max-w-[580px] text-[30px] font-extrabold leading-[1.16] tracking-[-0.025em] text-foreground sm:text-[36px] lg:text-[40px]">
            Užtikriname geriausią klientų patirtį
          </h2>
          <p className="mx-auto mt-5 max-w-[500px] text-[14px] leading-[1.75] text-muted-foreground">
            Jūsų ir jūsų šeimos saugumas kelyje neturi kainos. Pasirūpiname viskuo,
            kad kelionė būtų sklandi.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_380px_1fr] lg:gap-0">
          {/* left column */}
          <div className="grid grid-cols-2 gap-8 lg:flex lg:h-[590px] lg:flex-col lg:justify-between lg:gap-0">
            {LEFT.map((item, index) => (
              <div
                key={item.title}
                className={`flex items-start justify-center gap-3 transition-all duration-700 ease-out lg:justify-end ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: `${200 + index * 140}ms` }}
              >
                <Item {...item} align="left" />
                <div className="lg:mt-5">
                  <Connector dir="left" active={isVisible} delay={300 + index * 140} />
                </div>
              </div>
            ))}
          </div>

          {/* car */}
          <div
            className={`order-first mx-auto w-[250px] transition-all duration-1000 ease-out lg:order-none lg:w-[370px] ${
              isVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-10 scale-[0.96] opacity-0"
            }`}
            style={{ transitionDelay: "220ms" }}
          >
            <img
              src={`${topCar}?v=3`}
              alt="Automobilis iš viršaus"
              loading="eager"
              decoding="async"
              width={912}
              height={1408}
              className="w-full drop-shadow-[0_34px_34px_rgba(0,0,0,0.22)]"
            />
          </div>

          {/* right column */}
          <div className="grid grid-cols-2 gap-8 lg:flex lg:h-[590px] lg:flex-col lg:justify-between lg:gap-0">
            {RIGHT.map((item, index) => (
              <div
                key={item.title}
                className={`flex items-start justify-center gap-3 transition-all duration-700 ease-out lg:justify-start ${
                  isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: `${270 + index * 140}ms` }}
              >
                <div className="lg:mt-5">
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
