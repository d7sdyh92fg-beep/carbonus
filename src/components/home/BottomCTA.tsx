import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, CarFront, RefreshCcw } from "lucide-react";
import ctaSuv from "@/assets/cta-suv.jpg";

export function BottomCTA() {
  const navigate = useNavigate();
  return (
    <section className="bg-white pt-4 pb-[44px]">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] rounded-[18px] overflow-hidden shadow-[0_18px_55px_rgba(6,25,27,0.16)] bg-[hsl(var(--carbonus-dark-2))] min-h-[250px]">
          <div className="relative min-h-[220px] lg:min-h-[250px]">
            <img src={ctaSuv} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[hsl(var(--carbonus-dark-2))]" />
          </div>
          <div className="p-8 md:p-10 flex flex-col justify-center text-white" style={{ background: "linear-gradient(135deg,#0A2729 0%,#061719 100%)" }}>
            <h2 className="font-extrabold leading-[1.12]" style={{ fontSize: "clamp(28px, 3.4vw, 38px)" }}>
              Pasiruošę <span className="text-[hsl(var(--carbonus-green))]">kelionei?</span>
            </h2>
            <p className="mt-3 text-white/75 max-w-[390px] text-[15px]">
              Užsisakykite automobilį jau dabar ir mėgaukitės patogia kelione be rūpesčių.
            </p>
            <div>
              <button
                onClick={() => navigate("/automobiliai")}
                className="mt-6 inline-flex items-center gap-2 h-[46px] px-6 rounded-lg text-white text-sm font-bold bg-gradient-to-br from-[hsl(var(--carbonus-green))] to-[hsl(var(--carbonus-green-hover))] hover:brightness-110 transition"
              >
                Užsakyti dabar <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-7 gap-y-2 text-[12px] text-white/80">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-[hsl(var(--carbonus-green))]" /> Geriausios kainos</span>
              <span className="inline-flex items-center gap-1.5"><CarFront className="h-4 w-4 text-[hsl(var(--carbonus-green))]" /> Nauji automobiliai</span>
              <span className="inline-flex items-center gap-1.5"><RefreshCcw className="h-4 w-4 text-[hsl(var(--carbonus-green))]" /> Lankstus atšaukimas</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
