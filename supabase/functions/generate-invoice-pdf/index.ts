import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encodeBase64, decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, rgb } from "npm:pdf-lib@1.17.1";
import fontkit from "npm:@pdf-lib/fontkit@1.1.1";

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
    const { reservationId, prefix = 'CARW', invoiceId } = await req.json();

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
      issueDate = new Date();
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
