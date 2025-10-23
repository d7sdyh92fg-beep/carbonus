import { useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

const PrivacyPolicy = () => {
  const { t, language } = useTranslations();
  
  useEffect(() => {
    // Set page title and meta tags
    document.title = t('privacyPolicy.metaTitle');
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('privacyPolicy.metaDescription'));
    }
    
    // Update canonical URL with language-specific path
    const canonical = document.querySelector('link[rel="canonical"]');
    const canonicalUrl = language === 'en' 
      ? 'https://carbonus.lt/privacy-policy' 
      : 'https://carbonus.lt/privatumo-politika';
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t('privacyPolicy.title') + ' - Carbonus');
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', canonicalUrl);
    }
  }, [t, language]);
  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              {t('privacyPolicy.badge')}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {t('privacyPolicy.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('privacyPolicy.subtitle')}
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8 lg:p-12">
              <div className="prose prose-lg max-w-none">
                <div className="mb-8">
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {t('privacyPolicy.intro')}
                  </p>
                </div>

                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.dataProcessed.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {t('privacyPolicy.sections.dataProcessed.paragraph1')}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.dataProcessed.paragraph2')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.collection.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.collection.paragraph1')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Phone className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.disclosure.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.disclosure.paragraph1')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.security.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {t('privacyPolicy.sections.security.paragraph1')}
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.security.paragraph2')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.retention.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.retention.paragraph1')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <MapPin className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.rights.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.rights.paragraph1')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.cookies.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.cookies.paragraph1')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Mail className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.newsletter.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.newsletter.paragraph1')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.changes.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('privacyPolicy.sections.changes.paragraph1')}
                    </p>
                  </div>

                  <div className="pt-8 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Phone className="w-6 h-6 text-primary mt-4.5" />
                      <h2 className="text-2xl font-bold leading-none text-foreground">{t('privacyPolicy.sections.contact.title')}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {t('privacyPolicy.sections.contact.paragraph1')}
                    </p>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{t('privacyPolicy.sections.contact.email')}</p>
                      <p>{t('privacyPolicy.sections.contact.phone')}</p>
                      <p>{t('privacyPolicy.sections.contact.address')}</p>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground pt-6 border-t border-border">
                    <p>{t('privacyPolicy.lastUpdated')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;