import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import CryptoJS from "https://esm.sh/crypto-js@4.1.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

interface PayseraPaymentRequest {
  reservationId: string
  amount: number
  currency: string
  customerEmail: string
  customerName: string
  carName: string
  paymentType: 'full' | 'advance'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservationId, amount, currency, customerEmail, customerName, carName, paymentType }: PayseraPaymentRequest = await req.json();
    
    console.log('Creating Paysera payment for:', { reservationId, amount, currency, customerEmail });

    const projectId = '252946';
    const projectPassword = 'a016575ea129113c21a757ea84d8f86f';
    const origin = req.headers.get('origin') || 'https://carbonus.lt';
    
    // Split customer name
    const [firstName, ...lastNameParts] = customerName.split(' ');
    const lastName = lastNameParts.join(' ');

    // Prepare Paysera payment parameters
    const params = {
      projectid: projectId,
      orderid: reservationId,
      accepturl: `${origin}/payment-success?provider=paysera&reservation_id=${reservationId}`,
      cancelurl: `${origin}/payment-canceled?provider=paysera&reservation_id=${reservationId}`,
      callbackurl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/verify-paysera-payment`,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toUpperCase(),
      test: '1', // Use test mode
      country: 'LT',
      p_firstname: firstName,
      p_lastname: lastName || firstName, // Fallback if no last name
      p_email: customerEmail,
      description: `${carName} nuoma (${paymentType === 'full' ? 'pilnas mokėjimas' : 'išankstinis mokėjimas'})`
    };

    console.log('Paysera payment parameters:', params);

    // Create URL-encoded string
    const paramsForUrl = {
      ...params,
      amount: params.amount.toString(),
    };
    const urlEncoded = new URLSearchParams(paramsForUrl as Record<string, string>).toString();
    console.log('URL encoded string:', urlEncoded);

    // Base64 encode with replacements for Paysera format
    const base64Data = btoa(urlEncoded).replace(/\//g, '_').replace(/\+/g, '-');
    console.log('Base64 data:', base64Data);

    // Generate MD5 signature
    const signatureString = base64Data + projectPassword;
    const signature = CryptoJS.MD5(signatureString).toString();
    console.log('Generated signature for string:', signatureString);
    console.log('MD5 signature:', signature);

    // Return the payment form data
    return new Response(
      JSON.stringify({
        success: true,
        paymentUrl: 'https://www.paysera.com/pay/',
        formData: {
          data: base64Data,
          sign: signature
        },
        params: params, // Include for debugging
        method: 'POST'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error: any) {
    console.error('Error creating Paysera payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'Unknown error'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }, 
        status: 400 
      }
    );
  }
});