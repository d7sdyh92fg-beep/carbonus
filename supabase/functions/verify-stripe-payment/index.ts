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

// Helper to draw wrapped text
function drawWrappedText(page: any, text: string, x: number, y: number, font: any, size: number, maxWidth: number): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, size);
    if (width > maxWidth && line) {
      page.drawText(line, { x, y: currentY, size, font });
      currentY -= size + 3;
      line = word;
    } else {
      line = testLine;
    }
  }
  if (line) {
    page.drawText(line, { x, y: currentY, size, font });
    currentY -= size + 3;
  }
  return currentY;
}

function drawLine(page: any, y: number) {
  page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
}

async function loadFonts(pdfDoc: any) {
  pdfDoc.registerFontkit(fontkit);
  const [fontRegularResponse, fontBoldResponse] = await Promise.all([
    fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'),
    fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf'),
  ]);
  const font = await pdfDoc.embedFont(new Uint8Array(await fontRegularResponse.arrayBuffer()));
  const fontBold = await pdfDoc.embedFont(new Uint8Array(await fontBoldResponse.arrayBuffer()));
  return { font, fontBold };
}

function generateMainContractPage(pdfDoc: any, font: any, fontBold: any, data: any) {
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { reservationId, date, customer, car, reservation } = data;
  let y = 790;

  const pageWidth = 595.28;
  const title1 = 'AUTOMOBILIŲ NUOMOS SUTARTIS';
  const t1w = fontBold.widthOfTextAtSize(title1, 16);
  page.drawText(title1, { x: (pageWidth - t1w) / 2, y, size: 16, font: fontBold });
  y -= 22;
  const nrText = `Nr. ${reservationId.substring(0, 8).toUpperCase()}`;
  const nrw = font.widthOfTextAtSize(nrText, 11);
  page.drawText(nrText, { x: (pageWidth - nrw) / 2, y, size: 11, font });
  y -= 16;
  const dw = font.widthOfTextAtSize(date, 10);
  page.drawText(date, { x: (pageWidth - dw) / 2, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 28;
  drawLine(page, y); y -= 20;

  // Lessor
  page.drawText('1. NUOMOTOJAS', { x: 40, y, size: 12, font: fontBold }); y -= 18;
  for (const [k, v] of [
    ['Pavadinimas', 'MB "Carbonus"'], ['Įmonės kodas', '307196558'],
    ['Adresas', 'Neravų 2A-6, Druskininkai, Druskininkų sav.'],
    ['A/S', 'LT547189900059467578, AB Artea bankas'],
    ['Telefonas', '+37069818781'], ['El. paštas', 'info@carbonus.lt'],
  ]) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font }); y -= 15;
  }
  y -= 10; drawLine(page, y); y -= 20;

  // Tenant
  page.drawText('2. NUOMININKAS', { x: 40, y, size: 12, font: fontBold }); y -= 18;
  const isCorporate = customer.is_corporate;
  const tenantRows: [string, string][] = [];
  if (isCorporate && customer.company_name) {
    tenantRows.push(['Įmonės pavadinimas', customer.company_name]);
    if (customer.company_code) tenantRows.push(['Įmonės kodas', customer.company_code]);
    if (customer.vat_code) tenantRows.push(['PVM mokėtojo kodas', customer.vat_code]);
    tenantRows.push(['Atstovas', `${customer.first_name} ${customer.last_name}`]);
  } else {
    tenantRows.push(['Vardas, pavardė', `${customer.first_name} ${customer.last_name}`]);
  }
  if (customer.address) tenantRows.push(['Adresas', customer.address]);
  tenantRows.push(['Telefonas', customer.phone]);
  tenantRows.push(['El. paštas', customer.email]);
  for (const [k, v] of tenantRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(String(v), { x: 190, y, size: 10, font }); y -= 15;
  }
  y -= 10; drawLine(page, y); y -= 20;

  // Terms
  page.drawText('3. PAGRINDINĖS SĄLYGOS', { x: 40, y, size: 12, font: fontBold }); y -= 18;
  for (const term of [
    '3.1. Nuomotojas įsipareigoja perduoti techniškai tvarkingą automobilį nuomininkui.',
    '3.2. Nuomininkas įsipareigoja naudoti automobilį pagal paskirtį ir laikytis KET.',
    '3.3. Automobilis turi būti grąžintas švarus ir tokiu pačiu degalų lygiu.',
    '3.4. Už pavėluotą grąžinimą taikomas 20 EUR/val. mokestis.',
    '3.5. Užstatas grąžinamas per 3-5 darbo dienas po automobilio apžiūros.',
    '3.6. Nuomotojas neatsako už asmeninius daiktus, paliktus automobilyje.',
    '3.7. Draudžiama rūkyti automobilyje. Pažeidus – 150 EUR bauda.',
    '3.8. Nuomininkas privalo nedelsiant pranešti apie bet kokį eismo įvykį ar gedimą.',
  ]) {
    y = drawWrappedText(page, term, 50, y, font, 9, 490); y -= 4;
  }
  y -= 10; drawLine(page, y); y -= 20;

  // Signatures
  page.drawText('4. ŠALIŲ PARAŠAI', { x: 40, y, size: 12, font: fontBold }); y -= 24;
  page.drawText('Nuomotojas:', { x: 50, y, size: 10, font: fontBold });
  page.drawText('Nuomininkas:', { x: 320, y, size: 10, font: fontBold }); y -= 16;
  page.drawText('MB "Carbonus"', { x: 50, y, size: 10, font });
  const signerName = isCorporate && customer.company_name
    ? `${customer.company_name} (${customer.first_name} ${customer.last_name})`
    : `${customer.first_name} ${customer.last_name}`;
  page.drawText(signerName, { x: 320, y, size: 10, font }); y -= 50;
  page.drawText('_________________________', { x: 50, y, size: 10, font });
  page.drawText('_________________________', { x: 320, y, size: 10, font });
}

