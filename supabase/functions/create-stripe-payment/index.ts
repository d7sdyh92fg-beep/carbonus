import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      reservationId, 
      amount,
      currency = 'eur', 
      customerEmail, 
      customerName,
      carName,
      paymentType 
    }: PaymentRequest = await req.json();

    console.log('Creating Stripe payment session:', { 
      reservationId, 
      amount, 
      paymentType 
    });

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this email
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: customerName,
      });
      customerId = customer.id;
    }

    const origin = req.headers.get("origin") || "https://carbonus.lt";

    // Create line item for payment amount
    const lineItems = [
      {
        price_data: {
          currency: currency,
          product_data: { 
            name: `Automobilių nuoma - ${carName}`,
            description: paymentType === 'full' ? 'Pilna nuomos suma' : 'Avansas',
          },
          unit_amount: Math.round(amount * 100), // Amount in cents
        },
        quantity: 1,
      },
    ];

    // Create checkout session with automatic capture
    const sessionConfig: any = {
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservationId}&provider=stripe`,
      cancel_url: `${origin}/payment-canceled?reservation_id=${reservationId}`,
      payment_intent_data: {
        metadata: {
          reservationId: reservationId,
          amount: amount.toString(),
          paymentType: paymentType,
        },
      },
      metadata: {
        reservationId: reservationId,
        paymentType: paymentType,
        amount: amount.toString(),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log('Stripe session created:', session.id);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    } catch (error: any) {
      console.error('Error creating Stripe payment session:', error);
      return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});