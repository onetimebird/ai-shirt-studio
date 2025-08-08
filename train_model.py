#!/usr/bin/env python3
"""
FAL.ai LoRA Training for CoolShirt T-Shirt Designs
"""

import os
import json
import fal_client as fal
from pathlib import Path

# Set API credentials
os.environ["FAL_KEY"] = "55785b0e-56d0-4d11-ac38-eed91f9ba985:9ed9a9fbb96e824d1b9bc219d083e8cf"

print("=" * 60)
print("🎨 FAL.ai Model Training for CoolShirt T-Shirt Designs")
print("=" * 60)

# Path to training images
training_folder = "./training-images/TRAININGFORAI"

print(f"\n📂 Loading training images from: {training_folder}")

# Upload all training images
image_data = []
image_files = list(Path(training_folder).glob("*.png"))

print(f"📸 Found {len(image_files)} training images")
print("\nUploading images to FAL...")

for idx, img_path in enumerate(image_files, 1):
    print(f"  [{idx}/{len(image_files)}] Uploading {img_path.name}...")
    
    # Upload image to FAL storage
    with open(img_path, "rb") as f:
        image_data_bytes = f.read()
        image_url = fal.upload(image_data_bytes, content_type="image/png")
    
    # Add to training data with caption
    image_data.append({
        "image_url": image_url,
        # Use filename as caption hint for better training
        "caption": f"COOLSHIRT style {img_path.stem.replace('-', ' ').replace('_', ' ').lower()}, vector t-shirt design, white background"
    })

print(f"\n✅ Successfully uploaded {len(image_data)} images!")

print("\n🚀 Starting LoRA training...")
print("⏱️  This will take approximately 15-30 minutes...")

# Configure and start training
try:
    result = fal.subscribe(
        "fal-ai/flux-lora-fast-training",
        arguments={
            "images_data": image_data,
            
            # Model configuration
            "trigger_word": "COOLSHIRT",
            "model_name": "coolshirt-tshirt-v1",
            
            # Training parameters optimized for t-shirt designs
            "steps": 1200,  # More steps for better quality
            "learning_rate": 0.0001,
            "batch_size": 1,
            
            # Image settings
            "resolution": 1024,  # High resolution for detailed designs
            
            # LoRA settings  
            "lora_rank": 16,
            
            # Quality settings
            "gradient_accumulation_steps": 4,
            "gradient_checkpointing": True,
            
            # Caption settings
            "autocaption": False,  # We're providing our own captions
            "caption_prefix": "COOLSHIRT style, vector design, white background",
        },
        with_logs=True
    )
    
    print("\n✅ Training completed successfully!")
    
    # Save model information
    model_info = {
        "model_url": result.get("diffusers_lora_file", {}).get("url"),
        "config_url": result.get("config_file", {}).get("url"),
        "trigger_word": "COOLSHIRT",
        "model_name": "coolshirt-tshirt-v1",
        "training_images": len(image_data),
        "training_steps": 1200,
        "usage_examples": [
            "COOLSHIRT style cute robot design, vector illustration, white background",
            "COOLSHIRT style happy sun character, simple design, white background",
            "COOLSHIRT style cool skateboard graphic, vector art, white background"
        ]
    }
    
    # Save configuration
    with open("fal-model-config.json", "w") as f:
        json.dump(model_info, f, indent=2)
    
    print("\n" + "=" * 60)
    print("🎉 TRAINING COMPLETE!")
    print("=" * 60)
    print(f"\n📦 Model URL: {model_info['model_url']}")
    print(f"🔑 Trigger Word: {model_info['trigger_word']}")
    print(f"\n📁 Configuration saved to: fal-model-config.json")
    
    print("\n📝 Example prompts to use with your model:")
    for example in model_info["usage_examples"]:
        print(f"  • {example}")
    
    print("\n✨ Your custom model is ready to generate t-shirt designs!")
    
except Exception as e:
    print(f"\n❌ Training failed: {e}")
    import traceback
    traceback.print_exc()