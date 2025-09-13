import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractRequest {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  carName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  signatureData: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      reservationId,
      customerName,
      customerEmail,
      carName,
      startDate,
      endDate,
      totalAmount,
      signatureData
    }: ContractRequest = await req.json();

    // Generate PDF content (simplified HTML version for now)
    const contractHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Car Rental Agreement</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 20px;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .section { 
              margin-bottom: 20px; 
            }
            .signature-section {
              border-top: 1px solid #ccc;
              padding-top: 20px;
              margin-top: 40px;
            }
            .signature-image {
              max-width: 300px;
              height: auto;
              border: 1px solid #ddd;
              padding: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CARBONUS CAR RENTAL AGREEMENT</h1>
            <p>Contract #: ${reservationId}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="section">
            <h2>RENTAL DETAILS</h2>
            <table>
              <tr><th>Customer Name</th><td>${customerName}</td></tr>
              <tr><th>Email</th><td>${customerEmail}</td></tr>
              <tr><th>Vehicle</th><td>${carName}</td></tr>
              <tr><th>Rental Start Date</th><td>${startDate}</td></tr>
              <tr><th>Rental End Date</th><td>${endDate}</td></tr>
              <tr><th>Total Amount</th><td>€${totalAmount}</td></tr>
            </table>
          </div>

          <div class="section">
            <h2>TERMS AND CONDITIONS</h2>
            <ol>
              <li><strong>Driver Requirements:</strong> The renter must possess a valid driver's license and be at least 21 years old.</li>
              <li><strong>Vehicle Condition:</strong> The vehicle is provided in good working condition and must be returned in the same state.</li>
              <li><strong>Insurance:</strong> Basic insurance is included. Additional coverage may be purchased separately.</li>
              <li><strong>Fuel Policy:</strong> Vehicle must be returned with the same fuel level as provided.</li>
              <li><strong>Late Returns:</strong> Additional charges apply for late returns beyond the agreed time.</li>
              <li><strong>Damages:</strong> Renter is responsible for any damages not covered by insurance.</li>
              <li><strong>Cancellation:</strong> Cancellations must be made at least 3 days in advance for full refund.</li>
              <li><strong>Prohibited Uses:</strong> Vehicle cannot be used for racing, off-road driving, or illegal activities.</li>
            </ol>
          </div>

          <div class="signature-section">
            <h2>CUSTOMER SIGNATURE</h2>
            <p>By signing below, I acknowledge that I have read, understood, and agree to all terms and conditions of this rental agreement.</p>
            
            <div style="margin: 20px 0;">
              <p><strong>Customer Name:</strong> ${customerName}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>

            ${signatureData ? `
              <div style="margin: 20px 0;">
                <p><strong>Digital Signature:</strong></p>
                <img src="${signatureData}" class="signature-image" alt="Customer Signature" />
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
            <p>CARBONUS Car Rental Service</p>
            <p>Email: info@carbonus.lt | Phone: +370 XXX XXXXX</p>
            <p>This is a legally binding agreement.</p>
          </div>
        </body>
      </html>
    `;

    // Send contract via email to both customer and company
    const emailPromises = [
      // Email to customer
      resend.emails.send({
        from: "CARBONUS <info@carbonus.lt>",
        to: [customerEmail],
        subject: "Your Car Rental Contract - CARBONUS",
        html: `
          <h2>Thank you for choosing CARBONUS!</h2>
          <p>Dear ${customerName},</p>
          <p>Your car rental booking has been confirmed. Please find your signed contract attached.</p>
          
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Vehicle:</strong> ${carName}</li>
            <li><strong>Rental Period:</strong> ${startDate} to ${endDate}</li>
            <li><strong>Total Amount:</strong> €${totalAmount}</li>
            <li><strong>Contract #:</strong> ${reservationId}</li>
          </ul>
          
          <p>Please keep this contract for your records. If you have any questions, please don't hesitate to contact us.</p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            ${contractHtml}
          </div>
          
          <p>Best regards,<br>CARBONUS Team</p>
        `,
      }),
      
      // Email to company
      resend.emails.send({
        from: "CARBONUS <info@carbonus.lt>",
        to: ["info@carbonus.lt"],
        subject: `New In-Person Booking Completed - ${customerName}`,
        html: `
          <h2>New In-Person Booking Completed</h2>
          
          <h3>Customer Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${customerName}</li>
            <li><strong>Email:</strong> ${customerEmail}</li>
          </ul>
          
          <h3>Booking Details:</h3>
          <ul>
            <li><strong>Contract #:</strong> ${reservationId}</li>
            <li><strong>Vehicle:</strong> ${carName}</li>
            <li><strong>Rental Period:</strong> ${startDate} to ${endDate}</li>
            <li><strong>Total Amount:</strong> €${totalAmount}</li>
          </ul>
          
          <p>The customer has signed the contract digitally and a copy has been sent to their email address.</p>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            ${contractHtml}
          </div>
        `,
      })
    ];

    await Promise.all(emailPromises);

    console.log("Contract emails sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contract generated and sent successfully" 
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
    console.error("Error in generate-contract-pdf function:", error);
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