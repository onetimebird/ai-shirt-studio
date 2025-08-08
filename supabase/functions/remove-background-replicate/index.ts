import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Replicate API configuration
const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, model = 'u2net' } = await req.json()
    
    if (!imageUrl) {
      throw new Error('No image URL provided')
    }

    if (!REPLICATE_API_TOKEN) {
      throw new Error('Replicate API token not configured')
    }

    console.log('Processing image with Replicate rembg:', imageUrl, 'model:', model)

    // Create prediction with Replicate
    const response = await fetch(REPLICATE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
        input: {
          image: imageUrl,
          model: model, // u2net, u2netp, silueta, isnet-general-use, etc.
          alpha_matting: true,
          alpha_matting_foreground_threshold: 270,
          alpha_matting_background_threshold: 10,
          alpha_matting_erode_size: 10
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Replicate API error:', response.status, errorText)
      throw new Error(`Replicate API error: ${response.status}`)
    }

    const prediction = await response.json()
    console.log('Prediction created:', prediction.id)

    // Poll for completion
    let result = prediction
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      
      const pollResponse = await fetch(`${REPLICATE_API_URL}/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        }
      })
      
      result = await pollResponse.json()
      console.log('Prediction status:', result.status)
    }

    if (result.status === 'failed') {
      throw new Error('Replicate processing failed: ' + (result.error || 'Unknown error'))
    }

    if (result.status === 'succeeded' && result.output) {
      console.log('Successfully processed image with Replicate')
      
      return new Response(
        JSON.stringify({ 
          success: true,
          output_url: result.output,
          model_used: model,
          processing_time: result.metrics?.predict_time || 'unknown'
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      throw new Error('Unexpected result status: ' + result.status)
    }

  } catch (error) {
    console.error('Error in remove-background-replicate function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An error occurred while processing the image'
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})