import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "imageUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call OCR.space API
    const ocrApiKey = Deno.env.get("OCR_SPACE_API_KEY");
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        url: imageUrl,
        apikey: ocrApiKey,
      }),
    });

    const ocrData = await ocrResponse.json();

    let detectedText = "";
    if (
      ocrData.ParsedResults &&
      ocrData.ParsedResults.length > 0 &&
      ocrData.ParsedResults[0].ParsedText
    ) {
      detectedText = ocrData.ParsedResults[0].ParsedText.trim();
    }

    if (detectedText.length < 6) {
      return new Response(
        JSON.stringify({ error: "Could not detect a valid plate (too short)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Call secure_lookup RPC
    const { data, error } = await supabase.rpc("secure_lookup", {
      input_plate: detectedText,
    });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ plate: detectedText, result: data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
