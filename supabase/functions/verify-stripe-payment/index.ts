import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  sessionId: string;
  reservationId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, reservationId }: VerifyPaymentRequest = await req.json();

    console.log('Verifying payment:', { sessionId, reservationId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase with service role key
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session status:', session.payment_status);

    if (session.payment_status === 'paid') {
      let depositPaymentIntentId = null;
      
      // Create deposit pre-authorization if deposit amount is specified
      const depositAmount = session.metadata?.depositAmount ? parseFloat(session.metadata.depositAmount) : 0;
      
      if (depositAmount > 0 && session.payment_intent) {
        try {
          // Retrieve payment method from the successful payment
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
          
          if (paymentIntent.payment_method) {
            // Create a new payment intent with manual capture for deposit hold
            const depositIntent = await stripe.paymentIntents.create({
              amount: Math.round(depositAmount * 100), // Convert to cents
              currency: 'eur',
              customer: session.customer as string,
              payment_method: paymentIntent.payment_method as string,
              off_session: true,
              confirm: true,
              capture_method: 'manual', // Pre-authorization - won't be charged unless captured
              description: `Deposit hold for reservation ${reservationId}`,
              metadata: {
                reservationId: reservationId,
                type: 'deposit_hold'
              }
            });
            
            depositPaymentIntentId = depositIntent.id;
            console.log('Deposit pre-authorization created:', depositPaymentIntentId);
          }
        } catch (depositError) {
          console.error('Error creating deposit hold:', depositError);
          // Continue even if deposit hold fails - we can handle manually
        }
      }

      // Update reservation status in database
      const updateData: any = { 
        status: session.metadata?.paymentType === 'full' ? 'confirmed' : 'awaiting_payment',
        payment_transaction_id: session.payment_intent as string,
        updated_at: new Date().toISOString()
      };
      
      if (depositPaymentIntentId) {
        updateData.deposit_payment_intent_id = depositPaymentIntentId;
      }

      const { data, error } = await supabase
        .from('reservations')
        .update(updateData)
        .eq('id', reservationId)
        .select();

      if (error) {
        console.error('Error updating reservation:', error);
        throw error;
      }

      console.log('Reservation updated successfully:', data);

      return new Response(JSON.stringify({ 
        success: true, 
        paymentStatus: 'paid',
        paymentType: session.metadata?.paymentType || 'unknown',
        depositHoldCreated: !!depositPaymentIntentId,
        reservation: data?.[0]
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        paymentStatus: session.payment_status,
        message: 'Payment not completed'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});