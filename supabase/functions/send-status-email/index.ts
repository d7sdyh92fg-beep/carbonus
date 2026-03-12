import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
  
  const logoUrl = 'https://carbonus.lt/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png';
  const logoStyles = 'max-width: 180px; height: auto; margin-bottom: 24px;';
  
  const templatesLT: Record<StatusType, { subject: string; html: string }> = {
    awaiting_payment: {
      subject: "Užbaikite rezervaciją - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
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
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
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
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
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
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color:#22c55e;margin:0 0 12px;">✅ Apmokėjimas sėkmingai gautas!</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Dėkojame už apmokėjimą! Jūsų rezervacija patvirtinta ir nuomos sutartis pridėta prie šio el. laiško (PDF formatu).</p>
          
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <h2 style="margin-top:0;font-size:18px;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Sumokėta:</strong> €${totalAmount}</p>
            ${paymentTransactionId ? `<p><strong>Mokėjimo ID:</strong> ${paymentTransactionId}</p>` : ''}
            <p><strong>Rezervacijos Nr.:</strong> ${reservationId}</p>
          </div>
          
          <div style="background:#dbeafe;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;"><strong>📋 Kas toliau?</strong></p>
            <p style="margin:10px 0 0 0;">
              1. Pasiruoškite automobilio pasiėmimui nustatytą dieną<br>
              2. Turėkite su savimi galiojantį vairuotojo pažymėjimą<br>
              3. Automobilis bus paruoštas atsiėmimui nuo ${startDate} 9:00 val.
            </p>
          </div>
          
          <div style="background:#fef3c7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #f59e0b;">
            <p style="margin:0;"><strong>⚠️ Svarbu prisiminti:</strong></p>
            <p style="margin:10px 0 0 0;">
              • Automobilis bus paruoštas atsiėmimui nuo ${startDate} 9:00 val.<br>
              • Prašome atvykti laiku<br>
              • Automobilio būklė bus patikrinta kartu su jumis
            </p>
          </div>
          
          <p>Jei turite klausimų ar reikia pakeisti atsiėmimo laiką, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 6 98 18 781</p>
          
          <p style="margin-top:30px;color:#6b7280;font-size:14px;">
            Laukiame susitikimo!<br>Carbonus komanda
          </p>
        </div>
      `
    },
    cancelled: {
      subject: "Rezervacija atšaukta - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color:#ef4444;margin:0 0 12px;">Jūsų rezervacija atšaukta</h1>
          <p>Sveiki, ${customerName}! Jūsų rezervacija atšaukta.</p>
        </div>
      `
    },
    picked_up: {
      subject: "Automobilis atsiimtas - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color:#6366f1;margin:0 0 12px;">Automobilis sėkmingai atsiimtas</h1>
          <p>Sveiki, ${customerName}! Patvirtiname, kad sėkmingai atsiėmėte automobilį.</p>
        </div>
      `
    },
    completed: {
      subject: "Nuoma baigta - Dėkojame! - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
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
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
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
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
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
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
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
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color:#22c55e;margin:0 0 12px;">✅ Payment Successfully Received!</h1>
          <p>Hello, ${customerName}!</p>
          <p>Thank you for your payment! Your booking is confirmed and the rental agreement is attached to this email (PDF format).</p>
          
          <div style="background:#f3f4f6;padding:16px;border-radius:8px;margin:16px 0;">
            <h2 style="margin-top:0;font-size:18px;">Booking Details:</h2>
            <p><strong>Car:</strong> ${carName}</p>
            <p><strong>Rental Start:</strong> ${startDate}</p>
            <p><strong>Rental End:</strong> ${endDate}</p>
            <p><strong>Paid:</strong> €${totalAmount}</p>
            ${paymentTransactionId ? `<p><strong>Payment ID:</strong> ${paymentTransactionId}</p>` : ''}
            <p><strong>Booking ID:</strong> ${reservationId}</p>
          </div>
          
          <div style="background:#dbeafe;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;"><strong>📋 What's Next?</strong></p>
            <p style="margin:10px 0 0 0;">
              1. Prepare for car pickup on the scheduled date<br>
              2. Have your valid driver's license with you<br>
              3. Car will be ready for pickup from ${startDate} 9:00 AM
            </p>
          </div>
          
          <div style="background:#fef3c7;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #f59e0b;">
            <p style="margin:0;"><strong>⚠️ Important to Remember:</strong></p>
            <p style="margin:10px 0 0 0;">
              • Car will be ready for pickup from ${startDate} 9:00 AM<br>
              • Please arrive on time<br>
              • Car condition will be inspected together with you
            </p>
          </div>
          
          <p>If you have questions or need to change the pickup time, contact us:</p>
          <p>📧 Email: info@carbonus.lt<br>📞 Phone: +370 6 98 18 781</p>
          
          <p style="margin-top:30px;color:#6b7280;font-size:14px;">
            Looking forward to seeing you!<br>Carbonus Team
          </p>
        </div>
      `
    },
    cancelled: {
      subject: "Booking Cancelled - Carbonus Rental",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color:#ef4444;margin:0 0 12px;">Your Booking Has Been Cancelled</h1>
          <p>Hello, ${customerName}! Your booking has been cancelled.</p>
        </div>
      `
    },
    picked_up: {
      subject: "Car Picked Up - Carbonus Rental",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color:#6366f1;margin:0 0 12px;">Car Successfully Picked Up</h1>
          <p>Hello, ${customerName}! We confirm that you have successfully picked up the car.</p>
        </div>
      `
    },
    completed: {
      subject: "Rental Completed - Thank You! - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color:#22c55e;margin:0 0 12px;">Thank You for Choosing Carbonus!</h1>
          <p>Hello, ${customerName}! Your rental has been successfully completed.</p>
        </div>
      `
    }
  };
  
  return isLT ? templatesLT[status as StatusType] : templatesEN[status as StatusType];
}

// Helper function to get the static PDF URL based on language
function getStaticPdfUrl(language: string = 'lt'): string {
  const baseUrl = 'https://carbonus.lt';
  if (language === 'en') {
    return `${baseUrl}/carbonus-rental-agreement.pdf`;
  }
  return `${baseUrl}/carbonus-nuomos-sutartis.pdf`;
}

// Helper function to download PDF from URL as base64
async function downloadPdfAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
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

    // When marked as paid, attach the static contract PDF
    if (data.status === 'paid') {
      try {
        const language = data.language || 'lt';
        const pdfUrl = getStaticPdfUrl(language);
        console.log('Downloading static PDF from:', pdfUrl);
        
        const base64Content = await downloadPdfAsBase64(pdfUrl);
        
        const pdfFilename = language === 'en' 
          ? 'carbonus-rental-agreement.pdf'
          : 'carbonus-nuomos-sutartis.pdf';
        
        emailOptions.attachments = [{
          filename: pdfFilename,
          content: base64Content,
          contentType: 'application/pdf'
        }];
        console.log(`Attached static ${language.toUpperCase()} PDF:`, pdfFilename);
      } catch (error) {
        console.error('Error preparing PDF attachment:', error);
        // Continue without attachment if there's an error
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