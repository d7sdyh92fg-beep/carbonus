import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import CryptoJS from "https://esm.sh/crypto-js@4.1.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received Paysera callback:', req.method);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const projectPassword = 'a016575ea129113c21a757ea84d8f86f';
    
    let data: string;
    let sign: string;

    // Handle both GET and POST requests from Paysera
    if (req.method === 'GET') {
      const url = new URL(req.url);
      data = url.searchParams.get('data') || '';
      sign = url.searchParams.get('sign') || '';
    } else {
      const formData = await req.formData();
      data = formData.get('data') as string || '';
      sign = formData.get('sign') as string || '';
    }

    console.log('Paysera callback data:', { data, sign });

    if (!data || !sign) {
      console.error('Missing data or sign parameters');
      return new Response('Missing parameters', { status: 400 });
    }

    // Verify signature
    const expectedSign = CryptoJS.MD5(data + projectPassword).toString();
    console.log('Expected signature:', expectedSign, 'Received signature:', sign);

    if (sign !== expectedSign) {
      console.error('Invalid signature');
      return new Response('Invalid signature', { status: 400 });
    }

    // Decode the data
    const base64Decoded = atob(data.replace(/_/g, '/').replace(/-/g, '+'));
    const params = new URLSearchParams(base64Decoded);
    
    console.log('Decoded payment parameters:', Object.fromEntries(params));

    const reservationId = params.get('orderid');
    const status = params.get('status');
    const amount = params.get('amount');
    const currency = params.get('currency');

    if (!reservationId) {
      console.error('Missing order ID');
      return new Response('Missing order ID', { status: 400 });
    }

    // Update reservation in database
    if (status === '1') { // Payment successful
      console.log('Payment successful, updating reservation:', reservationId);
      
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'confirmed',
          payment_completed_at: new Date().toISOString(),
          payment_transaction_id: reservationId,
          payment_provider: 'paysera'
        })
        .eq('id', reservationId);

      if (error) {
        console.error('Error updating reservation:', error);
        return new Response('Database error', { status: 500 });
      }

      console.log('Reservation updated successfully');
      return new Response('OK');
      
    } else {
      console.log('Payment failed or pending, status:', status);
      
      // Update reservation status to failed if payment failed
      if (status === '0') {
        await supabase
          .from('reservations')
          .update({
            status: 'failed',
            payment_transaction_id: reservationId,
            payment_provider: 'paysera'
          })
          .eq('id', reservationId);
      }
      
      return new Response('OK');
    }

  } catch (error) {
    console.error('Error processing Paysera callback:', error);
    return new Response('Internal server error', { status: 500 });
  }
});