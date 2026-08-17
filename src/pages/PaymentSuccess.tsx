import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/use-translations';
import { getRoute } from '@/utils/routes';
import { ReservationResultLayout } from '@/components/booking/ReservationResultLayout';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useTranslations();
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'error'>('loading');
  const [reservationId, setReservationId] = useState<string>('');

  const provider = searchParams.get('provider');
  const sessionId = searchParams.get('session_id'); // Stripe
  const reservationIdParam = searchParams.get('reservation_id'); // Stripe

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const verifyPayment = async () => {
      try {
        if (provider === 'cash' && reservationIdParam) {
          setStatus('success');
          setReservationId(reservationIdParam);
          return;
        }

        if (provider === 'stripe' && sessionId) {
          // Verify Stripe payment
          const { data, error } = await supabase.functions.invoke('verify-stripe-payment', {
            body: { sessionId, reservationId: reservationIdParam }
          });

          if (error) {
            console.error('Stripe verification error:', error);
            setStatus('error');
            return;
          }

          if (data?.success) {
            setStatus('success');
            setReservationId(reservationIdParam || '');
          } else {
            setStatus('processing');
          }
        } else {
          console.error('Invalid payment provider or missing session ID');
          setStatus('error');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [provider, sessionId, reservationIdParam]);

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="reservation-result-content text-center">
            <span className="reservation-result-icon"><Clock className="h-9 w-9 animate-pulse" /></span>
            <h1>{t('payment.loadingTitle')}</h1>
            <p className="text-muted-foreground">{t('payment.loadingDesc')}</p>
          </div>
        );
      
      case 'processing':
        return (
          <div className="reservation-result-content text-center">
            <span className="reservation-result-icon is-warning"><Clock className="h-9 w-9" /></span>
            <h1>{t('payment.processingTitle')}</h1>
            <p className="text-muted-foreground mb-4">
              {t('payment.processingDesc')}
            </p>
            <div className="reservation-result-reference">
              {t('payment.processingNote')}
            </div>
          </div>
        );
      
      case 'success':
        return (
          <div className="reservation-result-content text-center">
            <span className="reservation-result-icon"><CheckCircle className="h-10 w-10" /></span>
            <h1>{t('payment.successTitle')}</h1>
            <p className="text-muted-foreground mb-4">
              {t('payment.successDesc')}
            </p>
            {reservationId && (
              <div className="reservation-result-reference">
                {t('payment.reservationId')} <strong>{reservationId}</strong>
              </div>
            )}
            <div className="reservation-result-next">
              <div>{t('payment.confirmEmail')}</div>
              <div>{t('payment.willContact')}</div>
              <div>{t('payment.carReady')}</div>
            </div>
          </div>
        );
      
      case 'error':
      default:
        return (
          <div className="reservation-result-content text-center">
            <span className="reservation-result-icon is-error"><AlertCircle className="h-9 w-9" /></span>
            <h1>{t('payment.errorTitle')}</h1>
            <p className="text-muted-foreground mb-4">
              {t('payment.errorDesc')}
            </p>
            <div className="reservation-result-next !grid-cols-2">
              <div>{t('payment.phone')}</div>
              <div>{t('payment.email')}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <ReservationResultLayout
      language={language}
      eyebrow={language === 'en' ? 'Reservation status' : 'Rezervacijos būsena'}
    >
          {renderContent()}
          
          <div className="reservation-result-actions px-8 pb-8">
            <Button
              onClick={() => navigate(getRoute('home', language))}
              variant="outline"
              className="flex-1"
            >
              {t('payment.backHome')}
            </Button>
            {status === 'success' && (
              <Button
                onClick={() => navigate(getRoute('cars', language))}
                className="flex-1"
              >
                {t('payment.viewCars')}
              </Button>
            )}
          </div>
    </ReservationResultLayout>
  );
};

export default PaymentSuccess;
