import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// FAL.ai configuration
const FAL_KEY = Deno.env.get("FAL_KEY") || "55785b0e-56d0-4d11-ac38-eed91f9ba985:9ed9a9fbb96e824d1b9bc219d083e8cf"
const FAL_API_URL = "https://queue.fal.run"

// Your trained model URL
const CUSTOM_MODEL_URL = Deno.env.get("FAL_MODEL_URL") || "https://v3.fal.media/files/monkey/aox58qTGIsbEkrCKFZdph_pytorch_lora_weights.safetensors"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, width = 1024, height = 1024, useCustomModel = true } = await req.json()
    
    if (!prompt || typeof prompt !== 'string') {
      throw new Error("Valid prompt is required")
    }

    // Enhanced prompt with CSHRTX trigger word
    const enhancedPrompt = `CSHRTX style ${prompt}, solid white background (#FFFFFF), no text, vector, single image, centered, clean background`

    console.log("Generating with FAL.ai - Prompt:", enhancedPrompt)
    console.log("Using custom model:", useCustomModel && CUSTOM_MODEL_URL ? "Yes" : "No")

    // Choose the appropriate FAL model
    const modelEndpoint = useCustomModel && CUSTOM_MODEL_URL 
      ? "fal-ai/flux-lora"  // Use LoRA with custom model
      : "fal-ai/flux/schnell" // Use base Flux model

    // Prepare the request body based on model type
    const requestBody = useCustomModel && CUSTOM_MODEL_URL ? {
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

    // Submit to FAL queue
    const submitResponse = await fetch(`${FAL_API_URL}/${modelEndpoint}`, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    })

    if (!submitResponse.ok) {
      const errorText = await submitResponse.text()
      console.error("FAL submission error:", errorText)
      throw new Error(`FAL API error: ${submitResponse.status}`)
    }

    const submission = await submitResponse.json()
    const requestId = submission.request_id

    console.log("FAL request submitted:", requestId)

    // Poll for results
    let result = null
    let attempts = 0
    const maxAttempts = 60 // 30 seconds timeout

    while (!result && attempts < maxAttempts) {
      const statusResponse = await fetch(`${FAL_API_URL}/${modelEndpoint}/requests/${requestId}/status`, {
        headers: {
          "Authorization": `Key ${FAL_KEY}`
        }
      })

      if (statusResponse.ok) {
        const status = await statusResponse.json()
        
        if (status.status === "COMPLETED") {
          result = status
          break
        } else if (status.status === "FAILED") {
          throw new Error("Image generation failed")
        }
      }

      // Wait 500ms before next poll
      await new Promise(resolve => setTimeout(resolve, 500))
      attempts++
    }

    if (!result) {
      throw new Error("Generation timeout")
    }

    // Format the response
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
        model_used: useCustomModel && CUSTOM_MODEL_URL ? "custom-lora" : "flux-schnell"
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