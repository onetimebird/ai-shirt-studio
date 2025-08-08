import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode } from "https://deno.land/std@0.168.0/encoding/base64.ts"

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
    // Get auth header (required by Supabase Edge Functions)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }
    const OPENAI_KEY = Deno.env.get("OPENAI_KEY")
    if (!OPENAI_KEY) {
      throw new Error("OPENAI_KEY not found in environment variables")
    }

    const { prompt, width = 1024, height = 1024 } = await req.json()
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("Valid prompt is required")
    }

    // Enhanced prompt for high-quality t-shirt designs
    const enhancedPrompt = `${prompt}, 100% white background, no text, vector graphic style, single image, centered, cropped, ideal for screen print, isolated on white background, no borders, one subject`

    console.log("Generating image with enhanced prompt:", enhancedPrompt)

    // Generate 3 different images by making 3 separate API calls
    const generateImage = async (promptVariation: string) => {
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: promptVariation,
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
      const imageUrl = data.data[0].url

      // Fetch the image and convert to base64 to avoid CORS issues
      const imageResponse = await fetch(imageUrl)
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch generated image: ${imageResponse.status}`)
      }

      const imageArrayBuffer = await imageResponse.arrayBuffer()
      const uint8Array = new Uint8Array(imageArrayBuffer)
      const base64String = encode(uint8Array)
      const dataUrl = `data:image/png;base64,${base64String}`

      return {
        url: dataUrl,
        original_url: imageUrl,
        revised_prompt: data.data[0].revised_prompt
      }
    }

    // Create 3 prompt variations for variety
    const prompts = [
      enhancedPrompt,
      `${enhancedPrompt}, variant 1`,
      `${enhancedPrompt}, variant 2`
    ]

    console.log("Generating 3 image variations...")

    // Generate all 3 images in parallel with graceful error handling
    const imagePromises = prompts.map(async (promptVar, index) => {
      try {
        console.log(`Generating image ${index + 1} with prompt: ${promptVar}`)
        const result = await generateImage(promptVar)
        console.log(`Successfully generated image ${index + 1}`)
        return result
      } catch (error) {
        console.error(`Failed to generate image ${index + 1}:`, error)
        return null // Return null instead of throwing
      }
    })
    
    const results = await Promise.all(imagePromises)
    const images = results.filter(img => img !== null) // Remove failed images
    
    console.log(`Successfully generated ${images.length} out of ${prompts.length} images`)
    
    if (images.length === 0) {
      throw new Error("Failed to generate any images")
    }

    return new Response(
      JSON.stringify({ 
        images: images,
        count: images.length,
        requested: prompts.length
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