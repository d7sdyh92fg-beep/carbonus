import { ArrowRight, Star, Facebook, Instagram, Youtube, Send } from "lucide-react";
import logoDark from "@/assets/logo-dark.png.asset.json";

const COLUMNS = [
  { title: "Mūsų paslaugos", links: ["Trumpalaikė nuoma", "Ilgalaikė nuoma", "Nuoma su vairuotoju", "Vestuvėms", "Verslui", "Pervežimai"] },
  { title: "Apie Carbonus", title2: true, links: ["Kodėl Carbonus", "Mūsų istorija", "Karjera", "Spauda", "Reklama"] },
  { title: "Ištekliai", links: ["Patarimai ir gidas", "Pagalbos centras", "DUK", "Partneriams", "Nuomos sutartis", "Privatumo politika"] },
  { title: "Papildomai", links: ["Pasiūlymai", "Draudimas", "Peržiūrėti rezervaciją", "Įmonėms", "Naujienos"] },
];

export function V3Footer() {
  return (
    <footer className="bg-white pb-10 pt-16">
      <div className="mx-auto max-w-[1180px] px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[15px] font-bold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[13px] text-muted-foreground transition-colors hover:text-[hsl(var(--carbonus-green))]">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[15px] font-bold text-foreground">Naujienlaiškis</h3>
            <div className="mt-4 flex overflow-hidden rounded-lg bg-muted">
              <input
                type="email"
                placeholder="El. pašto adresas"
                className="w-full bg-transparent px-3 py-2.5 text-[13px] text-foreground outline-none placeholder:text-muted-foreground"
              />
              <button
                aria-label="Prenumeruoti"
                className="flex w-11 shrink-0 items-center justify-center bg-[hsl(var(--carbonus-green))] text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-6 text-[14px] font-semibold text-foreground">4,9</p>
            <p className="text-[13px] text-muted-foreground">įvertinimas, 320+ klientų</p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[hsl(var(--carbonus-green))] text-[hsl(var(--carbonus-green))]" />
              ))}
            </div>
            <a href="#" className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-foreground underline">
              <Send className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
              Google atsiliepimai
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-border pt-8 md:flex-row md:justify-between">
          <img src={logoDark.url} alt="Carbonus" className="h-6 w-auto" />
          <nav className="flex flex-wrap justify-center gap-6 text-[13px] text-muted-foreground">
            {["Atsiliepimai", "Paslaugos", "Partneriai", "Kontaktai", "Rezervacija"].map((l) => (
              <a key={l} href="#" className="transition-colors hover:text-[hsl(var(--carbonus-green))]">
                {l}
              </a>
            ))}
          </nav>
          <div className="flex gap-3">
            {[Facebook, Instagram, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Socialinis tinklas"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-[hsl(var(--carbonus-green))] hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
