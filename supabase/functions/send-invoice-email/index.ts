import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get invoice with customer
    const { data: invoice, error: invError } = await supabase
      .from('invoices')
      .select('*, customers(*)')
      .eq('id', invoiceId)
      .single();

    if (invError || !invoice) {
      throw new Error(`Invoice not found: ${invError?.message}`);
    }

    // Download PDF from storage
    const { data: pdfData, error: dlError } = await supabase.storage
      .from('contracts')
      .download(invoice.pdf_url);

    if (dlError || !pdfData) {
      throw new Error(`Failed to download invoice PDF: ${dlError?.message}`);
    }

    const pdfBuffer = await pdfData.arrayBuffer();
    const pdfBase64 = encodeBase64(new Uint8Array(pdfBuffer));

    const customer = invoice.customers;
    const customerName = `${customer.first_name} ${customer.last_name}`;
    const fileName = `Saskaita_${invoice.invoice_number.replace(/[\s\/]/g, '_')}.pdf`;

    const logoUrl = 'https://yuvugrgoadxbmfvebsiu.supabase.co/storage/v1/object/public/contracts/carbonus-logo.png';

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1a3a2a, #2d5a3d); padding: 30px; text-align: center;">
        <img src="${logoUrl}" alt="Carbonus" style="height: 40px; margin-bottom: 10px;" />
        <h1 style="color: white; margin: 0; font-size: 22px;">Sąskaita faktūra</h1>
      </div>
      <div style="padding: 30px;">
        <p>Sveiki, ${customerName},</p>
        <p>Siunčiame Jums sąskaitą faktūrą <strong>${invoice.invoice_number}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f3f4f6;">
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Sąskaitos Nr.</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${invoice.invoice_number}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Data</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;">${invoice.issue_date}</td>
          </tr>
          <tr style="background: #f3f4f6;">
            <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: bold;">Suma</td>
            <td style="padding: 10px; border: 1px solid #e5e7eb;"><strong>${Number(invoice.total_amount).toFixed(2)} €</strong></td>
          </tr>
        </table>
        <p>Sąskaita faktūra pridėta kaip PDF priedas.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
          MB "CARBONUS" | Įmonės kodas: 307196558 | www.carbonus.lt
        </p>
      </div>
    </div>`;

    // Send to customer
    const customerEmail = await resend.emails.send({
      from: 'Carbonus <info@carbonus.lt>',
      to: [customer.email],
      subject: `Sąskaita faktūra ${invoice.invoice_number} - Carbonus`,
      html: emailHtml,
      attachments: [{
        filename: fileName,
        content: pdfBase64,
      }],
    });

    // Send copy to admin
    await resend.emails.send({
      from: 'Carbonus <info@carbonus.lt>',
      to: ['info@carbonus.lt'],
      subject: `[Kopija] Sąskaita ${invoice.invoice_number} - ${customerName}`,
      html: emailHtml,
      attachments: [{
        filename: fileName,
        content: pdfBase64,
      }],
    });

    // Update invoice status
    await supabase
      .from('invoices')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', invoiceId);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error sending invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
