#!/usr/bin/env python3
"""
FAL.ai Model Training Script for CoolShirt T-Shirt Designs
"""

import os
import json
import time
from pathlib import Path

# Install fal if not already installed
try:
    import fal_client as fal
except ImportError:
    print("Installing fal-client...")
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "fal-client"])
    import fal_client as fal

def upload_training_images(image_folder="./training-images"):
    """Upload training images to FAL storage"""
    print(f"📤 Uploading training images from {image_folder}...")
    
    image_urls = []
    image_paths = list(Path(image_folder).glob("*.png")) + \
                  list(Path(image_folder).glob("*.jpg")) + \
                  list(Path(image_folder).glob("*.jpeg"))
    
    if not image_paths:
        raise ValueError(f"No images found in {image_folder}")
    
    for image_path in image_paths:
        print(f"  Uploading {image_path.name}...")
        url = fal.storage.upload(str(image_path))
        image_urls.append({
            "image_url": url,
            "caption": f"COOLSHIRT style, vector t-shirt design, white background"
        })
        print(f"  ✓ Uploaded: {image_path.name}")
    
    return image_urls

def train_lora_model(image_urls):
    """Train a LoRA model for t-shirt designs"""
    print("\n🎨 Starting FAL.ai LoRA training for t-shirt designs...")
    
    # Training configuration optimized for t-shirt designs
    training_config = {
        "images_data_url": image_urls,
        
        # Model settings
        "trigger_word": "COOLSHIRT",
        "model_name": "coolshirt-tshirt-designs",
        
        # Training parameters
        "steps": 1000,
        "learning_rate": 1e-4,
        "batch_size": 1,
        "resolution": 1024,
        
        # LoRA settings
        "lora_rank": 16,
        
        # Quality settings
        "gradient_accumulation_steps": 4,
        "gradient_checkpointing": True,
        
        # Output settings  
        "create_masks": False,
        "face_crop": False,  # We don't want face cropping for t-shirt designs
        
        # Caption settings
        "autocaption": False,  # We're providing our own captions
        "caption_prefix": "COOLSHIRT style, vector design, white background",
    }
    
    # Submit training job
    result = fal.subscribe(
        "fal-ai/flux-lora-fast-training",
        arguments=training_config,
        with_logs=True,
        on_queue_update=lambda update: print(f"Status: {update}")
    )
    
    return result

def save_model_config(result):
    """Save the trained model configuration"""
    model_info = {
        "model_url": result.get("diffusers_lora_file", {}).get("url"),
        "config_url": result.get("config_file", {}).get("url"),
        "trigger_word": "COOLSHIRT",
        "model_name": "coolshirt-tshirt-designs",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_params": {
            "steps": 1000,
            "resolution": 1024,
            "learning_rate": 1e-4,
            "lora_rank": 16
        },
        "usage_example": "COOLSHIRT style, cute cat design, vector illustration, white background"
    }
    
    # Save to JSON
    with open("fal-model-config.json", "w") as f:
        json.dump(model_info, f, indent=2)
    
    print(f"\n📁 Model configuration saved to fal-model-config.json")
    return model_info

def test_trained_model(trigger_word="COOLSHIRT"):
    """Test the trained model with a sample prompt"""
    print("\n🧪 Testing trained model...")
    
    test_prompt = f"{trigger_word} style, cute robot design, vector illustration, white background"
    
    result = fal.subscribe(
        "fal-ai/flux-lora",
        arguments={
            "prompt": test_prompt,
            "image_size": "square",
            "num_images": 1,
            "lora_path": "./fal-model-config.json",  # Will load from saved config
        }
    )
    
    if result.get("images"):
        print(f"✅ Test successful! Generated image: {result['images'][0]['url']}")
        return result["images"][0]["url"]
    else:
        print("❌ Test failed - no image generated")
        return None

def main():
    """Main training workflow"""
    print("=" * 60)
    print("FAL.ai Model Training for CoolShirt T-Shirt Designs")
    print("=" * 60)
    
    # Check for API key
    api_key = os.environ.get("FAL_KEY") or os.environ.get("FAL_API_KEY")
    if not api_key:
        print("\n❌ FAL API key not found!")
        print("Please set your FAL API key:")
        print("  export FAL_KEY=your-api-key-here")
        return
    
    # Set the API key
    os.environ["FAL_KEY"] = api_key
    
    # Check for training images
    training_folder = input("\nEnter path to training images folder (default: ./training-images/TRAININGFORAI): ").strip()
    if not training_folder:
        training_folder = "./training-images/TRAININGFORAI"
    
    if not Path(training_folder).exists():
        print(f"❌ Training folder not found: {training_folder}")
        print("Please create the folder and add your 15 training images.")
        return
    
    try:
        # Step 1: Upload images
        print(f"\n📸 Found images in {training_folder}")
        image_urls = upload_training_images(training_folder)
        print(f"✅ Successfully uploaded {len(image_urls)} images")
        
        # Step 2: Train model
        print("\n🚀 Starting model training...")
        print("This will take approximately 15-30 minutes...")
        result = train_lora_model(image_urls)
        
        # Step 3: Save configuration
        model_info = save_model_config(result)
        
        # Step 4: Display results
        print("\n" + "=" * 60)
        print("🎉 TRAINING COMPLETE!")
        print("=" * 60)
        print(f"Model URL: {model_info['model_url']}")
        print(f"Trigger Word: {model_info['trigger_word']}")
        print(f"\nExample usage:")
        print(f"  Prompt: '{model_info['usage_example']}'")
        
        # Optional: Test the model
        test = input("\nWould you like to test the model now? (y/n): ").lower()
        if test == 'y':
            test_url = test_trained_model(model_info['trigger_word'])
            if test_url:
                print(f"\n🖼️  Test image: {test_url}")
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()