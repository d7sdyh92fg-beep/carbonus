import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { requireAdmin, adminAuthFailureResponse } from "../_shared/adminAuth.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FeedbackRequestRequest {
  reservationId: string;
  customerEmail: string;
  customerName: string;
  carName: string;
  startDate: string;
  endDate: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return adminAuthFailureResponse(auth, corsHeaders);

    const data: FeedbackRequestRequest = await req.json();
    console.log("Sending feedback request for reservation:", data.reservationId);
    const isLT = (data.language || 'lt') === 'lt';

    const emailResponse = await resend.emails.send({
      from: "Carbonus <info@carbonus.lt>",
      to: [data.customerEmail],
      subject: isLT ? "Kaip sekėsi kelionė? - Carbonus nuoma" : "How Was Your Trip? - Carbonus Rental",
      html: isLT ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Dėkojame už pasirinktą Carbonus! 🚗</h1>
          <p>Sveiki, ${data.customerName}!</p>
          <p>Tikimės, kad jūsų kelionė su <strong>${data.carName}</strong> buvo maloni ir sėkminga!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Jūsų nuomos informacija:</h2>
            <p><strong>Automobilis:</strong> ${data.carName}</p>
            <p><strong>Nuomos laikotarpis:</strong> ${data.startDate} - ${data.endDate}</p>
            <p><strong>Rezervacijos numeris:</strong> ${data.reservationId}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">💬 Jūsų nuomonė mums svarbi!</h2>
            <p>Būtume labai dėkingi, jei dalintumėtės savo patirtimi. Tai užtrunka tik 2 minutes ir labai padeda mums tobulėti.</p>
            
            <p style="margin: 20px 0;"><strong>Prašome įvertinti:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Automobilio būklę ir švarumą</li>
              <li>Rezervacijos proceso patogumą</li>
              <li>Mūsų komandos aptarnavimą</li>
              <li>Ar rekomenduotumėte Carbonus draugams?</li>
            </ul>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="mailto:info@carbonus.lt?subject=Atsiliepimas apie nuomą ${data.reservationId}" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                📝 Palikti atsiliepimą
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
              Arba tiesiog atsakykite į šį laišką su savo komentarais.
            </p>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>🎁 Dėkojame už ištikimybę!</strong></p>
            <p style="margin: 10px 0 0 0;">
              Jūsų užstatas bus grąžintas per 3-5 darbo dienas.<br>
              <strong>Kita nuoma:</strong> Specialiai jums - 10% nuolaida kitai rezervacijai!<br>
              <em>Nuolaidos kodas: LOYAL10</em>
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">🌟 Pasidalinkite savo patirtimi</h3>
            <p style="margin: 10px 0;">Jei jums patiko mūsų paslauga, būtume dėkingi už atsiliepimą:</p>
            <p style="margin: 5px 0;">
              ⭐ <a href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK" style="color: #3b82f6; text-decoration: none;">Google vertinimas</a><br>
              📘 <a href="https://facebook.com/YOUR_FB_PAGE" style="color: #3b82f6; text-decoration: none;">Facebook puslapis</a><br>
              📸 <a href="https://instagram.com/YOUR_IG" style="color: #3b82f6; text-decoration: none;">Instagram</a>
            </p>
          </div>
          
          <p>Tikimės vėl matyti jus tarp mūsų klientų! 🚗💨</p>
          
          <p>Jei turite klausimų ar problemų, visada galite susisiekti:</p>
          <p>📧 El. paštas: info@carbonus.lt<br>📞 Telefonas: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Su pagarba ir dėkingumu,<br>Carbonus komanda 🙏
          </p>
        </div>
      ` : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #22c55e;">Thank You for Choosing Carbonus! 🚗</h1>
          <p>Hello, ${data.customerName}!</p>
          <p>We hope your trip with <strong>${data.carName}</strong> was pleasant and successful!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Your Rental Information:</h2>
            <p><strong>Car:</strong> ${data.carName}</p>
            <p><strong>Rental Period:</strong> ${data.startDate} - ${data.endDate}</p>
            <p><strong>Booking ID:</strong> ${data.reservationId}</p>
          </div>
          
          <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">💬 Your Opinion Matters to Us!</h2>
            <p>We would be very grateful if you could share your experience. It takes only 2 minutes and helps us improve greatly.</p>
            
            <p style="margin: 20px 0;"><strong>Please rate:</strong></p>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Car condition and cleanliness</li>
              <li>Booking process convenience</li>
              <li>Our team's service</li>
              <li>Would you recommend Carbonus to friends?</li>
            </ul>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="mailto:info@carbonus.lt?subject=Feedback about rental ${data.reservationId}" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                📝 Leave Feedback
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 15px;">
              Or simply reply to this email with your comments.
            </p>
          </div>
          
          <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
            <p style="margin: 0;"><strong>🎁 Thank You for Your Loyalty!</strong></p>
            <p style="margin: 10px 0 0 0;">
              Your deposit will be refunded within 3-5 business days.<br>
              <strong>Next Rental:</strong> Especially for you - 10% discount on your next booking!<br>
              <em>Discount code: LOYAL10</em>
            </p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #555;">🌟 Share Your Experience</h3>
            <p style="margin: 10px 0;">If you enjoyed our service, we would be grateful for a review:</p>
            <p style="margin: 5px 0;">
              ⭐ <a href="https://g.page/r/YOUR_GOOGLE_REVIEW_LINK" style="color: #3b82f6; text-decoration: none;">Google Review</a><br>
              📘 <a href="https://facebook.com/YOUR_FB_PAGE" style="color: #3b82f6; text-decoration: none;">Facebook Page</a><br>
              📸 <a href="https://instagram.com/YOUR_IG" style="color: #3b82f6; text-decoration: none;">Instagram</a>
            </p>
          </div>
          
          <p>We hope to see you again among our customers! 🚗💨</p>
          
          <p>If you have questions or issues, you can always contact us:</p>
          <p>📧 Email: info@carbonus.lt<br>📞 Phone: +370 6 98 18 781</p>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            With respect and gratitude,<br>Carbonus Team 🙏
          </p>
        </div>
      `,
    });

    console.log("Feedback request email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-feedback-request function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
