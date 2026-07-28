import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Tag, Sparkles, ShieldCheck } from "lucide-react";
import carMustang from "@/assets/car-mustang.jpg";

export function CTA() {
  const navigate = useNavigate();

  const chips = [
    { icon: Tag, label: "Geriausios kainos" },
    { icon: Sparkles, label: "Nauji automobiliai" },
    { icon: ShieldCheck, label: "Lankstus atlaikimas" },
  ];

  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-[#0E1512] min-h-[280px] md:min-h-[320px] flex items-stretch">
          {/* Car image left */}
          <div className="absolute inset-y-0 left-0 w-full md:w-[55%]">
            <img src={carMustang} alt="" className="w-full h-full object-cover" />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(14,21,18,0.35) 0%, rgba(14,21,18,0.55) 55%, #0E1512 92%)',
              }}
            />
          </div>

          {/* Content right */}
          <div className="relative z-10 w-full md:w-1/2 md:ml-auto p-8 md:p-12 lg:p-14 flex flex-col justify-center text-white">
            <h2 className="text-3xl md:text-4xl lg:text-[38px] font-bold leading-tight">
              Pasiruošę <span className="text-primary">kelionei</span>?
            </h2>
            <p className="mt-4 text-white/75 text-sm md:text-base max-w-md">
              Užsisakykite automobilį jau dabar ir mėgaukitės patogia kelione be rūpesčių.
            </p>
            <div className="mt-6">
              <Button
                onClick={() => { navigate('/automobiliai'); setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100); }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full h-11 px-6 gap-2 font-semibold"
              >
                Užsakyti dabar <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chips row below */}
        <div className="mt-6 flex flex-wrap justify-center gap-3 md:gap-8 text-sm text-muted-foreground">
          {chips.map(({ icon: Icon, label }) => (
            <div key={label} className="inline-flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
