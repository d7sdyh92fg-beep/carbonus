import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  carName: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  returnTime?: string;
  rentalDays: number;
  totalAmount: number;
  depositAmount: number;
  advancePayment?: number;
  paymentMethod?: 'pay_now' | 'pay_at_counter' | string;
  language?: string;
  packageName?: string;
  packagePrice?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingEmailRequest = await req.json();
    console.log("Received booking request:", booking);
    const lang = booking.language || 'lt';
    const isLT = lang === 'lt';
    
    const logoUrl = 'https://carbonus.lt/__l5e/assets-v1/ca2ce61e-2fe8-4b83-805a-6d90ebedc076/carbonus_logo_green_white_transparent.png';
    const logoStyles = 'max-width: 180px; height: auto; margin-bottom: 24px;';

    // Package info HTML block
    const packageHtmlAdmin = booking.packageName ? `
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>📦 Emocinis paketas:</strong> ${booking.packageName} — ${booking.packagePrice} €</p>
      </div>
    ` : '';

    const packageHtmlCustomerLT = booking.packageName ? `
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>✨ Pasirinktas paketas:</strong> ${booking.packageName}</p>
        <p style="margin: 5px 0 0 0;"><strong>Paketo kaina:</strong> ${booking.packagePrice} €</p>
      </div>
    ` : '';

    const packageHtmlCustomerEN = booking.packageName ? `
      <div style="background-color: #fff8e1; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #f59e0b;">
        <p style="margin: 0;"><strong>✨ Selected package:</strong> ${booking.packageName}</p>
        <p style="margin: 5px 0 0 0;"><strong>Package price:</strong> ${booking.packagePrice} €</p>
      </div>
    ` : '';

    // Payment summary blocks (advance + remaining) — only when paying at counter
    const isPayAtCounter = booking.paymentMethod === 'pay_at_counter';
    const advance = booking.advancePayment ?? 0;
    const remainingRental = Math.max(0, booking.totalAmount - advance);
    const remainingTotal = remainingRental + booking.depositAmount;

    const paymentHtmlAdmin = isPayAtCounter ? `
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4caf50;">
        <p style="margin: 0;"><strong>💳 Mokėjimo būdas:</strong> Mokėti atsiimant</p>
        <p style="margin: 5px 0 0 0;"><strong>Sumokėtas avansas (Stripe):</strong> €${advance}</p>
        <p style="margin: 5px 0 0 0;"><strong>Liko sumokėti atsiimant:</strong> €${remainingRental} (nuoma) + €${booking.depositAmount} (užstatas) = <strong>€${remainingTotal}</strong></p>
      </div>
    ` : `
      <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4caf50;">
        <p style="margin: 0;"><strong>💳 Mokėjimo būdas:</strong> Visa suma internetu (Stripe)</p>
      </div>
    `;

    const paymentHtmlCustomerLT = isPayAtCounter ? `
      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; margin-top: 0;">Mokėjimo informacija</h3>
        <p style="margin: 5px 0;"><strong>Sumokėtas avansas (rezervacijai patvirtinti):</strong> €${advance}</p>
        <p style="margin: 5px 0;"><strong>Liko sumokėti atsiimant automobilį:</strong></p>
        <ul style="margin: 5px 0; padding-left: 20px; color: #2e7d32;">
          <li>Likusi nuomos suma: €${remainingRental}</li>
          <li>Užstatas (grąžinamas): €${booking.depositAmount}</li>
        </ul>
        <p style="margin: 10px 0 0 0; font-size: 16px;"><strong>Iš viso mokėtina atsiimant: €${remainingTotal}</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #555;">Mokėjimas atsiimant priimamas grynais arba terminalu.</p>
      </div>
    ` : '';

    const paymentHtmlCustomerEN = isPayAtCounter ? `
      <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
        <h3 style="color: #2e7d32; margin-top: 0;">Payment information</h3>
        <p style="margin: 5px 0;"><strong>Advance paid (to confirm reservation):</strong> €${advance}</p>
        <p style="margin: 5px 0;"><strong>Remaining to pay on pickup:</strong></p>
        <ul style="margin: 5px 0; padding-left: 20px; color: #2e7d32;">
          <li>Remaining rental: €${remainingRental}</li>
          <li>Deposit (refundable): €${booking.depositAmount}</li>
        </ul>
        <p style="margin: 10px 0 0 0; font-size: 16px;"><strong>Total due on pickup: €${remainingTotal}</strong></p>
        <p style="margin: 10px 0 0 0; font-size: 13px; color: #555;">Payment on pickup is accepted in cash or by card terminal.</p>
      </div>
    ` : '';

    // Email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "CARBONUS <info@carbonus.lt>",
      to: ["info@carbonus.lt"],
      subject: `Nauja rezervacija - ${booking.carName}${booking.packageName ? ` (${booking.packageName})` : ''}`,
      html: `
        <meta charset="utf-8" />
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Nauja rezervacija</h1>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Kliento informacija</h2>
            <p><strong>Vardas:</strong> ${booking.customerName}</p>
            <p><strong>El. paštas:</strong> ${booking.customerEmail}</p>
            <p><strong>Telefonas:</strong> ${booking.customerPhone}</p>
            <p><strong>Kalba:</strong> ${isLT ? 'Lietuvių' : 'English'}</p>
          </div>

          ${packageHtmlAdmin}
          ${paymentHtmlAdmin}

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Rezervacijos detalės</h2>
            <p><strong>Automobilis:</strong> ${booking.carName}</p>
            <p><strong>Paėmimo data ir laikas:</strong> ${booking.startDate} ${booking.pickupTime || '10:00'}</p>
            <p><strong>Grąžinimo data ir laikas:</strong> ${booking.endDate} ${booking.returnTime || '10:00'}</p>
            <p><strong>Dienų skaičius:</strong> ${booking.rentalDays}</p>
            <p><strong>Nuomos kaina:</strong> €${booking.totalAmount}</p>
            <p><strong>Užstatas:</strong> €${booking.depositAmount}</p>
            <p style="font-size: 18px;"><strong>Iš viso:</strong> €${booking.totalAmount + booking.depositAmount}</p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Prašome susisiekti su klientu dėl mokėjimo ir automobilio perdavimo detalių.
          </p>
        </div>
      `,
    });

    console.log("Admin email sent:", adminEmailResponse);

    // Email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "CARBONUS <info@carbonus.lt>",
      to: [booking.customerEmail],
      subject: isLT ? `Rezervacijos patvirtinimas - ${booking.carName}` : `Booking Confirmation - ${booking.carName}`,
      html: isLT ? `
        <meta charset="utf-8" />
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Rezervacija atlikta!</h1>
          
          <p>Sveiki, ${booking.customerName}!</p>
          <p>Jūsų rezervacija sėkmingai gauta. Netrukus susisieksime su jumis dėl mokėjimo ir automobilio perdavimo detalių.</p>

          ${packageHtmlCustomerLT}
          ${paymentHtmlCustomerLT}

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Jūsų rezervacijos informacija</h2>
            <p><strong>Automobilis:</strong> ${booking.carName}</p>
            <p><strong>Paėmimo data ir laikas:</strong> ${booking.startDate} ${booking.pickupTime || '10:00'}</p>
            <p><strong>Grąžinimo data ir laikas:</strong> ${booking.endDate} ${booking.returnTime || '10:00'}</p>
            <p><strong>Dienų skaičius:</strong> ${booking.rentalDays}</p>
            <p><strong>Nuomos kaina:</strong> €${booking.totalAmount}</p>
            <p><strong>Užstatas:</strong> €${booking.depositAmount}</p>
            <p style="font-size: 18px;"><strong>Iš viso mokėti:</strong> €${booking.totalAmount + booking.depositAmount}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Svarbi informacija:</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Užstatas (€200) bus grąžinamas po automobilio grąžinimo</li>
              <li>Atšaukti galima ne vėliau kaip likus 3 dienoms iki paėmimo datos</li>
              <li>Vėliau atšaukus, vienos dienos nuomos mokestis negrąžinamas</li>
            </ul>
          </div>

          <p>Jei turite klausimų, kreipkitės: <strong>info@carbonus.lt</strong></p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Ačiū, kad pasirinkote CARBONUS!<br>
            CARBONUS komanda
          </p>
        </div>
      ` : `
        <meta charset="utf-8" />
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Booking Confirmed!</h1>
          
          <p>Hello, ${booking.customerName}!</p>
          <p>Your booking has been successfully received. We will contact you shortly regarding payment and car pickup details.</p>

          ${packageHtmlCustomerEN}
          ${paymentHtmlCustomerEN}

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Your Booking Information</h2>
            <p><strong>Car:</strong> ${booking.carName}</p>
            <p><strong>Pick-up date and time:</strong> ${booking.startDate} ${booking.pickupTime || '10:00'}</p>
            <p><strong>Return date and time:</strong> ${booking.endDate} ${booking.returnTime || '10:00'}</p>
            <p><strong>Number of days:</strong> ${booking.rentalDays}</p>
            <p><strong>Rental price:</strong> €${booking.totalAmount}</p>
            <p><strong>Deposit:</strong> €${booking.depositAmount}</p>
            <p style="font-size: 18px;"><strong>Total to pay:</strong> €${booking.totalAmount + booking.depositAmount}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Important Information:</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Deposit (€200) will be refunded after car return</li>
              <li>Cancellation is possible no later than 3 days before pick-up date</li>
              <li>If cancelled later, one day rental fee is non-refundable</li>
            </ul>
          </div>

          <p>If you have any questions, contact us: <strong>info@carbonus.lt</strong></p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Thank you for choosing CARBONUS!<br>
            CARBONUS Team
          </p>
        </div>
      `,
    });

    console.log("Customer email sent:", customerEmailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailResponse,
        customerEmail: customerEmailResponse 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
