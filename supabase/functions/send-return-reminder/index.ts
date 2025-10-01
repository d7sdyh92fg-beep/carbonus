import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReturnReminderRequest {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  endDate: string;
  returnLocation?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ReturnReminderRequest = await req.json();
    console.log("Sending return reminder for reservation:", data.reservationId);

    const returnLocation = data.returnLocation || "toje pačioje vietoje, kur pasiėmėte";

    const emailResponse = await resend.emails.send({
      from: "Carbonus <info@carbonus.lt>",
      to: [data.customerEmail],
      subject: "⏰ Automobilio grąžinimas - rytoj",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">⏰ Automobilio grąžinimas jau rytoj!</h1>
          <p>Sveiki, ${data.customerName}!</p>
          <p>Primename, kad rytoj baigiasi jūsų automobilio nuomos laikotarpis.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Grąžinimo informacija:</h2>
            <p><strong>Automobilis:</strong> ${data.carName}</p>
            <p><strong>Grąžinimo data:</strong> ${data.endDate}</p>
            <p><strong>Grąžinimo vieta:</strong> ${returnLocation}</p>
            <p><strong>Rekomenduojamas laikas:</strong> iki 18:00 val.</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>✅ Prieš grąžindami automobilį:</strong></p>
            <p style="margin: 10px 0 0 0;">
              <strong>1. Degalai:</strong><br>
              • Papildykite degalus iki tokio pat lygio kaip gavote<br>
              • Jei degalų bakas nepilnas, taikomas €1.50/l mokestis<br><br>
              
              <strong>2. Valymas:</strong><br>
              • Išvalykite šiukšles iš salono<br>
              • Automobilio vidus turi būti tvarkingos būklės<br>
              • Jei labai purvinas, rekomenduojame nuplauti<br><br>
              
              <strong>3. Apžiūra:</strong><br>
              • Patikrinkite, ar nesate palikę asmeninių daiktų<br>
              • Įsitikinkite, kad visi dokumentai ir įranga vietoje<br>
              • Užfiksuokite automobilio būklę nuotraukomis
            </p>
          </div>
          
          <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p style="margin: 0;"><strong>⚠️ Vėlavimo mokestis:</strong></p>
            <p style="margin: 10px 0 0 0;">
              Už kiekvieną pavėluotą valandą taikomas papildomas mokestis.<br>
              Jei žinote, kad pavėluosite, prašome pranešti iš anksto:<br>
              📞 +370 6 98 18 781
            </p>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>💰 Užstato grąžinimas:</strong></p>
            <p style="margin: 10px 0 0 0;">
              Po automobilio apžiūros, jūsų užstatas (€200) bus grąžintas į nurodytą sąskaitą per 3-5 darbo dienas.
            </p>
          </div>
          
          <p><strong>Svarbu:</strong> Jei negalėsite grąžinti automobilio nurodytu laiku, prašome nedelsiant pranešti mums.</p>
          
          <p>Jei turite klausimų, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Dėkojame už pasirinktą Carbonus!<br>Carbonus komanda
          </p>
        </div>
      `,
    });

    console.log("Return reminder email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-return-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
