import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslations } from "@/hooks/use-translations";
import { getRoute } from "@/utils/routes";

export function Footer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useTranslations();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: t('common.messages.error'),
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
          title: t('common.messages.newsletterSuccess'),
          description: data.message || t('common.messages.newsletterCheck'),
        });
        setEmail(''); // Clear the input
      } else {
        toast({
          title: t('common.messages.error'),
          description: data.error || "Nepavyko užsiprenumeruoti.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error("Newsletter subscription error:", error);
      toast({
        title: t('common.messages.error'),
        description: "Nepavyko užsiprenumeruoti. Bandykite dar kartą.",
        variant: "destructive",
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleLinkClick = (routeKey: keyof typeof import('@/utils/routes').routes) => {
    const path = getRoute(routeKey, language);
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#07191C] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <img 
              src="/__l5e/assets-v1/eb52b609-dc60-4b38-b63c-1e1348dc083a/logo-white.png" 
              alt="Carbonus Logo" 
              className="h-16 md:h-24 lg:h-36 mb-6"
            />
            <p className="text-white/70 mb-6 max-w-md">
              {t('footer.brand.description')}
            </p>
            <div className="mt-4 max-w-sm">
              <p className="text-white/70 text-sm mb-3">
                {t('footer.newsletter.title')}
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input 
                  type="email" 
                  placeholder={t('footer.newsletter.placeholder')}
                  className="bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-[hsl(var(--carbonus-green))]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubscribing}
                  required
                />
                <Button 
                  type="submit"
                  className="bg-[hsl(var(--carbonus-green))] text-white hover:bg-[hsl(var(--carbonus-green-dark))] border-0 whitespace-nowrap"
                  disabled={isSubscribing}
                >
                  {isSubscribing ? t('common.buttons.sending') : t('footer.newsletter.subscribe')}
                </Button>
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">{t('footer.quickLinks.title')}</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleLinkClick("home")} className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left">
                  {t('footer.quickLinks.home')}
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("cars")} className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left">
                  {t('footer.quickLinks.cars')}
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("about")} className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left">
                  {t('footer.quickLinks.about')}
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("contact")} className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left">
                  {t('footer.quickLinks.contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">{t('footer.support.title')}</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => handleLinkClick("faq")} className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left">
                  {t('footer.support.faq')}
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("privacy")} className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left">
                  {t('footer.support.privacy')}
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("leaseAgreement")} className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left">
                  {t('footer.support.terms')}
                </button>
              </li>
              <li>
                <button onClick={() => handleLinkClick("blog")} className="text-muted-foreground hover:text-primary transition-colors duration-200 text-left">
                  {t('footer.support.blog')}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Company Information */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Company Details */}
            <div>
              <h4 className="font-semibold mb-3 text-primary">{t('footer.company.name')}</h4>
              <div className="text-muted-foreground text-sm space-y-1">
                <p>{t('footer.company.code')}</p>
                <p>{t('footer.company.phone')}</p>
                <p>{t('footer.company.email')}</p>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="flex items-end">
              <p className="text-muted-foreground text-sm">
                {t('footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}