import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/use-translations';
import { getRoute } from '@/utils/routes';
import { ReservationResultLayout } from '@/components/booking/ReservationResultLayout';

const PaymentCanceled: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useTranslations();

  const provider = searchParams.get('provider');
  const reservationId = searchParams.get('reservation_id');

  useEffect(() => {
    const updateReservationStatus = async () => {
      if (reservationId) {
        try {
          // Update reservation status to awaiting_payment (not canceled, allow retry)
          await supabase
            .from('reservations')
            .update({ 
              status: 'awaiting_payment',
              payment_provider: provider || 'unknown'
            })
            .eq('id', reservationId);
        } catch (error) {
          console.error('Error updating reservation status:', error);
        }
      }
    };

    updateReservationStatus();
  }, [reservationId, provider]);

  return (
    <ReservationResultLayout
      language={language}
      eyebrow={language === 'en' ? 'Payment interrupted' : 'Mokėjimas nebaigtas'}
    >
          <div className="reservation-result-content text-center">
            <span className="reservation-result-icon is-warning"><XCircle className="h-10 w-10" /></span>
            <h1>{t('payment.canceledTitle')}</h1>
            <p className="text-muted-foreground mb-4">
              {t('payment.canceledDesc')}
            </p>
            
            <h3 className="mt-7 font-semibold">{t('payment.whatNext')}</h3>
            <div className="reservation-result-next">
              <div>{t('payment.option1')}</div>
              <div>{t('payment.option2')}</div>
              <div>{t('payment.option3')}</div>
            </div>

            <div className="reservation-result-reference">
              <p><strong>{t('payment.contactUs')}</strong></p>
              <span className="ml-2">{t('payment.phone')} · {t('payment.email')}</span>
            </div>
          </div>
          
          <div className="reservation-result-actions px-8 pb-8">
            <Button
              onClick={() => navigate(getRoute('home', language))}
              variant="outline"
              className="flex-1"
            >
              {t('payment.backHome')}
            </Button>
            <Button
              onClick={() => {
                if (reservationId) {
                  navigate(`${getRoute('cars', language)}?retry_reservation=${reservationId}`);
                } else {
                  navigate(getRoute('cars', language));
                }
              }}
              className="flex-1"
            >
              {t('payment.retryPayment')}
            </Button>
          </div>
    </ReservationResultLayout>
  );
};

export default PaymentCanceled;
