import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield } from 'lucide-react';
import { useBooking, InsuranceOption } from '@/contexts/BookingContext';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';
import { getRoute, getReservationRoute } from '@/utils/routes';
import { ReservationFlowShell } from '@/components/booking/ReservationFlowShell';

const getInsuranceOptions = (t: (key: string) => string): InsuranceOption[] => [
  {
    id: 'max-liability',
    title: t('insurance.options.basic.title'),
    description: t('insurance.options.basic.description'),
    pricePerDay: 0,
    excess: 1500,
  },
  {
    id: 'ldw-with-liability',
    title: t('insurance.options.standard.title'),
    description: t('insurance.options.standard.description'),
    pricePerDay: 10,
    excess: 500,
  },
  {
    id: 'ldw-no-liability',
    title: t('insurance.options.full.title'),
    description: t('insurance.options.full.description'),
    pricePerDay: 20,
    excess: 0,
  },
];

export default function ReservationInsurance() {
  const navigate = useNavigate();
  const { t, language } = useTranslations();
  const { bookingData, updateInsurance } = useBooking();
  const insuranceOptions = getInsuranceOptions(t);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    if (!bookingData) {
      navigate(getRoute('cars', language));
    }
  }, [bookingData, navigate, language]);

  if (!bookingData) return null;

  const handleSelectInsurance = (insurance: InsuranceOption) => {
    updateInsurance(insurance);
    navigate(getReservationRoute(bookingData.carId, 'services', language));
  };

  return (
    <ReservationFlowShell step={2} title={t('insurance.title')} subtitle={t('insurance.subtitle')} totalLabel={t('insurance.from')} total={bookingData.basePrice} backLabel={t('insurance.back')} onBack={() => navigate(-1)} language={language}>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-5 lg:grid-cols-3">
          {insuranceOptions.map((option) => {
            const isSelected = bookingData.insurance?.id === option.id;
            const dailyPrice = option.pricePerDay;
            const totalPrice = dailyPrice * bookingData.rentalDays;

            return (
              <Card
                key={option.id}
                role="button"
                tabIndex={0}
                className={`reservation-option-card p-6 ${
                  isSelected ? 'is-selected' : ''
                }`}
                onClick={() => handleSelectInsurance(option)}
                onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && handleSelectInsurance(option)}
              >
                <div className="flex h-full flex-col justify-between gap-5">
                  <div>
                    <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#eaf7f0] text-[#0b7650]"><Shield className="h-5 w-5" /></span>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[18px] font-extrabold tracking-[-0.02em]">{option.title}</h3>
                      {option.id === 'ldw-with-liability' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          {t('insurance.recommended')}
                        </span>
                      )}
                    </div>
                    <p className="min-h-[64px] text-sm leading-6 text-muted-foreground mb-4">
                      {option.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{t('insurance.liability')}:</span>
                      <span className="text-muted-foreground">
                        {option.excess === 0 ? t('insurance.none') : `${option.excess} €`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-end justify-between gap-2 border-t border-[#e5ece8] pt-4">
                    {dailyPrice === 0 ? (
                      <div className="text-right">
                        <p className="text-xl font-extrabold text-primary">{t('insurance.included')}</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          +{dailyPrice.toFixed(2)} € / {t('insurance.perDay')}
                        </p>
                        <p className="text-xl font-extrabold text-primary">
                          +{totalPrice.toFixed(2)} €
                        </p>
                      </div>
                    )}
                    {isSelected ? (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-5 w-5" />
                      </div>
                    ) : <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#cfddd6] text-[10px] font-bold text-muted-foreground">+</span>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Important Info */}
        <Card className="mt-6 p-6 bg-white/80">
          <h3 className="font-semibold mb-3">{t('insurance.importantInfo.title')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t('insurance.importantInfo.liability')}</li>
            <li>• {t('insurance.importantInfo.cdw')}</li>
            <li>• {t('insurance.importantInfo.full')}</li>
            <li>• {t('insurance.importantInfo.change')}</li>
          </ul>
        </Card>
      </div>
    </ReservationFlowShell>
  );
}