function generateAppendixPage(pdfDoc: any, font: any, fontBold: any, data: any) {
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { reservationId, date, customer, car, reservation } = data;
  let y = 790;

  const pageWidth = 595.28;
  const at = 'PRIEDAS Nr. 1';
  const atw = fontBold.widthOfTextAtSize(at, 16);
  page.drawText(at, { x: (pageWidth - atw) / 2, y, size: 16, font: fontBold }); y -= 20;
  const st = `prie Automobilių nuomos sutarties Nr. ${reservationId.substring(0, 8).toUpperCase()}`;
  const stw = font.widthOfTextAtSize(st, 10);
  page.drawText(st, { x: (pageWidth - stw) / 2, y, size: 10, font }); y -= 16;
  const dw = font.widthOfTextAtSize(date, 10);
  page.drawText(date, { x: (pageWidth - dw) / 2, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) }); y -= 28;
  drawLine(page, y); y -= 20;

  // Lessor
  page.drawText('1. NUOMOTOJAS', { x: 40, y, size: 11, font: fontBold }); y -= 18;
  for (const [k, v] of [
    ['Pavadinimas', 'MB "Carbonus"'], ['Įmonės kodas', '306 588 891'],
    ['Adresas', 'Gardino g. 77, LT-66191 Druskininkai'],
    ['Telefonas', '+370 698 18 781'], ['El. paštas', 'info@carbonus.lt'],
  ]) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font }); y -= 15;
  }
  y -= 10; drawLine(page, y); y -= 20;

  // Tenant
  page.drawText('2. NUOMININKAS', { x: 40, y, size: 11, font: fontBold }); y -= 18;
  const isCorporate = customer.is_corporate;
  const tenantRows: [string, string][] = [];
  if (isCorporate && customer.company_name) {
    tenantRows.push(['Įmonės pavadinimas', customer.company_name]);
    if (customer.company_code) tenantRows.push(['Įmonės kodas', customer.company_code]);
    if (customer.vat_code) tenantRows.push(['PVM mokėtojo kodas', customer.vat_code]);
    tenantRows.push(['Atstovas', `${customer.first_name} ${customer.last_name}`]);
  } else {
    tenantRows.push(['Vardas, pavardė', `${customer.first_name} ${customer.last_name}`]);
  }
  if (customer.address) tenantRows.push(['Adresas', customer.address]);
  tenantRows.push(['Telefonas', customer.phone]);
  tenantRows.push(['El. paštas', customer.email]);
  for (const [k, v] of tenantRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(String(v), { x: 190, y, size: 10, font }); y -= 15;
  }
  y -= 10; drawLine(page, y); y -= 20;

  // Car
  page.drawText('3. AUTOMOBILIS', { x: 40, y, size: 11, font: fontBold }); y -= 18;
  const carRows: [string, string][] = [
    ['Markė, modelis', car?.name || reservation.car_name || '—'],
    ['Metai', car?.year ? String(car.year) : '—'],
    ['Kategorija', car?.category || '—'],
    ['Kuro tipas', car?.fuel || '—'],
    ['Pavarų dėžė', car?.transmission || '—'],
    ['Keleivių skaičius', car?.passengers ? String(car.passengers) : '—'],
  ];
  if (car?.license_plate) carRows.push(['Valst. numeris', car.license_plate]);
  if (car?.current_mileage) carRows.push(['Rida', `${car.current_mileage} km`]);
  for (const [k, v] of carRows) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font }); y -= 15;
  }
  y -= 10; drawLine(page, y); y -= 20;

  // Rental period
  page.drawText('4. NUOMOS LAIKOTARPIS IR KAINA', { x: 40, y, size: 11, font: fontBold }); y -= 18;
  const pickupTime = reservation.pickup_time || '10:00';
  const returnTime = reservation.return_time || '10:00';
  for (const [k, v] of [
    ['Nuomos pradžia', `${reservation.start_date} ${pickupTime}`],
    ['Nuomos pabaiga', `${reservation.end_date} ${returnTime}`],
    ['Nuomos dienų sk.', `${reservation.rental_days}`],
    ['Dienos kaina', `€${reservation.daily_rate}`],
    ['Nuomos kaina', `€${reservation.total_rental_cost}`],
    ['Užstatas', `€${reservation.deposit_amount}`],
    ['Bendra suma', `€${reservation.total_amount}`],
  ] as [string, string][]) {
    page.drawText(`${k}:`, { x: 50, y, size: 10, font: fontBold });
    page.drawText(v, { x: 190, y, size: 10, font }); y -= 15;
  }
  y -= 10; drawLine(page, y); y -= 20;

  // Signatures
  page.drawText('ŠALIŲ PARAŠAI', { x: 40, y, size: 11, font: fontBold }); y -= 24;
  page.drawText('Nuomotojas:', { x: 50, y, size: 10, font: fontBold });
  page.drawText('Nuomininkas:', { x: 320, y, size: 10, font: fontBold }); y -= 16;
  page.drawText('MB "Carbonus"', { x: 50, y, size: 10, font });
  const sn = isCorporate && customer.company_name ? customer.company_name : `${customer.first_name} ${customer.last_name}`;
  page.drawText(sn, { x: 320, y, size: 10, font }); y -= 50;
  page.drawText('_________________________', { x: 50, y, size: 10, font });
  page.drawText('_________________________', { x: 320, y, size: 10, font });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, reservationId }: VerifyPaymentRequest = await req.json();
    console.log('Verifying payment:', { sessionId, reservationId });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Stripe session status:', session.payment_status);

    const isCompleted = session.payment_status === 'paid' || session.status === 'complete';
    
    if (isCompleted && session.payment_intent) {
      console.log('Payment completed successfully');

      const { data, error } = await supabase
        .from('reservations')
        .update({ 
          status: 'paid',
          payment_transaction_id: session.payment_intent as string,
          payment_provider: 'stripe',
          updated_at: new Date().toISOString()
        })
        .eq('id', reservationId)
        .select();

      if (error) { console.error('Error updating reservation:', error); throw error; }
      console.log('Reservation updated successfully:', data);

      const reservation = data?.[0];
      let contractPdfUrl = null;
      let customer: any = null;
      let car: any = null;
      
      if (reservation) {
        // Fetch full customer data
        const { data: c } = await supabase.from('customers').select('*').eq('id', reservation.customer_id).single();
        customer = c;

        // Fetch full car data
        if (reservation.car_id) {
          const { data: carData } = await supabase.from('cars').select('*').eq('id', reservation.car_id).single();
          car = carData;
        }

        if (customer) {
          try {
            const pdfDoc = await PDFDocument.create();
            const { font, fontBold } = await loadFonts(pdfDoc);
            const todayStr = new Date().toLocaleDateString('lt-LT');

            const pdfData = {
              reservationId,
              date: todayStr,
              customer,
              car,
              reservation,
              signatureBytes: null,
            };

            generateMainContractPage(pdfDoc, font, fontBold, pdfData);
            generateAppendixPage(pdfDoc, font, fontBold, pdfData);

            const pdfBytes = await pdfDoc.save();
            const pdfFilePath = `${reservation.id}/nuomos_sutartis_${reservation.id}.pdf`;
            
            const { error: uploadError } = await supabase.storage
              .from('contracts')
              .upload(pdfFilePath, pdfBytes, { contentType: 'application/pdf', upsert: true });

            if (!uploadError) {
              contractPdfUrl = pdfFilePath;
              await supabase.from('reservations').update({ contract_pdf_url: contractPdfUrl }).eq('id', reservation.id);
              console.log('Contract PDF generated:', contractPdfUrl);
            }
          } catch (pdfError) {
            console.error('Error generating contract PDF:', pdfError);
          }

          // Send confirmation email
          try {
            await supabase.functions.invoke('send-status-email', {
              body: {
                reservationId: reservation.id,
                customerEmail: customer.email,
                customerName: `${customer.first_name} ${customer.last_name}`,
                carName: reservation.car_name,
                startDate: reservation.start_date,
                endDate: reservation.end_date,
                totalAmount: reservation.total_amount,
                status: 'paid',
                paymentTransactionId: session.payment_intent as string,
                contractPdfUrl: contractPdfUrl
              }
            });
            console.log('Confirmation email sent');
          } catch (emailError) {
            console.error('Error sending confirmation email:', emailError);
          }
        }
      }

      const amount = session.metadata?.amount ? parseFloat(session.metadata.amount) : 0;
      
      return new Response(JSON.stringify({ 
        success: true, paymentStatus: 'paid', amount,
        reservation: data?.[0], contractPdfUrl
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200,
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, paymentStatus: session.payment_status, message: 'Payment not completed'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
      });
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500,
    });
  }
});
