import { CalendarDays, CarFront, ClipboardCheck, KeyRound } from "lucide-react";

const steps = [
  { icon: CalendarDays, title: "Pasirinkite datas", text: "Nurodykite paėmimo ir grąžinimo datas bei vietą." },
  { icon: CarFront, title: "Pasirinkite automobilį", text: "Išsirinkite tinkamiausią automobilį pagal poreikius." },
  { icon: ClipboardCheck, title: "Užsakykite", text: "Užpildykite duomenis ir patvirtinkite užsakymą." },
  { icon: KeyRound, title: "Mėgaukitės kelione", text: "Atvykite, pasiimkite automobilį ir leiskitės į nuotykius!" },
];

export function HowItWorks() {
  return (
    <section className="bg-white pt-[70px] pb-[72px]">
      <div className="max-w-[1120px] mx-auto px-5 md:px-8 text-center">
        <div className="text-[12px] uppercase tracking-[0.10em] font-bold text-[hsl(var(--carbonus-green))]">
          Kaip tai veikia
        </div>
        <h2 className="mt-2 font-extrabold text-[#12191A]" style={{ fontSize: "clamp(26px, 3.4vw, 34px)" }}>
          Nuoma paprasta kaip 1–2–3–4
        </h2>

        <div className="relative mt-10">
          {/* dotted line behind icons (desktop only) */}
          <div aria-hidden className="hidden lg:block absolute top-8 left-[12%] right-[12%] border-t-2 border-dashed border-[hsl(var(--carbonus-green-dark)/0.28)]" />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="relative h-16 w-16 rounded-full bg-[hsl(var(--carbonus-green-soft))] flex items-center justify-center">
                  <Icon className="h-7 w-7 text-[hsl(var(--carbonus-green-dark))]" aria-hidden />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--carbonus-green))] text-white text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-bold text-[#12191A]">{title}</span>
                </div>
                <p className="mt-2 text-[12px] leading-[1.55] text-[#687374] max-w-[210px]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
