import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "@/hooks/use-translations";
import { getRoute } from "@/utils/routes";
import logoWhite from "@/assets/logo-white.png";
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

export function Navigation({ logo }: NavigationProps) {
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

  const isHome = location.pathname === '/';
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${
        isHome
          ? "bg-[rgba(8,18,15,0.35)] backdrop-blur-xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
          : "bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-sm"
      }`}>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="block">
              {isHome ? (
                <img src={logoWhite} alt="Carbonus" className="h-12 sm:h-14 md:h-16 w-auto" />
              ) : logo ? (
                <img src={logo} alt="Carbonus" className="h-12 sm:h-14 md:h-16 w-auto" />
              ) : (
                <span className="text-2xl font-bold text-primary">CARBONUS.</span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActiveRoute(item.key)
                      ? isHome
                        ? "text-white border-b-2 border-primary pb-1"
                        : "text-primary border-b-2 border-primary pb-1"
                      : isHome ? "text-white" : "text-foreground"
                  }`}

                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <LanguageSwitcher />
            {user && isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    {t('nav.admin')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate('/admin');
                  }}>
                    <Shield className="mr-2 h-4 w-4" />
                    {t('nav.adminDashboard')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
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
              className={isHome ? "text-white hover:bg-white/10" : "text-foreground"}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary block px-3 py-2 ${
                    isActiveRoute(item.key) ? "text-primary" : "text-foreground"
                  }`}
                  onClick={() => {
                    setIsOpen(false);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 border-t mt-4 space-y-3">
                <div className="flex justify-center">
                  <LanguageSwitcher />
                </div>
                {user && isAdmin && (
                  <div className="space-y-2">
                    <Link
                      to="/admin"
                      className="text-sm font-medium block px-3 py-2 text-center"
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
                      className="w-full"
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