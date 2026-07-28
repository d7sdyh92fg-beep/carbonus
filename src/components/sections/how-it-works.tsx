import { CalendarDays, Car, ClipboardCheck, Key } from "lucide-react";

export function HowItWorks() {
  const steps = [
    { icon: CalendarDays, title: "Pasirinkite datas", desc: "Nurodykite paėmimo ir grąžinimo datas bei vietą." },
    { icon: Car, title: "Pasirinkite automobilį", desc: "Išsirinkite tinkamiausią automobilį pagal poreikius." },
    { icon: ClipboardCheck, title: "Užsakykite", desc: "Užpildykite duomenis ir patvirtinkite užsakymą." },
    { icon: Key, title: "Mėgaukitės kelione", desc: "Atvykite, pasiimkite automobilį ir leiskitės į nuotykius!" },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 md:mb-20">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] mb-3">
            Kaip tai veikia
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[38px] font-bold text-foreground">
            Nuoma paprasta kaip 1–2–3–4
          </h2>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 max-w-5xl mx-auto">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {/* Dotted connector (desktop) */}
                {i < steps.length - 1 && (
                  <div
                    aria-hidden
                    className="hidden md:block absolute top-10 left-[calc(50%+56px)] right-[calc(-50%+56px)] h-px"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(to right, hsl(var(--muted-foreground) / 0.4) 0 4px, transparent 4px 10px)',
                    }}
                  />
                )}
                <div className="relative w-20 h-20 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-center">
                  <Icon className="h-8 w-8 text-primary" strokeWidth={1.8} />
                </div>
                <div className="mt-5 mb-2 inline-flex items-center gap-2">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <h3 className="text-[15px] font-semibold text-foreground">{step.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
