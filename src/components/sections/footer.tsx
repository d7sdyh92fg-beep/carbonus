import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Klaida",
        description: "Prašome įvesti teisingą el. pašto adresą",
        variant: "destructive",
      });
      return;
    }

    setIsSubscribing(true);

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-newsletter', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      if (data.success) {
        toast({
          title: "Sėkmingai užsiprenumeravote!",
          description: data.message || "Patikrinkite savo el. paštą dėl patvirtinimo.",
        });
        setEmail(''); // Clear the input
      } else {
        toast({
          title: "Klaida",
          description: data.error || "Nepavyko užsiprenumeruoti.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: "Klaida",
        description: "Nepavyko užsiprenumeruoti. Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

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
    } else if (link === "Kontaktai") {
      navigate('/kontaktai');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === "DUK") {
      navigate('/duk');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === "Privatumo politika") {
      navigate('/privatumo-politika');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === "Nuomos sutartis") {
      navigate('/nuomos-sutartis');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (link === "Patarimai ir gidas") {
      navigate('/naujienos');
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
              className="h-16 md:h-24 lg:h-36 mb-6"
            />
            <p className="text-muted-foreground mb-6 max-w-md">
              Patirkite aukščiausią pasirinkimo laisvę su premium automobilių nuoma Druskininkuose. 
              Nuomokite vietoje, vairuokite visoje Lietuvoje - jūsų kelionė, jūsų automobilis, jūsų būdas.
            </p>
            <div className="mt-4 max-w-sm">
              <p className="text-muted-foreground text-sm mb-3">
                Prenumeruoti naujienlaiškį
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder="Įveskite el. paštą"
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing}
                  required
                />
                <Button 
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 border-0 whitespace-nowrap"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? 'Siunčiama...' : 'Prenumeruoti'}
                </Button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Nuorodos</h4>
            <ul className="space-y-2">
              {["Pradžia", "Automobiliai", "Apie mus", "Kontaktai", "DUK", "Patarimai ir gidas"].map((link) => (
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
              {["Privatumo politika", "Nuomos sutartis"].map((link) => (
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

        {/* Company Information */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Company Details */}
            <div>
              <h4 className="font-semibold mb-3 text-primary">UAB „Carbonus"</h4>
              <div className="text-muted-foreground text-sm space-y-1">
                <p>Įmonės kodas: 307196558</p>
                <p>Adresas: Neravų g. 2A-6, Neravų k, LT-66412 Druskininkai</p>
                <p>Telefonas: +370 6 98 18 781</p>
                <p>El. paštas: info@carbonus.lt</p>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="flex items-end">
              <p className="text-muted-foreground text-sm">
                © 2024 Carbonus. Visos teisės saugomos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}