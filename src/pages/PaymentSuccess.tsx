import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/use-translations';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslations();
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'error'>('loading');
  const [reservationId, setReservationId] = useState<string>('');

  const provider = searchParams.get('provider');
  const sessionId = searchParams.get('session_id'); // Stripe
  const reservationIdParam = searchParams.get('reservation_id'); // Paysera

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const verifyPayment = async () => {
      try {
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
        } else if (provider === 'paysera' && reservationIdParam) {
          // For Paysera, check reservation status in database
          const { data, error } = await supabase
            .from('reservations')
            .select('status, payment_completed_at')
            .eq('id', reservationIdParam)
            .maybeSingle();

          if (error) {
            console.error('Paysera verification error:', error);
            setStatus('error');
            return;
          }

          if (!data) {
            setStatus('error');
            return;
          }

          if (data.status === 'paid' || data.status === 'partial_payment') {
            setStatus('success');
            setReservationId(reservationIdParam);
          } else if (data.status === 'payment_failed') {
            setStatus('error');
          } else if (retryCount < maxRetries) {
            setStatus('processing');
            retryCount++;
            setTimeout(verifyPayment, 3000);
          } else {
            setStatus('error');
          }
        } else {
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
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-spin" />
            <h2 className="text-2xl font-semibold mb-2">{t('payment.success.checking')}</h2>
            <p className="text-muted-foreground">{t('payment.success.pleaseWait')}</p>
          </div>
        );
      
      case 'processing':
        return (
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-semibold mb-2">{t('payment.success.processing')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('payment.success.processingMessage')}
            </p>
            <p className="text-sm text-muted-foreground">
              {t('payment.success.processingTime')}
            </p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-semibold mb-2 text-green-700">{t('payment.success.title')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('payment.success.message')}
            </p>
            {reservationId && (
              <p className="text-sm text-muted-foreground mb-4">
                {t('payment.success.reservationNumber')} <strong>{reservationId}</strong>
              </p>
            )}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 {t('payment.success.emailSent')}</p>
              <p>📞 {t('payment.success.contactDetails')}</p>
              <p>🚗 {t('payment.success.carReady')}</p>
            </div>
          </div>
        );
      
      case 'error':
      default:
        return (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-semibold mb-2 text-red-700">{t('payment.success.error')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('payment.success.errorMessage')}
            </p>
            <div className="text-sm text-muted-foreground">
              <p>📞 {t('payment.success.phone')}</p>
              <p>📧 {t('payment.success.email')}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">
            {provider === 'stripe' ? 'Stripe' : 'Paysera'} {t('payment.success.paymentTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderContent()}
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
            >
              {t('payment.success.backHome')}
            </Button>
            {status === 'success' && (
              <Button
                onClick={() => navigate('/cars')}
                className="flex-1"
              >
                {t('payment.success.viewCars')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;