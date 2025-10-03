import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StatusEmailRequest {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: string;
  paymentTransactionId?: string;
  contractPdfUrl?: string;
}

const getEmailContent = (data: StatusEmailRequest) => {
  const { customerName, carName, startDate, endDate, totalAmount, status, paymentTransactionId } = data;
  
  const templates = {
    confirmed: {
      subject: "Rezervacija patvirtinta - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Jūsų rezervacija patvirtinta!</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Džiaugiamės pranešti, kad jūsų automobilio nuomos rezervacija buvo patvirtinta.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Bendra suma:</strong> €${totalAmount}</p>
            <p><strong>Rezervacijos numeris:</strong> ${data.reservationId}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>📋 Kas toliau?</strong></p>
            <p style="margin: 10px 0 0 0;">
              • Prieš pasiėmimą su jumis susisieks mūsų darbuotojai<br>
              • Pasiruoškite vairuotojo pažymėjimą ir asmens dokumentą<br>
              • Automobilis bus paruoštas nurodytą dieną<br>
              • Atšaukti galite iki 3 dienų prieš nuomos pradžią
            </p>
          </div>
          
          <p>Jei turite klausimų, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 698 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    partial_payment: {
      subject: "Išankstinis mokėjimas gautas - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Išankstinis mokėjimas gautas!</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Gavome jūsų išankstinį mokėjimą. Jūsų rezervacija patvirtinta!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Bendra suma:</strong> €${totalAmount}</p>
            <p><strong>Rezervacijos numeris:</strong> ${data.reservationId}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>💰 Likusi suma</strong></p>
            <p style="margin: 10px 0 0 0;">Likusi suma bus apmokėta pasiimant automobilį. Galėsite mokėti kortele arba grynaisiais.</p>
          </div>
          
          <p>Jei turite klausimų, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 698 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    awaiting_payment: {
      subject: "Užbaikite rezervaciją - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Laukiame jūsų mokėjimo</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Jūsų rezervacija sukurta, bet laukiame mokėjimo patvirtinimo.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Suma:</strong> €${totalAmount}</p>
            <p><strong>Rezervacijos numeris:</strong> ${data.reservationId}</p>
          </div>
          
          <p>Jei įvyko mokėjimo klaida arba norite pakeisti mokėjimo būdą, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 698 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    payment_failed: {
      subject: "Mokėjimo klaida - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Mokėjimas nepavyko</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Deja, jūsų mokėjimas už rezervaciją nepavyko.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Suma:</strong> €${totalAmount}</p>
          </div>
          
          <p>Prašome susisiekti su mumis, kad galėtume padėti užbaigti rezervaciją:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 698 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    paid: {
      subject: "Apmokėjimas gautas - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Apmokėjimas sėkmingai gautas!</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Gavome jūsų apmokėjimą už automobilio nuomą. Dėkojame!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Sumokėta:</strong> €${totalAmount}</p>
            ${paymentTransactionId ? `<p><strong>Mokėjimo ID:</strong> ${paymentTransactionId}</p>` : ''}
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Kas toliau?</strong></p>
            <p style="margin: 10px 0 0 0;">Prieš nuomos pradžią su jumis susisieks mūsų darbuotojai ir suderins automobilio atsiėmimo detales.</p>
          </div>
          
          <p>Jei turite klausimų, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    cancelled: {
      subject: "Rezervacija atšaukta - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Jūsų rezervacija atšaukta</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Deja, jūsų automobilio nuomos rezervacija buvo atšaukta.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Atšauktos rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
          </div>
          
          <p>Jei atšaukėte patys ir sumokėjote užstatą ar avansą, grąžinimo procesas bus pradėtas per 3-5 darbo dienas.</p>
          <p>Jei rezervacija buvo atšaukta dėl mūsų administracijos sprendimo, su jumis susisieksime atskirai.</p>
          
          <p>Jei turite klausimų, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    completed: {
      subject: "Nuoma baigta - Dėkojame! - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Dėkojame už pasirinktą Carbonus!</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Jūsų automobilio nuoma sėkmingai baigta. Tikimės, kad mūsų paslaugos patiko!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Nuomos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos laikotarpis:</strong> ${startDate} - ${endDate}</p>
            <p><strong>Bendra suma:</strong> €${totalAmount}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Užstato grąžinimas</strong></p>
            <p style="margin: 10px 0 0 0;">Jūsų užstatas bus grąžintas per 3-5 darbo dienas į jūsų nurodytą sąskaitą po automobilio apžiūros.</p>
          </div>
          
          <p>Būtume dėkingi už atsiliepimą apie mūsų paslaugas. Jūsų nuomonė mums labai svarbi!</p>
          
          <p>Tikimės vėl matyti jus tarp mūsų klientų!</p>
          
          <p>Jei turite klausimų, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    }
  };

  return templates[status as keyof typeof templates] || null;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: StatusEmailRequest = await req.json();
    console.log("Sending status email for reservation:", data.reservationId, "Status:", data.status);

    const emailContent = getEmailContent(data);
    
    if (!emailContent) {
      console.log("No email template for status:", data.status);
      return new Response(
        JSON.stringify({ message: "No email template for this status" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Prepare email options
    const emailOptions: any = {
      from: "Carbonus <info@carbonus.lt>",
      to: [data.customerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    };

    // If status is confirmed and there's a contract PDF, attach it
    if (data.status === 'confirmed' && data.contractPdfUrl) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Extract the file path from the URL
        const urlParts = data.contractPdfUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        // Download the PDF from Supabase storage
        const { data: pdfData, error: downloadError } = await supabase.storage
          .from('contracts')
          .download(`${data.reservationId}/${fileName}`);

        if (!downloadError && pdfData) {
          // Convert blob to base64
          const arrayBuffer = await pdfData.arrayBuffer();
          const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          emailOptions.attachments = [{
            filename: `nuomos_sutartis_${data.reservationId}.pdf`,
            content: base64Pdf,
          }];
          console.log("Contract PDF attached to confirmation email");
        } else {
          console.error("Error downloading PDF:", downloadError);
        }
      } catch (pdfError) {
        console.error("Error processing PDF attachment:", pdfError);
        // Continue sending email without attachment if PDF fails
      }
    }

    const emailResponse = await resend.emails.send(emailOptions);

    console.log("Status email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-status-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
