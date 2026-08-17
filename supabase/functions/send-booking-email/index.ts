import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
  deliveryAddress?: string;
  returnAddress?: string;
  deliveryFee?: number;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const escapeHtml = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const num = (v: unknown, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    // ---- Authorization: the email content must be tied to a real reservation.
    // Staff (admin/owner/fleet_manager) may send test/manual emails with custom data.
    let isStaff = false;
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (jwt && jwt !== Deno.env.get("SUPABASE_ANON_KEY")) {
      const { data: userData } = await admin.auth.getUser(jwt);
      const uid = userData?.user?.id;
      if (uid) {
        const { data: roles } = await admin
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        isStaff = (roles ?? []).some((r: { role: string }) =>
          ["admin", "owner", "fleet_manager"].includes(r.role)
        );
      }
    }

    const reservationId = typeof payload.reservationId === "string" ? payload.reservationId : "";
    let booking: BookingEmailRequest;

    if (UUID_RE.test(reservationId)) {
      const { data: reservation, error: resErr } = await admin
        .from("reservations")
        .select(
          "id, car_name, start_date, end_date, pickup_time, return_time, rental_days, total_amount, deposit_amount, delivery_address, return_address, delivery_fee, language, payment_method, customers(first_name,last_name,email,phone)"
        )
        .eq("id", reservationId)
        .maybeSingle();

      if (resErr || !reservation) {
        return new Response(JSON.stringify({ error: "Reservation not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const c = (reservation as any).customers ?? {};
      booking = {
        customerName: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(),
        customerEmail: c.email ?? "",
        customerPhone: c.phone ?? "",
        carName: reservation.car_name ?? "",
        startDate: String(reservation.start_date ?? ""),
        endDate: String(reservation.end_date ?? ""),
        pickupTime: reservation.pickup_time ? String(reservation.pickup_time).slice(0, 5) : undefined,
        returnTime: reservation.return_time ? String(reservation.return_time).slice(0, 5) : undefined,
        rentalDays: num(reservation.rental_days, 1),
        totalAmount: num(reservation.total_amount),
        depositAmount: num(reservation.deposit_amount, 200),
        advancePayment: num(payload.advancePayment),
        paymentMethod: reservation.payment_method ?? undefined,
        language: reservation.language ?? payload.language ?? "lt",
        packageName: typeof payload.packageName === "string" ? payload.packageName : undefined,
        packagePrice: typeof payload.packagePrice === "string" ? payload.packagePrice : undefined,
        deliveryAddress: reservation.delivery_address ?? undefined,
        returnAddress: reservation.return_address ?? undefined,
        deliveryFee: num(reservation.delivery_fee),
      };

      if (!booking.customerEmail) {
        return new Response(JSON.stringify({ error: "Reservation has no customer email" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } else if (isStaff) {
      booking = payload as BookingEmailRequest;
      if (!booking.customerEmail) {
        return new Response(JSON.stringify({ error: "customerEmail required" }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
    } else {
      return new Response(JSON.stringify({ error: "Valid reservationId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Escape every free-text value once so templates cannot inject HTML.
    const recipientEmail = String(booking.customerEmail).trim();
    booking = {
      ...booking,
      customerName: escapeHtml(booking.customerName),
      customerEmail: escapeHtml(booking.customerEmail),
      customerPhone: escapeHtml(booking.customerPhone),
      carName: escapeHtml(booking.carName),
      startDate: escapeHtml(booking.startDate),
      endDate: escapeHtml(booking.endDate),
      pickupTime: booking.pickupTime ? escapeHtml(booking.pickupTime) : undefined,
      returnTime: booking.returnTime ? escapeHtml(booking.returnTime) : undefined,
      packageName: booking.packageName ? escapeHtml(booking.packageName) : undefined,
      packagePrice: booking.packagePrice ? escapeHtml(booking.packagePrice) : undefined,
      rentalDays: num(booking.rentalDays, 1),
      totalAmount: num(booking.totalAmount),
      depositAmount: num(booking.depositAmount, 200),
      advancePayment: num(booking.advancePayment),
      deliveryFee: num(booking.deliveryFee),
    };

    const lang = booking.language || 'lt';
    const isLT = lang === 'lt';

    
    const logoUrl = 'https://carbonus.lt/lovable-uploads/9b59176c-0032-4a32-bf95-84482d9bcdbd.png';
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

    // Delivery / collection (pristatymas ir paėmimas kitu adresu)
    const esc = (v: unknown) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const OFFICE_HINT = "carbonus";
    const deliveryAddr = (booking.deliveryAddress || "").trim();
    const returnAddr = (booking.returnAddress || "").trim();
    const deliveryFee = Number(booking.deliveryFee || 0);
    const isOffice = (a: string) => !a || a.toLowerCase().includes(OFFICE_HINT);
    const needsLogistics = deliveryFee > 0 || !isOffice(deliveryAddr) || !isOffice(returnAddr);

    const logisticsHtml = (locale: 'lt' | 'en', forAdmin = false) => {
      if (!needsLogistics) return '';
      const title = locale === 'lt'
        ? (forAdmin ? '🚚 Pristatymas / paėmimas kitu adresu' : '🚚 Pristatymas ir paėmimas')
        : (forAdmin ? '🚚 Delivery / collection at another address' : '🚚 Delivery and collection');
      const dLabel = locale === 'lt' ? 'Pristatyti automobilį į' : 'Deliver the car to';
      const rLabel = locale === 'lt' ? 'Paimti automobilį iš' : 'Collect the car from';
      const fLabel = locale === 'lt' ? 'Logistikos mokestis' : 'Logistics fee';
      return `
      <div style="background-color: #ecfdf5; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #15803d;">
        <p style="margin: 0 0 8px 0; font-weight: bold;">${title}</p>
        <p style="margin: 4px 0;"><strong>${dLabel}:</strong> ${esc(deliveryAddr) || (locale === 'lt' ? 'Carbonus ofisas, Druskininkai' : 'Carbonus office, Druskininkai')}</p>
        <p style="margin: 4px 0;"><strong>${rLabel}:</strong> ${esc(returnAddr) || (locale === 'lt' ? 'Carbonus ofisas, Druskininkai' : 'Carbonus office, Druskininkai')}</p>
        ${deliveryFee > 0 ? `<p style="margin: 4px 0;"><strong>${fLabel}:</strong> €${deliveryFee.toFixed(2)}</p>` : ''}
      </div>`;
    };

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
          ${logisticsHtml('lt', true)}
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
      to: [recipientEmail],
      subject: isLT ? `Rezervacijos patvirtinimas - ${booking.carName}` : `Booking Confirmation - ${booking.carName}`,
      html: isLT ? `
        <meta charset="utf-8" />
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${logoUrl}" alt="Carbonus" style="${logoStyles}" />
          <h1 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Rezervacija atlikta!</h1>
          
          <p>Sveiki, ${booking.customerName}!</p>
          <p>Jūsų rezervacija sėkmingai gauta. Netrukus susisieksime su jumis dėl mokėjimo ir automobilio perdavimo detalių.</p>

          ${packageHtmlCustomerLT}
          ${logisticsHtml('lt')}
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
          ${logisticsHtml('en')}
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
