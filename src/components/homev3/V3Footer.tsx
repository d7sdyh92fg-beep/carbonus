import { Link } from "react-router-dom";
import { ArrowRight, Star, Facebook, Instagram, Send } from "lucide-react";
import footerLogo from "@/assets/brand-footer-carplus.png";

const COLUMNS = [
  {
    title: "Nuoma",
    links: [
      { label: "Visi automobiliai", to: "/automobiliai" },
      { label: "Laisvi automobiliai", to: "/laisvi-automobiliai" },
    ],
  },
  {
    title: "Mūsų autoparkas",
    links: [
      { label: "Mercedes-Benz SLK", to: "/automobiliai/mercedes-benz-slk-nuoma" },
      { label: "Hyundai Bayon Cross", to: "/automobiliai/hyundai-bayon-cross-nuoma" },
      { label: "Citroën SpaceTourer", to: "/automobiliai/citroen-spacetourer-nuoma" },
      { label: "KIA CEED 2020", to: "/automobiliai/kia-ceed-hecbekas-nuoma" },
    ],
  },
  {
    title: "Apie Carbonus",
    links: [
      { label: "Apie mus", to: "/apie-mus" },
      { label: "Kontaktai", to: "/kontaktai" },
      { label: "DUK", to: "/duk" },
    ],
  },
  {
    title: "Informacija",
    links: [
      { label: "Patarimai ir gidas", to: "/naujienos" },
      { label: "Nuomos sutartis", to: "/nuomos-sutartis" },
      { label: "Privatumo politika", to: "/privatumo-politika" },
    ],
  },
];

const BOTTOM_LINKS = [
  { label: "Pradžia", to: "/" },
  { label: "Automobiliai", to: "/automobiliai" },
  { label: "Apie mus", to: "/apie-mus" },
  { label: "Kontaktai", to: "/kontaktai" },
  { label: "DUK", to: "/duk" },
];

export function V3Footer() {
  return (
    <footer className="bg-white pb-10 pt-14">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[15px] font-bold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-[13px] text-muted-foreground transition-colors hover:text-[hsl(var(--carbonus-green))]">
                      {link.label}
                    </Link>
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

            <p className="mt-6 text-[16px] font-bold text-foreground">5,0</p>
            <p className="text-[13px] text-muted-foreground">Google įvertinimas</p>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-[hsl(var(--carbonus-green))] text-[hsl(var(--carbonus-green))]" />
              ))}
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Carbonus+Druskininkai"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[13px] font-medium text-foreground underline"
            >
              <Send className="h-4 w-4 text-[hsl(var(--carbonus-green))]" />
              Google atsiliepimai
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-border pt-8 md:flex-row md:justify-between">
          <img src={footerLogo} alt="Carbonus" className="h-9 w-auto sm:h-10" />
          <nav className="flex flex-wrap justify-center gap-6 text-[13px] text-muted-foreground">
            {BOTTOM_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="transition-colors hover:text-[hsl(var(--carbonus-green))]">
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-3">
            {[
              { Icon: Facebook, label: "Facebook", href: "https://www.facebook.com/profile.php?id=61578519851950" },
              { Icon: Instagram, label: "Instagram", href: "https://www.instagram.com/carbonusautonuoma/" },
            ].map(({ Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
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
