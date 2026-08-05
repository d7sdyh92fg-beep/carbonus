import topCar from "@/assets/homev3-car-topdown.png";
import { Tag, Award, PiggyBank, UserRound, CreditCard, Wrench, ChevronDown } from "lucide-react";

const LEFT = [
  { icon: Tag, title: "Konkurencingos kainos" },
  { icon: PiggyBank, title: "Nuoma pagal jūsų biudžetą" },
  { icon: CreditCard, title: "Lankstūs atsiskaitymo būdai" },
];
const RIGHT = [
  { icon: Award, title: "Pilnai apdraustas parkas" },
  { icon: UserRound, title: "Pagalba kelyje 24/7" },
  { icon: Wrench, title: "Prižiūrėti automobiliai" },
];
const CHIPS = ["Variklis", "Pavarų dėžė", "Elektronika", "Kondicionierius", "20+ daugiau"];

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
    <div className={`flex flex-col ${align === "right" ? "lg:items-start" : "lg:items-end"}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
        <Icon className="h-5 w-5 text-[hsl(var(--carbonus-green))]" />
      </div>
      <p
        className={`mt-3 max-w-[150px] text-[14px] font-medium leading-snug text-foreground ${
          align === "right" ? "lg:text-left" : "lg:text-right"
        }`}
      >
        {title}
      </p>
    </div>
  );
}

function Connector({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 120 30" className="hidden h-8 w-[120px] lg:block" fill="none">
      {dir === "left" ? (
        <>
          <path d="M2 4H70L110 26" stroke="hsl(var(--carbonus-green-dark))" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="112" cy="26" r="3.5" fill="hsl(var(--carbonus-green))" />
        </>
      ) : (
        <>
          <path d="M118 4H50L10 26" stroke="hsl(var(--carbonus-green-dark))" strokeOpacity="0.5" strokeWidth="1.5" />
          <circle cx="8" cy="26" r="3.5" fill="hsl(var(--carbonus-green))" />
        </>
      )}
    </svg>
  );
}

export function V3CustomerExperience() {
  return (
    <section className="bg-white py-16 lg:py-24">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="text-center">
          <h2 className="mx-auto max-w-[520px] text-[28px] font-extrabold leading-[1.2] tracking-tight text-foreground sm:text-[32px]">
            Užtikriname geriausią klientų patirtį
          </h2>
          <p className="mx-auto mt-4 max-w-[420px] text-[13px] leading-relaxed text-muted-foreground">
            Jūsų ir jūsų šeimos saugumas kelyje neturi kainos. Pasirūpiname viskuo,
            kad kelionė būtų sklandi.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr]">
          {/* left column */}
          <div className="grid grid-cols-2 gap-8 lg:flex lg:flex-col lg:gap-14">
            {LEFT.map((item, i) => (
              <div key={item.title} className="flex items-start gap-2 lg:justify-end">
                <Item {...item} align="left" />
                <div className={i === 1 ? "lg:mt-4" : "lg:mt-4"}>
                  <Connector dir="left" />
                </div>
              </div>
            ))}
          </div>

          {/* car */}
          <div className="order-first mx-auto w-[220px] lg:order-none lg:w-[280px]">
            <img
              src={topCar}
              alt="Automobilis iš viršaus"
              loading="lazy"
              width={912}
              height={1408}
              className="w-full drop-shadow-[0_30px_40px_rgba(0,0,0,0.25)]"
            />
          </div>

          {/* right column */}
          <div className="grid grid-cols-2 gap-8 lg:flex lg:flex-col lg:gap-14">
            {RIGHT.map((item) => (
              <div key={item.title} className="flex items-start gap-2">
                <div className="lg:mt-4">
                  <Connector dir="right" />
                </div>
                <Item {...item} align="right" />
              </div>
            ))}
          </div>
        </div>

        {/* chips */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-4">
          {CHIPS.map((chip) => (
            <button
              key={chip}
              className="flex items-center gap-3 rounded-xl bg-muted px-4 py-3 text-[13px] font-medium text-foreground transition-colors hover:bg-muted/70"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-card">
                <Wrench className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
              </span>
              {chip}
              <ChevronDown className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
