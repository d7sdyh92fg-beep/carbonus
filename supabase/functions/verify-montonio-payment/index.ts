import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to verify Montonio JWT signature
async function verifyMontonioJWT(jwt: string): Promise<boolean> {
  try {
    const secretKey = Deno.env.get('MONTONIO_SECRET_KEY');
    if (!secretKey) {
      throw new Error('Montonio secret key not configured');
    }

    const [headerB64, payloadB64, signatureB64] = jwt.split('.');
    const message = `${headerB64}.${payloadB64}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(message)
    );

    return isValid;
  } catch (error) {
    console.error('JWT verification error:', error);
    return false;
  }
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

    // Get webhook data from Montonio
    const webhookData = await req.json();
    console.log('Montonio webhook received:', webhookData);

    // Verify JWT signature if provided
    if (webhookData.payment_token) {
      const isValid = await verifyMontonioJWT(webhookData.payment_token);
      if (!isValid) {
        console.error('Invalid Montonio JWT signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    const reservationId = webhookData.merchant_reference;
    const paymentStatus = webhookData.status || webhookData.payment_status;

    console.log('Processing payment for reservation:', reservationId, 'Status:', paymentStatus);

    // Fetch reservation details
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*, customers(*)')
      .eq('id', reservationId)
      .single();

    if (fetchError || !reservation) {
      console.error('Reservation not found:', reservationId);
      return new Response(
        JSON.stringify({ error: 'Reservation not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update reservation status based on Montonio payment status
    let newStatus = 'awaiting_payment';
    if (paymentStatus === 'paid' || paymentStatus === 'finalized' || paymentStatus === 'authorized') {
      newStatus = reservation.payment_method === 'pay_at_counter' ? 'partial_payment' : 'paid';
    } else if (paymentStatus === 'abandoned' || paymentStatus === 'voided') {
      newStatus = 'payment_failed';
    }

    const { error: updateError } = await supabase
      .from('reservations')
      .update({
        status: newStatus,
        payment_completed_at: newStatus === 'paid' || newStatus === 'partial_payment' ? new Date().toISOString() : null,
        payment_transaction_id: webhookData.payment_token || webhookData.uuid,
      })
      .eq('id', reservationId);

    if (updateError) {
      console.error('Failed to update reservation:', updateError);
      throw updateError;
    }

    // If payment successful, generate contract PDF and send confirmation email
    if (newStatus === 'paid' || newStatus === 'partial_payment') {
      console.log('Payment successful, generating contract and sending email...');

      try {
        // Generate rental contract PDF
        const contractResponse = await fetch(`${supabaseUrl}/functions/v1/generate-contract-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ reservationId }),
        });

        if (!contractResponse.ok) {
          console.error('Failed to generate contract:', await contractResponse.text());
        } else {
          console.log('Contract generated successfully');
        }

        // Send confirmation email
        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-contract-confirmation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            reservationId,
            customerEmail: reservation.customers.email,
            customerName: `${reservation.customers.first_name} ${reservation.customers.last_name}`,
          }),
        });

        if (!emailResponse.ok) {
          console.error('Failed to send confirmation email:', await emailResponse.text());
        } else {
          console.log('Confirmation email sent successfully');
        }
      } catch (error) {
        console.error('Error in post-payment processing:', error);
        // Don't fail the webhook if email/contract fails
      }
    }

    console.log('Montonio webhook processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        status: newStatus,
        reservationId,
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
    console.error('Error in verify-montonio-payment:', error);
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
