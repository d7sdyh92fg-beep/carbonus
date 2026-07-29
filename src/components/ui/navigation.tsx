import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/use-translations";
import { getRoute } from "@/utils/routes";
import logo from "@/assets/carbonus-logo-white.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  logo?: string;
}

export function Navigation({ logo: logoProp }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();
  const { t, language } = useTranslations();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (ltPath: string, enPath: string) => 
    location.pathname === ltPath || location.pathname === enPath;

  const handleNavigate = (href: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(href);
  };

  const navItems = [
    { name: t('nav.home'), href: getRoute('home', language), key: 'home' as const },
    { name: t('nav.cars'), href: getRoute('cars', language), key: 'cars' as const },
    { name: t('nav.about'), href: getRoute('about', language), key: 'about' as const },
    { name: t('nav.contact'), href: getRoute('contact', language), key: 'contact' as const },
    { name: t('nav.faq'), href: getRoute('faq', language), key: 'faq' as const },
    { name: t('nav.blog'), href: getRoute('blog', language), key: 'blog' as const },
  ];

  const isActiveRoute = (key: string) => {
    const ltPath = getRoute(key as any, 'lt');
    const enPath = getRoute(key as any, 'en');
    return location.pathname === ltPath || location.pathname === enPath;
  };

  const logoSrc = logoProp || logo;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } bg-[rgba(24,34,31,0.88)] backdrop-blur-[14px] border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.25)]`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="block">
              <img src={logoSrc} alt="Carbonus" className="h-12 sm:h-14 md:h-16 w-auto" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`text-sm font-medium transition-colors hover:text-primary text-white ${
                    isActiveRoute(item.key) ? "border-b-2 border-primary pb-1" : ""
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className={`hidden lg:flex items-center ${user && isAdmin ? "space-x-4" : "ml-auto"}`}>
            <LanguageSwitcher />
            {user && isAdmin && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-white hover:bg-white/10"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    {t('nav.admin')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[rgba(24,34,31,0.92)] backdrop-blur-[14px] border-white/10 text-white">
                  <DropdownMenuItem onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate('/admin');
                  }} className="text-white focus:bg-white/10 focus:text-white">
                    <Shield className="mr-2 h-4 w-4" />
                    {t('nav.adminDashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={signOut} className="text-white focus:bg-white/10 focus:text-white">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-white/10"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[rgba(24,34,31,0.96)] border-t border-white/10">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary block px-3 py-2 text-white/95 ${
                    isActiveRoute(item.key) ? "text-white border-b-2 border-primary pb-1" : ""
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 mt-4 space-y-3">
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
                {user && isAdmin && (
                  <div className="space-y-2">
                    <Link
                      to="/admin"
                      className="text-sm font-medium block px-3 py-2 text-center text-white"
                      onClick={() => {
                        setIsOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      <Shield className="h-4 w-4 inline mr-2" />
                      {t('nav.adminDashboard')}
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        signOut();
                        setIsOpen(false);
                      }}
                      className="w-full text-white hover:text-white hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t('nav.logout')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
