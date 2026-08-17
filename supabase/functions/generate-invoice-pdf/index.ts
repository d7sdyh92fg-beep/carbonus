import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encodeBase64, decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit@1.1.1";
import { requireAdmin, adminAuthFailureResponse } from "../_shared/adminAuth.ts";

const LOGO_BASE64 = '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';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function loadFonts(pdfDoc: any) {
  pdfDoc.registerFontkit(fontkit);
  const [fontRegularResponse, fontBoldResponse] = await Promise.all([
    fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf'),
    fetch('https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Bold.ttf'),
  ]);
  const fontRegularBytes = new Uint8Array(await fontRegularResponse.arrayBuffer());
  const fontBoldBytes = new Uint8Array(await fontBoldResponse.arrayBuffer());
  const font = await pdfDoc.embedFont(fontRegularBytes);
  const fontBold = await pdfDoc.embedFont(fontBoldBytes);
  return { font, fontBold };
}

function numberToWordsLT(num: number): string {
  // Simple Lithuanian number to words for common invoice amounts
  const ones = ['', 'vienas', 'du', 'trys', 'keturi', 'penki', 'šeši', 'septyni', 'aštuoni', 'devyni'];
  const teens = ['dešimt', 'vienuolika', 'dvylika', 'trylika', 'keturiolika', 'penkiolika', 'šešiolika', 'septyniolika', 'aštuoniolika', 'devyniolika'];
  const tens = ['', 'dešimt', 'dvidešimt', 'trisdešimt', 'keturiasdešimt', 'penkiasdešimt', 'šešiasdešimt', 'septyniasdešimt', 'aštuoniasdešimt', 'devyniasdešimt'];
  const hundreds = ['', 'šimtas', 'du šimtai', 'trys šimtai', 'keturi šimtai', 'penki šimtai', 'šeši šimtai', 'septyni šimtai', 'aštuoni šimtai', 'devyni šimtai'];

  const integer = Math.floor(num);
  const decimal = Math.round((num - integer) * 100);

  if (integer === 0) return 'nulis';

  let result = '';
  if (integer >= 1000) {
    const th = Math.floor(integer / 1000);
    if (th === 1) result += 'tūkstantis ';
    else result += ones[th] + ' tūkstančiai ';
  }
  const remainder = integer % 1000;
  if (remainder >= 100) result += hundreds[Math.floor(remainder / 100)] + ' ';
  const lastTwo = remainder % 100;
  if (lastTwo >= 10 && lastTwo < 20) {
    result += teens[lastTwo - 10] + ' ';
  } else {
    if (lastTwo >= 20) result += tens[Math.floor(lastTwo / 10)] + ' ';
    if (lastTwo % 10 > 0) result += ones[lastTwo % 10] + ' ';
  }

  result = result.trim();
  if (decimal > 0) {
    result += ` EUR ${decimal}/100`;
  } else {
    result += ' EUR 00/100';
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return adminAuthFailureResponse(auth, corsHeaders);

    const { reservationId, prefix = 'CAR', invoiceId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch reservation with customer
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .select('*, customers(*)')
      .eq('id', reservationId)
      .single();

    if (resError || !reservation) {
      throw new Error(`Reservation not found: ${resError?.message}`);
    }

    const customer = reservation.customers;
    let invoiceNumber: string;
    let sequenceNumber: number;
    let invoiceYear: number;
    let issueDate: Date;
    let issueDateStr: string;
    let items: Array<{ name: string; unit: string; qty: number; price: number; total: number }>;
    let existingInvoiceId: string | null = invoiceId || null;

    if (existingInvoiceId) {
      // Regenerate: use existing invoice data
      const { data: existingInvoice, error: invErr } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', existingInvoiceId)
        .single();

      if (invErr || !existingInvoice) {
        throw new Error(`Invoice not found: ${invErr?.message}`);
      }

      invoiceNumber = existingInvoice.invoice_number;
      sequenceNumber = existingInvoice.sequence_number;
      invoiceYear = existingInvoice.year;
      issueDate = new Date(existingInvoice.issue_date);
      issueDateStr = `${issueDate.getFullYear()} ${String(issueDate.getMonth() + 1).padStart(2, '0')} ${String(issueDate.getDate()).padStart(2, '0')}`;
      items = existingInvoice.items as any[];
    } else {
      // New invoice: generate number and build items from reservation
      const { data: invoiceNum, error: numError } = await supabase
        .rpc('get_next_invoice_number', { p_prefix: prefix });

      if (numError || !invoiceNum || invoiceNum.length === 0) {
        throw new Error(`Failed to get invoice number: ${numError?.message}`);
      }

      const invoiceData = invoiceNum[0];
      invoiceNumber = invoiceData.invoice_number;
      sequenceNumber = invoiceData.sequence_number;
      invoiceYear = invoiceData.year;
      // Default invoice issue date = reservation start (pickup) date, not generation date
      issueDate = reservation.start_date
        ? new Date(`${reservation.start_date}T12:00:00`)
        : new Date();
      issueDateStr = `${issueDate.getFullYear()} ${String(issueDate.getMonth() + 1).padStart(2, '0')} ${String(issueDate.getDate()).padStart(2, '0')}`;

      const rentalDays = reservation.rental_days;
      const dailyRate = reservation.custom_rental_price 
        ? reservation.custom_rental_price / rentalDays 
        : reservation.daily_rate;
      const totalAmount = reservation.custom_rental_price || reservation.total_rental_cost;

      items = [];
      items.push({
        name: `Automobilio ${reservation.car_name} nuoma (${reservation.start_date}_${reservation.end_date})`,
        unit: 'd.',
        qty: rentalDays,
        price: Number(dailyRate),
        total: Number(totalAmount),
      });

      if (reservation.additional_services && Array.isArray(reservation.additional_services)) {
        for (const svc of reservation.additional_services) {
          const svcName = svc.title || svc.name || 'Papildoma paslauga';
          const svcPrice = Number(svc.price || 0);
          const svcQty = svc.unit === 'perDay' ? rentalDays : 1;
          items.push({
            name: svcName,
            unit: svc.unit === 'perDay' ? 'd.' : 'vnt.',
            qty: svcQty,
            price: svcPrice,
            total: svcPrice * svcQty,
          });
        }
      }
    }

    const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const { font, fontBold } = await loadFonts(pdfDoc);

    // Embed logo from base64
    let logoImage: any = null;
    try {
      const logoBytes = decodeBase64(LOGO_BASE64);
      logoImage = await pdfDoc.embedPng(logoBytes);
    } catch (e) {
      console.error('Failed to embed logo:', e);
    }

    const page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const LEFT = 50;
    const RIGHT = width - 50;
    const COL_WIDTH = RIGHT - LEFT;
    let y = height - 60;

    // Logo + Title
    if (logoImage) {
      const logoHeight = 35;
      const logoWidth = logoHeight * (logoImage.width / logoImage.height);
      page.drawImage(logoImage, { x: LEFT, y: y - 5, width: logoWidth, height: logoHeight });
    }
    const titleText = 'SĄSKAITA FAKTŪRA';
    const titleWidth = fontBold.widthOfTextAtSize(titleText, 16);
    page.drawText(titleText, { x: (width - titleWidth) / 2, y: y + 5, font: fontBold, size: 16, color: rgb(0, 0, 0) });
    y -= 35;

    // Invoice number and date
    const docLine = `Dokumento Nr: ${invoiceNumber}`;
    page.drawText(docLine, { x: LEFT, y, font, size: 10, color: rgb(0, 0, 0) });
    page.drawText(issueDateStr, { x: RIGHT - font.widthOfTextAtSize(issueDateStr, 10), y, font, size: 10, color: rgb(0, 0, 0) });
    y -= 25;

    // Separator line
    page.drawLine({ start: { x: LEFT, y: y + 5 }, end: { x: RIGHT, y: y + 5 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
    y -= 5;

    // Two column header: Pardavėjas | Pirkėjas
    const midX = width / 2;
    page.drawText('Pardavėjas', { x: LEFT, y, font: fontBold, size: 11, color: rgb(0, 0, 0) });
    page.drawText('Pirkėjas', { x: midX + 10, y, font: fontBold, size: 11, color: rgb(0, 0, 0) });
    y -= 18;

    // Seller info (static)
    const sellerLines = [
      'MB "CARBONUS"',
      'Neravų 2A-6, Neravų kaimas,',
      'Viečiūnų sen., Druskininkų sav.',
      'Įmonės kodas: 307196558',
      'Banko sąskaita: LT547189900059467578',
      'Bankas: AB Artea bankas',
      'www.carbonus.lt',
      'Tel. +37069818781',
    ];

    // Buyer info (dynamic)
    const buyerLines = [
      `${customer.first_name} ${customer.last_name}`,
    ];
    if (customer.address) buyerLines.push(customer.address);
    if (customer.email) buyerLines.push(`El. p.: ${customer.email}`);
    if (customer.phone) buyerLines.push(`Tel.: ${customer.phone}`);

    const maxLines = Math.max(sellerLines.length, buyerLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (i < sellerLines.length) {
        page.drawText(sellerLines[i], { x: LEFT, y, font, size: 9, color: rgb(0, 0, 0) });
      }
      if (i < buyerLines.length) {
        page.drawText(buyerLines[i], { x: midX + 10, y, font, size: 9, color: rgb(0, 0, 0) });
      }
      y -= 14;
    }
    y -= 20;

    // Helper to right-align text
    const drawRight = (text: string, xRight: number, yPos: number, f: any, size: number) => {
      const w = f.widthOfTextAtSize(text, size);
      page.drawText(text, { x: xRight - w, y: yPos, font: f, size, color: rgb(0, 0, 0) });
    };

    // Column right edges for number alignment
    const colX = {
      name: LEFT + 5,
      unitRight: LEFT + 320,
      qtyRight: LEFT + 380,
      priceRight: LEFT + 440,
      totalRight: RIGHT - 5,
    };

    // Table header
    const PAD = 10;
    page.drawLine({ start: { x: LEFT, y: y + PAD + 2 }, end: { x: RIGHT, y: y + PAD + 2 }, thickness: 0.5, color: rgb(0, 0, 0) });
    page.drawText('Paslaugos pavadinimas', { x: colX.name, y, font: fontBold, size: 9, color: rgb(0, 0, 0) });
    drawRight('Mato vnt.', colX.unitRight, y, fontBold, 9);
    drawRight('Kiekis', colX.qtyRight, y, fontBold, 9);
    drawRight('Kaina', colX.priceRight, y, fontBold, 9);
    drawRight('Suma', colX.totalRight, y, fontBold, 9);
    y -= PAD;
    page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.5, color: rgb(0, 0, 0) });
    y -= (PAD + 4);

    // Table rows
    for (const item of items) {
      const maxNameWidth = 240;
      let nameText = item.name;
      const nameLines: string[] = [];
      
      while (nameText.length > 0) {
        let fitLen = nameText.length;
        while (fitLen > 0 && font.widthOfTextAtSize(nameText.substring(0, fitLen), 9) > maxNameWidth) {
          fitLen--;
        }
        if (fitLen === 0) fitLen = 1;
        if (fitLen < nameText.length) {
          const lastSpace = nameText.lastIndexOf(' ', fitLen);
          if (lastSpace > 0) fitLen = lastSpace;
        }
        nameLines.push(nameText.substring(0, fitLen).trim());
        nameText = nameText.substring(fitLen).trim();
      }

      page.drawText(nameLines[0], { x: colX.name, y, font, size: 9, color: rgb(0, 0, 0) });
      drawRight(item.unit, colX.unitRight, y, font, 9);
      drawRight(item.qty.toFixed(2).replace('.', ','), colX.qtyRight, y, font, 9);
      drawRight(item.price.toFixed(2).replace('.', ','), colX.priceRight, y, font, 9);
      drawRight(item.total.toFixed(2).replace('.', ','), colX.totalRight, y, font, 9);
      y -= 14;

      for (let nl = 1; nl < nameLines.length; nl++) {
        page.drawText(nameLines[nl], { x: colX.name, y, font, size: 9, color: rgb(0, 0, 0) });
        y -= 14;
      }
    }

    // Total line
    y -= 4;
    page.drawLine({ start: { x: LEFT, y: y + PAD + 2 }, end: { x: RIGHT, y: y + PAD + 2 }, thickness: 0.5, color: rgb(0, 0, 0) });
    const totalStr = grandTotal.toFixed(2).replace('.', ',');
    page.drawText('Suma žodžiais:', { x: colX.name, y, font, size: 9, color: rgb(0, 0, 0) });
    drawRight(`Iš viso   ${totalStr} EUR`, colX.totalRight, y, fontBold, 10);
    y -= PAD;
    page.drawLine({ start: { x: LEFT, y }, end: { x: RIGHT, y }, thickness: 0.5, color: rgb(0, 0, 0) });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = encodeBase64(pdfBytes);

    // Upload to storage
    const fileName = `invoices/${reservationId}/${invoiceNumber.replace(/[\s\/]/g, '_')}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload invoice PDF: ${uploadError.message}`);
    }

    const { data: publicUrl } = supabase.storage.from('contracts').getPublicUrl(fileName);

    let invoice;
    if (existingInvoiceId) {
      // Update existing invoice PDF
      const { data: updatedInvoice, error: updateError } = await supabase
        .from('invoices')
        .update({ pdf_url: fileName, total_amount: grandTotal })
        .eq('id', existingInvoiceId)
        .select()
        .single();

      if (updateError) {
        throw new Error(`Failed to update invoice: ${updateError.message}`);
      }
      invoice = updatedInvoice;
    } else {
      // Save new invoice record
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          invoice_prefix: prefix,
          sequence_number: sequenceNumber,
          year: invoiceYear,
          reservation_id: reservationId,
          customer_id: customer.id,
          issue_date: issueDate.toISOString().split('T')[0],
          items: items,
          total_amount: grandTotal,
          status: 'draft',
          pdf_url: fileName,
        })
        .select()
        .single();

      if (invoiceError) {
        throw new Error(`Failed to save invoice: ${invoiceError.message}`);
      }
      invoice = newInvoice;
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoice,
        pdfBase64,
        invoiceNumber,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error generating invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
