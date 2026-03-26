import { useState } from "react";
import { Hand, CalendarCheck, Car, RotateCcw, ChevronRight } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function HowItWorks() {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: t('howItWorks.steps.choose.title'),
      icon: Hand,
      description: t('howItWorks.steps.choose.description'),
      phoneContent: {
        heading: "Carbonus",
        subtext: t('howItWorks.steps.choose.title'),
        visual: "grid",
      },
    },
    {
      id: 2,
      title: t('howItWorks.steps.book.title'),
      icon: CalendarCheck,
      description: t('howItWorks.steps.book.description'),
      phoneContent: {
        heading: "Carbonus",
        subtext: t('howItWorks.steps.book.title'),
        visual: "calendar",
      },
    },
    {
      id: 3,
      title: t('howItWorks.steps.drive.title'),
      icon: Car,
      description: t('howItWorks.steps.drive.description'),
      phoneContent: {
        heading: "Carbonus",
        subtext: t('howItWorks.steps.drive.title'),
        visual: "keys",
      },
    },
    {
      id: 4,
      title: t('howItWorks.steps.return.title'),
      icon: RotateCcw,
      description: t('howItWorks.steps.return.description'),
      phoneContent: {
        heading: "Carbonus",
        subtext: t('howItWorks.steps.return.title'),
        visual: "check",
      },
    },
  ];

  const PhoneScreen = ({ step }: { step: typeof steps[0] }) => {
    const IconComponent = step.icon;
    return (
      <div className="w-full h-full bg-background rounded-[2rem] flex flex-col items-center justify-center p-6 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
          <IconComponent className="w-6 h-6 text-primary" />
        </div>
        <p className="text-sm font-semibold text-foreground text-center">{step.phoneContent.subtext}</p>
        {step.phoneContent.visual === "grid" && (
          <div className="grid grid-cols-2 gap-2 w-full max-w-[180px]">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/3] rounded-lg bg-primary/5 border border-primary/10" />
            ))}
          </div>
        )}
        {step.phoneContent.visual === "calendar" && (
          <div className="w-full max-w-[180px] space-y-1.5">
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="aspect-square rounded bg-muted flex items-center justify-center text-[8px] text-muted-foreground font-medium">
                  {["P", "A", "T", "K", "Pn", "Š", "S"][i]}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: 21 }).map((_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded flex items-center justify-center text-[8px] font-medium ${
                    i >= 7 && i <= 11
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        )}
        {step.phoneContent.visual === "keys" && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Car className="w-8 h-8 text-primary" />
            </div>
            <div className="w-24 h-1.5 rounded-full bg-primary/20" />
            <div className="w-16 h-1.5 rounded-full bg-primary/10" />
          </div>
        )}
        {step.phoneContent.visual === "check" && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-primary/20" />
            <div className="w-16 h-1.5 rounded-full bg-primary/10" />
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="py-20 lg:py-28 bg-background overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Steps */}
          <div className="space-y-4">
            <p className="text-sm font-semibold text-primary tracking-wider uppercase">
              {t('howItWorks.badge')}
            </p>
            <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              {t('howItWorks.title')}
            </h2>

            <div className="pt-6 space-y-2">
              {steps.map((step, index) => {
                const IconComponent = step.icon;
                const isActive = activeStep === index;

                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(index)}
                    className={`w-full text-left rounded-xl p-5 transition-all duration-300 group ${
                      isActive
                        ? "bg-primary/5 border border-primary/20"
                        : "bg-transparent border border-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold transition-colors duration-300 ${
                            isActive ? "text-foreground" : "text-muted-foreground"
                          }`}>
                            <span className="text-primary mr-2">{index + 1}.</span>
                            {step.title}
                          </h3>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-all duration-300 ${
                            isActive ? "text-primary rotate-90" : "text-muted-foreground/40"
                          }`} />
                        </div>
                        <div className={`overflow-hidden transition-all duration-300 ${
                          isActive ? "max-h-24 opacity-100 mt-2" : "max-h-0 opacity-0"
                        }`}>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                variant="default"
                onClick={() => {
                  navigate('/automobiliai');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {t('howItWorks.steps.choose.title')}
              </Button>
            </div>
          </div>

          {/* Right side - Phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-[280px] h-[570px] rounded-[3rem] border-[6px] border-foreground/10 bg-muted/30 shadow-2xl overflow-hidden">
                {/* Notch / Dynamic Island */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-foreground/10 rounded-full z-10" />

                {/* Screen content */}
                <div className="absolute inset-2 top-12 bottom-2 overflow-hidden rounded-[2rem]">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`absolute inset-0 transition-all duration-500 ${
                        activeStep === index
                          ? "opacity-100 translate-y-0"
                          : activeStep > index
                          ? "opacity-0 -translate-y-4"
                          : "opacity-0 translate-y-4"
                      }`}
                    >
                      <PhoneScreen step={step} />
                    </div>
                  ))}
                </div>

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-foreground/10 rounded-full" />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

              {/* Step indicator dots */}
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveStep(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeStep === index
                        ? "bg-primary h-6"
                        : "bg-border hover:bg-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
