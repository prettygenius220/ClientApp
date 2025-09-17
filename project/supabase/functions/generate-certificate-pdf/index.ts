import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { jsPDF } from "npm:jspdf@2.5.1";

import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { certificateId } = await req.json();

    if (!certificateId) {
      return new Response(
        JSON.stringify({ error: "Certificate ID is required" }),
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
        course_number,
        course_date,
        course_id
      `)
      .eq("id", certificateId)
      .single();

    if (certError) {
      return new Response(
        JSON.stringify({ error: `Error fetching certificate: ${certError.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get course details if needed
    let courseNumber = certificate.course_number;
    let courseDate = certificate.course_date;

    if (!courseNumber || !courseDate) {
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("course_number, start_time")
        .eq("id", certificate.course_id)
        .single();

      if (!courseError && course) {
        if (!courseNumber) courseNumber = course.course_number;
        if (!courseDate) courseDate = course.start_time;
      }
    }

    // Format date
    let formattedDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    if (courseDate) {
      try {
        formattedDate = new Date(courseDate).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      } catch (e) {
        console.error("Error formatting date:", e);
      }
    }

    // Generate PDF
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Background color instead of image for simplicity
    doc.setFillColor(240, 253, 250); // Light teal background
    doc.rect(0, 0, 297, 210, "F");

    // Add certificate content
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.setTextColor(13, 148, 136); // Teal color
    doc.text("Certificate of Completion", 148.5, 50, { align: "center" });

    // Add course title with proper text wrapping
    doc.setFontSize(24);
    doc.setTextColor(50, 50, 50);
    const courseTitle = certificate.course_title;
    const maxWidth = 180; // Reduced maximum width for text in mm
    const lines = doc.splitTextToSize(courseTitle, maxWidth);
    
    // Adjust vertical position based on number of lines
    const titleY = lines.length > 1 ? 65 : 68;
    doc.text(lines, 148.5, titleY, { align: "center" });

    // Add course number and date
    const courseInfoY = titleY + (lines.length * 8) + 8;

    // Format course number properly
    let formattedCourseNumber = "Course #N/A";
    if (courseNumber && courseNumber.trim() !== "") {
      formattedCourseNumber = `Course #${courseNumber}`;
    }
    doc.text(formattedCourseNumber, 148.5, courseInfoY, { align: "center" });

    // Add session date
    doc.text(`Session Date: ${formattedDate}`, 148.5, courseInfoY + 8, { align: "center" });

    // Add participant name
    doc.setFontSize(26);
    doc.setFont("helvetica", "bold");

    // Ensure participant name is properly formatted
    let participantName = "Certificate Recipient";
    if (certificate.participant_name && certificate.participant_name.trim() !== "") {
      participantName = certificate.participant_name.trim();
    }

    // Wrap participant name if too long
    const participantLines = doc.splitTextToSize(participantName, maxWidth - 20);
    const participantY = courseInfoY + 25;
    doc.text(participantLines, 148.5, participantY, { align: "center" });

    // Add certificate number
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    const certNumberY = participantY + (participantLines.length * 8) + 8;

    // Format certificate number properly
    let formattedCertNumber = "Certificate #N/A";
    if (certificate.certificate_number && certificate.certificate_number.trim() !== "") {
      formattedCertNumber = `Certificate #${certificate.certificate_number}`;
    }
    doc.text(formattedCertNumber, 148.5, certNumberY, { align: "center" });

    // Add CE Hours
    doc.setFontSize(16);
    doc.text(`CE Hours: ${certificate.ce_hours}`, 148.5, certNumberY + 12, { align: "center" });

    // Add issue date
    // Format issue date properly with error handling
    let issuedDate;
    try {
      issuedDate = new Date(certificate.issued_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      issuedDate = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
    doc.text(`Issued: ${issuedDate}`, 148.5, certNumberY + 24, { align: "center" });

    // Add instructor signature
    if (certificate.instructor) {
      doc.setFont("helvetica", "bold");
      doc.text(certificate.instructor, 148.5, certNumberY + 36, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Instructor", 148.5, certNumberY + 42, { align: "center" });
    }

    // Add school name at bottom
    doc.setFontSize(10);
    doc.text(certificate.school_name || "RealEdu", 148.5, 200, { align: "center" });

    // Convert to base64
    const pdfBase64 = doc.output("datauristring").split(",")[1];

    return new Response(
      JSON.stringify({ pdfBase64 }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred generating the PDF" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});