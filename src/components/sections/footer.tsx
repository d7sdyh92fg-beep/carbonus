import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Instagram } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";
import { getRoute } from "@/utils/routes";

export function Footer() {
  const navigate = useNavigate();
  const { t, language } = useTranslations();

  const handleLinkClick = (routeKey: keyof typeof import('@/utils/routes').routes) => {
    const path = getRoute(routeKey, language);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <img
              src="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png"
              alt="Carbonus"
              className="h-14 mb-5"
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              Modernios automobilių nuomos paslaugos Druskininkuose ir visoje Lietuvoje.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-black/[0.04] hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-black/[0.04] hover:bg-primary hover:text-primary-foreground text-foreground flex items-center justify-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[13px] font-semibold text-primary uppercase tracking-wider mb-4">Greita navigacija</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => handleLinkClick("home")} className="text-muted-foreground hover:text-primary transition-colors">Pradžia</button></li>
              <li><button onClick={() => handleLinkClick("cars")} className="text-muted-foreground hover:text-primary transition-colors">Automobiliai</button></li>
              <li><button onClick={() => handleLinkClick("about")} className="text-muted-foreground hover:text-primary transition-colors">Apie mus</button></li>
              <li><button onClick={() => handleLinkClick("contact")} className="text-muted-foreground hover:text-primary transition-colors">Kontaktai</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-[13px] font-semibold text-primary uppercase tracking-wider mb-4">Pagalba</h4>
            <ul className="space-y-2.5 text-sm">
              <li><button onClick={() => handleLinkClick("faq")} className="text-muted-foreground hover:text-primary transition-colors">DUK</button></li>
              <li><button onClick={() => handleLinkClick("privacy")} className="text-muted-foreground hover:text-primary transition-colors">Privatumo politika</button></li>
              <li><button onClick={() => handleLinkClick("leaseAgreement")} className="text-muted-foreground hover:text-primary transition-colors">Nuomos sutartis</button></li>
              <li><button onClick={() => handleLinkClick("blog")} className="text-muted-foreground hover:text-primary transition-colors">Patarimai ir gidas</button></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-[13px] font-semibold text-primary uppercase tracking-wider mb-4">MB Carbonus</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary shrink-0" /><a href="tel:+37061819417" className="hover:text-primary transition-colors">+370 618 19 417</a></li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary shrink-0" /><a href="mailto:info@carbonus.lt" className="hover:text-primary transition-colors">info@carbonus.lt</a></li>
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary shrink-0" /><span>Druskininkai, Lietuva</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black/5 mt-10 pt-6 text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Carbonus. Visos teisės saugomos.</p>
        </div>
      </div>
    </footer>
  );
}
