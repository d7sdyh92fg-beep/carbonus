import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: NewsletterRequest = await req.json();

    console.log("Newsletter subscription request for:", email);

    // Validate email
    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ error: "El. pašto adresas yra privalomas" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Neteisingas el. pašto formato" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if email already exists
    const { data: existingSubscriber, error: checkError } = await supabase
      .from('newsletter_subscribers')
      .select('id, is_active')
      .eq('email', trimmedEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking existing subscriber:", checkError);
      throw checkError;
    }

    // If subscriber exists and is active
    if (existingSubscriber && existingSubscriber.is_active) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Jūs jau esate prenumeratorius!" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // If subscriber exists but is inactive, reactivate
    if (existingSubscriber && !existingSubscriber.is_active) {
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          is_active: true,
          subscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', existingSubscriber.id);

      if (updateError) {
        console.error("Error reactivating subscriber:", updateError);
        throw updateError;
      }

      console.log("Reactivated subscriber:", trimmedEmail);
    } else {
      // Create new subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: trimmedEmail }]);

      if (insertError) {
        console.error("Error creating subscriber:", insertError);
        throw insertError;
      }

      console.log("New subscriber created:", trimmedEmail);
    }

    // Send welcome email
    try {
      const emailResponse = await resend.emails.send({
        from: "Carbonus <onboarding@resend.dev>",
        to: [trimmedEmail],
        subject: "Sveiki atvykę į Carbonus naujienlaiškį!",
        html: `
          <h1>Ačiū, kad prenumeruojate mūsų naujienlaiškį!</h1>
          <p>Jūs sėkmingai užsiprenumeravote Carbonus naujienlaiškį.</p>
          <p>Gausite informaciją apie:</p>
          <ul>
            <li>Naujus automobilius mūsų parke</li>
            <li>Specialius pasiūlymus ir nuolaidas</li>
            <li>Automobilių nuomos patarimus</li>
            <li>Naujienas iš Carbonus</li>
          </ul>
          
          <p>Jei norite atsisakyti prenumeratos, susisiekite su mumis el. paštu: <strong>info@carbonus.lt</strong></p>
          
          <p>Ačiū, kad pasirinkote Carbonus!</p>
          <p>Carbonus komanda</p>
        `,
      });

      console.log("Welcome email sent:", emailResponse);
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't fail the subscription if email fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Sėkmingai užsiprenumeravote naujienlaiškį!" 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in subscribe-newsletter function:", error);
    
    // Handle unique constraint violation (duplicate email)
    if (error.code === '23505') {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Jūs jau esate prenumeratorius!" 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: "Nepavyko užsiregistruoti prenumeratai. Bandykite dar kartą vėliau.",
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