import { V3StoreButtons } from "./V3StoreButtons";
import mercedesSlk from "@/assets/mercedes-slk-side-clean.png";
import citroen from "@/assets/citroen-spacetourer-side-clean.png";

export function V3AppCta() {
  return (
    <section className="bg-white pb-8 pt-16 lg:pb-16">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="relative grid gap-8 rounded-[24px] bg-[hsl(var(--carbonus-green-dark))] px-8 py-12 lg:grid-cols-2 lg:px-14 lg:py-16">
          {/* tread + dashes */}
          <div
            className="pointer-events-none absolute right-16 top-0 h-full w-[240px] rotate-[18deg] opacity-[0.08]"
            style={{
              backgroundImage: "repeating-linear-gradient(90deg,#fff 0 12px,transparent 12px 30px)",
              maskImage: "repeating-linear-gradient(0deg,#000 0 16px,transparent 16px 28px)",
              WebkitMaskImage: "repeating-linear-gradient(0deg,#000 0 16px,transparent 16px 28px)",
            }}
          />
          <div className="pointer-events-none absolute bottom-10 left-8 grid grid-cols-5 gap-2 opacity-20">
            {Array.from({ length: 20 }).map((_, i) => (
              <span key={i} className="block h-3 w-[3px] rounded-full bg-white" />
            ))}
          </div>

          <div className="relative">
            <h2 className="max-w-[320px] text-[28px] font-extrabold leading-[1.2] text-white sm:text-[32px]">
              Atsisiųskite nemokamą Carbonus programėlę
            </h2>
            <p className="mt-4 text-[13px] text-white/80">
              Greitesnė rezervacija ir išskirtiniai pasiūlymai.
            </p>
            <div className="mt-7">
              <V3StoreButtons variant="onColor" />
            </div>
          </div>

          {/* phone mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="w-[240px] rounded-[34px] border-[8px] border-[hsl(var(--carbonus-dark))] bg-card p-3 shadow-[0_30px_60px_rgba(0,0,0,0.3)] lg:absolute lg:-top-32 lg:right-6">
              <p className="mt-2 px-1 text-[18px] font-bold leading-tight text-foreground">
                Rinkitės
                <br />
                automobilį
              </p>
              <div className="mt-4 space-y-3">
                {[
                  { name: "Mercedes-Benz SLK", price: "79 €", img: mercedesSlk },
                  { name: "Citroën SpaceTourer", price: "69 €", img: citroen },
                ].map((c) => (
                  <div key={c.name} className="rounded-2xl bg-muted p-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground">{c.name}</span>
                      <span className="font-bold text-[hsl(var(--carbonus-green))]">
                        {c.price}
                        <span className="font-normal text-muted-foreground">/d.</span>
                      </span>
                    </div>
                    <img src={c.img} alt={c.name} loading="lazy" className="mt-2 w-full object-contain" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
