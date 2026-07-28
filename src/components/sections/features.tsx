import { ShieldCheck, Car, Tag, Headphones } from "lucide-react";

export function Features() {
  const items = [
    { icon: ShieldCheck, title: "Lengvas užsakymas", desc: "Paprastas, greitas ir lankstus užsakymo procesas. Vos keli žingsniai ir viskas paruošta kelionei." },
    { icon: Car, title: "Kokybė ir įvairovė", desc: "Aukščiausios klasės ir patikimumo automobilių įvairovės poreikiams – nuo savaitgalio iki ilgesnių kelionėms." },
    { icon: Tag, title: "Skaidrios kainos", desc: "Konkurencingi tarifai be paslėptų mokesčių. Ką matote – tą ir mokate." },
    { icon: Headphones, title: "Klientų palaikymas", desc: "Esame pasiekiami 24/7. Patarsime, padėsime ir pasirūpinsime, kad kelionė būtų sklandi." },
  ];

  return (
    <section className="py-16 md:py-24 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[11px] font-semibold text-primary uppercase tracking-[0.2em] mb-3">
            Kodėl verta rinktis Carbonus?!
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-[38px] font-bold text-foreground">
            Patikima nuoma be rūpesčių
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {items.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] flex items-center justify-center mb-6">
                <Icon className="h-8 w-8 text-primary" strokeWidth={1.8} />
              </div>
              <h3 className="text-[17px] font-semibold text-foreground mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[240px]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
