import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

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
    let signatureBytes: Uint8Array | null = null;
    if (signatureData && signatureData.startsWith("data:image")) {
      try {
        signatureBytes = dataUrlToUint8Array(signatureData);
        const filePath = `signatures/${reservationId}.png`;

        // Upload signature PNG to private bucket 'contracts'
        const { error: uploadError } = await supabase.storage
          .from("contracts")
          .upload(filePath, signatureBytes, {
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

    // Simplified email content (contract will be attached as PDF)
    const emailSummary = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #22c55e; padding-bottom: 20px; margin-bottom: 30px; }
            .info-box { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .details { background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: #22c55e; margin: 0;">✅ Nuomos sutartis patvirtinta</h1>
          </div>

          <p>Gerb. <strong>${customerName}</strong>,</p>
          <p>Dėkojame, kad pasirinkote CARBONUS automobilių nuomą!</p>
          <p>Jūsų nuomos sutartis buvo sėkmingai sukurta ir pasirašyta.</p>

          <div class="details">
            <h3 style="margin-top: 0; color: #374151;">Rezervacijos informacija:</h3>
            <p style="margin: 8px 0;"><strong>Automobilis:</strong> ${carName}</p>
            <p style="margin: 8px 0;"><strong>Paėmimo data ir laikas:</strong> ${startDate} ${(req.body as any)?.pickupTime || '10:00'}</p>
            <p style="margin: 8px 0;"><strong>Grąžinimo data ir laikas:</strong> ${endDate} ${(req.body as any)?.returnTime || '10:00'}</p>
            <p style="margin: 8px 0;"><strong>Bendra suma:</strong> €${totalAmount}</p>
            <p style="margin: 8px 0;"><strong>Sutarties Nr.:</strong> ${reservationId}</p>
          </div>

          <div class="info-box">
            <p style="margin: 0 0 10px 0;"><strong>📎 Nuomos sutartis</strong></p>
            <p style="margin: 0;">Nuomos sutartis pridėta prie šio laiško kaip PDF failas. Prašome ją išsaugoti ir pasiimti atsiimant automobilį.</p>
          </div>

          <div class="info-box" style="background: #fef3c7; border-left-color: #f59e0b;">
            <p style="margin: 0 0 10px 0;"><strong>📋 Prieš pasiimant automobilį:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
              <li>Pasiimkite galiojantį vairuotojo pažymėjimą</li>
              <li>Pasiruoškite asmens dokumentą (paso ar asmens kortelės)</li>
              <li>Turite turėti sutartyje nurodytą sumą mokėjimui</li>
            </ul>
          </div>

          <p style="margin-top: 25px;">Jei turite klausimų, mielai atsakysime:</p>
          <p style="margin: 5px 0;">
            📧 El. paštas: <a href="mailto:info@carbonus.lt" style="color: #3b82f6;">info@carbonus.lt</a><br>
            📞 Telefonas: <a href="tel:+37069818781" style="color: #3b82f6;">+370 698 18 781</a>
          </p>

          <div class="footer">
            <p><strong>CARBONUS automobilių nuoma</strong></p>
            <p>Ačiū, kad pasirinkote mus!</p>
          </div>
        </body>
      </html>
    `;

    // Generate a simple PDF version of the contract and store it in Supabase Storage
    let contractPath: string | null = null;
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const title = 'CARBONUS AUTOMOBILIŲ NUOMOS SUTARTIS';
      let y = 800;

      page.drawText(title, { x: 40, y, size: 14, font: fontBold, color: rgb(0, 0, 0) });
      y -= 24;
      page.drawText(`Sutarties Nr.: ${reservationId}`, { x: 40, y, size: 11, font });
      y -= 16;
      page.drawText(`Data: ${new Date().toLocaleDateString('lt-LT')}`, { x: 40, y, size: 11, font });
      y -= 28;

      page.drawText('NUOMOS DUOMENYS', { x: 40, y, size: 12, font: fontBold });
      y -= 18;
      const rows = [
        ['Klientas', customerName],
        ['El. paštas', customerEmail],
        ['Automobilis', carName],
        ['Paėmimo data ir laikas', `${startDate} ${(req.body as any)?.pickupTime || '10:00'}`],
        ['Grąžinimo data ir laikas', `${endDate} ${(req.body as any)?.returnTime || '10:00'}`],
        ['Bendra suma', `€${totalAmount}`],
      ];
      for (const [k, v] of rows) {
        page.drawText(`${k}:`, { x: 40, y, size: 11, font: fontBold });
        page.drawText(String(v), { x: 160, y, size: 11, font });
        y -= 16;
      }

      y -= 12;
      page.drawText('KLIENTO PARAŠAS', { x: 40, y, size: 12, font: fontBold });
      y -= 18;
      if (signatureBytes) {
        try {
          const png = await pdfDoc.embedPng(signatureBytes);
          const pngDims = png.scale(0.5);
          page.drawImage(png, { x: 40, y: y - pngDims.height, width: pngDims.width, height: pngDims.height });
          y -= pngDims.height + 10;
        } catch (_e) {
          // continue without signature image
        }
      }

      const pdfBytes = await pdfDoc.save();
      const pdfFilePath = `${reservationId}/nuomos_sutartis_${reservationId}.pdf`;
      const { error: pdfUploadError } = await supabase.storage
        .from('contracts')
        .upload(pdfFilePath, pdfBytes, { contentType: 'application/pdf', upsert: true });
      if (!pdfUploadError) {
        contractPath = pdfFilePath;
      } else {
        console.error('PDF upload failed:', pdfUploadError);
      }
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
    }

    // Download PDF from storage to attach to emails
    let pdfAttachment = null;
    if (contractPath) {
      try {
        const { data: pdfData, error: downloadError } = await supabase.storage
          .from('contracts')
          .download(contractPath);
        
        if (!downloadError && pdfData) {
          const arrayBuffer = await pdfData.arrayBuffer();
          const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          pdfAttachment = {
            filename: `nuomos_sutartis_${reservationId}.pdf`,
            content: base64Pdf,
          };
        }
      } catch (pdfError) {
        console.error('Failed to download PDF for attachment:', pdfError);
      }
    }

    // Emails in Lithuanian - only send to admin
    const emailPromises = [
      resend.emails.send({
        from: "CARBONUS <info@carbonus.lt>",
        to: ["info@carbonus.lt"],
        subject: `Nauja vietoje atlikta rezervacija – ${customerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; border-bottom: 2px solid #22c55e; padding-bottom: 10px;">Nauja rezervacija (vietoje)</h2>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Klientas:</h3>
              <p><strong>Vardas, pavardė:</strong> ${customerName}</p>
              <p><strong>El. paštas:</strong> ${customerEmail}</p>
            </div>
            
            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Rezervacijos duomenys:</h3>
              <p><strong>Sutarties Nr.:</strong> ${reservationId}</p>
              <p><strong>Automobilis:</strong> ${carName}</p>
              <p><strong>Paėmimo:</strong> ${startDate} ${(req.body as any)?.pickupTime || '10:00'}</p>
              <p><strong>Grąžinimas:</strong> ${endDate} ${(req.body as any)?.returnTime || '10:00'}</p>
              <p><strong>Bendra suma:</strong> €${totalAmount}</p>
            </div>
            
            ${signatureUrl ? `
              <div style="margin: 20px 0;">
                <p><strong>Kliento parašas:</strong></p>
                <img src="${signatureUrl}" alt="Parašas" style="max-width:280px;border:1px solid #ddd;padding:8px;"/>
              </div>
            ` : ''}
            
            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              Sutartis pridėta kaip PDF failas.
            </p>
          </div>
        `,
        ...(pdfAttachment ? { attachments: [pdfAttachment] } : {})
      })
    ];

    await Promise.all(emailPromises);

    console.log("Contract emails sent successfully");

    return new Response(
      JSON.stringify({ success: true, contractUrl: contractPath, message: "Contract generated and sent successfully" }),
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
