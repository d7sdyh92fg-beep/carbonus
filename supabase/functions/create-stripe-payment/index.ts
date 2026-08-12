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
  carId: string;
  paymentType: 'full' | 'advance';
}

const SANLAB_CAR_IDS = ['7'];

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
      paymentType 
    }: PaymentRequest = await req.json();

    if (!reservationId || typeof reservationId !== 'string') {
      return new Response(JSON.stringify({ error: 'reservationId is required' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Server-side amount validation (never trust client-provided price) ----
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: reservation, error: reservationError } = await admin
      .from('reservations')
      .select('id, car_id, car_name, total_amount, status, deleted_at')
      .eq('id', reservationId)
      .maybeSingle();

    if (reservationError || !reservation || reservation.deleted_at) {
      return new Response(JSON.stringify({ error: 'Reservation not found' }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (['cancelled', 'completed'].includes(String(reservation.status))) {
      return new Response(JSON.stringify({ error: 'Reservation is not payable' }), {
        status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const total = Number(reservation.total_amount ?? 0);
    const requested = Number(amount ?? 0);
    let chargeAmount: number;

    if (paymentType === 'full') {
      chargeAmount = total;
    } else {
      // Advance: must be a positive amount not exceeding the reservation total.
      if (!(requested > 0) || requested > total + 0.01) {
        return new Response(JSON.stringify({ error: 'Invalid advance amount' }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      chargeAmount = requested;
    }

    if (!(chargeAmount > 0)) {
      return new Response(JSON.stringify({ error: 'Invalid payment amount' }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Car identity comes from the database, not from the client (Stripe account routing).
    const carId = String(reservation.car_id ?? '');
    const carName = reservation.car_name ?? '';

    // Select Stripe key based on car ID (Sanlab for SpaceTourer)
    const isSanlabCar = SANLAB_CAR_IDS.includes(carId);
    const stripeKey = isSanlabCar 
      ? Deno.env.get("SANLAB_STRIPE_SECRET_KEY") 
      : Deno.env.get("STRIPE_SECRET_KEY");


    console.log('Creating Stripe payment session:', { 
      reservationId, 
      amount: chargeAmount,
      paymentType,
      isSanlabCar,
      stripeAccount: isSanlabCar ? 'sanlab' : 'carbonus'
    });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey || "", {
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
          unit_amount: Math.round(chargeAmount * 100), // Amount in cents
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
          amount: chargeAmount.toString(),
          paymentType: paymentType,
        },
      },
      metadata: {
        reservationId: reservationId,
        paymentType: paymentType,
        amount: chargeAmount.toString(),
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