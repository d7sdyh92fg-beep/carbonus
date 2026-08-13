import { Link } from "react-router-dom";
import { ArrowRight, Star, Facebook, Instagram, Send } from "lucide-react";
import footerLogo from "@/assets/brand-footer-carplus.png";
import { useLanguage } from "@/hooks/use-language";

const COPY = {
  lt: {
    columns: [
      { title: "Nuoma", links: [["Visi automobiliai", "/automobiliai"], ["Laisvi automobiliai", "/laisvi-automobiliai"]] },
      { title: "Mūsų autoparkas", links: [["Mercedes-Benz SLK", "/automobiliai/mercedes-benz-slk-nuoma"], ["Hyundai Bayon Cross", "/automobiliai/hyundai-bayon-cross-nuoma"], ["Citroën SpaceTourer", "/automobiliai/citroen-spacetourer-nuoma"], ["KIA CEED 2020", "/automobiliai/kia-ceed-hecbekas-nuoma"]] },
      { title: "Apie Carbonus", links: [["Apie mus", "/apie-mus"], ["Kontaktai", "/kontaktai"], ["DUK", "/duk"]] },
      { title: "Informacija", links: [["Patarimai ir gidas", "/naujienos"], ["Nuomos sutartis", "/nuomos-sutartis"], ["Privatumo politika", "/privatumo-politika"]] },
    ],
    newsletter: "Naujienlaiškis",
    emailPlaceholder: "El. pašto adresas",
    subscribe: "Prenumeruoti",
    rating: "Google įvertinimas",
    reviews: "Google atsiliepimai",
    bottom: [["Pradžia", "/"], ["Automobiliai", "/automobiliai"], ["Apie mus", "/apie-mus"], ["Kontaktai", "/kontaktai"], ["DUK", "/duk"]],
  },
  en: {
    columns: [
      { title: "Rental", links: [["All cars", "/automobiliai"], ["Available cars", "/laisvi-automobiliai"]] },
      { title: "Our fleet", links: [["Mercedes-Benz SLK", "/automobiliai/mercedes-benz-slk-nuoma"], ["Hyundai Bayon Cross", "/automobiliai/hyundai-bayon-cross-nuoma"], ["Citroën SpaceTourer", "/automobiliai/citroen-spacetourer-nuoma"], ["KIA CEED 2020", "/automobiliai/kia-ceed-hecbekas-nuoma"]] },
      { title: "About Carbonus", links: [["About us", "/apie-mus"], ["Contact", "/kontaktai"], ["FAQ", "/duk"]] },
      { title: "Information", links: [["Tips & guide", "/naujienos"], ["Rental agreement", "/nuomos-sutartis"], ["Privacy policy", "/privatumo-politika"]] },
    ],
    newsletter: "Newsletter",
    emailPlaceholder: "Email address",
    subscribe: "Subscribe",
    rating: "Google rating",
    reviews: "Google reviews",
    bottom: [["Home", "/"], ["Cars", "/automobiliai"], ["About us", "/apie-mus"], ["Contact", "/kontaktai"], ["FAQ", "/duk"]],
  },
  ru: {
    columns: [
      { title: "Аренда", links: [["Все автомобили", "/automobiliai"], ["Свободные автомобили", "/laisvi-automobiliai"]] },
      { title: "Наш автопарк", links: [["Mercedes-Benz SLK", "/automobiliai/mercedes-benz-slk-nuoma"], ["Hyundai Bayon Cross", "/automobiliai/hyundai-bayon-cross-nuoma"], ["Citroën SpaceTourer", "/automobiliai/citroen-spacetourer-nuoma"], ["KIA CEED 2020", "/automobiliai/kia-ceed-hecbekas-nuoma"]] },
      { title: "О Carbonus", links: [["О нас", "/apie-mus"], ["Контакты", "/kontaktai"], ["ЧаВо", "/duk"]] },
      { title: "Информация", links: [["Советы и гид", "/naujienos"], ["Договор аренды", "/nuomos-sutartis"], ["Политика конфиденциальности", "/privatumo-politika"]] },
    ],
    newsletter: "Рассылка",
    emailPlaceholder: "Адрес эл. почты",
    subscribe: "Подписаться",
    rating: "Рейтинг Google",
    reviews: "Отзывы Google",
    bottom: [["Главная", "/"], ["Автомобили", "/automobiliai"], ["О нас", "/apie-mus"], ["Контакты", "/kontaktai"], ["ЧаВо", "/duk"]],
  },
} as const;

export function V3Footer() {
  const { language } = useLanguage();
  const c = COPY[language] ?? COPY.lt;
  const COLUMNS = c.columns.map((col) => ({ title: col.title, links: col.links.map(([label, to]) => ({ label, to })) }));
  const BOTTOM_LINKS = c.bottom.map(([label, to]) => ({ label, to }));
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
                    <Link to={link.to} className="text-[13px] text-foreground/80 transition-colors duration-200 hover:text-[hsl(var(--carbonus-green))]">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-[15px] font-bold text-foreground">{c.newsletter}</h3>
            <div className="mt-4 flex overflow-hidden rounded-lg bg-muted">
              <input
                type="email"
                aria-label={c.newsletter}
                placeholder={c.emailPlaceholder}
                className="w-full bg-transparent px-3 py-2.5 text-[13px] text-foreground outline-none placeholder:text-foreground/60"
              />
              <button
                aria-label={c.subscribe}
                className="flex w-11 shrink-0 items-center justify-center bg-[hsl(var(--carbonus-green))] text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-6 text-[16px] font-bold text-foreground">5,0</p>
            <p className="text-[13px] text-foreground/80">{c.rating}</p>
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
              {c.reviews}
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-border pt-8 md:flex-row md:justify-between">
          <img src={footerLogo} alt="Carbonus" className="h-9 w-auto sm:h-10" />
          <nav className="flex flex-wrap justify-center gap-6 text-[13px] text-foreground/80">
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
