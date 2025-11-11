import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit@1.1.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type StatusType = 'awaiting_payment' | 'partial_payment' | 'payment_failed' | 'paid' | 'cancelled' | 'picked_up' | 'completed';

interface StatusEmailRequest {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: StatusType;
  paymentTransactionId?: string;
  contractPdfUrl?: string;
  language?: string;
}

// Minimal, clean email templates
function getEmailContent(data: StatusEmailRequest) {
  const { customerName, carName, startDate, endDate, totalAmount, status, paymentTransactionId, reservationId, language } = data;
  const isLT = (language || 'lt') === 'lt';
  
  const templatesLT: Record<StatusType, { subject: string; html: string }> = {
    awaiting_payment: {
      subject: "Užbaikite rezervaciją - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#3b82f6;margin:0 0 12px;">Laukiame mokėjimo</h1>
          <p>Sveiki, ${customerName}! Jūsų rezervacija sukurta, bet laukiame mokėjimo patvirtinimo.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Laikotarpis:</strong> ${startDate} – ${endDate}</p>
            <p><strong>Suma:</strong> €${totalAmount}</p>
            <p><strong>Rezervacijos Nr.:</strong> ${reservationId}</p>
          </div>
        </div>
      `
    },
    partial_payment: {
      subject: "Išankstinis mokėjimas gautas - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#22c55e;margin:0 0 12px;">Išankstinis mokėjimas gautas</h1>
          <p>Sveiki, ${customerName}! Gavome jūsų išankstinį mokėjimą. Rezervacija patvirtinta.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Laikotarpis:</strong> ${startDate} – ${endDate}</p>
            <p><strong>Bendra suma:</strong> €${totalAmount}</p>
            <p><strong>Rezervacijos Nr.:</strong> ${reservationId}</p>
          </div>
        </div>
      `
    },
    payment_failed: {
      subject: "Mokėjimo klaida - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#ef4444;margin:0 0 12px;">Mokėjimas nepavyko</h1>
          <p>Sveiki, ${customerName}! Deja, jūsų mokėjimas nepavyko. Jei reikia pagalbos – parašykite mums.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Laikotarpis:</strong> ${startDate} – ${endDate}</p>
            <p><strong>Suma:</strong> €${totalAmount}</p>
          </div>
        </div>
      `
    },
    paid: {
      subject: "Apmokėjimas gautas - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#22c55e;margin:0 0 12px;">Apmokėjimas sėkmingai gautas!</h1>
          <p>Sveiki, ${customerName}! Gavome jūsų apmokėjimą. Pridedame nuomos sutartį (PDF).</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Laikotarpis:</strong> ${startDate} – ${endDate}</p>
            <p><strong>Sumokėta:</strong> €${totalAmount}</p>
            ${paymentTransactionId ? `<p><strong>Mokėjimo ID:</strong> ${paymentTransactionId}</p>` : ''}
          </div>
        </div>
      `
    },
    cancelled: {
      subject: "Rezervacija atšaukta - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#ef4444;margin:0 0 12px;">Jūsų rezervacija atšaukta</h1>
          <p>Sveiki, ${customerName}! Jūsų rezervacija atšaukta.</p>
        </div>
      `
    },
    picked_up: {
      subject: "Automobilis atsiimtas - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#6366f1;margin:0 0 12px;">Automobilis sėkmingai atsiimtas</h1>
          <p>Sveiki, ${customerName}! Patvirtiname, kad sėkmingai atsiėmėte automobilį.</p>
        </div>
      `
    },
    completed: {
      subject: "Nuoma baigta - Dėkojame! - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#22c55e;margin:0 0 12px;">Ačiū, kad pasirinkote Carbonus!</h1>
          <p>Sveiki, ${customerName}! Jūsų nuoma sėkmingai baigta.</p>
        </div>
      `
    }
  };
  
  const templatesEN: Record<StatusType, { subject: string; html: string }> = {
    awaiting_payment: {
      subject: "Complete Your Booking - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#3b82f6;margin:0 0 12px;">Awaiting Payment</h1>
          <p>Hello, ${customerName}! Your booking has been created, but we are waiting for payment confirmation.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Car:</strong> ${carName}</p>
            <p><strong>Period:</strong> ${startDate} – ${endDate}</p>
            <p><strong>Amount:</strong> €${totalAmount}</p>
            <p><strong>Booking ID:</strong> ${reservationId}</p>
          </div>
        </div>
      `
    },
    partial_payment: {
      subject: "Advance Payment Received - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#22c55e;margin:0 0 12px;">Advance Payment Received</h1>
          <p>Hello, ${customerName}! We received your advance payment. Booking confirmed.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Car:</strong> ${carName}</p>
            <p><strong>Period:</strong> ${startDate} – ${endDate}</p>
            <p><strong>Total Amount:</strong> €${totalAmount}</p>
            <p><strong>Booking ID:</strong> ${reservationId}</p>
          </div>
        </div>
      `
    },
    payment_failed: {
      subject: "Payment Error - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#ef4444;margin:0 0 12px;">Payment Failed</h1>
          <p>Hello, ${customerName}! Unfortunately, your payment has failed. If you need help, please contact us.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Car:</strong> ${carName}</p>
            <p><strong>Period:</strong> ${startDate} – ${endDate}</p>
            <p><strong>Amount:</strong> €${totalAmount}</p>
          </div>
        </div>
      `
    },
    paid: {
      subject: "Payment Received - Carbonus Rental",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#22c55e;margin:0 0 12px;">Payment Successfully Received!</h1>
          <p>Hello, ${customerName}! We received your payment. Please find the rental agreement (PDF) attached.</p>
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <p><strong>Car:</strong> ${carName}</p>
            <p><strong>Period:</strong> ${startDate} – ${endDate}</p>
            <p><strong>Paid:</strong> €${totalAmount}</p>
            ${paymentTransactionId ? `<p><strong>Payment ID:</strong> ${paymentTransactionId}</p>` : ''}
          </div>
        </div>
      `
    },
    cancelled: {
      subject: "Booking Cancelled - Carbonus Rental",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#ef4444;margin:0 0 12px;">Your Booking Has Been Cancelled</h1>
          <p>Hello, ${customerName}! Your booking has been cancelled.</p>
        </div>
      `
    },
    picked_up: {
      subject: "Car Picked Up - Carbonus Rental",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#6366f1;margin:0 0 12px;">Car Successfully Picked Up</h1>
          <p>Hello, ${customerName}! We confirm that you have successfully picked up the car.</p>
        </div>
      `
    },
    completed: {
      subject: "Rental Completed - Thank You! - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h1 style="color:#22c55e;margin:0 0 12px;">Thank You for Choosing Carbonus!</h1>
          <p>Hello, ${customerName}! Your rental has been successfully completed.</p>
        </div>
      `
    }
  };
  
  return isLT ? templatesLT[status as StatusType] : templatesEN[status as StatusType];
}

