import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
  rentalDays: number;
  totalAmount: number;
  depositAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const booking: BookingEmailRequest = await req.json();
    console.log("Received booking request:", booking);

    // Email to admin (info@carbonus.lt)
    const adminEmailResponse = await resend.emails.send({
      from: "CARBONUS <onboarding@resend.dev>",
      to: ["info@carbonus.lt"],
      subject: `Nauja rezervacija - ${booking.carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Nauja rezervacija</h1>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Kliento informacija</h2>
            <p><strong>Vardas:</strong> ${booking.customerName}</p>
            <p><strong>El. paštas:</strong> ${booking.customerEmail}</p>
            <p><strong>Telefonas:</strong> ${booking.customerPhone}</p>
          </div>

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Rezervacijos detalės</h2>
            <p><strong>Automobilis:</strong> ${booking.carName}</p>
            <p><strong>Pradžios data:</strong> ${booking.startDate}</p>
            <p><strong>Pabaigos data:</strong> ${booking.endDate}</p>
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

    // Email to customer (temporarily sending to admin email due to Resend limitations)
    const customerEmailResponse = await resend.emails.send({
      from: "CARBONUS <onboarding@resend.dev>",
      to: ["info@carbonus.lt"], // Using admin email until domain is verified
      subject: `Rezervacijos patvirtinimas - ${booking.carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Rezervacija atlikta!</h1>
          
          <p>Sveiki, ${booking.customerName}!</p>
          <p>Jūsų rezervacija sėkmingai gauta. Netrukus susisieksime su jumis dėl mokėjimo ir automobilio perdavimo detalių.</p>

          <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #555; margin-top: 0;">Jūsų rezervacijos informacija</h2>
            <p><strong>Automobilis:</strong> ${booking.carName}</p>
            <p><strong>Pradžios data:</strong> ${booking.startDate}</p>
            <p><strong>Pabaigos data:</strong> ${booking.endDate}</p>
            <p><strong>Dienų skaičius:</strong> ${booking.rentalDays}</p>
            <p><strong>Nuomos kaina:</strong> €${booking.totalAmount}</p>
            <p><strong>Užstatas:</strong> €${booking.depositAmount}</p>
            <p style="font-size: 18px;"><strong>Iš viso mokėti:</strong> €${booking.totalAmount + booking.depositAmount}</p>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0;">Svarbi informacija:</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px;">
              <li>Užstatas (€300) bus grąžinamas po automobilio grąžinimo</li>
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