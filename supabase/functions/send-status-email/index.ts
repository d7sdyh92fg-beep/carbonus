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
    partial_payment: {
      subject: "Išankstinis mokėjimas gautas - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22c55e; margin-bottom: 10px;">Išankstinis mokėjimas gautas!</h1>
          <p style="margin: 10px 0;">Sveiki, ${customerName}!</p>
          <p style="margin: 10px 0;">Gavome jūsų išankstinį mokėjimą. Jūsų rezervacija patvirtinta!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 15px 0; font-size: 18px;">Rezervacijos detalės:</h2>
            <p style="margin: 8px 0;"><strong>Automobilis:</strong> ${carName}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p style="margin: 8px 0;"><strong>Bendra suma:</strong> €${totalAmount}</p>
            <p style="margin: 8px 0;"><strong>Rezervacijos numeris:</strong> ${data.reservationId}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 10px 0;"><strong>💰 Likusi suma</strong></p>
            <p style="margin: 5px 0; line-height: 1.6;">Likusi suma bus apmokėta pasiimant automobilį. Galėsite mokėti kortele arba grynaisiais.</p>
          </div>
          
          <p style="margin: 20px 0 5px 0;">Jei turite klausimų, susisiekite su mumis:</p>
          <p style="margin: 5px 0;">
            📧 El. paštas: <a href="mailto:info@carbonus.lt" style="color: #3b82f6; text-decoration: none;">info@carbonus.lt</a><br>
            📞 Telefonas: <a href="tel:+37069818781" style="color: #3b82f6; text-decoration: none;">+370 698 18 781</a>
          </p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    awaiting_payment: {
      subject: "Užbaikite rezervaciją - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3b82f6; margin-bottom: 10px;">Laukiame jūsų mokėjimo</h1>
          <p style="margin: 10px 0;">Sveiki, ${customerName}!</p>
          <p style="margin: 10px 0;">Jūsų rezervacija sukurta, bet laukiame mokėjimo patvirtinimo.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 15px 0; font-size: 18px;">Rezervacijos detalės:</h2>
            <p style="margin: 8px 0;"><strong>Automobilis:</strong> ${carName}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p style="margin: 8px 0;"><strong>Suma:</strong> €${totalAmount}</p>
            <p style="margin: 8px 0;"><strong>Rezervacijos numeris:</strong> ${data.reservationId}</p>
          </div>
          
          <p style="margin: 20px 0;">Jei įvyko mokėjimo klaida arba norite pakeisti mokėjimo būdą, susisiekite su mumis:</p>
          <p style="margin: 5px 0;">
            📧 El. paštas: <a href="mailto:info@carbonus.lt" style="color: #3b82f6; text-decoration: none;">info@carbonus.lt</a><br>
            📞 Telefonas: <a href="tel:+37069818781" style="color: #3b82f6; text-decoration: none;">+370 698 18 781</a>
          </p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    payment_failed: {
      subject: "Mokėjimo klaida - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ef4444; margin-bottom: 10px;">Mokėjimas nepavyko</h1>
          <p style="margin: 10px 0;">Sveiki, ${customerName}!</p>
          <p style="margin: 10px 0;">Deja, jūsų mokėjimas už rezervaciją nepavyko.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 15px 0; font-size: 18px;">Rezervacijos detalės:</h2>
            <p style="margin: 8px 0;"><strong>Automobilis:</strong> ${carName}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p style="margin: 8px 0;"><strong>Suma:</strong> €${totalAmount}</p>
          </div>
          
          <p style="margin: 20px 0;">Prašome susisiekti su mumis, kad galėtume padėti užbaigti rezervaciją:</p>
          <p style="margin: 5px 0;">
            📧 El. paštas: <a href="mailto:info@carbonus.lt" style="color: #3b82f6; text-decoration: none;">info@carbonus.lt</a><br>
            📞 Telefonas: <a href="tel:+37069818781" style="color: #3b82f6; text-decoration: none;">+370 698 18 781</a>
          </p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    paid: {
      subject: "Apmokėjimas gautas - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22c55e; margin-bottom: 10px;">Apmokėjimas sėkmingai gautas!</h1>
          <p style="margin: 10px 0;">Sveiki, ${customerName}!</p>
          <p style="margin: 10px 0;">Gavome jūsų apmokėjimą už automobilio nuomą. Dėkojame!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 15px 0; font-size: 18px;">Rezervacijos detalės:</h2>
            <p style="margin: 8px 0;"><strong>Automobilis:</strong> ${carName}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p style="margin: 8px 0;"><strong>Sumokėta:</strong> €${totalAmount}</p>
            ${paymentTransactionId ? `<p style="margin: 8px 0;"><strong>Mokėjimo ID:</strong> ${paymentTransactionId}</p>` : ''}
          </div>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 10px 0;"><strong>📎 Nuomos sutartis</strong></p>
            <p style="margin: 5px 0; line-height: 1.6;">Nuomos sutartis pridėta prie šio laiško kaip PDF failas. Prašome ją išsaugoti ir pasiimti atsiimant automobilį.</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 10px 0;"><strong>📋 Kas toliau?</strong></p>
            <p style="margin: 5px 0; line-height: 1.6;">Prieš nuomos pradžią su jumis susisieks mūsų darbuotojai ir suderins automobilio atsiėmimo detales.</p>
          </div>
          
          <p style="margin: 20px 0 5px 0;">Jei turite klausimų, susisiekite su mumis:</p>
          <p style="margin: 5px 0;">
            📧 El. paštas: <a href="mailto:info@carbonus.lt" style="color: #3b82f6; text-decoration: none;">info@carbonus.lt</a><br>
            📞 Telefonas: <a href="tel:+37069818781" style="color: #3b82f6; text-decoration: none;">+370 698 18 781</a>
          </p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    cancelled: {
      subject: "Rezervacija atšaukta - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #ef4444; margin-bottom: 10px;">Jūsų rezervacija atšaukta</h1>
          <p style="margin: 10px 0;">Sveiki, ${customerName}!</p>
          <p style="margin: 10px 0;">Deja, jūsų automobilio nuomos rezervacija buvo atšaukta.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 15px 0; font-size: 18px;">Atšauktos rezervacijos detalės:</h2>
            <p style="margin: 8px 0;"><strong>Automobilis:</strong> ${carName}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pabaiga:</strong> ${endDate}</p>
          </div>
          
          <p style="margin: 20px 0; line-height: 1.6;">Jei atšaukėte patys ir sumokėjote užstatą ar avansą, grąžinimo procesas bus pradėtas per 3-5 darbo dienas.</p>
          <p style="margin: 10px 0; line-height: 1.6;">Jei rezervacija buvo atšaukta dėl mūsų administracijos sprendimo, su jumis susisieksime atskirai.</p>
          
          <p style="margin: 20px 0 5px 0;">Jei turite klausimų, susisiekite su mumis:</p>
          <p style="margin: 5px 0;">
            📧 El. paštas: <a href="mailto:info@carbonus.lt" style="color: #3b82f6; text-decoration: none;">info@carbonus.lt</a><br>
            📞 Telefonas: <a href="tel:+37069818781" style="color: #3b82f6; text-decoration: none;">+370 698 18 781</a>
          </p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    picked_up: {
      subject: "Automobilis atsiimtas - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #6366f1; margin-bottom: 10px;">Automobilis sėkmingai atsiimtas!</h1>
          <p style="margin: 10px 0;">Sveiki, ${customerName}!</p>
          <p style="margin: 10px 0;">Patvirtinome, kad sėkmingai atsiėmėte automobilį.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 15px 0; font-size: 18px;">Nuomos detalės:</h2>
            <p style="margin: 8px 0;"><strong>Automobilis:</strong> ${carName}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p style="margin: 8px 0;"><strong>Nuomos pabaiga:</strong> ${endDate}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 10px 0;"><strong>🚗 Saugios kelionės!</strong></p>
            <p style="margin: 5px 0; line-height: 1.6;">
              • Nepamirškite grąžinti automobilį nurodytą dieną<br>
              • Prieš grąžindami, prašome užpildyti degalų baką iki to paties lygio<br>
              • Automobilį grąžinkite švaru ir tvarkingu
            </p>
          </div>
          
          <p style="margin: 20px 0 5px 0;">Kilus klausimams, susisiekite:</p>
          <p style="margin: 5px 0;">
            📧 <a href="mailto:info@carbonus.lt" style="color: #3b82f6; text-decoration: none;">info@carbonus.lt</a><br>
            📞 <a href="tel:+37069818781" style="color: #3b82f6; text-decoration: none;">+370 698 18 781</a>
          </p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    completed: {
      subject: "Nuoma baigta - Dėkojame! - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22c55e; margin-bottom: 10px;">Dėkojame už pasirinktą Carbonus!</h1>
          <p style="margin: 10px 0;">Sveiki, ${customerName}!</p>
          <p style="margin: 10px 0;">Jūsų automobilio nuoma sėkmingai baigta. Tikimės, kad mūsų paslaugos patiko!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 15px 0; font-size: 18px;">Nuomos detalės:</h2>
            <p style="margin: 8px 0;"><strong>Automobilis:</strong> ${carName}</p>
            <p style="margin: 8px 0;"><strong>Nuomos laikotarpis:</strong> ${startDate} - ${endDate}</p>
            <p style="margin: 8px 0;"><strong>Bendra suma:</strong> €${totalAmount}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 10px 0;"><strong>💳 Užstato grąžinimas</strong></p>
            <p style="margin: 5px 0; line-height: 1.6;">Jūsų užstatas bus grąžintas per 3-5 darbo dienas į jūsų nurodytą sąskaitą po automobilio apžiūros.</p>
          </div>
          
          <p style="margin: 20px 0; line-height: 1.6;">Būtume dėkingi už atsiliepimą apie mūsų paslaugas. Jūsų nuomonė mums labai svarbi!</p>
          <p style="margin: 10px 0; line-height: 1.6;">Tikimės vėl matyti jus tarp mūsų klientų!</p>
          
          <p style="margin: 20px 0 5px 0;">Jei turite klausimų, susisiekite su mumis:</p>
          <p style="margin: 5px 0;">
            📧 El. paštas: <a href="mailto:info@carbonus.lt" style="color: #3b82f6; text-decoration: none;">info@carbonus.lt</a><br>
            📞 Telefonas: <a href="tel:+37069818781" style="color: #3b82f6; text-decoration: none;">+370 698 18 781</a>
          </p>
          
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

    // If status is paid and there's a contract PDF, attach it
    if (data.status === 'paid' && data.contractPdfUrl) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('Attempting to download PDF from:', data.contractPdfUrl);
        
        // Download the PDF from Supabase storage using the full path
        const { data: pdfData, error: downloadError } = await supabase.storage
          .from('contracts')
          .download(data.contractPdfUrl);

        if (!downloadError && pdfData) {
          // Convert blob to base64
          const arrayBuffer = await pdfData.arrayBuffer();
          const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          emailOptions.attachments = [{
            filename: `nuomos_sutartis_${data.reservationId}.pdf`,
            content: base64Pdf,
          }];
          console.log("Contract PDF successfully attached to confirmation email");
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
