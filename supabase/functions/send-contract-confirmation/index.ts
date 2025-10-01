import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractConfirmationRequest {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  startDate: string;
  endDate: string;
  contractPdfUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ContractConfirmationRequest = await req.json();
    console.log("Sending contract confirmation for reservation:", data.reservationId);

    const emailResponse = await resend.emails.send({
      from: "Carbonus <info@carbonus.lt>",
      to: [data.customerEmail],
      subject: "Sutartis pasirašyta - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">✅ Nuomos sutartis sėkmingai pasirašyta!</h1>
          <p>Sveiki, ${data.customerName}!</p>
          <p>Dėkojame, kad pasirašėte automobilio nuomos sutartį.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${data.carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${data.startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${data.endDate}</p>
            <p><strong>Rezervacijos numeris:</strong> ${data.reservationId}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>📋 Kas toliau?</strong></p>
            <p style="margin: 10px 0 0 0;">
              1. Pasiruoškite automobilio pasiėmimui nustatytą dieną<br>
              2. Turėkite su savimi:<br>
              &nbsp;&nbsp;&nbsp;• Galiojantį vairuotojo pažymėjimą<br>
              &nbsp;&nbsp;&nbsp;• Asmens dokumentą (ID kortelę ar pasą)<br>
              3. Sutarties kopiją gausite automobilio pasiėmimo metu
            </p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>⚠️ Svarbu prisiminti:</strong></p>
            <p style="margin: 10px 0 0 0;">
              • Automobilis bus paruoštas atsiėmimui nuo ${data.startDate} 9:00 val.<br>
              • Prašome atvykti laiku<br>
              • Automobilio būklė bus patikrinta kartu su jumis
            </p>
          </div>
          
          <p>Jei turite klausimų ar reikia pakeisti atsiėmimo laiką, susisiekite su mumis:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Laukiame susitikimo!<br>Carbonus komanda
          </p>
        </div>
      `,
    });

    console.log("Contract confirmation email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-contract-confirmation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