async function fetchNotoFonts() {
  const regular = await fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf');
  const bold = await fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf');
  return {
    regular: new Uint8Array(await regular.arrayBuffer()),
    bold: new Uint8Array(await bold.arrayBuffer()),
  };
}

async function ensureContractAndGetPath(supabase: ReturnType<typeof createClient>, reservationId: string): Promise<string | null> {
  // Try existing
  const { data: reservation } = await supabase
    .from('reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  let contractPath = reservation?.contract_pdf_url ?? null;
  if (contractPath) return contractPath;

  // Generate on-the-fly
  console.log('Generating contract PDF on-the-fly...');
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage([595.28, 841.89]);
  const { regular, bold } = await fetchNotoFonts();
  const font = await pdfDoc.embedFont(regular);
  const fontBold = await pdfDoc.embedFont(bold);

  // Fetch data for content
  const { data: full } = await supabase
    .from('reservations')
    .select('*, customers(*)')
    .eq('id', reservationId)
    .single();

  if (!full) return null;

  let y = 800;
  page.drawText('CARBONUS AUTOMOBILIŲ NUOMOS SUTARTIS', { x: 40, y, size: 14, font: fontBold, color: rgb(0,0,0) });
  y -= 24;
  page.drawText(`Sutarties Nr.: ${full.id}`, { x: 40, y, size: 11, font });
  y -= 16;
  page.drawText(`Data: ${new Date().toLocaleDateString('lt-LT')}`, { x: 40, y, size: 11, font });
  y -= 28;

  page.drawText('NUOMOS DUOMENYS', { x: 40, y, size: 12, font: fontBold });
  y -= 18;
  const rows: [string, string][] = [
    ['Klientas', `${full.customers?.first_name ?? ''} ${full.customers?.last_name ?? ''}`.trim()],
    ['El. paštas', full.customers?.email ?? ''],
    ['Telefonas', full.customers?.phone ?? ''],
    ['Automobilis', full.car_name],
    ['Paėmimo data', `${full.start_date}${full.pickup_time ? ' ' + full.pickup_time : ''}`],
    ['Grąžinimo data', `${full.end_date}${full.return_time ? ' ' + full.return_time : ''}`],
    ['Nuomos kaina', `€${full.total_rental_cost}`],
    ['Užstatas', `€${full.deposit_amount}`],
    ['Bendra suma', `€${full.total_amount}`],
  ];
  for (const [k, v] of rows) {
    page.drawText(`${k}:`, { x: 40, y, size: 11, font: fontBold });
    page.drawText(String(v), { x: 160, y, size: 11, font });
    y -= 16;
  }

  const pdfBytes = await pdfDoc.save();
  const path = `${reservationId}/nuomos_sutartis_${reservationId}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true });
  if (uploadError) {
    console.error('PDF upload error:', uploadError);
    return null;
  }
  await supabase.from('reservations').update({ contract_pdf_url: path }).eq('id', reservationId);
  console.log('Contract PDF generated and saved:', path);
  return path;
}

async function downloadAsBase64(supabase: ReturnType<typeof createClient>, path: string) {
  const filePath = path.replace(/^contracts\//, '');
  const { data, error } = await supabase.storage.from('contracts').download(filePath);
  if (error || !data) throw error ?? new Error('File not found');
  const buf = await data.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return { base64: b64, size: buf.byteLength };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const data: StatusEmailRequest = await req.json();
    console.log('Status email request:', { reservationId: data.reservationId, status: data.status });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const tmpl = getEmailContent(data);
    const emailOptions: any = {
      from: 'Carbonus <info@carbonus.lt>',
      to: [data.customerEmail],
      subject: tmpl.subject,
      html: tmpl.html,
    };

    // When marked as paid manually or via provider, guarantee contract attachment
    if (data.status === 'paid') {
      let path = data.contractPdfUrl ?? null;
      if (!path) path = await ensureContractAndGetPath(supabase, data.reservationId);

      if (path) {
        try {
          const { base64, size } = await downloadAsBase64(supabase, path);
          emailOptions.attachments = [{ filename: `nuomos_sutartis_${data.reservationId}.pdf`, content: base64, contentType: 'application/pdf' }];
          console.log(`Attached contract PDF (${size} bytes)`);
        } catch (e) {
          console.error('Attachment download failed:', e);
        }
      } else {
        console.warn('No contract PDF path available');
      }
    }

    const response = await resend.emails.send(emailOptions);
    console.log('Status email sent:', response?.id || response);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error in send-status-email:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});