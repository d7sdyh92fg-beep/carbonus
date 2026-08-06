import { Fragment } from "react";
import { MapPin, CalendarCheck, CalendarHeart } from "lucide-react";

const STEPS = [
  {
    icon: MapPin,
    title: "Pasirinkite vietą",
    text: "Peržiūrėkite populiariausias paėmimo vietas visoje Lietuvoje.",
  },
  {
    icon: CalendarCheck,
    title: "Paėmimo data",
    text: "Nurodykite datas ir laiką – laisvus automobilius parodysime iškart.",
    active: true,
  },
  {
    icon: CalendarHeart,
    title: "Rezervuokite",
    text: "Patvirtinkite užsakymą ir gaukite sutartį el. paštu.",
  },
];

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
  return (
    <section className="bg-white pb-24 pt-20 lg:pb-28 lg:pt-24">
      <div className="mx-auto max-w-[1060px] px-6 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Kaip tai veikia
        </p>
        <h2 className="mt-3 text-[28px] font-extrabold tracking-tight text-foreground sm:text-[32px]">
          Carbonus nuoma – trys paprasti žingsniai
        </h2>

        <div className="mt-16 flex flex-col items-center justify-center gap-10 md:flex-row md:items-start md:gap-3">
          {STEPS.map((step, i) => (
            <Fragment key={step.title}>
              <div className="max-w-[230px] text-center">
                <div
                  className={`mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-xl border-2 border-white ${
                    step.active
                      ? "bg-carbonus-green shadow-[0_14px_30px_hsl(var(--carbonus-green)/0.38)]"
                      : "bg-muted shadow-[0_12px_26px_rgba(16,24,40,0.10)]"
                  }`}
                >
                  <step.icon
                    className={`h-7 w-7 ${step.active ? "text-white" : "text-carbonus-green"}`}
                  />
                </div>
                <h3 className="mt-5 text-[16px] font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
              {i < STEPS.length - 1 && <Dashes flip={i === 1} />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
