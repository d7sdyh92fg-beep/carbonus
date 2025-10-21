import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslations } from '@/hooks/use-translations';

const PaymentCanceled: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslations();

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
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-center">
            {t('payment.canceledTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
            <h2 className="text-2xl font-semibold mb-2 text-orange-700">{t('payment.canceledTitle')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('payment.canceledDesc')}
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">{t('payment.whatNext')}</h3>
              <div className="space-y-2 text-sm text-muted-foreground text-left">
                <p>{t('payment.option1')}</p>
                <p>{t('payment.option2')}</p>
                <p>{t('payment.option3')}</p>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p><strong>{t('payment.contactUs')}</strong></p>
              <p>{t('payment.phone')}</p>
              <p>{t('payment.email')}</p>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="flex-1"
            >
              {t('payment.backHome')}
            </Button>
            <Button
              onClick={() => {
                if (reservationId) {
                  navigate(`/cars?retry_reservation=${reservationId}`);
                } else {
                  navigate('/cars');
                }
              }}
              className="flex-1"
            >
              {t('payment.retryPayment')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCanceled;