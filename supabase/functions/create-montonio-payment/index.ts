import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  reservationId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  paymentType: 'full' | 'advance';
}

// Helper function to generate JWT for Montonio API
function generateMontonioJWT(payload: any): string {
  const accessKey = Deno.env.get('MONTONIO_ACCESS_KEY');
  const secretKey = Deno.env.get('MONTONIO_SECRET_KEY');

  if (!accessKey || !secretKey) {
    throw new Error('Montonio API keys not configured');
  }

  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify({ ...payload, access_key: accessKey }));

  const message = `${encodedHeader}.${encodedPayload}`;
  
  // Create HMAC signature
  const encoder = new TextEncoder();
  const key = encoder.encode(secretKey);
  const data = encoder.encode(message);

  return crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(cryptoKey => 
    crypto.subtle.sign('HMAC', cryptoKey, data)
  ).then(signature => {
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
    return `${message}.${signatureBase64}`;
  });
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      reservationId,
      amount,
      currency,
      customerEmail,
      customerName,
      carName,
      paymentType
    }: PaymentRequest = await req.json();

    console.log('Creating Montonio payment:', {
      reservationId,
      amount,
      currency,
      customerEmail,
      paymentType
    });

    const origin = req.headers.get('origin') || 'https://carbonus.lt';

    // Generate JWT token for Montonio API
    const jwtPayload = {
      amount: amount.toFixed(2),
      currency: currency.toUpperCase(),
      merchant_reference: reservationId,
      merchant_return_url: `${origin}/payment-success?provider=montonio&reservation_id=${reservationId}`,
      merchant_notification_url: `${supabaseUrl}/functions/v1/verify-montonio-payment`,
      checkout_email: customerEmail,
      checkout_first_name: customerName.split(' ')[0],
      checkout_last_name: customerName.split(' ').slice(1).join(' '),
      payment_description: `${carName} - ${paymentType === 'advance' ? 'Advance Payment' : 'Full Payment'}`,
      locale: 'lt',
      exp: Math.floor(Date.now() / 1000) + (60 * 30) // 30 minutes expiration
    };

    const jwt = await generateMontonioJWT(jwtPayload);

    // Call Montonio API to create payment order
    const montonioResponse = await fetch('https://api.montonio.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_key: Deno.env.get('MONTONIO_ACCESS_KEY'),
        merchant_reference: reservationId,
        return_url: `${origin}/payment-success?provider=montonio&reservation_id=${reservationId}`,
        notification_url: `${supabaseUrl}/functions/v1/verify-montonio-payment`,
        currency: currency.toUpperCase(),
        grand_total: amount.toFixed(2),
        locale: 'lt',
        payment_information_unstructured: `${carName} - ${paymentType === 'advance' ? 'Advance Payment' : 'Full Payment'}`,
        merchant_name: 'Carbonus',
        customer_email: customerEmail,
        customer_name: customerName,
      }),
    });

    if (!montonioResponse.ok) {
      const errorText = await montonioResponse.text();
      console.error('Montonio API error:', errorText);
      throw new Error(`Montonio API error: ${montonioResponse.status} - ${errorText}`);
    }

    const montonioData = await montonioResponse.json();
    console.log('Montonio payment created:', montonioData);

    // Update reservation with payment transaction ID
    if (montonioData.payment_token || montonioData.uuid) {
      await supabase
        .from('reservations')
        .update({
          payment_transaction_id: montonioData.payment_token || montonioData.uuid,
          payment_provider: 'montonio',
        })
        .eq('id', reservationId);
    }

    // Return the payment URL for redirect
    return new Response(
      JSON.stringify({
        paymentUrl: montonioData.payment_url || montonioData.url,
        paymentToken: montonioData.payment_token || montonioData.uuid,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in create-montonio-payment:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
