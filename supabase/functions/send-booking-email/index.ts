import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client for rate limiting
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  "Access-Control-Allow-Origin": Deno.env.get('NODE_ENV') === 'production' ? "https://carbonus.lt" : "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

// Input validation and sanitization
function validateAndSanitizeInput(input: BookingEmailRequest): BookingEmailRequest {
  const requiredFields = ['customerName', 'customerEmail', 'customerPhone', 'carName', 'startDate', 'endDate'];
  
  for (const field of requiredFields) {
    if (!input[field as keyof BookingEmailRequest] || String(input[field as keyof BookingEmailRequest]).trim() === '') {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(input.customerEmail)) {
    throw new Error('Invalid email format');
  }

  // Sanitize HTML-sensitive content by escaping HTML entities
  const escapeHtml = (text: string): string => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  return {
    customerName: escapeHtml(String(input.customerName).trim().substring(0, 100)),
    customerEmail: String(input.customerEmail).trim().toLowerCase().substring(0, 254),
    customerPhone: escapeHtml(String(input.customerPhone).trim().substring(0, 20)),
    carName: escapeHtml(String(input.carName).trim().substring(0, 100)),
    startDate: escapeHtml(String(input.startDate).trim().substring(0, 10)),
    endDate: escapeHtml(String(input.endDate).trim().substring(0, 10)),
    rentalDays: Math.max(1, Math.min(365, Number(input.rentalDays) || 1)),
    totalAmount: Math.max(0, Math.min(100000, Number(input.totalAmount) || 0)),
    depositAmount: Math.max(0, Math.min(10000, Number(input.depositAmount) || 300)),
  };
}

// Rate limiting function
async function checkRateLimit(identifier: string): Promise<boolean> {
  const windowMinutes = 15;
  const maxRequests = 5; // Max 5 emails per 15 minutes per IP/email
  
  try {
    // Clean up old entries first
    await supabase.rpc('cleanup_old_rate_limits');
    
    // Check current rate limit
    const { data: existingLimits } = await supabase
      .from('rate_limits')
      .select('request_count, window_start')
      .eq('identifier', identifier)
      .eq('endpoint', 'send-booking-email')
      .gte('window_start', new Date(Date.now() - windowMinutes * 60 * 1000).toISOString())
      .order('window_start', { ascending: false })
      .limit(1);

    if (existingLimits && existingLimits.length > 0) {
      const limit = existingLimits[0];
      if (limit.request_count >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      // Update counter
      await supabase
        .from('rate_limits')
        .update({ request_count: limit.request_count + 1 })
        .eq('identifier', identifier)
        .eq('endpoint', 'send-booking-email')
        .eq('window_start', limit.window_start);
    } else {
      // Create new rate limit entry
      await supabase
        .from('rate_limits')
        .insert({
          identifier,
          endpoint: 'send-booking-email',
          request_count: 1,
        });
    }
    
    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return true; // Allow on error to prevent blocking legitimate requests
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Get client IP for rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    console.log(`Processing booking email request from IP: ${clientIP}`);

    const rawInput = await req.json();
    
    // Validate and sanitize input
    const input = validateAndSanitizeInput(rawInput);
    
    // Check rate limit using IP and email
    const rateLimitIdentifier = `${clientIP}:${input.customerEmail}`;
    const withinRateLimit = await checkRateLimit(rateLimitIdentifier);
    
    if (!withinRateLimit) {
      console.warn(`Rate limit exceeded for ${rateLimitIdentifier}`);
      return new Response(JSON.stringify({ 
        error: "Too many requests. Please wait before sending another email." 
      }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Sending booking confirmation emails...');

    // Send email to admin
    const adminEmailResponse = await resend.emails.send({
      from: "Carbonus Rezervacijos <onboarding@resend.dev>",
      to: ["info@carbonus.lt"],
      subject: `Nauja rezervacija - ${input.carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Nauja automobilio rezervacija</h2>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Kliento informacija:</h3>
            <p><strong>Vardas Pavardė:</strong> ${input.customerName}</p>
            <p><strong>El. paštas:</strong> ${input.customerEmail}</p>
            <p><strong>Telefonas:</strong> ${input.customerPhone}</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Rezervacijos informacija:</h3>
            <p><strong>Automobilis:</strong> ${input.carName}</p>
            <p><strong>Pradžios data:</strong> ${input.startDate}</p>
            <p><strong>Pabaigos data:</strong> ${input.endDate}</p>
            <p><strong>Dienų skaičius:</strong> ${input.rentalDays}</p>
            <p><strong>Nuomos kaina:</strong> €${input.totalAmount}</p>
            <p><strong>Užstatas:</strong> €${input.depositAmount}</p>
            <p><strong>Bendra suma:</strong> €${input.totalAmount + input.depositAmount}</p>
          </div>
          
          <p style="color: #059669; font-weight: bold;">Susisiekite su klientu dėl mokėjimo ir automobilio perdavimo detalių.</p>
        </div>
      `,
    });

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "Carbonus <onboarding@resend.dev>",
      to: [input.customerEmail],
      subject: `Rezervacijos patvirtinimas - ${input.carName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Ačiū už rezervaciją!</h2>
          
          <p>Sveiki, ${input.customerName}!</p>
          
          <p>Gavome jūsų automobilio rezervacijos užklausą. Netrukus susisieksime su jumis dėl mokėjimo ir automobilio perdavimo detalių.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Jūsų rezervacijos informacija:</h3>
            <p><strong>Automobilis:</strong> ${input.carName}</p>
            <p><strong>Pradžios data:</strong> ${input.startDate}</p>
            <p><strong>Pabaigos data:</strong> ${input.endDate}</p>
            <p><strong>Dienų skaičius:</strong> ${input.rentalDays}</p>
            <p><strong>Nuomos kaina:</strong> €${input.totalAmount}</p>
            <p><strong>Užstatas:</strong> €${input.depositAmount}</p>
            <p><strong>Bendra suma:</strong> €${input.totalAmount + input.depositAmount}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #92400e;">Svarbi informacija:</h4>
            <ul style="color: #92400e;">
              <li>Užstatas (€${input.depositAmount}) grąžinamas po automobilio grąžinimo</li>
              <li>Atšaukimai galimi el. paštu: <strong>info@carbonus.lt</strong></li>
              <li>Atšaukti galima ne vėliau kaip likus 3 dienoms iki paėmimo datos</li>
            </ul>
          </div>
          
          <p>Klausimų atveju kreipkitės:</p>
          <p><strong>El. paštas:</strong> info@carbonus.lt</p>
          <p><strong>Telefonas:</strong> +370 123 45678</p>
          
          <p style="margin-top: 30px;">Su pagarba,<br>Carbonus komanda</p>
        </div>
      `,
    });

    console.log("Admin email sent successfully:", adminEmailResponse);
    console.log("Customer email sent successfully:", customerEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      adminEmailId: adminEmailResponse.data?.id,
      customerEmailId: customerEmailResponse.data?.id 
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    
    // Don't expose detailed error messages to clients
    const errorMessage = error.message?.includes('Missing required field') || 
                        error.message?.includes('Invalid email format') ||
                        error.message?.includes('Too many requests')
                        ? error.message 
                        : 'Internal server error';
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: error.message?.includes('Too many requests') ? 429 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);