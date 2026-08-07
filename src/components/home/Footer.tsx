import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo-white.png.asset.json";

export function Footer() {
  return (
    <footer className="relative bg-[#07191C] text-white pt-14 pb-6 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-[hsl(var(--carbonus-green)/0.08)] blur-[120px]" />
      <div className="relative max-w-[1360px] mx-auto px-6 md:px-12">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 lg:gap-[70px]">
          <div>
            <img src={logo.url} alt="Carbonus" className="h-12 w-auto" />
            <p className="mt-4 text-[13px] text-white/70 max-w-[260px]">
              Modernios automobilių nuomos paslaugos Druskininkuose ir visoje Lietuvoje.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a href="https://www.facebook.com/profile.php?id=61578519851950" aria-label="Facebook" className="h-[30px] w-[30px] inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 hover:text-[hsl(var(--carbonus-green))] transition">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="https://www.instagram.com/carbonusautonuoma/" aria-label="Instagram" className="h-[30px] w-[30px] inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 hover:text-[hsl(var(--carbonus-green))] transition">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          <FooterCol title="Greita navigacija" links={[
            { to: "/", label: "Pradžia" },
            { to: "/automobiliai", label: "Automobiliai" },
            { to: "/apie-mus", label: "Apie mus" },
            { to: "/kontaktai", label: "Kontaktai" },
          ]} />
          <FooterCol title="Pagalba" links={[
            { to: "/duk", label: "DUK" },
            { to: "/privatumo-politika", label: "Privatumo politika" },
            { to: "/nuomos-sutartis", label: "Nuomos sutartis" },
            { to: "/naujienos", label: "Patarimai ir gidas" },
          ]} />
          <div>
            <h4 className="text-sm font-bold text-[hsl(var(--carbonus-green))] mb-4">MB Carbonus</h4>
            <ul className="space-y-3 text-[13px] text-white/70">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[hsl(var(--carbonus-green))]" /> <a href="tel:+37061819417" className="hover:text-white">+370 618 19 417</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[hsl(var(--carbonus-green))]" /> <a href="mailto:info@carbonus.lt" className="hover:text-white">info@carbonus.lt</a></li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[hsl(var(--carbonus-green))]" /> Druskininkai, Lietuva</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-white/10 text-center text-[12px] text-white/50">
          © {new Date().getFullYear()} Carbonus. Visos teisės saugomos.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="text-sm font-bold text-[hsl(var(--carbonus-green))] mb-4">{title}</h4>
      <ul className="space-y-2.5 text-[13px] text-white/70">
        {links.map((l) => (
          <li key={l.to}><Link to={l.to} className="hover:text-white transition-colors">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
