import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentReminderRequest {
  reservationId: string;
  reminderType: 'payment_deadline' | 'payment_failed' | 'payment_retry';
  language?: string;
}

const getEmailContent = (
  reminderType: string,
  customerName: string,
  carName: string,
  startDate: string,
  endDate: string,
  totalAmount: number,
  reservationId: string,
  language: string = 'lt'
) => {
  const isLT = language === 'lt';
  const paymentLink = `${Deno.env.get('SITE_URL') || 'https://carbonus.lt'}/cars?retry_reservation=${reservationId}`;

  const templatesLT = {
    payment_deadline: {
      subject: "Priminimas: Patvirtinkite rezervaciją - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Priminimas apie mokėjimą</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Primename, kad jūsų rezervacija dar nepatvirtinta, nes nesame gavę mokėjimo.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Suma:</strong> €${totalAmount}</p>
            <p><strong>Rezervacijos numeris:</strong> ${reservationId}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>⚠️ Svarbu!</strong></p>
            <p style="margin: 10px 0 0 0;">Jei per artimiausias 24 valandas negausime mokėjimo, jūsų rezervacija bus automatiškai atšaukta.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Apmokėti dabar
            </a>
          </div>
          
          <p>Jei turite klausimų arba norite pakeisti mokėjimo būdą, susisiekite su mumis:</p>
          <p>📞 Telefonas: +370 698 18 781<br>📧 El. paštas: info@carbonus.lt</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    payment_failed: {
      subject: "Mokėjimo klaida - Carbonus nuoma",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Mokėjimas nepavyko</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Deja, jūsų mokėjimas už automobilio nuomą nepavyko. Tai galėjo įvykti dėl įvairių priežasčių:</p>
          
          <ul>
            <li>Nepakanka lėšų sąskaitoje</li>
            <li>Kortelė atmesta arba užblokuota</li>
            <li>Neteisingi mokėjimo duomenys</li>
            <li>Banko sistemos sutrikimas</li>
          </ul>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Suma:</strong> €${totalAmount}</p>
            <p><strong>Rezervacijos numeris:</strong> ${reservationId}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Bandyti mokėti dar kartą
            </a>
          </div>
          
          <p>Galite pasirinkti alternatyvų mokėjimo būdą arba susisiekti su mumis telefonu:</p>
          <p>📞 Telefonas: +370 698 18 781<br>📧 El. paštas: info@carbonus.lt</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    },
    payment_retry: {
      subject: "Prašome užbaigti mokėjimą - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Užbaikite savo rezervaciją</h1>
          <p>Sveiki, ${customerName}!</p>
          <p>Pastebėjome, kad pradėjote rezervacijos procesą, bet neužbaigėte mokėjimo.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Rezervacijos detalės:</h2>
            <p><strong>Automobilis:</strong> ${carName}</p>
            <p><strong>Nuomos pradžia:</strong> ${startDate}</p>
            <p><strong>Nuomos pabaiga:</strong> ${endDate}</p>
            <p><strong>Suma:</strong> €${totalAmount}</p>
            <p><strong>Rezervacijos numeris:</strong> ${reservationId}</p>
          </div>
          
          <p>Jūsų pasirinktas automobilis dar laisvas! Užbaikite rezervaciją dabar, kol jį neišnuomavo kiti klientai.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Užbaigti rezervaciją
            </a>
          </div>
          
          <p>Jei nusprendėte atsisakyti šios rezervacijos arba turite klausimų, susisiekite su mumis:</p>
          <p>📞 Telefonas: +370 698 18 781<br>📧 El. paštas: info@carbonus.lt</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Pagarbiai,<br>Carbonus komanda
          </p>
        </div>
      `
    }
  };

  const templatesEN = {
    payment_deadline: {
      subject: "Reminder: Confirm Your Booking - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #f59e0b;">Payment Reminder</h1>
          <p>Hello, ${customerName}!</p>
          <p>We remind you that your booking is not yet confirmed as we haven't received your payment.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Booking Details:</h2>
            <p><strong>Car:</strong> ${carName}</p>
            <p><strong>Rental Start:</strong> ${startDate}</p>
            <p><strong>Rental End:</strong> ${endDate}</p>
            <p><strong>Amount:</strong> €${totalAmount}</p>
            <p><strong>Booking ID:</strong> ${reservationId}</p>
          </div>
          
          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0;"><strong>⚠️ Important!</strong></p>
            <p style="margin: 10px 0 0 0;">If we don't receive payment within the next 24 hours, your booking will be automatically cancelled.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Pay Now
            </a>
          </div>
          
          <p>If you have questions or want to change payment method, contact us:</p>
          <p>📞 Phone: +370 698 18 781<br>📧 Email: info@carbonus.lt</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Best regards,<br>Carbonus Team
          </p>
        </div>
      `
    },
    payment_failed: {
      subject: "Payment Error - Carbonus Rental",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #ef4444;">Payment Failed</h1>
          <p>Hello, ${customerName}!</p>
          <p>Unfortunately, your payment for the car rental failed. This may have occurred due to various reasons:</p>
          
          <ul>
            <li>Insufficient funds in account</li>
            <li>Card declined or blocked</li>
            <li>Incorrect payment details</li>
            <li>Banking system malfunction</li>
          </ul>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Booking Details:</h2>
            <p><strong>Car:</strong> ${carName}</p>
            <p><strong>Rental Start:</strong> ${startDate}</p>
            <p><strong>Rental End:</strong> ${endDate}</p>
            <p><strong>Amount:</strong> €${totalAmount}</p>
            <p><strong>Booking ID:</strong> ${reservationId}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Try Payment Again
            </a>
          </div>
          
          <p>You can choose an alternative payment method or contact us by phone:</p>
          <p>📞 Phone: +370 698 18 781<br>📧 Email: info@carbonus.lt</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Best regards,<br>Carbonus Team
          </p>
        </div>
      `
    },
    payment_retry: {
      subject: "Please Complete Payment - Carbonus",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Complete Your Booking</h1>
          <p>Hello, ${customerName}!</p>
          <p>We noticed you started the booking process but didn't complete the payment.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Booking Details:</h2>
            <p><strong>Car:</strong> ${carName}</p>
            <p><strong>Rental Start:</strong> ${startDate}</p>
            <p><strong>Rental End:</strong> ${endDate}</p>
            <p><strong>Amount:</strong> €${totalAmount}</p>
            <p><strong>Booking ID:</strong> ${reservationId}</p>
          </div>
          
          <p>Your selected car is still available! Complete your booking now before other customers rent it.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${paymentLink}" style="background: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Complete Booking
            </a>
          </div>
          
          <p>If you decided to cancel this booking or have questions, contact us:</p>
          <p>📞 Phone: +370 698 18 781<br>📧 Email: info@carbonus.lt</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Best regards,<br>Carbonus Team
          </p>
        </div>
      `
    }
  };

  return (isLT ? templatesLT : templatesEN)[reminderType as keyof typeof templatesLT] || null;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservationId, reminderType }: PaymentReminderRequest = await req.json();
    console.log("Sending payment reminder:", { reservationId, reminderType });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch reservation details
    const { data: reservation, error: reservationError } = await supabaseClient
      .from('reservations')
      .select(`
        *,
        customers (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', reservationId)
      .single();

    if (reservationError || !reservation) {
      console.error("Error fetching reservation:", reservationError);
      return new Response(
        JSON.stringify({ error: "Reservation not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const customer = reservation.customers as any;
    const customerName = `${customer.first_name} ${customer.last_name}`;
    const customerEmail = customer.email;

    const emailContent = getEmailContent(
      reminderType,
      customerName,
      reservation.car_name,
      reservation.start_date,
      reservation.end_date,
      reservation.total_amount,
      reservationId,
      (reservation as any).language || 'lt'
    );

    if (!emailContent) {
      return new Response(
        JSON.stringify({ error: "Invalid reminder type" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailResponse = await resend.emails.send({
      from: "Carbonus <info@carbonus.lt>",
      to: [customerEmail],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    console.log("Payment reminder sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-payment-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
