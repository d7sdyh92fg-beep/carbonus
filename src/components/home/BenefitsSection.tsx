import { ShieldCheck, CarFront, Tags, Headphones } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Lengvas užsakymas", text: "Paprastas, greitas ir lankstus užsakymo procesas. Vos keli žingsniai ir viskas paruošta kelionei." },
  { icon: CarFront, title: "Kokybė ir įvairovė", text: "Aukščiausios klasės ir patikimumo automobiliai įvairiems poreikiams – nuo savaitgaliui iki ilgesnėms kelionėms." },
  { icon: Tags, title: "Skaidrios kainos", text: "Konkurencingi tarifai be paslėptų mokesčių. Ką matote – tą ir mokate." },
  { icon: Headphones, title: "Klientų palaikymas", text: "Esame pasiekiami 24/7. Patarsime, padėsime ir pasirūpinsime, kad kelionė būtų sklandi." },
];

export function BenefitsSection() {
  return (
    <section className="border-t border-[#E2EAE5] py-[72px] md:py-[88px]" style={{ background: "linear-gradient(180deg,#F4F9F6 0%,#FFFFFF 100%)" }}>
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 text-center">

        <div className="text-[13px] uppercase tracking-[0.12em] font-bold text-[hsl(var(--carbonus-green))]">
          Kodėl verta rinktis Carbonus?!
        </div>
        <h2 className="mt-2.5 font-extrabold text-[#12191A]" style={{ fontSize: "clamp(28px, 3.6vw, 36px)" }}>
          Patikima nuoma be rūpesčių
        </h2>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-9 md:gap-12">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <div className="mx-auto h-[84px] w-[84px] rounded-full bg-white border border-[#E2EAE5] shadow-[0_12px_30px_rgba(18,35,29,0.10)] flex items-center justify-center">
                <span className="inline-flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[hsl(var(--carbonus-green-soft))]">
                  <Icon className="h-6 w-6 text-[hsl(var(--carbonus-green-dark))]" aria-hidden />
                </span>
              </div>
              <h3 className="mt-5 text-[17px] font-bold text-[#12191A]">{title}</h3>
              <p className="mt-2.5 text-[14px] leading-[1.65] text-[#4D5959]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

