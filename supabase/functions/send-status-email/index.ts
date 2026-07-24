import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type StatusType = 'awaiting_payment' | 'partial_payment' | 'payment_failed' | 'paid' | 'cancelled' | 'picked_up' | 'completed';

interface StatusEmailRequest {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: StatusType;
  paymentTransactionId?: string;
  contractPdfUrl?: string;
  language?: string;
  customerPhone?: string;
  customerAddress?: string;
  additionalServices?: string;
  depositAmount?: number;
  testMode?: boolean;
}

// Shared styles matching EmailPreview component exactly
const logoUrl = 'https://carbonus.lt/__l5e/assets-v1/ca2ce61e-2fe8-4b83-805a-6d90ebedc076/carbonus_logo_green_white_transparent.png';

const commonStyles = `font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;`;
const headerStyles = `background: linear-gradient(135deg, #0a5028 0%, #2d8659 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;`;
const logoStyles = `max-width: 180px; height: auto; margin: 0 auto 15px auto; display: block;`;
const contentStyles = `padding: 30px 20px; line-height: 1.6; color: #333333;`;
const detailsBoxStyles = `background-color: #f8f9fa; border-left: 4px solid #0a5028; padding: 15px; margin: 20px 0; border-radius: 4px;`;
const buttonStyles = `display: inline-block; background-color: #0a5028; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;`;
const footerStyles = `text-align: center; padding: 20px; color: #666666; font-size: 12px; border-top: 1px solid #eeeeee; margin-top: 30px;`;

