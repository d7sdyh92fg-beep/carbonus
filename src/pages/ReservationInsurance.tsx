import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Shield } from 'lucide-react';
import { useBooking, InsuranceOption } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

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
  const { t } = useTranslations();
  const { bookingData, updateInsurance } = useBooking();
  const insuranceOptions = getInsuranceOptions(t);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    if (!bookingData) {
      navigate('/automobiliai');
    }
  }, [bookingData, navigate]);

  if (!bookingData) return null;

  const handleSelectInsurance = (insurance: InsuranceOption) => {
    updateInsurance(insurance);
    navigate(`/rezervacija/${bookingData.carId}/paslaugos`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              {t('insurance.back')}
            </Button>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{t('insurance.from')}</p>
              <p className="text-2xl font-bold text-primary">
                {bookingData.basePrice.toFixed(2)} €
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t('insurance.title')}</h1>
          </div>
          <p className="text-muted-foreground">
            {t('insurance.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {insuranceOptions.map((option) => {
            const isSelected = bookingData.insurance?.id === option.id;
            const dailyPrice = option.pricePerDay;
            const totalPrice = dailyPrice * bookingData.rentalDays;

            return (
              <Card
                key={option.id}
                className={`p-6 cursor-pointer transition-all hover:border-primary ${
                  isSelected ? 'border-primary border-2 bg-primary/5' : ''
                }`}
                onClick={() => handleSelectInsurance(option)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{option.title}</h3>
                      {option.id === 'ldw-with-liability' && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          {t('insurance.recommended')}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {option.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{t('insurance.liability')}:</span>
                      <span className="text-muted-foreground">
                        {option.excess === 0 ? t('insurance.none') : `${option.excess} €`}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {dailyPrice === 0 ? (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{t('insurance.included')}</p>
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          +{dailyPrice.toFixed(2)} € / {t('insurance.perDay')}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          +{totalPrice.toFixed(2)} €
                        </p>
                      </div>
                    )}
                    {isSelected && (
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Important Info */}
        <Card className="mt-8 p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">{t('insurance.importantInfo.title')}</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• {t('insurance.importantInfo.liability')}</li>
            <li>• {t('insurance.importantInfo.cdw')}</li>
            <li>• {t('insurance.importantInfo.full')}</li>
            <li>• {t('insurance.importantInfo.change')}</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
