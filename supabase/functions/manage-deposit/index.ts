import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ManageDepositRequest {
  reservationId: string;
  action: 'release' | 'capture-partial' | 'capture-full' | 'extend';
  amount?: number; // For partial capture
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: require admin role
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized', success: false }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized', success: false }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Verify admin role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Forbidden: admin access required', success: false }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { reservationId, action, amount }: ManageDepositRequest = await req.json();

    console.log('Managing deposit:', { reservationId, action, amount, adminUserId: userId });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Get reservation details
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', reservationId)
      .single();

    if (fetchError || !reservation) {
      throw new Error('Reservation not found');
    }

    const depositPaymentIntentId = reservation.deposit_payment_intent_id;
    if (!depositPaymentIntentId) {
      throw new Error('No deposit payment intent found for this reservation');
    }

    // Retrieve the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(depositPaymentIntentId);
    console.log('Current PaymentIntent status:', paymentIntent.status);

    let result;
    let updateData: any = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'release':
        // Cancel the remaining authorization (release deposit)
        if (paymentIntent.status === 'requires_capture') {
          result = await stripe.paymentIntents.cancel(paymentIntent.id);
          updateData.status = 'completed';
          console.log('Deposit released successfully');
        } else {
          throw new Error(`Cannot release deposit. PaymentIntent status: ${paymentIntent.status}`);
        }
        break;

      case 'capture-partial':
        // Capture partial amount (for damages, cleaning fees, etc.)
        if (!amount || amount <= 0) {
          throw new Error('Amount is required for partial capture');
        }
        if (paymentIntent.status === 'requires_capture') {
          const captureAmount = Math.round(amount * 100); // Convert to cents
          result = await stripe.paymentIntents.capture(paymentIntent.id, {
            amount_to_capture: captureAmount,
          });
          updateData.notes = `Partial deposit captured: €${amount}`;
          console.log('Partial deposit captured:', captureAmount, 'cents');
        } else {
          throw new Error(`Cannot capture deposit. PaymentIntent status: ${paymentIntent.status}`);
        }
        break;

      case 'capture-full':
        // Capture full remaining deposit
        if (paymentIntent.status === 'requires_capture') {
          result = await stripe.paymentIntents.capture(paymentIntent.id);
          updateData.notes = 'Full deposit captured';
          console.log('Full deposit captured');
        } else {
          throw new Error(`Cannot capture deposit. PaymentIntent status: ${paymentIntent.status}`);
        }
        break;

      case 'extend':
        // For rentals longer than 7 days, create a new authorization
        if (paymentIntent.payment_method) {
          // Create new payment intent with the same amount
          const newIntent = await stripe.paymentIntents.create({
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            customer: paymentIntent.customer as string,
            payment_method: paymentIntent.payment_method as string,
            off_session: true,
            confirm: true,
            capture_method: 'manual',
            description: `Extended deposit hold for reservation ${reservationId}`,
            metadata: {
              reservationId: reservationId,
              type: 'deposit_hold_extended',
              original_intent: paymentIntent.id,
            }
          });

          // Cancel the old authorization
          if (paymentIntent.status === 'requires_capture') {
            await stripe.paymentIntents.cancel(paymentIntent.id);
          }

          updateData.deposit_payment_intent_id = newIntent.id;
          result = newIntent;
          console.log('Deposit authorization extended:', newIntent.id);
        } else {
          throw new Error('Cannot extend authorization without payment method');
        }
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Update reservation in database
    const { error: updateError } = await supabase
      .from('reservations')
      .update(updateData)
      .eq('id', reservationId);

    if (updateError) {
      console.error('Error updating reservation:', updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ 
      success: true,
      action,
      result,
      message: `Deposit ${action} completed successfully`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error managing deposit:', error);
    return new Response(JSON.stringify({ 
      error: error?.message || 'Unknown error',
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