function getEmailContent(data: StatusEmailRequest) {
  const { customerName, carName, startDate, endDate, totalAmount, status, paymentTransactionId, reservationId, language, depositAmount } = data;
  const isLT = (language || 'lt') === 'lt';

  if (isLT) {
    const templatesLT: Record<StatusType, { subject: string; html: string }> = {
      awaiting_payment: {
        subject: "Užbaikite rezervaciją - Carbonus",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">Carbonus</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Automobilių nuoma</p>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Sveiki, ${customerName}!</h2>
              <p>Dėkojame už rezervaciją! Gavome Jūsų užklausą ir laukiame apmokėjimo.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Rezervacijos detalės:</h3>
                <p><strong>Rezervacijos nr.:</strong> ${reservationId}</p>
                <p><strong>Automobilis:</strong> ${carName}</p>
                <p><strong>Pradžios data:</strong> ${startDate}</p>
                <p><strong>Pabaigos data:</strong> ${endDate}</p>
                <p><strong>Suma:</strong> €${totalAmount}</p>
                ${depositAmount ? `<p><strong>Užstatas:</strong> €${depositAmount}</p>` : ''}
              </div>

              <p>Prašome apmokėti sąskaitą, kad patvirtintume Jūsų rezervaciją.</p>
            </div>
            <div style="${footerStyles}">
              <p>Carbonus automobilių nuoma</p>
              <p>El. paštas: info@carbonus.lt | Tel: +370 6 98 18 781</p>
            </div>
          </div>
        `
      },
      partial_payment: {
        subject: "Išankstinis mokėjimas gautas - Carbonus",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">✓ Išankstinis mokėjimas gautas</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Sveiki, ${customerName}!</h2>
              <p>Gavome jūsų išankstinį mokėjimą. Rezervacija patvirtinta.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Rezervacijos informacija:</h3>
                <p><strong>Automobilis:</strong> ${carName}</p>
                <p><strong>Nuomos laikotarpis:</strong> ${startDate} - ${endDate}</p>
                <p><strong>Bendra suma:</strong> €${totalAmount}</p>
                <p><strong>Rezervacijos Nr.:</strong> ${reservationId}</p>
              </div>
            </div>
            <div style="${footerStyles}">
              <p>Iki greito pasimatymo!</p>
              <p>Carbonus automobilių nuoma</p>
            </div>
          </div>
        `
      },
      payment_failed: {
        subject: "Mokėjimo klaida - Carbonus",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">❌ Mokėjimas nepavyko</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Sveiki, ${customerName}!</h2>
              <p>Deja, jūsų mokėjimas nepavyko. Jei reikia pagalbos – parašykite mums.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Rezervacijos detalės:</h3>
                <p><strong>Automobilis:</strong> ${carName}</p>
                <p><strong>Nuomos laikotarpis:</strong> ${startDate} – ${endDate}</p>
                <p><strong>Suma:</strong> €${totalAmount}</p>
              </div>

              <p>Prašome bandyti dar kartą arba susisiekite su mumis.</p>
            </div>
            <div style="${footerStyles}">
              <p>Carbonus automobilių nuoma</p>
              <p>El. paštas: info@carbonus.lt | Tel: +370 6 98 18 781</p>
            </div>
          </div>
        `
      },
      paid: {
        subject: "Apmokėjimas patvirtintas - Carbonus nuoma",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">✓ Apmokėjimas patvirtintas</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Sveiki, ${customerName}!</h2>
              <p>Puiku! Jūsų apmokėjimas patvirtintas ir rezervacija užregistruota.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Rezervacijos informacija:</h3>
                <p><strong>Automobilis:</strong> ${carName}</p>
                <p><strong>Nuomos laikotarpis:</strong> ${startDate} - ${endDate}</p>
                <p><strong>Sumokėta:</strong> €${totalAmount}</p>
                ${paymentTransactionId ? `<p><strong>Mokėjimo ID:</strong> ${paymentTransactionId}</p>` : ''}
                <p><strong>Rezervacijos Nr.:</strong> ${reservationId}</p>
              </div>

              <p>Sutartis bus paruošta ir galėsite ją pasirašyti prieš automobilio pasiėmimą.</p>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>Svarbu:</strong> Automobilio atsiėmimo dieną turėsite pateikti vairuotojo pažymėjimą.
              </p>
            </div>
            <div style="${footerStyles}">
              <p>Iki greito pasimatymo!</p>
              <p>Carbonus automobilių nuoma</p>
            </div>
          </div>
        `
      },
      cancelled: {
        subject: "Rezervacija atšaukta - Carbonus nuoma",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">Rezervacija atšaukta</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Sveiki, ${customerName}!</h2>
              <p>Informuojame, kad Jūsų rezervacija buvo atšaukta.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Atšauktos rezervacijos duomenys:</h3>
                <p><strong>Rezervacijos nr.:</strong> ${reservationId}</p>
                <p><strong>Automobilis:</strong> ${carName}</p>
                <p><strong>Pradžios data:</strong> ${startDate}</p>
                <p><strong>Pabaigos data:</strong> ${endDate}</p>
              </div>

              <p>Jei sumokėjote už rezervaciją, pinigai bus grąžinti per 5-7 darbo dienas.</p>

              <p style="margin-top: 20px;">Jei turite klausimų, prašome susisiekti su mumis.</p>
            </div>
            <div style="${footerStyles}">
              <p>Carbonus automobilių nuoma</p>
              <p>El. paštas: info@carbonus.lt | Tel: +370 6 98 18 781</p>
            </div>
          </div>
        `
      },
      picked_up: {
        subject: "Automobilis atsiimtas - Carbonus nuoma",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">🚗 Geros kelionės!</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Sveiki, ${customerName}!</h2>
              <p>Dėkojame, kad pasirinkote Carbonus! Linkime saugios ir malonios kelionės su ${carName}.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Primename:</h3>
                <p><strong>Grąžinimo data:</strong> ${endDate}</p>
                <p><strong>Grąžinimo laikas:</strong> 10:00</p>
                <p><strong>Vieta:</strong> Carbonus biuras</p>
              </div>

              <p>Jei kiltų klausimų ar problemų kelionės metu, nedvejodami susisiekite su mumis.</p>

              <p style="margin-top: 20px;">
                <strong>Kontaktai pagalbai:</strong><br>
                Tel: +370 6 98 18 781<br>
                El. paštas: info@carbonus.lt
              </p>
            </div>
            <div style="${footerStyles}">
              <p>Saugios kelionės!</p>
              <p>Carbonus komanda</p>
            </div>
          </div>
        `
      },
      completed: {
        subject: "Nuoma baigta - Dėkojame! - Carbonus",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">✓ Nuoma užbaigta</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Sveiki, ${customerName}!</h2>
              <p>Dėkojame, kad pasirinkote Carbonus automobilių nuomą!</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Nuomos informacija:</h3>
                <p><strong>Automobilis:</strong> ${carName}</p>
                <p><strong>Nuomos laikotarpis:</strong> ${startDate} - ${endDate}</p>
              </div>

              <p>Jūsų užstatas bus grąžintas per 3-5 darbo dienas, jei nebuvo jokių papildomų mokesčių.</p>

              <p style="margin-top: 30px;">Būtume dėkingi už Jūsų atsiliepimą apie mūsų paslaugas!</p>
            </div>
            <div style="${footerStyles}">
              <p>Laukiame Jūsų dar kartą!</p>
              <p>Carbonus komanda</p>
            </div>
          </div>
        `
      }
    };
    return templatesLT[status as StatusType];
  } else {
    const templatesEN: Record<StatusType, { subject: string; html: string }> = {
      awaiting_payment: {
        subject: "Complete Your Booking - Carbonus",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">Carbonus</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px;">Car Rental</p>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Hello, ${customerName}!</h2>
              <p>Thank you for your booking! We have received your request and are waiting for payment.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Booking Details:</h3>
                <p><strong>Booking ID:</strong> ${reservationId}</p>
                <p><strong>Car:</strong> ${carName}</p>
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p><strong>End Date:</strong> ${endDate}</p>
                <p><strong>Amount:</strong> €${totalAmount}</p>
                ${depositAmount ? `<p><strong>Deposit:</strong> €${depositAmount}</p>` : ''}
              </div>

              <p>Please complete the payment to confirm your booking.</p>
            </div>
            <div style="${footerStyles}">
              <p>Carbonus Car Rental</p>
              <p>Email: info@carbonus.lt | Phone: +370 6 98 18 781</p>
            </div>
          </div>
        `
      },
      partial_payment: {
        subject: "Advance Payment Received - Carbonus",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">✓ Advance Payment Received</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Hello, ${customerName}!</h2>
              <p>We received your advance payment. Booking confirmed.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Booking Information:</h3>
                <p><strong>Car:</strong> ${carName}</p>
                <p><strong>Rental Period:</strong> ${startDate} - ${endDate}</p>
                <p><strong>Total Amount:</strong> €${totalAmount}</p>
                <p><strong>Booking ID:</strong> ${reservationId}</p>
              </div>
            </div>
            <div style="${footerStyles}">
              <p>See you soon!</p>
              <p>Carbonus Car Rental</p>
            </div>
          </div>
        `
      },
      payment_failed: {
        subject: "Payment Error - Carbonus",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">❌ Payment Failed</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Hello, ${customerName}!</h2>
              <p>Unfortunately, your payment has failed. If you need help, please contact us.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Booking Details:</h3>
                <p><strong>Car:</strong> ${carName}</p>
                <p><strong>Rental Period:</strong> ${startDate} – ${endDate}</p>
                <p><strong>Amount:</strong> €${totalAmount}</p>
              </div>

              <p>Please try again or contact us for assistance.</p>
            </div>
            <div style="${footerStyles}">
              <p>Carbonus Car Rental</p>
              <p>Email: info@carbonus.lt | Phone: +370 6 98 18 781</p>
            </div>
          </div>
        `
      },
      paid: {
        subject: "Payment Confirmed - Carbonus Rental",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">✓ Payment Confirmed</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Hello, ${customerName}!</h2>
              <p>Great! Your payment has been confirmed and your booking is registered.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Booking Information:</h3>
                <p><strong>Car:</strong> ${carName}</p>
                <p><strong>Rental Period:</strong> ${startDate} - ${endDate}</p>
                <p><strong>Paid:</strong> €${totalAmount}</p>
                ${paymentTransactionId ? `<p><strong>Payment ID:</strong> ${paymentTransactionId}</p>` : ''}
                <p><strong>Booking ID:</strong> ${reservationId}</p>
              </div>

              <p>The contract will be prepared and you can sign it before picking up the car.</p>

              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                <strong>Important:</strong> On car pickup day you must present your driver's license.
              </p>
            </div>
            <div style="${footerStyles}">
              <p>See you soon!</p>
              <p>Carbonus Car Rental</p>
            </div>
          </div>
        `
      },
      cancelled: {
        subject: "Booking Cancelled - Carbonus Rental",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">Booking Cancelled</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Hello, ${customerName}!</h2>
              <p>We inform you that your booking has been cancelled.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Cancelled Booking Details:</h3>
                <p><strong>Booking ID:</strong> ${reservationId}</p>
                <p><strong>Car:</strong> ${carName}</p>
                <p><strong>Start Date:</strong> ${startDate}</p>
                <p><strong>End Date:</strong> ${endDate}</p>
              </div>

              <p>If you paid for the booking, the money will be refunded within 5-7 business days.</p>

              <p style="margin-top: 20px;">If you have any questions, please contact us.</p>
            </div>
            <div style="${footerStyles}">
              <p>Carbonus Car Rental</p>
              <p>Email: info@carbonus.lt | Phone: +370 6 98 18 781</p>
            </div>
          </div>
        `
      },
      picked_up: {
        subject: "Car Picked Up - Carbonus Rental",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">🚗 Safe Travels!</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Hello, ${customerName}!</h2>
              <p>Thank you for choosing Carbonus! We wish you a safe and pleasant journey with ${carName}.</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Reminder:</h3>
                <p><strong>Return Date:</strong> ${endDate}</p>
                <p><strong>Return Time:</strong> 10:00</p>
                <p><strong>Location:</strong> Carbonus Office</p>
              </div>

              <p>If you have any questions or problems during your trip, don't hesitate to contact us.</p>

              <p style="margin-top: 20px;">
                <strong>Contact for Help:</strong><br>
                Phone: +370 6 98 18 781<br>
                Email: info@carbonus.lt
              </p>
            </div>
            <div style="${footerStyles}">
              <p>Safe travels!</p>
              <p>Carbonus Team</p>
            </div>
          </div>
        `
      },
      completed: {
        subject: "Rental Completed - Thank You! - Carbonus",
        html: `
          <div style="${commonStyles}">
            <div style="${headerStyles}">
              <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
              <h1 style="margin: 0; font-size: 28px;">✓ Rental Completed</h1>
            </div>
            <div style="${contentStyles}">
              <h2 style="color: #0a5028;">Hello, ${customerName}!</h2>
              <p>Thank you for choosing Carbonus Car Rental!</p>
              
              <div style="${detailsBoxStyles}">
                <h3 style="margin-top: 0; color: #0a5028;">Rental Information:</h3>
                <p><strong>Car:</strong> ${carName}</p>
                <p><strong>Rental Period:</strong> ${startDate} - ${endDate}</p>
              </div>

              <p>Your deposit will be refunded within 3-5 business days, if there were no additional charges.</p>

              <p style="margin-top: 30px;">We would appreciate your feedback about our services!</p>
            </div>
            <div style="${footerStyles}">
              <p>We hope to see you again!</p>
              <p>Carbonus Team</p>
            </div>
          </div>
        `
      }
    };
    return templatesEN[status as StatusType];
  }
}

// Helper function to download generated contract PDF from Supabase Storage
async function downloadGeneratedPdf(supabase: any, reservationId: string): Promise<{ base64: string; filename: string } | null> {
  try {
    const { data: reservation } = await supabase
      .from('reservations')
      .select('contract_pdf_url')
      .eq('id', reservationId)
      .single();

    let filePath = reservation?.contract_pdf_url || '';

    if (!filePath) {
      filePath = `${reservationId}/nuomos_sutartis_${reservationId}.pdf`;
    }

    const { data: fileData, error } = await supabase.storage
      .from('contracts')
      .download(filePath);

    if (error || !fileData) {
      return null;
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    const base64 = btoa(binary);
    return { base64, filename: `nuomos_sutartis_${reservationId}.pdf` };
  } catch (e) {
    console.warn('Failed to download generated PDF:', e);
    return null;
  }
}

function getStaticPdfUrl(language: string = 'lt'): string {
  const baseUrl = 'https://carbonus.lt';
  if (language === 'en') {
    return `${baseUrl}/carbonus-rental-agreement.pdf`;
  }
  return `${baseUrl}/carbonus-nuomos-sutartis.pdf`;
}

async function downloadPdfAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const data: StatusEmailRequest = await req.json();
    console.log('Status email request:', { reservationId: data.reservationId, status: data.status });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Fetch full customer + reservation details from DB for admin email
    let customerDetails: any = null;
    let reservationDetails: any = null;
    try {
      const { data: res } = await supabase
        .from('reservations')
        .select('*, customers(*)')
        .eq('id', data.reservationId)
        .single();
      if (res) {
        reservationDetails = res;
        customerDetails = res.customers;
      }
    } catch (_e) { /* continue with data from request */ }

    const tmpl = getEmailContent(data);
    const emailOptions: any = {
      from: 'Carbonus <info@carbonus.lt>',
      to: [data.customerEmail],
      subject: tmpl.subject,
      html: tmpl.html,
    };

    // For picked_up, only attach the contract if the customer has already signed.
    let hasCustomerSignature = false;
    if (data.status === 'picked_up') {
      const { data: sig } = await supabase
        .from('contract_signatures')
        .select('id')
        .eq('reservation_id', data.reservationId)
        .maybeSingle();
      hasCustomerSignature = !!sig;
      if (!hasCustomerSignature) {
        console.log('picked_up: no customer signature yet, skipping contract attachment');
      }
    }

    // Attach contract PDF for "paid" (lessor-signed only) and "picked_up" (only if customer signed).
    if (data.status === 'paid' || (data.status === 'picked_up' && hasCustomerSignature)) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
        const language = data.language || 'lt';

        // Regenerate contract. generate-contract-pdf embeds the customer signature if present in contract_signatures.
        const genResp = await fetch(`${supabaseUrl}/functions/v1/generate-contract-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`,
            'apikey': anonKey,
          },
          body: JSON.stringify({
            reservationId: data.reservationId,
            customerName: `${customerDetails?.first_name || ''} ${customerDetails?.last_name || ''}`.trim(),
            customerEmail: data.customerEmail,
            carName: data.carName,
            startDate: data.startDate,
            endDate: data.endDate,
            totalAmount: data.totalAmount,
            pickupTime: reservationDetails?.pickup_time,
            returnTime: reservationDetails?.return_time,
            language,
            skipEmail: true,
          }),
        });

        if (!genResp.ok) {
          console.warn('generate-contract-pdf returned non-OK:', genResp.status, await genResp.text());
        } else {
          await genResp.json().catch(() => null);
        }

        const generatedPdf = await downloadGeneratedPdf(supabase, data.reservationId);
        if (generatedPdf) {
          console.log(`Attaching contract PDF for status=${data.status}`);
          emailOptions.attachments = [{
            filename: generatedPdf.filename,
            content: generatedPdf.base64,
          }];
        } else {
          console.warn(`No generated PDF available for ${data.status} email`);
        }
      } catch (error) {
        console.error('Error preparing contract attachment:', error);
      }
    }

    const response = await resend.emails.send(emailOptions);
    console.log('Status email sent to customer:', response?.id || response);

    // Send admin summary email (skipped in test mode)
    if (data.testMode) {
      console.log('🧪 TEST MODE: skipping admin summary email');
    } else try {
      const c = customerDetails || {};
      const r = reservationDetails || {};
      const services = r.additional_services ? (typeof r.additional_services === 'string' ? JSON.parse(r.additional_services) : r.additional_services) : [];
      
      const serviceNames: Record<string, string> = {
        'additional-driver': 'Papildomas vairuotojas',
        'abroad-zone3': 'Naudojimas užsienyje - Zona 3',
        'abroad-zone2': 'Naudojimas užsienyje - Zona 2',
        'abroad-zone1': 'Naudojimas užsienyje - Zona 1',
        'roadside-assistance': 'Pagalba kelyje 24/7',
        'tire-glass-protection': 'Padangų ir stiklų apsauga',
        'baby-seat': 'Kūdikio kėdutė (0-13kg)',
        'child-seat': 'Vaikiška kėdutė (9-36kg)',
      };
      
      const servicesHtml = services.length > 0 
        ? `<h3 style="margin-bottom: 8px;">Pasirinktos paslaugos:</h3>
           <div style="background:#fefce8; padding:16px; border-radius:8px; margin-bottom:16px;">
             ${services.map((s: any) => {
               const title = s.title || serviceNames[s.id] || s.id;
               const priceInfo = s.unit === 'perDay' ? `€${s.price}/dieną` : `€${s.price}`;
               return `<p style="margin:4px 0;">• ${title} – ${priceInfo}</p>`;
             }).join('')}
           </div>` 
        : '';

      const statusLabels: Record<string, string> = {
        paid: 'Apmokėta ✅',
        completed: 'Nuoma baigta ✅',
        cancelled: 'Atšaukta ❌',
        picked_up: 'Automobilis atsiimtas 🚗',
        awaiting_payment: 'Laukiama apmokėjimo ⏳',
        partial_payment: 'Išankstinis mokėjimas gautas',
        payment_failed: 'Mokėjimas nepavyko ❌',
      };

      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 20px;">
          <h2 style="color:#22c55e; border-bottom: 2px solid #22c55e; padding-bottom: 10px; margin-top: 0;">
            Rezervacija – ${statusLabels[data.status] || data.status}
          </h2>
          
          <h3 style="margin-bottom: 8px;">Kliento informacija:</h3>
          <div style="background:#f9fafb; padding:16px; border-radius:8px; margin-bottom:16px;">
            <p style="margin:4px 0;"><strong>Vardas, pavardė:</strong> ${c.first_name || ''} ${c.last_name || ''}</p>
            <p style="margin:4px 0;"><strong>El. paštas:</strong> ${c.email || data.customerEmail}</p>
            <p style="margin:4px 0;"><strong>Telefonas:</strong> ${c.phone || ''}</p>
            <p style="margin:4px 0;"><strong>Adresas:</strong> ${c.address || '—'}</p>
            ${c.is_corporate && c.company_name ? `
              <p style="margin:4px 0;"><strong>Įmonė:</strong> ${c.company_name}</p>
              ${c.company_code ? `<p style="margin:4px 0;"><strong>Įmonės kodas:</strong> ${c.company_code}</p>` : ''}
              ${c.vat_code ? `<p style="margin:4px 0;"><strong>PVM kodas:</strong> ${c.vat_code}</p>` : ''}
            ` : ''}
          </div>
          
          <h3 style="margin-bottom: 8px;">Rezervacijos detalės:</h3>
          <div style="background:#f0f9ff; padding:16px; border-radius:8px; margin-bottom:16px;">
            <p style="margin:4px 0;"><strong>Automobilis:</strong> ${data.carName}</p>
            <p style="margin:4px 0;"><strong>Nuomos pradžia:</strong> ${data.startDate} ${r.pickup_time || ''}</p>
            <p style="margin:4px 0;"><strong>Nuomos pabaiga:</strong> ${data.endDate} ${r.return_time || ''}</p>
            <p style="margin:4px 0;"><strong>Nuomos dienų:</strong> ${r.rental_days || '—'}</p>
            <p style="margin:4px 0;"><strong>Dienos kaina:</strong> €${r.daily_rate || '—'}</p>
            <p style="margin:4px 0;"><strong>Nuomos kaina:</strong> €${r.total_rental_cost || data.totalAmount}</p>
            <p style="margin:4px 0;"><strong>Užstatas:</strong> €${r.deposit_amount || 0}</p>
            <p style="margin:4px 0;"><strong>Bendra suma:</strong> €${data.totalAmount}</p>
            <p style="margin:4px 0;"><strong>Rezervacijos Nr.:</strong> ${data.reservationId}</p>
            ${data.paymentTransactionId ? `<p style="margin:4px 0;"><strong>Mokėjimo ID:</strong> ${data.paymentTransactionId}</p>` : ''}
            ${r.pricing_notes ? `<p style="margin:4px 0;"><strong>Kainų pastabos:</strong> ${r.pricing_notes}</p>` : ''}
          </div>
          
          ${servicesHtml}
          ${data.status === 'paid' ? `<p style="color:#6b7280; font-size:13px;">Klientui išsiųsta sutartis su nuomotojo parašu (be kliento parašo). Pilna pasirašyta sutartis bus sugeneruota atsiėmimo metu.</p>` : ''}
          
          
        </div>
      `;

      const adminEmailOptions: any = {
        from: 'Carbonus <info@carbonus.lt>',
        to: ['info@carbonus.lt'],
        subject: `Rezervacija: ${c.first_name || ''} ${c.last_name || ''} – ${data.carName} (${data.startDate})`,
        html: adminHtml,
      };

      if (emailOptions.attachments) {
        adminEmailOptions.attachments = emailOptions.attachments;
      }

      const adminResponse = await resend.emails.send(adminEmailOptions);
      console.log('Admin email sent:', adminResponse?.id || adminResponse);
    } catch (adminErr) {
      console.warn('Failed to send admin email:', adminErr);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Error in send-status-email:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
