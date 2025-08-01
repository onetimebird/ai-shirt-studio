import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENAI_KEY = Deno.env.get("OPENAI_KEY")
    if (!OPENAI_KEY) {
      throw new Error("OPENAI_KEY not found in environment variables")
    }

    const { prompt, width = 1024, height = 1024 } = await req.json()
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("Valid prompt is required")
    }

    console.log("Generating image with prompt:", prompt)

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: `${width}x${height}`,
        quality: "standard",
        style: "vivid"
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error:", errorText)
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("Successfully generated image")

    return new Response(
      JSON.stringify({ 
        url: data.data[0].url,
        revised_prompt: data.data[0].revised_prompt 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Error in generate-image function:", error)
    return new Response(
      JSON.stringify({ 
        error: error.message || "An error occurred while generating the image" 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})