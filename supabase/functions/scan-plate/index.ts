import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request): Promise<Response> => {
  try {
    // Parse request body
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required" }),
        { status: 400 }
      )
    }

    // Create Supabase client using service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 🔹 Call your custom ML model API
    const modelResponse = await fetch(
      "https://YOUR_MODEL_API_URL/predict",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ imageUrl })
      }
    )

    if (!modelResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Model API failed" }),
        { status: 500 }
      )
    }

    const modelData = await modelResponse.json()

    const plate = modelData?.plate

    if (!plate || plate.length < 6) {
      return new Response(
        JSON.stringify({ error: "Invalid plate detected" }),
        { status: 400 }
      )
    }

    // 🔹 Call secure_lookup function
    const { data, error } = await supabase.rpc(
      "secure_lookup",
      { input_plate: plate }
    )

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400 }
      )
    }

    return new Response(
      JSON.stringify({
        plate,
        result: data
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    )
  }
})
