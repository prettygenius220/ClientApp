import { createClient } from "npm:@supabase/supabase-js@2.39.7";
import { corsHeaders } from "../_shared/cors.ts";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mailgun configuration with environment variables
const MAILGUN_API_KEY = Deno.env.get("MAILGUN_API_KEY") || "";
const MAILGUN_DOMAIN = Deno.env.get("MAILGUN_DOMAIN") || "mg.themakerai.com";
const MAILGUN_FROM_EMAIL = Deno.env.get("MAILGUN_FROM_EMAIL") || "RealEdu <noreply@mg.themakerai.com>";

// Enhanced debug function
function debugEnvironment() {
  console.log("=== ENHANCED ENVIRONMENT DEBUG ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("SUPABASE_URL:", supabaseUrl ? `✓ Set (${supabaseUrl.substring(0, 30)}...)` : "✗ Missing");
  console.log("SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? `✓ Set (${supabaseServiceKey.substring(0, 8)}...)` : "✗ Missing");
  console.log("MAILGUN_API_KEY:", MAILGUN_API_KEY ? `✓ Set (${MAILGUN_API_KEY.substring(0, 12)}...)` : "✗ Missing");
  console.log("MAILGUN_DOMAIN:", MAILGUN_DOMAIN);
  console.log("MAILGUN_FROM_EMAIL:", MAILGUN_FROM_EMAIL);
  console.log("API Key Length:", MAILGUN_API_KEY.length);
  console.log("API Key Format Valid:", MAILGUN_API_KEY.startsWith("key-") || MAILGUN_API_KEY.match(/^[a-f0-9]{32}-[a-f0-9]{8}-[a-f0-9]{8}$/));
  console.log("==================================");
}

Deno.serve(async (req) => {
  console.log("🚀 Edge Function called:", req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight handled");
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Debug environment on every request
    debugEnvironment();

    if (req.method !== "POST") {
      console.error("❌ Invalid method:", req.method);
      return new Response(
        JSON.stringify({ success: false, error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse request body with enhanced error handling
    let requestBody;
    try {
      const rawBody = await req.text();
      console.log("📥 Raw request body length:", rawBody.length);
      console.log("📥 Raw request body preview:", rawBody.substring(0, 200));
      
      requestBody = JSON.parse(rawBody);
      console.log("✅ Request body parsed successfully:", {
        to: requestBody.to,
        subject: requestBody.subject,
        hasHtml: !!requestBody.html,
        hasText: !!requestBody.text,
        type: requestBody.type,
        htmlLength: requestBody.html?.length || 0,
        textLength: requestBody.text?.length || 0
      });
    } catch (error) {
      console.error("❌ Error parsing request body:", error);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid JSON in request body", details: error.message }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const { to, subject, html, text, type } = requestBody;

    // Enhanced validation
    if (!to || !subject || (!html && !text)) {
      console.error("❌ Missing required fields:", { 
        to: !!to, 
        subject: !!subject, 
        html: !!html, 
        text: !!text,
        toValue: to,
        subjectValue: subject
      });
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Missing required fields: to, subject, and html or text",
          received: { to: !!to, subject: !!subject, html: !!html, text: !!text }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Enhanced email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(to)) {
      console.error("❌ Invalid email format:", to);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address format", email: to }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Check Mailgun configuration
    if (!MAILGUN_API_KEY) {
      console.error("❌ MAILGUN_API_KEY environment variable is not set");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Mailgun API key not configured",
          debug: "MAILGUN_API_KEY environment variable is missing"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Validate API key format
    const isValidApiKey = MAILGUN_API_KEY.startsWith("key-") || 
                         MAILGUN_API_KEY.match(/^[a-f0-9]{32}-[a-f0-9]{8}-[a-f0-9]{8}$/);
    
    if (!isValidApiKey) {
      console.error("❌ Invalid Mailgun API key format");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Invalid Mailgun API key format",
          debug: `Key should start with 'key-' or be in format 'xxxxxxxx-xxxx-xxxx'. Current format: ${MAILGUN_API_KEY.substring(0, 8)}...`
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log("📧 Preparing to send email via Mailgun API...");
    console.log("📧 To:", to);
    console.log("📧 Subject:", subject);
    console.log("📧 From:", MAILGUN_FROM_EMAIL);
    console.log("📧 Domain:", MAILGUN_DOMAIN);
    console.log("📧 Type:", type || "unknown");

    // Prepare Mailgun request - EXACT format that works in curl
    const mailgunUrl = `https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`;
    console.log("📧 Mailgun URL:", mailgunUrl);

    // Create URLSearchParams exactly like your working curl command
    const formData = new URLSearchParams();
    formData.append("from", MAILGUN_FROM_EMAIL);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("text", text || "Please view this email in HTML format.");
    if (html) {
      formData.append("html", html);
    }

    console.log("📧 Form data prepared:");
    console.log("  - from:", MAILGUN_FROM_EMAIL);
    console.log("  - to:", to);
    console.log("  - subject:", subject);
    console.log("  - text length:", (text || "Please view this email in HTML format.").length);
    console.log("  - html length:", html?.length || 0);
    console.log("  - form data string length:", formData.toString().length);

    // Create authorization header exactly like curl
    const authHeader = `Basic ${btoa(`api:${MAILGUN_API_KEY}`)}`;
    console.log("🔐 Auth header created (length):", authHeader.length);

    console.log("🌐 Making request to Mailgun API...");
    
    // Make request with exact headers that work in curl
    const startTime = Date.now();
    let resp;
    
    try {
      resp = await fetch(mailgunUrl, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Supabase-Edge-Function/1.0"
        },
        body: formData.toString()
      });
      
      const requestTime = Date.now() - startTime;
      console.log("⏱️ Request completed in:", requestTime, "ms");
      console.log("📊 Response status:", resp.status);
      console.log("📊 Response status text:", resp.statusText);
      console.log("📊 Response headers:", Object.fromEntries(resp.headers.entries()));
      
    } catch (fetchError) {
      console.error("❌ Network error during fetch:");
      console.error("Error type:", fetchError.constructor.name);
      console.error("Error message:", fetchError.message);
      console.error("Error stack:", fetchError.stack);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Network error connecting to Mailgun",
          details: fetchError.message,
          debug: {
            errorType: fetchError.constructor.name,
            url: mailgunUrl,
            domain: MAILGUN_DOMAIN,
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Get response text with error handling
    let responseText;
    try {
      responseText = await resp.text();
      console.log("📥 Response body length:", responseText.length);
      console.log("📥 Response body:", responseText);
    } catch (textError) {
      console.error("❌ Error reading response text:", textError);
      responseText = "";
    }

    if (!resp.ok) {
      console.error("❌ Mailgun API error details:");
      console.error("Status:", resp.status);
      console.error("Status Text:", resp.statusText);
      console.error("Response Body:", responseText);
      console.error("Request URL:", mailgunUrl);
      console.error("Request Domain:", MAILGUN_DOMAIN);
      console.error("Request From:", MAILGUN_FROM_EMAIL);
      
      // Try to parse error response
      let errorMessage = "Failed to send email";
      let errorDetails = {};
      
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorMessage;
        errorDetails = errorData;
        console.error("📋 Parsed Mailgun error:", errorData);
      } catch (e) {
        console.error("❌ Could not parse error response as JSON");
        errorMessage = responseText || errorMessage;
        errorDetails = { rawResponse: responseText };
      }
      
      // Return detailed error for debugging
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Mailgun API error: ${resp.status} - ${errorMessage}`,
          debug: {
            status: resp.status,
            statusText: resp.statusText,
            response: responseText,
            url: mailgunUrl,
            domain: MAILGUN_DOMAIN,
            fromEmail: MAILGUN_FROM_EMAIL,
            apiKeyLength: MAILGUN_API_KEY.length,
            apiKeyPrefix: MAILGUN_API_KEY.substring(0, 8),
            errorDetails,
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 200, // Return 200 to handle gracefully on client
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Parse successful response
    let result;
    try {
      result = JSON.parse(responseText);
      console.log("✅ Mailgun success response:", result);
    } catch (e) {
      console.error("⚠️ Could not parse success response as JSON:", responseText);
      // Create a fallback result
      result = { 
        id: `fallback-${Date.now()}`, 
        message: "Email sent but response not parseable",
        rawResponse: responseText
      };
    }

    console.log("🎉 Email sent successfully via Mailgun API!");
    console.log("📧 Message ID:", result.id);
    console.log("📧 Recipient:", to);
    console.log("📧 Subject:", subject);

    // Enhanced communication logging
    try {
      const { error: logError } = await supabase
        .from("communications")
        .insert({
          client_id: null,
          user_id: null,
          type: "email",
          subject: subject,
          content: `System email sent to ${to} via Mailgun API`,
          status: "sent",
          metadata: {
            mailgun_id: result.id,
            type: type || "system",
            timestamp: new Date().toISOString(),
            domain: MAILGUN_DOMAIN,
            from_email: MAILGUN_FROM_EMAIL,
            recipient: to
          }
        });
        
      if (logError) {
        console.error("⚠️ Error logging communication (non-critical):", logError);
      } else {
        console.log("✅ Communication logged successfully");
      }
    } catch (logError) {
      console.error("⚠️ Error logging email communication (non-critical):", logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully via Mailgun API",
        recipient: to,
        mailgunId: result.id,
        timestamp: new Date().toISOString(),
        debug: {
          domain: MAILGUN_DOMAIN,
          fromEmail: MAILGUN_FROM_EMAIL,
          responseStatus: resp.status,
          responseTime: Date.now() - startTime
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("💥 Unexpected error in send-email-backup function:");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Internal server error",
        debug: {
          errorType: error.constructor.name,
          timestamp: new Date().toISOString(),
          stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});