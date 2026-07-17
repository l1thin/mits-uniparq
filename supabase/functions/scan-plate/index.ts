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

    // Call Plate Recognizer ALPR API
    const alprToken = Deno.env.get("PLATE_RECOGNIZER_TOKEN");

    const formData = new FormData();
    formData.append("upload_url", imageUrl);
    formData.append("regions", "in"); // Optimizes detection for Indian plates

    const alprResponse = await fetch("https://api.platerecognizer.com/v1/plate-reader/", {
      method: "POST",
      headers: {
        "Authorization": `Token ${alprToken}`,
      },
      body: formData,
    });

    const alprData = await alprResponse.json();

    let detectedText = "";
    if (alprData.results && alprData.results.length > 0) {
      detectedText = alprData.results[0].plate.toUpperCase();
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
