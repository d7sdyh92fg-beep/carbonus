import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PickupReminderRequest {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: PickupReminderRequest = await req.json();
    console.log("Sending pickup reminder for reservation:", data.reservationId);
    const isLT = (data.language || 'lt') === 'lt';

    const pickupLocation = data.pickupLocation || (isLT ? "mūsų biure (adresas bus suderintas atskirai)" : "our office (address will be coordinated separately)");

    const emailResponse = await resend.emails.send({
      from: "Carbonus <info@carbonus.lt>",
      to: [data.customerEmail],
      subject: isLT ? "🚗 Primename - rytoj pasiimate automobilį!" : "🚗 Reminder - Pick up your car tomorrow!",
      html: isLT ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">🚗 Automobilio pasiėmimas jau rytoj!</h1>
          <p>Sveiki, ${data.customerName}!</p>
          <p>Primename, kad rytoj prasideda jūsų automobilio nuomos laikotarpis.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Jūsų rezervacija:</h2>
            <p><strong>Automobilis:</strong> ${data.carName}</p>
            <p><strong>Pasiėmimo data:</strong> ${data.startDate}</p>
            <p><strong>Grąžinimo data:</strong> ${data.endDate}</p>
            <p><strong>Vieta:</strong> ${pickupLocation}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>✅ Pasiruošimo sąrašas:</strong></p>
            <p style="margin: 10px 0 0 0;">
              Prašome turėti su savimi:<br><br>
              📋 <strong>Dokumentai:</strong><br>
              • Galiojantį vairuotojo pažymėjimą<br>
              • Asmens dokumentą (ID kortelę ar pasą)<br>
              • Pasirašytos sutarties kopiją (jei turite)<br><br>
              
              💳 <strong>Mokėjimas:</strong><br>
              • Banko kortelę (jei dar likę apmokėti)<br>
              • Užstato suma: €300 (bus grąžinta po nuomos)<br><br>
              
              📱 <strong>Ryšys:</strong><br>
              • Įsitikinkite, kad galime su jumis susisiekti telefonu
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>☀️ Patarimai kelionei:</strong></p>
            <p style="margin: 10px 0 0 0;">
              • Patikrinkite orų prognozes keliui<br>
              • Susipažinkite su automobilio funkcijomis prieš išvykdami<br>
              • Apžiūrėkite automobilio būklę kartu su mumis<br>
              • Nufotografuokite automobilį prieš išvykdami
            </p>
          </div>
          
          <p><strong>Svarbu:</strong> Jei jūsų planai pasikeitė ar negalėsite atvykti nurodytu laiku, prašome nedelsiant pranešti mums.</p>
          
          <p>Laukiame jūsų susitikimo!</p>
          
          <p>Jei turite klausimų, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Geros kelionės!<br>Carbonus komanda
          </p>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">🚗 Car Pickup Tomorrow!</h1>
          <p>Hello, ${data.customerName}!</p>
          <p>We remind you that your car rental period starts tomorrow.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Your Booking:</h2>
            <p><strong>Car:</strong> ${data.carName}</p>
            <p><strong>Pickup Date:</strong> ${data.startDate}</p>
            <p><strong>Return Date:</strong> ${data.endDate}</p>
            <p><strong>Location:</strong> ${pickupLocation}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>✅ Preparation Checklist:</strong></p>
            <p style="margin: 10px 0 0 0;">
              Please have with you:<br><br>
              📋 <strong>Documents:</strong><br>
              • Valid driver's license<br>
              • Personal ID (ID card or passport)<br>
              • Signed contract copy (if you have it)<br><br>
              
              💳 <strong>Payment:</strong><br>
              • Bank card (if payment remaining)<br>
              • Deposit amount: €300 (will be refunded after rental)<br><br>
              
              📱 <strong>Contact:</strong><br>
              • Make sure we can reach you by phone
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>☀️ Travel Tips:</strong></p>
            <p style="margin: 10px 0 0 0;">
              • Check weather forecast for your trip<br>
              • Familiarize yourself with car features before leaving<br>
              • Inspect car condition together with us<br>
              • Take photos of the car before departure
            </p>
          </div>
          
          <p><strong>Important:</strong> If your plans changed or you can't arrive at the specified time, please let us know immediately.</p>
          
          <p>Looking forward to seeing you!</p>
          
          <p>If you have questions, contact us:</p>
          <p>📧 Email: info@carbonus.lt<br>📞 Phone: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Safe travels!<br>Carbonus Team
          </p>
        </div>
      `,
    });

    console.log("Pickup reminder email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-pickup-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);