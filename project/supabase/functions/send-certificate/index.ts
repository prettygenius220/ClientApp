import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Mailgun
const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY") || "";
const MAILGUN_DOMAIN = "mg.themakerai.com";
const MAILGUN_FROM_EMAIL = "RealEdu <noreply@mg.themakerai.com>";

// Fallback to environment variables if needed
const FINAL_MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN") || MAILGUN_DOMAIN;
const FINAL_FROM_EMAIL = Deno.env.get("MAILGUN_FROM_EMAIL") || MAILGUN_FROM_EMAIL;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Only accept POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { certificateId } = await req.json();

    if (!certificateId) {
      return new Response(
        JSON.stringify({ success: false, error: "Certificate ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Fetch certificate details
    const { data: certificate, error: certError } = await supabase
      .from("course_certificates")
      .select(`
        id,
        certificate_number,
        course_title,
        participant_name,
        issued_date,
        ce_hours,
        instructor,
        school_name,
        pdf_url,
        course_number,
        course_date,
        user_id,
        external_user_id,
        external_email
      `)
      .eq("id", certificateId)
      .single();

    if (certError) {
      return new Response(
        JSON.stringify({ success: false, error: `Error fetching certificate: ${certError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Determine recipient email
    let recipientEmail = "";
    
    if (certificate.user_id) {
      // Get email from todo_profiles for registered users
      const { data: profile, error: profileError } = await supabase
        .from("todo_profiles")
        .select("email")
        .eq("id", certificate.user_id)
        .single();

      if (profileError) {
        return new Response(
          JSON.stringify({ success: false, error: `Error fetching user profile: ${profileError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      recipientEmail = profile.email;
    } else if (certificate.external_user_id) {
      // Get email from external_enrollments
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("external_enrollments")
        .select("email")
        .eq("id", certificate.external_user_id)
        .single();

      if (enrollmentError) {
        return new Response(
          JSON.stringify({ success: false, error: `Error fetching external enrollment: ${enrollmentError.message}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
      
      recipientEmail = enrollment.email;
    } else if (certificate.external_email) {
      // Use external_email directly
      recipientEmail = certificate.external_email;
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "Could not determine recipient email" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Format certificate date
    const certificateDate = certificate.course_date 
      ? new Date(certificate.course_date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        })
      : new Date(certificate.issued_date).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });

    // Generate PDF URL
    const pdfUrl = `${supabaseUrl}/storage/v1/object/public/certificates/${certificate.certificate_number}.pdf`;

    // Format email content
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #0d9488; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Your Course Certificate</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
          <p>Hello ${certificate.participant_name},</p>
          <p>Congratulations on completing "${certificate.course_title}"!</p>
          <p>Your certificate details:</p>
          <ul style="margin-bottom: 20px;">
            <li>Certificate Number: ${certificate.certificate_number}</li>
            <li>Course: ${certificate.course_title}</li>
            <li>Instructor: ${certificate.instructor}</li>
            <li>CE Hours: ${certificate.ce_hours}</li>
            <li>Date Issued: ${certificateDate}</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${pdfUrl}" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Download Certificate</a>
          </div>
          <p>If you have any questions, please contact us at info@realedu.co.</p>
          <p>Best regards,<br>The RealEdu Team</p>
        </div>
      </div>
    `;

    // Check if we're in development mode (missing or dummy API key)
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || MAILGUN_API_KEY.startsWith("key-dummy")) {
      console.log("Development mode: Would send email to", recipientEmail);
      console.log("Email subject:", `Your Certificate for ${certificate.course_title}`);
      console.log("Email content preview:", emailContent.substring(0, 200) + "...");
      
      // Update certificate email status even in dev mode
      await supabase
        .from("course_certificates")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString()
        })
        .eq("id", certificateId);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Development mode: Email would be sent in production",
          recipient: recipientEmail
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Send email using Mailgun API
    const mailgunUrl = `https://api.mailgun.net/v3/${FINAL_MAILGUN_DOMAIN}/messages`;
    
    // Create form data for Mailgun
    const formData = new FormData();
    formData.append("from", FINAL_FROM_EMAIL);
    formData.append("to", recipientEmail);
    formData.append("subject", `Your Certificate for ${certificate.course_title}`);
    formData.append("html", emailContent);

    // Send email via Mailgun
    const response = await fetch(mailgunUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Mailgun API error:", response.status, errorText);
      throw new Error(`Mailgun API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log("Mailgun response:", result);

    // Update certificate email status
    await supabase
      .from("course_certificates")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq("id", certificateId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Certificate email sent successfully",
        recipient: recipientEmail,
        mailgunId: result.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error sending certificate:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send certificate email"
      }),
      {
        status: 200, // Return 200 even for errors to handle them on the client side
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});