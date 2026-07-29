import { ShieldCheck, CarFront, Tags, Headphones } from "lucide-react";

const items = [
  { icon: ShieldCheck, title: "Lengvas užsakymas", text: "Paprastas, greitas ir lankstus užsakymo procesas. Vos keli žingsniai ir viskas paruošta kelionei." },
  { icon: CarFront, title: "Kokybė ir įvairovė", text: "Aukščiausios klasės ir patikimumo automobiliai įvairiems poreikiams – nuo savaitgaliui iki ilgesnėms kelionėms." },
  { icon: Tags, title: "Skaidrios kainos", text: "Konkurencingi tarifai be paslėptų mokesčių. Ką matote – tą ir mokate." },
  { icon: Headphones, title: "Klientų palaikymas", text: "Esame pasiekiami 24/7. Patarsime, padėsime ir pasirūpinsime, kad kelionė būtų sklandi." },
];

export function BenefitsSection() {
  return (
    <section className="border-t border-[#EDF1EF] py-[66px] md:py-[78px]" style={{ background: "linear-gradient(180deg,#F7FAF8 0%,#FFFFFF 100%)" }}>
      <div className="max-w-[1360px] mx-auto px-6 md:px-12 text-center">

        <div className="text-[12px] uppercase tracking-[0.10em] font-bold text-[hsl(var(--carbonus-green))]">
          Kodėl verta rinktis Carbonus?!
        </div>
        <h2 className="mt-2 font-extrabold text-[#12191A]" style={{ fontSize: "clamp(28px, 3.6vw, 36px)" }}>
          Patikima nuoma be rūpesčių
        </h2>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-11">
          {items.map(({ icon: Icon, title, text }) => (
            <div key={title} className="text-center">
              <div className="mx-auto h-[70px] w-[70px] rounded-full bg-white border border-[#E2EAE5] shadow-[0_10px_25px_rgba(18,35,29,0.06)] flex items-center justify-center">
                <span className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[hsl(var(--carbonus-green-soft))]">
                  <Icon className="h-5 w-5 text-[hsl(var(--carbonus-green))]" aria-hidden />
                </span>
              </div>
              <h3 className="mt-4 text-[15px] font-bold text-[#12191A]">{title}</h3>
              <p className="mt-2 text-[13px] leading-[1.6] text-[#687374]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
