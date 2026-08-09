import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, UserCircle, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo-white.png.asset.json";
import headerLogo from "@/assets/brand-header-car-silhouette.png";

const NAV_COPY = {
  lt: [
    { to: "/", label: "Pradžia" },
    { to: "/automobiliai", label: "Automobiliai" },
    { to: "/apie-mus", label: "Apie mus" },
    { to: "/kontaktai", label: "Kontaktai" },
    { to: "/duk", label: "DUK" },
    { to: "/naujienos", label: "Patarimai ir gidas" },
  ],
  en: [
    { to: "/", label: "Home" },
    { to: "/automobiliai", label: "Cars" },
    { to: "/apie-mus", label: "About us" },
    { to: "/kontaktai", label: "Contact" },
    { to: "/duk", label: "FAQ" },
    { to: "/naujienos", label: "Tips & guide" },
  ],
  ru: [
    { to: "/", label: "Главная" },
    { to: "/automobiliai", label: "Автомобили" },
    { to: "/apie-mus", label: "О нас" },
    { to: "/kontaktai", label: "Контакты" },
    { to: "/duk", label: "ЧаВо" },
    { to: "/naujienos", label: "Советы и гид" },
  ],
} as const;

const MENU_LABEL = { lt: "Meniu", en: "Menu", ru: "Меню" } as const;
const CLOSE_LABEL = { lt: "Uždaryti", en: "Close", ru: "Закрыть" } as const;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { isAdmin } = useAuth();
  const { language, setLanguage } = useLanguage();
  const NAV = NAV_COPY[language] ?? NAV_COPY.lt;
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        setHidden(false);
      } else if (currentScrollY > lastScrollY) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onLightHero = true;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out",
        onLightHero ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_rgba(2,18,20,0.06)]" : "bg-black/25 backdrop-blur-[6px]",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="max-w-[1320px] mx-auto h-[78px] px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" aria-label="Carbonus" style={{ width: 180 }}>
          <img src={onLightHero ? headerLogo : logo.url} alt="Carbonus" className="h-14 w-auto object-contain" />
        </Link>


        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-[30px] text-[14px]">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative py-2 text-[14px] transition-colors duration-200 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--carbonus-green))] focus-visible:ring-offset-2",
                  active
                    ? onLightHero ? "font-semibold text-[hsl(var(--carbonus-dark))]" : "font-semibold text-white"
                    : onLightHero ? "font-medium text-[hsl(var(--carbonus-dark))]/70 hover:text-[hsl(var(--carbonus-dark))]" : "font-medium text-white/80 hover:text-white"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[hsl(var(--carbonus-green))] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-3">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={cn("inline-flex items-center justify-center gap-1.5 h-[40px] w-[70px] px-4 rounded-full text-sm font-medium transition-colors", onLightHero ? "bg-[hsl(var(--carbonus-dark))]/[0.05] border border-[hsl(var(--carbonus-dark))]/10 text-[hsl(var(--carbonus-dark))] hover:bg-[hsl(var(--carbonus-dark))]/10" : "bg-white/[0.06] border border-white/10 text-white hover:bg-white/[0.10]")}>
              {language.toUpperCase()} <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn("w-[var(--radix-dropdown-menu-trigger-width)] p-0 shadow-none rounded-t-none rounded-b-lg", onLightHero ? "bg-white border border-[hsl(var(--carbonus-dark))]/10 border-t-0 text-[hsl(var(--carbonus-dark))]" : "bg-[hsl(var(--carbonus-dark-2))] border border-white/10 border-t-0 text-white")}>
              <DropdownMenuItem onClick={() => setLanguage("lt")} className={cn("justify-center rounded-none focus:text-current", onLightHero ? "focus:bg-[hsl(var(--carbonus-dark))]/10" : "focus:bg-white/10")}>LT</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")} className={cn("justify-center rounded-none focus:text-current", onLightHero ? "focus:bg-[hsl(var(--carbonus-dark))]/10" : "focus:bg-white/10")}>EN</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("ru")} className={cn("justify-center rounded-none focus:text-current", onLightHero ? "focus:bg-[hsl(var(--carbonus-dark))]/10" : "focus:bg-white/10")}>RU</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={() => navigate(isAdmin ? "/admin" : "/auth")}
            className="inline-flex items-center gap-2 h-[40px] px-[18px] rounded-full text-white text-sm font-semibold border border-white/10 bg-gradient-to-br from-[hsl(var(--carbonus-green-dark))] to-[hsl(var(--carbonus-green-deep))] hover:brightness-110 transition"
          >
            <UserCircle className="h-4 w-4" />
            Admin
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn("lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-full", onLightHero ? "bg-[hsl(var(--carbonus-dark))]/[0.05] border border-[hsl(var(--carbonus-dark))]/10 text-[hsl(var(--carbonus-dark))]" : "bg-white/[0.06] border border-white/10 text-white")}
          onClick={() => setMobileOpen(true)}
          aria-label={MENU_LABEL[language] ?? MENU_LABEL.lt}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[hsl(var(--carbonus-dark))] flex flex-col">
          <div className="h-[68px] px-5 flex items-center justify-between border-b border-white/10">
            <img src={logo.url} alt="Carbonus" className="h-10 w-auto" />
            <button onClick={() => setMobileOpen(false)} aria-label={CLOSE_LABEL[language] ?? CLOSE_LABEL.lt} className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 flex flex-col px-6 py-8 gap-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="text-white text-xl font-semibold py-3 border-b border-white/10"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-6 pb-8 flex items-center gap-3">
            <button onClick={() => { setLanguage(language === "lt" ? "en" : language === "en" ? "ru" : "lt"); }} className="flex-1 h-12 rounded-full bg-white/[0.06] border border-white/10 text-white font-medium">
              {language.toUpperCase()}
            </button>
            <button
              onClick={() => { setMobileOpen(false); navigate(isAdmin ? "/admin" : "/auth"); }}
              className="flex-1 h-12 rounded-full text-white font-semibold bg-gradient-to-br from-[hsl(var(--carbonus-green-dark))] to-[hsl(var(--carbonus-green-deep))] inline-flex items-center justify-center gap-2"
            >
              <UserCircle className="h-4 w-4" /> Admin
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
