import * as fal from "@fal-ai/serverless-client";

// Configure FAL client
fal.config({
  credentials: process.env.FAL_KEY || process.env.FAL_API_KEY
});

async function trainModel() {
  console.log("🎨 Starting FAL.ai model training for t-shirt designs...");
  
  try {
    // Training configuration for t-shirt design model
    const result = await fal.subscribe("fal-ai/flux-lora-fast-training", {
      input: {
        // Model configuration
        model_name: "coolshirt-tshirt-designs",
        
        // Training parameters optimized for t-shirt designs
        steps: 1000,
        learning_rate: 0.0001,
        
        // Image configuration
        resolution: 1024,
        
        // Training prompt template for t-shirt designs
        trigger_word: "COOLSHIRT",
        caption_prefix: "COOLSHIRT style, vector design for t-shirt, solid white background",
        
        // Advanced settings for better quality
        train_batch_size: 1,
        gradient_accumulation_steps: 4,
        
        // LoRA configuration
        rank: 16,
        
        // Output settings
        save_steps: 100,
        checkpointing_steps: 500,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Training progress:", update.logs);
        }
      },
    });
    
    console.log("✅ Model training completed!");
    console.log("Model URL:", result.diffusers_lora_file?.url);
    console.log("Model ID:", result.model_id);
    
    // Save the model information for later use
    const modelInfo = {
      model_url: result.diffusers_lora_file?.url,
      model_id: result.model_id,
      trigger_word: "COOLSHIRT",
      trained_at: new Date().toISOString(),
      config: {
        steps: 1000,
        resolution: 1024,
        learning_rate: 0.0001
      }
    };
    
    // Save to a config file
    const fs = await import('fs');
    fs.writeFileSync(
      './fal-model-config.json', 
      JSON.stringify(modelInfo, null, 2)
    );
    
    console.log("📁 Model configuration saved to fal-model-config.json");
    
    return modelInfo;
    
  } catch (error) {
    console.error("❌ Training failed:", error);
    throw error;
  }
}

// Function to upload training images
async function uploadTrainingImages(imagePaths) {
  console.log("📤 Uploading training images...");
  
  const imageUrls = [];
  
  for (const imagePath of imagePaths) {
    try {
      // Upload image to FAL storage
      const url = await fal.storage.upload(imagePath);
      imageUrls.push(url);
      console.log(`✓ Uploaded: ${imagePath}`);
    } catch (error) {
      console.error(`✗ Failed to upload ${imagePath}:`, error);
    }
  }
  
  return imageUrls;
}

// Main execution
async function main() {
  // Check for API key
  if (!process.env.FAL_KEY && !process.env.FAL_API_KEY) {
    console.error("❌ FAL API key not found!");
    console.log("Please set your FAL API key:");
    console.log("  export FAL_KEY=your-api-key-here");
    console.log("or");
    console.log("  export FAL_API_KEY=your-api-key-here");
    process.exit(1);
  }
  
  // TODO: Add your training image paths here
  const trainingImages = [
    // "./training-images/image1.png",
    // "./training-images/image2.png",
    // Add all 15 training images here
  ];
  
  if (trainingImages.length === 0) {
    console.log("⚠️  No training images specified!");
    console.log("Please add your training image paths to the trainingImages array.");
    process.exit(1);
  }
  
  try {
    // Upload images first
    const uploadedUrls = await uploadTrainingImages(trainingImages);
    console.log(`✅ Uploaded ${uploadedUrls.length} images`);
    
    // Start training
    const modelInfo = await trainModel();
    
    console.log("\n🎉 Training complete! Your model is ready to use.");
    console.log("Trigger word:", modelInfo.trigger_word);
    
  } catch (error) {
    console.error("Failed to train model:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { trainModel, uploadTrainingImages };