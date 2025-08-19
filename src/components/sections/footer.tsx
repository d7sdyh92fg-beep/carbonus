import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  const handleLinkClick = (link: string) => {
    if (link === "Automobiliai") {
      navigate('/automobiliai');
    } else if (link === "Pradžia") {
      navigate('/');
    } else {
      // For other links, scroll to sections or handle as needed
      console.log(`Navigate to: ${link}`);
    }
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img 
              src="/lovable-uploads/f307c05e-658c-4866-b3eb-8b9d71719579.png" 
              alt="Carbonus Logo" 
              className="h-8 mb-4"
            />
            <p className="text-background/80 mb-6 max-w-md">
              Patirkite aukščiausią pasirinkimo laisvę su aukščiausios klasės automobilių nuoma. 
              Jūsų kelionė, jūsų automobilis, jūsų būdas.
            </p>
            <div className="mt-4 max-w-sm">
              <p className="text-background/60 text-sm mb-3">
                Prenumeruoti naujienlaiškį
              </p>
              <div className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Įveskite el. paštą"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/60 focus:border-background"
                />
                <Button 
                  className="bg-black text-white hover:bg-gray-800 border-0 whitespace-nowrap"
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
                    className="text-background/80 hover:text-primary transition-colors duration-200 text-left"
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
              {["Sąlygos", "Privatumas"].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => console.log(`Navigate to: ${link}`)}
                    className="text-background/80 hover:text-primary transition-colors duration-200 text-left"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/20 mt-12 pt-8">
          <p className="text-background/60 text-sm">
            © 2024 Carbonus. Visos teisės saugomos.
          </p>
        </div>
      </div>
    </footer>
  );
}