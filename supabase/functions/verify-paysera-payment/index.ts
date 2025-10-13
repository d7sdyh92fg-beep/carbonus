import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import CryptoJS from "https://esm.sh/crypto-js@4.1.1"
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1"
import fontkit from "npm:@pdf-lib/fontkit@1.1.1"

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
      
      // First, get the reservation to check payment amount
      const { data: reservation, error: fetchError } = await supabase
        .from('reservations')
        .select('total_amount')
        .eq('id', reservationId)
        .single();

      if (fetchError) {
        console.error('Error fetching reservation:', fetchError);
        return new Response('Database error', { status: 500 });
      }

      // Determine if this is full payment or advance payment
      const paidAmount = parseFloat(amount || '0') / 100; // Convert cents to euros
      const totalAmount = parseFloat(reservation.total_amount);
      const isFull = Math.abs(paidAmount - totalAmount) < 1; // Allow 1 euro difference for rounding
      
      console.log('Payment comparison:', { paidAmount, totalAmount, isFull });
      
      const { error } = await supabase
        .from('reservations')
        .update({
          status: isFull ? 'paid' : 'awaiting_payment',
          payment_completed_at: isFull ? new Date().toISOString() : null,
          payment_transaction_id: reservationId,
          payment_provider: 'paysera'
        })
        .eq('id', reservationId);

      if (error) {
        console.error('Error updating reservation:', error);
        return new Response('Database error', { status: 500 });
      }

      console.log('Reservation updated successfully');

      // Generate contract PDF and send email only for full payment
      if (isFull) {
        try {
          // Fetch full reservation and customer details
          const { data: fullReservation } = await supabase
            .from('reservations')
            .select('*, customers(*)')
            .eq('id', reservationId)
            .single();

          if (fullReservation && fullReservation.customers) {
            const customer = fullReservation.customers;
            
            // Generate PDF
            const pdfDoc = await PDFDocument.create();
            
            // Register fontkit for custom font support
            pdfDoc.registerFontkit(fontkit);
            
            const page = pdfDoc.addPage([595.28, 841.89]); // A4
            
            // Fetch and embed Unicode fonts that support Lithuanian characters
            console.log('Fetching Noto Sans fonts...');
            const fontRegularResponse = await fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf');
            const fontBoldResponse = await fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf');
            
            const fontRegularBytes = new Uint8Array(await fontRegularResponse.arrayBuffer());
            const fontBoldBytes = new Uint8Array(await fontBoldResponse.arrayBuffer());
            
            const font = await pdfDoc.embedFont(fontRegularBytes);
            const fontBold = await pdfDoc.embedFont(fontBoldBytes);
            console.log('Fonts embedded successfully');

            let y = 800;
            page.drawText('CARBONUS AUTOMOBILIŲ NUOMOS SUTARTIS', { x: 40, y, size: 14, font: fontBold });
            y -= 24;
            page.drawText(`Sutarties Nr.: ${fullReservation.id}`, { x: 40, y, size: 11, font });
            y -= 16;
            page.drawText(`Data: ${new Date().toLocaleDateString('lt-LT')}`, { x: 40, y, size: 11, font });
            y -= 28;

            page.drawText('NUOMOS DUOMENYS', { x: 40, y, size: 12, font: fontBold });
            y -= 18;
            
            const rows = [
              ['Klientas', `${customer.first_name} ${customer.last_name}`],
              ['El. paštas', customer.email],
              ['Telefonas', customer.phone],
              ['Automobilis', fullReservation.car_name],
              ['Paėmimo data', `${fullReservation.start_date}${fullReservation.pickup_time ? ' ' + fullReservation.pickup_time : ''}`],
              ['Grąžinimo data', `${fullReservation.end_date}${fullReservation.return_time ? ' ' + fullReservation.return_time : ''}`],
              ['Nuomos kaina', `€${fullReservation.total_rental_cost}`],
              ['Užstatas', `€${fullReservation.deposit_amount}`],
              ['Bendra suma', `€${fullReservation.total_amount}`],
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
            const pdfFilePath = `${fullReservation.id}/nuomos_sutartis_${fullReservation.id}.pdf`;
            
            const { error: uploadError } = await supabase.storage
              .from('contracts')
              .upload(pdfFilePath, pdfBytes, { contentType: 'application/pdf', upsert: true });

            if (!uploadError) {
              // Update reservation with contract PDF URL
              await supabase
                .from('reservations')
                .update({ contract_pdf_url: pdfFilePath })
                .eq('id', fullReservation.id);
              
              console.log('Contract PDF generated and saved:', pdfFilePath);

              // Send confirmation email with PDF attachment
              await supabase.functions.invoke('send-status-email', {
                body: {
                  reservationId: fullReservation.id,
                  customerEmail: customer.email,
                  customerName: `${customer.first_name} ${customer.last_name}`,
                  carName: fullReservation.car_name,
                  startDate: fullReservation.start_date,
                  endDate: fullReservation.end_date,
                  totalAmount: fullReservation.total_amount,
                  status: 'paid',
                  paymentTransactionId: reservationId,
                  contractPdfUrl: pdfFilePath
                }
              });
              console.log('Confirmation email sent with PDF attachment');
            }
          }
        } catch (pdfError) {
          console.error('Error generating contract PDF or sending email:', pdfError);
        }
      }

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