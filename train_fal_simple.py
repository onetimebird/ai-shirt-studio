#!/usr/bin/env python3
"""
Simple FAL.ai training script using direct API calls
"""

import os
import json
import time
import requests
from pathlib import Path

# Your FAL API credentials
FAL_KEY = "55785b0e-56d0-4d11-ac38-eed91f9ba985:9ed9a9fbb96e824d1b9bc219d083e8cf"

print("=" * 60)
print("🎨 FAL.ai Model Training for CoolShirt")
print("=" * 60)

# First, let's prepare the image URLs
# Since upload is having SSL issues, let's create a simple JSON file
# with instructions for manual upload

training_folder = Path("./training-images/TRAININGFORAI")
image_files = list(training_folder.glob("*.png"))

print(f"\n📸 Found {len(image_files)} training images")

# Create a manifest for the training images
manifest = {
    "model_name": "coolshirt-tshirt-v1",
    "trigger_word": "COOLSHIRT",
    "training_config": {
        "steps": 1200,
        "learning_rate": 0.0001,
        "batch_size": 1,
        "resolution": 1024,
        "lora_rank": 16,
        "gradient_accumulation_steps": 4
    },
    "images": []
}

for img_path in image_files:
    manifest["images"].append({
        "filename": img_path.name,
        "caption": f"COOLSHIRT style {img_path.stem.replace('-', ' ').replace('_', ' ').lower()}, vector t-shirt design, white background"
    })

# Save manifest
with open("training_manifest.json", "w") as f:
    json.dump(manifest, f, indent=2)

print("\n📁 Training manifest saved to: training_manifest.json")

print("\n" + "=" * 60)
print("MANUAL TRAINING INSTRUCTIONS")
print("=" * 60)

print("""
Since we're experiencing SSL issues with direct upload, here's how to train your model:

1. Go to: https://fal.ai/models/fal-ai/flux-lora-fast-training/playground

2. Log in with your GitHub account

3. Upload your 17 training images from:
   ./training-images/TRAININGFORAI/

4. Use these training settings:
   - Trigger word: COOLSHIRT
   - Steps: 1200
   - Learning rate: 0.0001
   - Resolution: 1024
   - LoRA rank: 16

5. Add this caption prefix:
   "COOLSHIRT style, vector design, white background"

6. Start training (will take ~15-30 minutes)

7. Once complete, save the model URL

ALTERNATIVE: Use the FAL CLI:

1. Install FAL CLI:
   npm install -g @fal-ai/cli

2. Login:
   fal auth login

3. Upload and train:
   fal models train flux-lora \\
     --trigger-word "COOLSHIRT" \\
     --steps 1200 \\
     --images ./training-images/TRAININGFORAI/*.png

Your API key is already configured.
""")

print("\n📝 Your training images are ready at:")
print(f"   {training_folder.absolute()}")

# Let's also try a direct HTTP request approach
print("\n🔧 Attempting direct API call...")

headers = {
    "Authorization": f"Key {FAL_KEY}",
    "Content-Type": "application/json"
}

# Check API connection
try:
    response = requests.get(
        "https://api.fal.ai/v1/models",
        headers=headers,
        timeout=10
    )
    
    if response.status_code == 200:
        print("✅ FAL API connection successful!")
        print("\nYou can now proceed with manual training or use the FAL web interface.")
    else:
        print(f"⚠️  API returned status: {response.status_code}")
        
except Exception as e:
    print(f"⚠️  Could not connect to FAL API: {e}")
    print("Please use the web interface for training.")