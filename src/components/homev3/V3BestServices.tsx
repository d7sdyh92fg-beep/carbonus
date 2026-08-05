import servicesCar from "@/assets/homev3-car-services.png";
import { Tag, Wallet, Headphones } from "lucide-react";

const ITEMS = [
  {
    icon: Tag,
    title: "Pasiūlymai kiekvienam biudžetui",
    text: "Konkurencingos kainos nuo ekonomiškų iki premium klasės automobilių.",
  },
  {
    icon: Wallet,
    title: "Geriausios kainos garantija",
    text: "Radote pigiau? Pasiūlysime tokią pačią arba geresnę kainą.",
  },
  {
    icon: Headphones,
    title: "Pagalba 24/7",
    text: "Susisiekite bet kuriuo paros metu – padėsime kelyje ir konsultuosime.",
  },
];

export function V3BestServices() {
  return (
    <section className="overflow-hidden bg-white py-16 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 lg:grid-cols-2">
        <div className="relative lg:-ml-[22%] lg:w-[122%]">
          <img
            src={servicesCar}
            alt="Carbonus nuomos automobilis"
            loading="lazy"
            width={1408}
            height={1008}
            className="w-full drop-shadow-[0_30px_28px_rgba(0,0,0,0.22)]"
          />
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Geriausios paslaugos
          </p>
          <h2 className="mt-3 max-w-[420px] text-[28px] font-extrabold leading-[1.2] tracking-tight text-foreground sm:text-[32px]">
            Patirkite geriausią nuomos patirtį su Carbonus
          </h2>
          <div className="mt-5 h-[3px] w-10 rounded-full bg-[hsl(var(--carbonus-green))]" />

          <div className="mt-9 space-y-7">
            {ITEMS.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <item.icon className="h-5 w-5 text-[hsl(var(--carbonus-green))]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 max-w-[320px] text-[13px] leading-relaxed text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
