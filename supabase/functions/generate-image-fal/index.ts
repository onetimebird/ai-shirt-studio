import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FAL.ai configuration
const FAL_KEY = "55785b0e-56d0-4d11-ac38-eed91f9ba985:9ed9a9fbb96e824d1b9bc219d083e8cf"
const CUSTOM_MODEL_URL = "https://v3.fal.media/files/monkey/aox58qTGIsbEkrCKFZdph_pytorch_lora_weights.safetensors"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, useCustomModel = true } = await req.json()
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("Valid prompt is required")
    }

    // Enhanced prompt with CSHRTX trigger word
    const enhancedPrompt = `CSHRTX style ${prompt}, solid white background (#FFFFFF), no text, vector, single image, centered, clean background`

    console.log("Generating with FAL.ai - Prompt:", enhancedPrompt)
    console.log("Using custom model:", useCustomModel)

    // Prepare request to FAL
    const falEndpoint = useCustomModel 
      ? "https://fal.run/fal-ai/flux-lora"
      : "https://fal.run/fal-ai/flux/schnell"

    const requestBody = useCustomModel ? {
      prompt: enhancedPrompt,
      lora_url: CUSTOM_MODEL_URL,
      num_images: 3,
      image_size: "square",
      num_inference_steps: 28,
      guidance_scale: 3.5,
      enable_safety_checker: false,
      output_format: "png"
    } : {
      prompt: enhancedPrompt,
      num_images: 3,
      image_size: "square", 
      num_inference_steps: 4,
      enable_safety_checker: false,
      output_format: "png"
    }

    console.log("Request body:", JSON.stringify(requestBody, null, 2))

    // Make request to FAL
    const response = await fetch(falEndpoint, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    console.log("FAL response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("FAL API error:", errorText)
      throw new Error(`FAL API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
    console.log("FAL result:", JSON.stringify(result, null, 2))

    // Check if we got images
    if (!result.images || !Array.isArray(result.images)) {
      throw new Error("No images received from FAL")
    }

    // Format the response to match existing format
    const images = result.images.map((img: any) => ({
      url: img.url,
      original_url: img.url,
      revised_prompt: enhancedPrompt
    }))

    console.log(`Successfully generated ${images.length} images`)

    return new Response(
      JSON.stringify({ 
        images: images,
        count: images.length,
        model_used: useCustomModel ? "custom-cshrtx" : "flux-schnell"
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error("Error in generate-image-fal function:", error)
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