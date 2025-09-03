import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email, phone, subject, message }: ContactEmailRequest = await req.json();

    console.log("Received contact form submission:", { firstName, lastName, email, subject });

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Visi privalomi laukai turi būti užpildyti" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to company
    const emailResponse = await resend.emails.send({
      from: "Carbonus Kontaktai <onboarding@resend.dev>",
      to: ["info@carbonus.lt"],
      subject: `Nauja žinutė iš svetainės: ${subject}`,
      html: `
        <h2>Nauja kontaktų formos žinutė</h2>
        <p><strong>Vardas:</strong> ${firstName}</p>
        <p><strong>Pavardė:</strong> ${lastName}</p>
        <p><strong>El. paštas:</strong> ${email}</p>
        ${phone ? `<p><strong>Telefonas:</strong> ${phone}</p>` : ''}
        <p><strong>Tema:</strong> ${subject}</p>
        <p><strong>Žinutė:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">Ši žinutė gauta iš Carbonus svetainės kontaktų formos.</p>
      `,
    });

    console.log("Company email sent successfully:", emailResponse);

    // Send confirmation email to customer
    const confirmationResponse = await resend.emails.send({
      from: "Carbonus <onboarding@resend.dev>",
      to: [email],
      subject: "Jūsų žinutė gauta - Carbonus",
      html: `
        <h1>Ačiū už jūsų žinutę, ${firstName}!</h1>
        <p>Mes gavome jūsų žinutę ir susisieksime su jumis kuo greičiau.</p>
        
        <h3>Jūsų žinutės santrauka:</h3>
        <p><strong>Tema:</strong> ${subject}</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff; margin: 15px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        
        <p>Jei turite skubių klausimų, galite mums skambinti: <strong>+370 698 18 781</strong></p>
        
        <p>Geriausiais linkėjimais,<br>Carbonus komanda</p>
      `,
    });

    console.log("Confirmation email sent successfully:", confirmationResponse);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Žinutė sėkmingai išsiųsta. Susisieksime su jumis kuo greičiau!"
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
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Nepavyko išsiųsti žinutės. Bandykite dar kartą arba susisiekite telefonu.",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);