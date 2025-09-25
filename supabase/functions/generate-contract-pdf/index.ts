import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractRequest {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  signatureData: string;
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64Data = dataUrl.split(",")[1] ?? "";
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      reservationId,
      customerName,
      customerEmail,
      carName,
      startDate,
      endDate,
      totalAmount,
      signatureData,
    }: ContractRequest = await req.json();

    // Init Supabase client (service role) to save signature
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let signatureUrl: string | null = null;
    if (signatureData && signatureData.startsWith("data:image")) {
      try {
        const bytes = dataUrlToUint8Array(signatureData);
        const filePath = `signatures/${reservationId}.png`;

        // Upload signature PNG to private bucket 'contracts'
        const { error: uploadError } = await supabase.storage
          .from("contracts")
          .upload(filePath, bytes, {
            contentType: "image/png",
            upsert: true,
          });
        if (uploadError) throw uploadError;

        // Create a signed URL valid for 30 days
        const { data: signed, error: signedErr } = await supabase.storage
          .from("contracts")
          .createSignedUrl(filePath, 60 * 60 * 24 * 30);
        if (signedErr) throw signedErr;
        signatureUrl = signed?.signedUrl ?? null;
      } catch (e) {
        console.warn("Failed to store signature:", e);
      }
    }

    // Contract HTML (Lithuanian)
    const contractHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Automobilių nuomos sutartis</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .signature-section { border-top: 1px solid #ccc; padding-top: 20px; margin-top: 40px; }
            .signature-image { max-width: 300px; height: auto; border: 1px solid #ddd; padding: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CARBONUS AUTOMOBILIŲ NUOMOS SUTARTIS</h1>
            <p>Sutarties Nr.: ${reservationId}</p>
            <p>Data: ${new Date().toLocaleDateString('lt-LT')}</p>
          </div>

          <div class="section">
            <h2>NUOMOS DUOMENYS</h2>
            <table>
              <tr><th>Klientas</th><td>${customerName}</td></tr>
              <tr><th>El. paštas</th><td>${customerEmail}</td></tr>
              <tr><th>Automobilis</th><td>${carName}</td></tr>
              <tr><th>Pradžios data</th><td>${startDate}</td></tr>
              <tr><th>Pabaigos data</th><td>${endDate}</td></tr>
              <tr><th>Bendra suma</th><td>€${totalAmount}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>TAISYKLĖS IR SĄLYGOS</h2>
            <ol>
              <li><strong>Vairuotojo reikalavimai:</strong> Privalomas galiojantis vairuotojo pažymėjimas, amžius nuo 21 m.</li>
              <li><strong>Transporto priemonė:</strong> Automobilis perduodamas tvarkingas ir turi būti grąžintas tokios pat būklės.</li>
              <li><strong>Draudimas:</strong> Į kainą įskaičiuotas bazinis draudimas. Papildomas draudimas – už papildomą mokestį.</li>
              <li><strong>Kuro politika:</strong> Grąžinti su tokiu pačiu kuro lygiu.</li>
              <li><strong>Vėlavimas:</strong> Už vėlavimą gali būti taikomi papildomi mokesčiai.</li>
              <li><strong>Žala:</strong> Klientas atsako už žalą, kurios nedengia draudimas.</li>
              <li><strong>Atšaukimas:</strong> Nemokamas atšaukimas likus ≥ 3 d. iki nuomos pradžios.</li>
              <li><strong>Draudžiama:</strong> Varžybos, bekelė, neteisėta veikla ir pan.</li>
            </ol>
          </div>

          <div class="signature-section">
            <h2>KLIENTO PARAŠAS</h2>
            <p>Pasirašydamas(-a) patvirtinu, kad perskaičiau ir sutinku su visomis sutarties sąlygomis.</p>
            <div style="margin: 20px 0;">
              <p><strong>Klientas:</strong> ${customerName}</p>
              <p><strong>Data:</strong> ${new Date().toLocaleDateString('lt-LT')}</p>
            </div>
            ${signatureUrl ? `
              <div style="margin: 20px 0;">
                <p><strong>Skaitmeninis parašas:</strong></p>
                <img src="${signatureUrl}" class="signature-image" alt="Kliento parašas" />
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
            <p>CARBONUS automobilių nuoma</p>
            <p>El. paštas: info@carbonus.lt | Tel.: +370 698 18 781</p>
            <p>Ši sutartis yra teisiškai privaloma.</p>
          </div>
        </body>
      </html>
    `;

    // Emails in Lithuanian
    const emailPromises = [
      resend.emails.send({
        from: "CARBONUS <info@carbonus.lt>",
        to: [customerEmail],
        subject: "Jūsų automobilių nuomos sutartis – CARBONUS",
        html: `
          <h2>Ačiū, kad pasirinkote CARBONUS!</h2>
          <p>Gerb. ${customerName},</p>
          <p>Jūsų rezervacija patvirtinta. Žemiau pateikiama pasirašyta nuomos sutartis.</p>
          <h3>Rezervacijos duomenys:</h3>
          <ul>
            <li><strong>Automobilis:</strong> ${carName}</li>
            <li><strong>Laikotarpis:</strong> ${startDate} – ${endDate}</li>
            <li><strong>Bendra suma:</strong> €${totalAmount}</li>
            <li><strong>Sutarties Nr.:</strong> ${reservationId}</li>
          </ul>
          ${signatureUrl ? `<p><strong>Kliento parašas:</strong><br/><img src="${signatureUrl}" alt="Parašas" style="max-width:280px;border:1px solid #ddd;padding:8px;"/></p>` : ''}
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            ${contractHtml}
          </div>
          <p>Pagarbiai,<br>CARBONUS komanda</p>
        `,
      }),
      
      resend.emails.send({
        from: "CARBONUS <info@carbonus.lt>",
        to: ["info@carbonus.lt"],
        subject: `Nauja vietoje atlikta rezervacija – ${customerName}`,
        html: `
          <h2>Nauja rezervacija (vietoje)</h2>
          <h3>Klientas:</h3>
          <ul>
            <li><strong>Vardas, pavardė:</strong> ${customerName}</li>
            <li><strong>El. paštas:</strong> ${customerEmail}</li>
          </ul>
          <h3>Rezervacijos duomenys:</h3>
          <ul>
            <li><strong>Sutarties Nr.:</strong> ${reservationId}</li>
            <li><strong>Automobilis:</strong> ${carName}</li>
            <li><strong>Laikotarpis:</strong> ${startDate} – ${endDate}</li>
            <li><strong>Bendra suma:</strong> €${totalAmount}</li>
          </ul>
          ${signatureUrl ? `<p><strong>Parašas:</strong><br/><img src="${signatureUrl}" alt="Parašas" style="max-width:280px;border:1px solid #ddd;padding:8px;"/></p>` : ''}
          <div style="margin-top: 20px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            ${contractHtml}
          </div>
        `,
      })
    ];

    await Promise.all(emailPromises);

    console.log("Contract emails sent successfully");

    return new Response(
      JSON.stringify({ success: true, message: "Contract generated and sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in generate-contract-pdf function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
