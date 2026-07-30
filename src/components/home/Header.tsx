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

const NAV = [
  { to: "/", label: "Pradžia" },
  { to: "/automobiliai", label: "Automobiliai" },
  { to: "/apie-mus", label: "Apie mus" },
  { to: "/kontaktai", label: "Kontaktai" },
  { to: "/duk", label: "DUK" },
  { to: "/naujienos", label: "Patarimai ir gidas" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { isAdmin } = useAuth();
  const { language, setLanguage } = useLanguage();
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

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-out",
        "bg-black/25 backdrop-blur-[6px]",
        hidden ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <div className="max-w-[1360px] mx-auto h-[78px] px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0" aria-label="Carbonus" style={{ width: 170 }}>
          <img src={logo.url} alt="Carbonus" className="h-12 w-auto" />
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
                  "relative text-[14px] font-medium transition-colors",
                  active ? "text-white" : "text-white/80 hover:text-white"
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[hsl(var(--carbonus-green))] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right */}
        <div className="hidden lg:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 h-[40px] px-4 rounded-full bg-white/[0.06] border border-white/10 text-white text-sm font-medium hover:bg-white/[0.10] transition-colors">
              {language.toUpperCase()} <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[hsl(var(--carbonus-dark-2))] border-white/10 text-white min-w-[100px]">
              <DropdownMenuItem onClick={() => setLanguage("lt")} className="focus:bg-white/10 focus:text-white">LT</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("en")} className="focus:bg-white/10 focus:text-white">EN</DropdownMenuItem>
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
          className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-full bg-white/[0.06] border border-white/10 text-white"
          onClick={() => setMobileOpen(true)}
          aria-label="Meniu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-[hsl(var(--carbonus-dark))] flex flex-col">
          <div className="h-[68px] px-5 flex items-center justify-between border-b border-white/10">
            <img src={logo.url} alt="Carbonus" className="h-10 w-auto" />
            <button onClick={() => setMobileOpen(false)} aria-label="Uždaryti" className="h-11 w-11 inline-flex items-center justify-center rounded-full bg-white/[0.06] border border-white/10 text-white">
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
            <button onClick={() => { setLanguage(language === "lt" ? "en" : "lt"); }} className="flex-1 h-12 rounded-full bg-white/[0.06] border border-white/10 text-white font-medium">
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
