import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { Menu, X, User, LogOut, Shield } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { useAuth } from "@/contexts/AuthContext";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleNavigate = (href: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigate(href);
  };

  const navItems = [
    { name: "Pradžia", href: "/" },
    { name: "Automobiliai", href: "/automobiliai" },
    { name: "Apie mus", href: "/apie-mus" },
    { name: "DUK", href: "/duk" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent md:bg-background/80 backdrop-blur-md border-b-0 md:border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="block">
              {logo ? (
                <img src={logo} alt="Carbonus" className="h-12 sm:h-14 md:h-16 w-auto" />
              ) : (
                <span className="text-2xl font-bold text-primary">CARBONUS.</span>
              )}
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href)
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <LanguageSwitcher />
            {user && isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate('/admin');
                  }}>
                    <Shield className="mr-2 h-4 w-4" />
                    Skydelis
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Atsijungti
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background border-t">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary block px-3 py-2 ${
                    isActive(item.href) ? "text-primary" : "text-foreground"
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
                      Admin Skydelis
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
                      Atsijungti
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