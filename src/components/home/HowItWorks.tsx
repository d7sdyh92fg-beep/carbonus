import { CalendarDays, CarFront, ClipboardCheck, KeyRound } from "lucide-react";

const steps = [
  { icon: CalendarDays, title: "Pasirinkite datas", text: "Nurodykite paėmimo ir grąžinimo datas bei vietą." },
  { icon: CarFront, title: "Pasirinkite automobilį", text: "Išsirinkite tinkamiausią automobilį pagal poreikius." },
  { icon: ClipboardCheck, title: "Užsakykite", text: "Užpildykite duomenis ir patvirtinkite užsakymą." },
  { icon: KeyRound, title: "Mėgaukitės kelione", text: "Atvykite, pasiimkite automobilį ir leiskitės į nuotykius!" },
];

export function HowItWorks() {
  return (
    <section className="bg-white pt-[78px] pb-[86px]">
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 text-center">

        <div className="text-[13px] uppercase tracking-[0.12em] font-bold text-[hsl(var(--carbonus-green))]">
          Kaip tai veikia
        </div>
        <h2 className="mt-2.5 font-extrabold text-[#12191A]" style={{ fontSize: "clamp(26px, 3.4vw, 34px)" }}>
          Nuoma paprasta kaip 1–2–3–4
        </h2>

        <div className="relative mt-12">
          {/* dotted line behind icons (desktop only) */}
          <div aria-hidden className="hidden lg:block absolute top-10 left-[14%] right-[14%] border-t-2 border-dashed border-[hsl(var(--carbonus-green-dark)/0.45)]" />
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="relative h-[72px] w-[72px] rounded-full bg-white border border-[#E2EAE5] shadow-[0_10px_25px_rgba(18,35,29,0.08)] flex items-center justify-center">
                  <span className="inline-flex h-[46px] w-[46px] items-center justify-center rounded-full bg-[hsl(var(--carbonus-green-soft))]">
                    <Icon className="h-6 w-6 text-[hsl(var(--carbonus-green-dark))]" aria-hidden />
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--carbonus-green))] text-white text-[12px] font-bold">
                    {i + 1}
                  </span>
                  <span className="text-[15px] font-bold text-[#12191A]">{title}</span>
                </div>
                <p className="mt-2.5 text-[14px] leading-[1.65] text-[#4D5959] max-w-[220px]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

