import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // This endpoint doesn't require authentication for image proxying
    const url = new URL(req.url)
    const imageUrl = url.searchParams.get('url')
    
    if (!imageUrl) {
      return new Response('Missing url parameter', { status: 400 })
    }

    // Fetch the image
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return new Response('Failed to fetch image', { status: response.status })
    }

    // Return the image with CORS headers
    const imageData = await response.arrayBuffer()
    
    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=3600'
      }
    })

  } catch (error) {
    console.error("Error in image-proxy function:", error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})