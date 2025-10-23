import { useEffect } from "react";
import { Navigation } from "@/components/ui/navigation";
import { Footer } from "@/components/sections/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  FileText, 
  Download, 
  Calendar, 
  Shield, 
  CreditCard, 
  Car,
  Users,
  Phone,
  AlertTriangle
} from "lucide-react";
import { useTranslations } from "@/hooks/use-translations";

const LeaseAgreement = () => {
  const { t } = useTranslations();

  useEffect(() => {
    document.title = t('leaseAgreement.meta.title');
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('leaseAgreement.meta.description'));
    }
    
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', 'https://carbonus.lt/nuomos-sutartis');
    }
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t('leaseAgreement.meta.ogTitle'));
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', 'https://carbonus.lt/nuomos-sutartis');
    }
  }, [t]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation logo="/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png" />
      
      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            {t('leaseAgreement.hero.badge')}
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
            {t('leaseAgreement.hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t('leaseAgreement.hero.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => {
              const link = document.createElement('a');
              link.href = '/carbonus-nuomos-sutartis.pdf';
              link.download = 'Carbonus-Nuomos-Sutartis.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              <Download className="w-5 h-5 mr-2" />
              {t('leaseAgreement.hero.downloadPdf')}
            </Button>
            <Button variant="outline" size="lg" onClick={() => {
              const printWindow = window.open('/carbonus-nuomos-sutartis.pdf', '_blank');
              if (printWindow) {
                printWindow.onload = () => {
                  printWindow.print();
                };
              }
            }}>
              <FileText className="w-5 h-5 mr-2" />
              {t('leaseAgreement.hero.print')}
            </Button>
          </div>
        </div>
      </section>

      {/* Agreement Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Important Notice */}
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">{t('leaseAgreement.notice.title')}</h3>
                  <p className="text-amber-700">
                    {t('leaseAgreement.notice.text')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Navigation */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t('leaseAgreement.navigation.title')}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm">
                  <li><a href="#reservation" className="text-primary hover:underline">{t('leaseAgreement.sections.reservation.title')}</a></li>
                  <li><a href="#documents" className="text-primary hover:underline">{t('leaseAgreement.sections.documents.title')}</a></li>
                  <li><a href="#payment" className="text-primary hover:underline">{t('leaseAgreement.sections.payment.title')}</a></li>
                  <li><a href="#insurance" className="text-primary hover:underline">{t('leaseAgreement.sections.insurance.title')}</a></li>
                </ul>
                <ul className="space-y-2 text-sm">
                  <li><a href="#usage" className="text-primary hover:underline">{t('leaseAgreement.sections.usage.title')}</a></li>
                  <li><a href="#return" className="text-primary hover:underline">{t('leaseAgreement.sections.return.title')}</a></li>
                  <li><a href="#contact" className="text-primary hover:underline">{t('leaseAgreement.sections.contact.title')}</a></li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Agreement Sections */}
          <div className="space-y-8">
            
            {/* Section 1: Reservation */}
            <Card id="reservation">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('leaseAgreement.sections.reservation.title')}
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.reservation.ways.title')}</h3>
                    <p>{t('leaseAgreement.sections.reservation.ways.text')}</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      {(t('leaseAgreement.sections.reservation.ways.items') as unknown as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.reservation.cancellation.title')}</h3>
                    <p>{t('leaseAgreement.sections.reservation.cancellation.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.reservation.validity.title')}</h3>
                    <p>{t('leaseAgreement.sections.reservation.validity.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.reservation.changes.title')}</h3>
                    <p>{t('leaseAgreement.sections.reservation.changes.text')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Documents */}
            <Card id="documents">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('leaseAgreement.sections.documents.title')}
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.documents.required.title')}</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {(t('leaseAgreement.sections.documents.required.items') as unknown as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.documents.age.title')}</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {(t('leaseAgreement.sections.documents.age.items') as unknown as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.documents.foreign.title')}</h3>
                    <p>{t('leaseAgreement.sections.documents.foreign.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.documents.card.title')}</h3>
                    <p>{t('leaseAgreement.sections.documents.card.text')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Payment */}
            <Card id="payment">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('leaseAgreement.sections.payment.title')}
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.payment.methods.title')}</h3>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      {(t('leaseAgreement.sections.payment.methods.items') as unknown as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.payment.prices.title')}</h3>
                    <p>{t('leaseAgreement.sections.payment.prices.text')}</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      {(t('leaseAgreement.sections.payment.prices.items') as unknown as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.payment.deposit.title')}</h3>
                    <p>{t('leaseAgreement.sections.payment.deposit.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.payment.hidden.title')}</h3>
                    <p>{t('leaseAgreement.sections.payment.hidden.text')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Insurance */}
            <Card id="insurance">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('leaseAgreement.sections.insurance.title')}
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.insurance.coverage.title')}</h3>
                    <p>{t('leaseAgreement.sections.insurance.coverage.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.insurance.accident.title')}</h3>
                    <p>{t('leaseAgreement.sections.insurance.accident.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.insurance.covered.title')}</h3>
                    <p>{t('leaseAgreement.sections.insurance.covered.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.insurance.additional.title')}</h3>
                    <p>{t('leaseAgreement.sections.insurance.additional.text')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Usage */}
            <Card id="usage">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('leaseAgreement.sections.usage.title')}
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.usage.abroad.title')}</h3>
                    <p>{t('leaseAgreement.sections.usage.abroad.text')}</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      {(t('leaseAgreement.sections.usage.abroad.items') as unknown as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.usage.km.title')}</h3>
                    <p>{t('leaseAgreement.sections.usage.km.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.usage.smoking.title')}</h3>
                    <p>{t('leaseAgreement.sections.usage.smoking.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.usage.animals.title')}</h3>
                    <p>{t('leaseAgreement.sections.usage.animals.text')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Return */}
            <Card id="return">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('leaseAgreement.sections.return.title')}
                  </h2>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.return.time.title')}</h3>
                    <p>{t('leaseAgreement.sections.return.time.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.return.fuel.title')}</h3>
                    <p>{t('leaseAgreement.sections.return.fuel.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.return.clean.title')}</h3>
                    <p>{t('leaseAgreement.sections.return.clean.text')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card id="contact" className="bg-primary/5">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    {t('leaseAgreement.sections.contact.title')}
                  </h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">{t('leaseAgreement.sections.contact.general.title')}</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>{t('leaseAgreement.sections.contact.general.phone')}</strong> +370 698 18 781</p>
                      <p><strong>{t('leaseAgreement.sections.contact.general.email')}</strong> info@carbonus.lt</p>
                      <p><strong>{t('leaseAgreement.sections.contact.general.hours')}</strong> {t('leaseAgreement.sections.contact.general.hoursValue')}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">{t('leaseAgreement.sections.contact.emergency.title')}</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>{t('leaseAgreement.sections.contact.emergency.phone')}</strong> +370 698 18 781</p>
                      <p><strong>{t('leaseAgreement.sections.contact.emergency.availability')}</strong> {t('leaseAgreement.sections.contact.emergency.availabilityValue')}</p>
                      <p><strong>{t('leaseAgreement.sections.contact.emergency.police')}</strong> 112</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LeaseAgreement;
