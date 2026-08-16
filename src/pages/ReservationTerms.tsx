import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from '@/hooks/use-translations';
import { getRoute, getReservationRoute } from '@/utils/routes';
import { ReservationFlowShell } from '@/components/booking/ReservationFlowShell';

export default function ReservationTerms() {
  const navigate = useNavigate();
  const { carId } = useParams();
  const { bookingData, getTotalPrice } = useBooking();
  const { toast } = useToast();
  const { t, language } = useTranslations();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!bookingData) {
      const carsRoute = getRoute('cars', language);
      navigate(carsRoute);
    }
  }, [bookingData, navigate, language]);

  if (!bookingData) return null;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;

    // Allow 50px tolerance
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handleContinue = () => {
    if (hasAccepted && hasScrolledToBottom) {
      navigate(getReservationRoute(carId!, 'review', language));
    }
  };

  const openPDF = () => {
    const pdfFileName = language === 'en' 
      ? '/carbonus-rental-agreement.pdf' 
      : '/carbonus-nuomos-sutartis.pdf';
    window.open(pdfFileName, '_blank');
  };

  const openFullTermsPage = () => {
    const route = getRoute('leaseAgreement', language);
    window.open(route, '_blank');
  };

  const totalPrice = getTotalPrice();

  return (
    <ReservationFlowShell step={3} title={t('terms.title')} subtitle={t('terms.subtitle')} totalLabel={t('terms.totalToPay')} total={totalPrice} backLabel={t('terms.back')} onBack={() => navigate(-1)} language={language}>
      <div className="mx-auto max-w-4xl">

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">{t('terms.noticeTitle')}</h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  {t('terms.noticeDescription')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={openPDF}>
            <Download className="w-4 h-4 mr-2" />
            {t('terms.downloadPdf')}
          </Button>
          <Button variant="outline" size="sm" onClick={openFullTermsPage}>
            <ExternalLink className="w-4 h-4 mr-2" />
            {t('terms.openFullContract')}
          </Button>
          <Button 
            variant={showFullTerms ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowFullTerms(!showFullTerms)}
          >
            <FileText className="w-4 h-4 mr-2" />
            {showFullTerms ? t('terms.hideTerms') : t('terms.readHere')}
          </Button>
        </div>

        {/* Terms content with scroll tracking */}
        {showFullTerms && (
          <Card className="mb-6 overflow-hidden">
            <CardContent className="p-6">
              <ScrollArea 
                className="reservation-flow-terms-scroll h-[460px] w-full p-5"
                onScrollCapture={handleScroll}
              >
                <div className="space-y-6 text-sm">
                  {/* Section 1 */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      {t('terms.termsContent.section1.title')}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">{t('terms.termsContent.section1.subsection1.title')}</h4>
                        <p>{t('terms.termsContent.section1.subsection1.intro')}</p>
                        <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                          {t('terms.termsContent.section1.subsection1.methods').map((method: string, index: number) => (
                            <li key={index}>{method}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">{t('terms.termsContent.section1.subsection2.title')}</h4>
                        <p>{t('terms.termsContent.section1.subsection2.text')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2 */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      {t('terms.termsContent.section2.title')}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">{t('terms.termsContent.section2.subsection1.title')}</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          {t('terms.termsContent.section2.subsection1.items').map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">{t('terms.termsContent.section2.subsection2.title')}</h4>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          {t('terms.termsContent.section2.subsection2.items').map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      {t('terms.termsContent.section3.title')}
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">{t('terms.termsContent.section3.subsection1.title')}</h4>
                        <p>{t('terms.termsContent.section3.subsection1.intro')}</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          {t('terms.termsContent.section3.subsection1.items').map((item: string, index: number) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">{t('terms.termsContent.section3.subsection2.title')}</h4>
                        <p><strong>{t('terms.termsContent.section3.subsection2.highlight')}</strong> {t('terms.termsContent.section3.subsection2.text').replace(t('terms.termsContent.section3.subsection2.highlight'), '').trim()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 4 */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      {t('terms.termsContent.section4.title')}
                    </h3>
                    <p>{t('terms.termsContent.section4.text')}</p>
                  </div>

                  {/* Section 5 */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">
                      {t('terms.termsContent.section5.title')}
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {t('terms.termsContent.section5.items').map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Final Note */}
                  <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <CardContent className="p-4">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        <strong>{t('terms.termsContent.finalNote.title')}</strong> {t('terms.termsContent.finalNote.text')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>

              {/* Scroll indicator */}
              {showFullTerms && !hasScrolledToBottom && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground animate-bounce">
                  <span>{t('terms.scrollToBottom')}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              )}

              {hasScrolledToBottom && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('terms.allRead')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Acceptance checkbox */}
        <Card className="reservation-summary-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms-acceptance"
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked as boolean)}
                disabled={!hasScrolledToBottom}
                className="mt-1"
              />
              <div className="space-y-1 flex-1">
                <Label 
                  htmlFor="terms-acceptance" 
                  className="text-sm font-medium cursor-pointer"
                >
                  {t('terms.acceptanceLabel')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {!hasScrolledToBottom 
                    ? t('terms.checkboxHintScroll')
                    : t('terms.checkboxHintCheck')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">{t('terms.summaryTitle')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('terms.summaryCar')}</span>
                <span className="font-medium">{bookingData.carName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('terms.summaryDuration')}</span>
                <span className="font-medium">{bookingData.rentalDays} {t('terms.summaryDays')}</span>
              </div>
              {bookingData.insurance && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('terms.summaryInsurance')}</span>
                  <span className="font-medium">{bookingData.insurance.title}</span>
                </div>
              )}
              {bookingData.services.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('terms.summaryServices')}</span>
                  <span className="font-medium">{bookingData.services.length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            {t('terms.back')}
          </Button>
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!hasAccepted || !hasScrolledToBottom}
            className="reservation-primary-action flex-1"
          >
            {t('terms.agreeAndContinue')}
          </Button>
        </div>
      </div>
    </ReservationFlowShell>
  );
}
