import { useEffect, useState } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/hooks/use-translations";
import { 
  HelpCircle, 
  Car, 
  Calendar, 
  CreditCard, 
  Shield, 
  Clock,
  Users,
  FileText,
  Phone,
  ChevronDown,
  ChevronUp
} from "lucide-react";

const FAQ = () => {
  const { t, language } = useTranslations();
  const [openItems, setOpenItems] = useState<number[]>([]);

  useEffect(() => {
    // Set page title and meta tags
    const pageTitle = language === 'lt' 
      ? "DUK - Dažnai užduodami klausimai | Carbonus automobilių nuoma"
      : "FAQ - Frequently Asked Questions | Carbonus Car Rental";
    document.title = pageTitle;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('faq.subtitle'));
    }
    
    // Update canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/duk');
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', pageTitle);
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/duk');
    }
  }, [language, t]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: t('faq.categories.booking'),
      icon: Calendar,
      questions: (t('faq.questions.booking') as any) || []
    },
    {
      title: t('faq.categories.documents'),
      icon: FileText,
      questions: (t('faq.questions.documents') as any) || []
    },
    {
      title: t('faq.categories.payment'),
      icon: CreditCard,
      questions: (t('faq.questions.payment') as any) || []
    },
    {
      title: t('faq.categories.insurance'),
      icon: Shield,
      questions: (t('faq.questions.insurance') as any) || []
    },
    {
      title: t('faq.categories.usage'),
      icon: Car,
      questions: (t('faq.questions.usage') as any) || []
    },
    {
      title: t('faq.categories.return'),
      icon: Clock,
      questions: (t('faq.questions.return') as any) || []
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            {t('faq.badge')}
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            {t('faq.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('faq.subtitle')}
          </p>
          <Button size="lg" onClick={() => window.location.href = '/kontaktai'}>
            {t('faq.contactButton')}
          </Button>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => {
              const IconComponent = category.icon;
              return (
                <Card key={categoryIndex} className="shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {category.title}
                      </h2>
                    </div>
                    
                    <div className="space-y-4">
                      {category.questions.map((faq, faqIndex) => {
                        const globalIndex = categoryIndex * 100 + faqIndex;
                        const isOpen = openItems.includes(globalIndex);
                        
                        return (
                          <div key={faqIndex} className="border border-border rounded-lg">
                            <button
                              onClick={() => toggleItem(globalIndex)}
                              className="w-full p-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors duration-200"
                            >
                              <span className="font-medium text-foreground pr-4">
                                {faq.question}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              )}
                            </button>
                            
                            {isOpen && (
                              <div className="px-4 pb-4">
                                <p className="text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-muted/50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              {t('faq.notFound.title')}
            </h2>
          </div>
          <p className="text-xl text-muted-foreground mb-8">
            {t('faq.notFound.subtitle')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center">
              <Phone className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{t('faq.notFound.phone.title')}</h3>
              <p className="text-muted-foreground text-sm mb-3">{t('faq.notFound.phone.number')}</p>
              <p className="text-xs text-muted-foreground">{t('faq.notFound.phone.hours')}</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{t('faq.notFound.email.title')}</h3>
              <p className="text-muted-foreground text-sm mb-3">{t('faq.notFound.email.address')}</p>
              <p className="text-xs text-muted-foreground">{t('faq.notFound.email.response')}</p>
            </Card>
            
            <Card className="p-6 text-center">
              <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">{t('faq.notFound.emergency.title')}</h3>
              <p className="text-muted-foreground text-sm mb-3">{t('faq.notFound.emergency.number')}</p>
              <p className="text-xs text-muted-foreground">{t('faq.notFound.emergency.availability')}</p>
            </Card>
          </div>
          
          <Button size="lg" onClick={() => window.location.href = '/kontaktai'}>
            {t('faq.notFound.contactPageButton')}
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FAQ;