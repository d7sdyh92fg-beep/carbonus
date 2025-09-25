import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'processing' | 'error'>('loading');
  const [reservationId, setReservationId] = useState<string>('');

  const provider = searchParams.get('provider');
  const sessionId = searchParams.get('session_id'); // Stripe
  const reservationIdParam = searchParams.get('reservation_id'); // Paysera

  useEffect(() => {
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
          // The callback should have already updated the reservation
          const { data, error } = await supabase
            .from('reservations')
            .select('status, payment_completed_at')
            .eq('id', reservationIdParam)
            .single();

          if (error) {
            console.error('Paysera verification error:', error);
            setStatus('error');
            return;
          }

          if (data.status === 'confirmed' && data.payment_completed_at) {
            setStatus('success');
            setReservationId(reservationIdParam);
          } else {
            setStatus('processing');
            // Check again after a delay
            setTimeout(verifyPayment, 3000);
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
            <h2 className="text-2xl font-semibold mb-2">Tikrinamas mokėjimas...</h2>
            <p className="text-muted-foreground">Prašome palaukti, kol patvirtinsime jūsų mokėjimą.</p>
          </div>
        );
      
      case 'processing':
        return (
          <div className="text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-2xl font-semibold mb-2">Mokėjimas apdorojamas</h2>
            <p className="text-muted-foreground mb-4">
              Jūsų mokėjimas vis dar apdorojamas. Tai gali užtrukti kelias minutes.
            </p>
            <p className="text-sm text-muted-foreground">
              Jei mokėjimas nebus patvirtintas per 10 minučių, susisiekite su mumis telefonu +370 698 18 781
            </p>
          </div>
        );
      
      case 'success':
        return (
          <div className="text-center">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-semibold mb-2 text-green-700">Mokėjimas sėkmingas!</h2>
            <p className="text-muted-foreground mb-4">
              Jūsų rezervacija buvo sėkmingai apmokėta ir patvirtinta.
            </p>
            {reservationId && (
              <p className="text-sm text-muted-foreground mb-4">
                Rezervacijos numeris: <strong>{reservationId}</strong>
              </p>
            )}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>📧 Patvirtinimo laiškas išsiųstas į jūsų el. paštą</p>
              <p>📞 Susisieksime su jumis dėl automobilio atsiėmimo detalių</p>
              <p>🚗 Automobilis bus paruoštas nurodytą dieną</p>
            </div>
          </div>
        );
      
      case 'error':
      default:
        return (
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-semibold mb-2 text-red-700">Mokėjimo klaida</h2>
            <p className="text-muted-foreground mb-4">
              Nepavyko patvirtinti jūsų mokėjimo. Prašome susisiekti su mumis.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>📞 Telefonas: +370 698 18 781</p>
              <p>📧 El. paštas: info@carbonus.lt</p>
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
            {provider === 'stripe' ? 'Stripe' : 'Paysera'} Mokėjimas
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
              Grįžti į pradžią
            </Button>
            {status === 'success' && (
              <Button
                onClick={() => navigate('/cars')}
                className="flex-1"
              >
                Žiūrėti automobilius
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;