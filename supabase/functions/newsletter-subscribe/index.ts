import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterSubscribeRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: NewsletterSubscribeRequest = await req.json();

    console.log("Newsletter subscription request for:", email);

    // Validate email
    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Neteisingas el. pašto adresas" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("email, is_active")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ 
            error: "Šis el. paštas jau yra užsiprenumeravęs naujienlaiškį",
            alreadySubscribed: true 
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabase
          .from("newsletter_subscribers")
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq("email", email.toLowerCase().trim());

        if (updateError) {
          throw updateError;
        }
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabase
        .from("newsletter_subscribers")
        .insert([{
          email: email.toLowerCase().trim()
        }]);

      if (insertError) {
        throw insertError;
      }
    }

    console.log("Newsletter subscription successful for:", email);

    // Send welcome email
    try {
      await resend.emails.send({
        from: "Carbonus <onboarding@resend.dev>",
        to: [email],
        subject: "Sveiki atvykę į Carbonus naujienlaiškį!",
        html: `
          <h1>Ačiū, kad prisijungėte prie Carbonus!</h1>
          <p>Sveiki atvykę į mūsų naujienlaiškį! Dabar gausite naujausias žinias apie:</p>
          <ul>
            <li>🚗 Naujus automobilius mūsų parke</li>
            <li>💰 Specialius pasiūlymus ir nuolaidas</li>
            <li>📱 Naujas funkcijas ir paslaugas</li>
            <li>🎉 Ekskluzyvius renginius ir akcijas</li>
          </ul>
          <p>Jei turite klausimų, galite mums rašyti adresu: <strong>info@carbonus.lt</strong> arba skambinti: <strong>+370 698 18 781</strong></p>
          <p>Su pagarba,<br>Carbonus komanda</p>
          <hr>
          <p style="color: #666; font-size: 12px;">Jei nebenorite gauti mūsų laiškų, galite bet kada atsisakyti prenumeratos susisiekę su mumis.</p>
        `,
      });
      console.log("Welcome email sent successfully");
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the subscription if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Sėkmingai užsiprenumeravote naujienlaiškį! Patikrinkite savo el. paštą." 
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
    console.error("Error in newsletter-subscribe function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Nepavyko užsiprenumeruoti naujienlaišykio. Bandykite dar kartą.",
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