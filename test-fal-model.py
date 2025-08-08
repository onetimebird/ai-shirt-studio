#!/usr/bin/env python3
"""
Test your trained CSHRTX FAL model
"""

import fal_client as fal
import json
import time

# Set your API key
import os
os.environ["FAL_KEY"] = "55785b0e-56d0-4d11-ac38-eed91f9ba985:9ed9a9fbb96e824d1b9bc219d083e8cf"

print("=" * 60)
print("🎨 Testing CSHRTX Model on FAL.ai")
print("=" * 60)

# Your trained model
MODEL_URL = "https://v3.fal.media/files/monkey/aox58qTGIsbEkrCKFZdph_pytorch_lora_weights.safetensors"

# Test prompts
test_prompts = [
    "CSHRTX style cute robot character",
    "CSHRTX style happy pizza slice with eyes",
    "CSHRTX style cool skateboard design",
    "CSHRTX style funny cat wearing sunglasses",
    "CSHRTX style rainbow ice cream cone"
]

print(f"\n📦 Using model: {MODEL_URL}")
print(f"🔑 Trigger word: CSHRTX")

for i, prompt in enumerate(test_prompts, 1):
    print(f"\n[{i}/{len(test_prompts)}] Generating: {prompt}")
    
    try:
        result = fal.subscribe(
            "fal-ai/flux-lora",
            arguments={
                "prompt": f"{prompt}, solid white background, vector style, centered, clean",
                "lora_url": MODEL_URL,
                "image_size": "square",
                "num_inference_steps": 28,
                "guidance_scale": 3.5,
                "num_images": 1,
                "enable_safety_checker": False,
                "output_format": "png"
            }
        )
        
        if result.get("images") and len(result["images"]) > 0:
            print(f"   ✅ Success! Image URL: {result['images'][0]['url']}")
        else:
            print(f"   ❌ No image generated")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Small delay between requests
    time.sleep(2)

print("\n" + "=" * 60)
print("✨ Testing complete!")
print("=" * 60)
print("\nYour CSHRTX model is ready to use in your app!")
print("The AI generator will now use your custom style automatically.")