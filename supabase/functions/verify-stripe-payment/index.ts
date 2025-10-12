import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit@1.1.1";

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

      // Generate contract PDF
      const reservation = data?.[0];
      let contractPdfUrl = null;
      
      if (reservation) {
        try {
          // Fetch customer details
          const { data: customer } = await supabase
            .from('customers')
            .select('*')
            .eq('id', reservation.customer_id)
            .single();

          if (customer) {
            // Generate PDF
            const pdfDoc = await PDFDocument.create();
            
            // Register fontkit for custom font support
            pdfDoc.registerFontkit(fontkit);
            
            const page = pdfDoc.addPage([595.28, 841.89]); // A4
            
            // Fetch and embed Unicode fonts that support Lithuanian characters
            console.log('Fetching Noto Sans fonts...');
            const fontRegularResponse = await fetch('https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Regular.ttf');
            const fontBoldResponse = await fetch('https://github.com/google/fonts/raw/main/ofl/notosans/NotoSans-Bold.ttf');
            
            const fontRegularBytes = new Uint8Array(await fontRegularResponse.arrayBuffer());
            const fontBoldBytes = new Uint8Array(await fontBoldResponse.arrayBuffer());
            
            const font = await pdfDoc.embedFont(fontRegularBytes);
            const fontBold = await pdfDoc.embedFont(fontBoldBytes);
            console.log('Fonts embedded successfully');

            let y = 800;
            page.drawText('CARBONUS AUTOMOBILIŲ NUOMOS SUTARTIS', { x: 40, y, size: 14, font: fontBold });
            y -= 24;
            page.drawText(`Sutarties Nr.: ${reservation.id}`, { x: 40, y, size: 11, font });
            y -= 16;
            page.drawText(`Data: ${new Date().toLocaleDateString('lt-LT')}`, { x: 40, y, size: 11, font });
            y -= 28;

            page.drawText('NUOMOS DUOMENYS', { x: 40, y, size: 12, font: fontBold });
            y -= 18;
            
            const rows = [
              ['Klientas', `${customer.first_name} ${customer.last_name}`],
              ['El. paštas', customer.email],
              ['Telefonas', customer.phone],
              ['Automobilis', reservation.car_name],
              ['Paėmimo data', `${reservation.start_date}${reservation.pickup_time ? ' ' + reservation.pickup_time : ''}`],
              ['Grąžinimo data', `${reservation.end_date}${reservation.return_time ? ' ' + reservation.return_time : ''}`],
              ['Nuomos kaina', `€${reservation.total_rental_cost}`],
              ['Užstatas', `€${reservation.deposit_amount}`],
              ['Bendra suma', `€${reservation.total_amount}`],
            ];
            
            for (const [k, v] of rows) {
              page.drawText(`${k}:`, { x: 40, y, size: 11, font: fontBold });
              page.drawText(String(v), { x: 160, y, size: 11, font });
              y -= 16;
            }

            y -= 20;
            page.drawText('SUTARTIES SĄLYGOS', { x: 40, y, size: 12, font: fontBold });
            y -= 18;
            const terms = [
              '1. Automobilis turi būti grąžintas švarus ir tokiu pačiu degalų lygio kaip buvo atsiimtas.',
              '2. Už pavėluotą grąžinimą taikomas 20 EUR/val. mokestis.',
              '3. Užstatas bus grąžintas per 3-5 darbo dienas po automobilio apžiūros.',
              '4. Nuomotojas neatsako už asmeninius daiktus, paliktus automobilyje.'
            ];
            
            for (const term of terms) {
              page.drawText(term, { x: 40, y, size: 10, font, maxWidth: 500 });
              y -= 14;
            }

            // Save PDF
            const pdfBytes = await pdfDoc.save();
            const pdfFilePath = `${reservation.id}/nuomos_sutartis_${reservation.id}.pdf`;
            
            const { error: uploadError } = await supabase.storage
              .from('contracts')
              .upload(pdfFilePath, pdfBytes, { contentType: 'application/pdf', upsert: true });

            if (!uploadError) {
              contractPdfUrl = pdfFilePath;
              
              // Update reservation with contract PDF URL
              await supabase
                .from('reservations')
                .update({ contract_pdf_url: contractPdfUrl })
                .eq('id', reservation.id);
              
              console.log('Contract PDF generated and saved:', contractPdfUrl);
            }
          }
        } catch (pdfError) {
          console.error('Error generating contract PDF:', pdfError);
        }

        // Send confirmation email with PDF attachment
        try {
          await supabase.functions.invoke('send-status-email', {
            body: {
              reservationId: reservation.id,
              customerEmail: customer?.email,
              customerName: `${customer?.first_name} ${customer?.last_name}`,
              carName: reservation.car_name,
              startDate: reservation.start_date,
              endDate: reservation.end_date,
              totalAmount: reservation.total_amount,
              status: 'paid',
              paymentTransactionId: session.payment_intent as string,
              contractPdfUrl: contractPdfUrl
            }
          });
          console.log('Confirmation email sent with PDF attachment');
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
        }
      }

      const rentalAmount = session.metadata?.rentalAmount ? parseFloat(session.metadata.rentalAmount) : 0;
      const depositAmount = session.metadata?.depositAmount ? parseFloat(session.metadata.depositAmount) : 0;
      
      return new Response(JSON.stringify({ 
        success: true, 
        paymentStatus: 'captured',
        rentalAmountCaptured: rentalAmount,
        depositAmountHeld: depositAmount,
        reservation: data?.[0],
        contractPdfUrl: contractPdfUrl
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