import { useEffect } from "react";
import { Header } from "@/components/home/Header";
import { V3Footer } from "@/components/homev3/V3Footer";
import { LanguageLinks } from "@/components/seo/LanguageLinks";
import { SEOHead } from "@/components/seo/SEOHead";
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
  const { t, language } = useTranslations();

  // Dynamic PDF selection based on language
  const pdfFileName = language === 'en' 
    ? '/carbonus-rental-agreement.pdf' 
    : '/carbonus-nuomos-sutartis.pdf';

  const pdfDisplayName = language === 'en'
    ? 'Carbonus-Rental-Agreement.pdf'
    : 'Carbonus-Nuomos-Sutartis.pdf';

  // Dynamic URL based on language
  const baseUrl = 'https://carbonus.lt';
  const pageUrl = language === 'en' 
    ? `${baseUrl}/rental-agreement`
    : `${baseUrl}/nuomos-sutartis`;

  const isEnglish = language === 'en';
  const copy = isEnglish
    ? {
        eyebrow: "RENTAL TERMS",
        title: "Clear terms before you book",
        subtitle: "Review the most important rental rules online or download the full agreement as a PDF.",
        download: "Download PDF",
        print: "Open to print",
      }
    : {
        eyebrow: "NUOMOS SĄLYGOS",
        title: "Aiškios sąlygos prieš rezervuojant",
        subtitle: "Svarbiausias nuomos taisykles peržiūrėkite internete arba atsisiųskite visą sutartį PDF formatu.",
        download: "Atsisiųsti PDF",
        print: "Atidaryti spausdinimui",
      };

  useEffect(() => {
    document.title = t('leaseAgreement.meta.title');
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', t('leaseAgreement.meta.description'));
    }
    
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    if (!canonical.parentNode) {
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', t('leaseAgreement.meta.ogTitle'));
    }
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) {
      ogUrl.setAttribute('content', pageUrl);
    }

    // Add hreflang tags for SEO
    const hreflangLt = document.querySelector('link[hreflang="lt"]') || document.createElement('link');
    if (!hreflangLt.parentNode) {
      hreflangLt.setAttribute('rel', 'alternate');
      hreflangLt.setAttribute('hreflang', 'lt');
      document.head.appendChild(hreflangLt);
    }
    hreflangLt.setAttribute('href', `${baseUrl}/nuomos-sutartis`);

    const hreflangEn = document.querySelector('link[hreflang="en"]') || document.createElement('link');
    if (!hreflangEn.parentNode) {
      hreflangEn.setAttribute('rel', 'alternate');
      hreflangEn.setAttribute('hreflang', 'en');
      document.head.appendChild(hreflangEn);
    }
    hreflangEn.setAttribute('href', `${baseUrl}/rental-agreement`);

    const hreflangDefault = document.querySelector('link[hreflang="x-default"]') || document.createElement('link');
    if (!hreflangDefault.parentNode) {
      hreflangDefault.setAttribute('rel', 'alternate');
      hreflangDefault.setAttribute('hreflang', 'x-default');
      document.head.appendChild(hreflangDefault);
    }
    hreflangDefault.setAttribute('href', `${baseUrl}/nuomos-sutartis`);
  }, [t, language, pageUrl]);

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#111b18]">
      <SEOHead title={t('leaseAgreement.meta.title')} description={t('leaseAgreement.meta.description')} canonical={pageUrl} keywords="automobilio nuomos sutartis, nuomos sąlygos, Carbonus" />
      <LanguageLinks ltPath="/nuomos-sutartis" enPath="/rental-agreement" />
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[#dce6e1] bg-[#f3f7f5] pb-16 pt-[78px]">
        <div className="pointer-events-none absolute -right-36 -top-44 h-[600px] w-[600px] rounded-full bg-[hsl(var(--carbonus-green))]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-[1320px] gap-12 px-6 pb-4 pt-16 md:px-6 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:pt-20">
          <div className="max-w-[790px]">
            <p className="text-[12px] font-bold uppercase tracking-[0.24em] text-[hsl(var(--carbonus-green-dark))]">{copy.eyebrow}</p>
            <h1 className="mt-5 text-[34px] font-bold leading-[1.06] tracking-[-0.04em] sm:text-[44px] lg:text-[54px]">{copy.title}</h1>
            <p className="mt-6 max-w-[680px] text-[16px] leading-7 text-[#64756e] sm:text-[17px]">{copy.subtitle}</p>
          </div>
          <div className="rounded-[26px] bg-[hsl(var(--carbonus-green-deep))] p-6 text-white shadow-[0_22px_60px_rgba(3,53,34,0.2)] sm:p-7">
            <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-white/10 text-[hsl(var(--carbonus-green))]"><FileText className="h-5 w-5" /></span>
            <p className="mt-5 text-[12px] font-bold uppercase tracking-[0.16em] text-white/55">PDF</p>
            <div className="mt-4 grid gap-3">
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-white px-5 text-[13px] font-bold text-[hsl(var(--carbonus-green-deep))] transition hover:bg-[#edf8f2]" onClick={() => {
              const link = document.createElement('a');
              link.href = pdfFileName;
              link.download = pdfDisplayName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}>
              <Download className="h-4 w-4" />{copy.download}
              </button>
              <button className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] border border-white/15 px-5 text-[13px] font-semibold text-white transition hover:bg-white/10" onClick={() => {
              const printWindow = window.open(pdfFileName, '_blank');
              if (printWindow) {
                printWindow.onload = () => {
                  printWindow.print();
                };
              }
            }}>
              <FileText className="h-4 w-4" />{copy.print}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Agreement Content */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-6 md:px-6">
          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          
          {/* Important Notice */}
          <Card className="border-amber-200 bg-amber-50 shadow-[0_14px_40px_rgba(14,47,35,0.04)]">
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
          <Card className="border-[#e0e8e4] shadow-[0_14px_40px_rgba(14,47,35,0.04)]">
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
          </div>

          {/* Agreement Sections */}
          <div className="mx-auto mt-8 max-w-[980px] space-y-8 [&>div]:scroll-mt-28 [&_.text-muted-foreground]:leading-7 [&_.rounded-xl]:rounded-[13px]">
            
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
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.payment.structure.title')}</h3>
                    <p>{t('leaseAgreement.sections.payment.structure.text')}</p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      {(t('leaseAgreement.sections.payment.structure.items') as unknown as string[]).map((item, i) => (
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
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      {(t('leaseAgreement.sections.insurance.accident.items') as unknown as string[]).map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                    <p className="mt-2 italic">{t('leaseAgreement.sections.insurance.accident.note')}</p>
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
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.usage.mileage.title')}</h3>
                    <p>{t('leaseAgreement.sections.usage.mileage.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.usage.smoking.title')}</h3>
                    <p>{t('leaseAgreement.sections.usage.smoking.text')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.usage.pets.title')}</h3>
                    <p>{t('leaseAgreement.sections.usage.pets.text')}</p>
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
                    <h3 className="font-semibold text-foreground mb-2">{t('leaseAgreement.sections.return.cleanliness.title')}</h3>
                    <p>{t('leaseAgreement.sections.return.cleanliness.text')}</p>
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

      <V3Footer />
    </div>
  );
};

export default LeaseAgreement;
