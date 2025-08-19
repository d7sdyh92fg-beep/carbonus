import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  const handleLinkClick = (link: string) => {
    if (link === "Automobiliai") {
      navigate('/automobiliai');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === "Pradžia") {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === "Apie mus") {
      navigate('/apie-mus');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === "Privatumo politika") {
      navigate('/privatumo-politika');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === "Nuomos sąlygos") {
      navigate('/nuomos-salygos');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // For other links, scroll to sections or handle as needed
      console.log(`Navigate to: ${link}`);
    }
  };

  return (
    <footer className="bg-gray-100 text-foreground">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img 
              src="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" 
              alt="Carbonus Logo" 
              className="h-36 mb-6"
            />
            <p className="text-muted-foreground mb-6 max-w-md">
              Patirkite aukščiausią pasirinkimo laisvę su aukščiausios klasės automobilių nuoma. 
              Jūsų kelionė, jūsų automobilis, jūsų būdas.
            </p>
            <div className="mt-4 max-w-sm">
              <p className="text-muted-foreground text-sm mb-3">
                Prenumeruoti naujienlaiškį
              </p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Įveskite el. paštą"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary"
                />
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-0 whitespace-nowrap"
                >
                  Prenumeruoti
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Nuorodos</h4>
            <ul className="space-y-2">
              {["Pradžia", "Automobiliai", "Apie mus", "Kontaktai", "DUK"].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Pagalba</h4>
            <ul className="space-y-2">
              {["Nuomos sąlygos", "Privatumo politika"].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => handleLinkClick(link)}
                    className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border mt-12 pt-8">
          <p className="text-muted-foreground text-sm">
            © 2024 Carbonus. Visos teisės saugomos.
          </p>
        </div>
      </div>
    </footer>
  );
}