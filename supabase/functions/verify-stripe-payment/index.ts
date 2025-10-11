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

    // Check if payment was authorized (not yet captured with manual capture)
    const isAuthorized = session.payment_status === 'paid' || session.status === 'complete';
    
    if (isAuthorized && session.payment_intent) {
      console.log('Payment authorized, processing capture...');
      
      const rentalAmount = session.metadata?.rentalAmount ? parseFloat(session.metadata.rentalAmount) : 0;
      const depositAmount = session.metadata?.depositAmount ? parseFloat(session.metadata.depositAmount) : 0;
      
      try {
        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string);
        console.log('PaymentIntent status:', paymentIntent.status, 'Amount:', paymentIntent.amount);
        
        // Capture only the rental amount, leaving deposit as pre-authorized
        if (paymentIntent.status === 'requires_capture') {
          const captureAmount = Math.round(rentalAmount * 100); // Rental amount in cents
          console.log('Capturing rental amount:', captureAmount, 'cents');
          
          const capturedIntent = await stripe.paymentIntents.capture(paymentIntent.id, {
            amount_to_capture: captureAmount,
          });
          
          console.log('Rental amount captured successfully:', capturedIntent.id);
          console.log('Remaining authorized (deposit):', depositAmount);
        } else {
          console.log('PaymentIntent not in capturable state:', paymentIntent.status);
        }
      } catch (captureError) {
        console.error('Error capturing rental amount:', captureError);
        throw new Error(`Failed to capture rental payment: ${captureError.message}`);
      }

      // Update reservation status in database
      const updateData: any = { 
        status: 'paid', // Payment captured successfully
        payment_transaction_id: session.payment_intent as string,
        deposit_payment_intent_id: session.payment_intent as string, // Same PaymentIntent holds the deposit
        updated_at: new Date().toISOString()
      };

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

      const rentalAmount = session.metadata?.rentalAmount ? parseFloat(session.metadata.rentalAmount) : 0;
      const depositAmount = session.metadata?.depositAmount ? parseFloat(session.metadata.depositAmount) : 0;
      
      return new Response(JSON.stringify({ 
        success: true, 
        paymentStatus: 'captured',
        rentalAmountCaptured: rentalAmount,
        depositAmountHeld: depositAmount,
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