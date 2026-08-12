import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { requireAdmin, adminAuthFailureResponse } from "../_shared/adminAuth.ts";

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
    const auth = await requireAdmin(req);
    if (!auth.ok) return adminAuthFailureResponse(auth, corsHeaders);

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

    const logoUrl = 'data:image/png;base64,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';

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
