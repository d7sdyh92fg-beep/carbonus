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
    <section className="bg-white py-16">
      <div className="mx-auto max-w-[1180px] px-6 text-center">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Kaip tai veikia
        </p>
        <h2 className="mt-3 text-[28px] font-extrabold tracking-tight text-foreground sm:text-[32px]">
          Carbonus nuoma – trys paprasti žingsniai
        </h2>

        <div className="mt-14 flex flex-col items-center justify-center gap-10 md:flex-row md:items-start md:gap-2">
          {STEPS.map((step, i) => (
            <>
              <div key={step.title} className="max-w-[230px] text-center">
                <div
                  className={`mx-auto flex h-[62px] w-[62px] items-center justify-center rounded-2xl ${
                    step.active
                      ? "bg-[hsl(var(--carbonus-green))] shadow-[0_14px_30px_hsl(var(--carbonus-green)/0.45)]"
                      : "bg-muted"
                  }`}
                >
                  <step.icon
                    className={`h-7 w-7 ${step.active ? "text-white" : "text-[hsl(var(--carbonus-green))]"}`}
                  />
                </div>
                <h3 className="mt-5 text-[16px] font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.text}</p>
              </div>
              {i < STEPS.length - 1 && <Dashes key={`d${i}`} flip={i === 1} />}
            </>
          ))}
        </div>
      </div>
    </section>
  );
}
