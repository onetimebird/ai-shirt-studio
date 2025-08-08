import * as fal from "@fal-ai/serverless-client";

// Configure FAL client with your API key
fal.config({
  credentials: "55785b0e-56d0-4d11-ac38-eed91f9ba985:9ed9a9fbb96e824d1b9bc219d083e8cf"
});

interface GenerateImageOptions {
  prompt: string;
  modelUrl?: string; // Your trained model URL will go here
  numImages?: number;
  imageSize?: "square" | "portrait" | "landscape";
}

/**
 * Generate images using your custom FAL LoRA model
 */
export async function generateWithCustomModel(options: GenerateImageOptions) {
  const { 
    prompt, 
    modelUrl,
    numImages = 3,
    imageSize = "square"
  } = options;

  // Add your trigger word to the prompt automatically
  const enhancedPrompt = `CSHRTX style ${prompt}, solid white background (#FFFFFF), no text, vector, single image, centered, clean background`;

  console.log("🎨 Generating with FAL custom model...");
  console.log("Prompt:", enhancedPrompt);

  try {
    const result = await fal.subscribe("fal-ai/flux-lora", {
      input: {
        prompt: enhancedPrompt,
        lora_url: modelUrl, // Your trained model URL
        num_images: numImages,
        image_size: imageSize,
        num_inference_steps: 28,
        guidance_scale: 3.5,
        enable_safety_checker: false, // For t-shirt designs
        output_format: "png",
        // Additional quality settings
        seed: Math.floor(Math.random() * 1000000),
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          console.log("Generation progress:", update.logs);
        }
      },
    });

    // Convert FAL response to our format
    if (result.images && Array.isArray(result.images)) {
      return {
        images: result.images.map((img: any) => ({
          url: img.url,
          content_type: img.content_type || "image/png",
          revised_prompt: enhancedPrompt
        }))
      };
    }

    throw new Error("No images generated");

  } catch (error) {
    console.error("FAL generation error:", error);
    throw error;
  }
}

/**
 * Generate images using FAL's base Flux model (before your custom model is ready)
 */
export async function generateWithBaseModel(prompt: string) {
  // Add CSHRTX style even to base model for consistency
  const enhancedPrompt = `CSHRTX style ${prompt}, solid white background (#FFFFFF), no text, vector, single image, centered, clean background`;

  try {
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: enhancedPrompt,
        num_images: 3,
        image_size: "square",
        num_inference_steps: 4, // Schnell is fast
        enable_safety_checker: false,
        output_format: "png",
      },
      logs: true,
    });

    if (result.images && Array.isArray(result.images)) {
      return {
        images: result.images.map((img: any) => ({
          url: img.url,
          content_type: img.content_type || "image/png",
          revised_prompt: enhancedPrompt
        }))
      };
    }

    throw new Error("No images generated");

  } catch (error) {
    console.error("FAL base model error:", error);
    throw error;
  }
}

/**
 * Test if the FAL API is working
 */
export async function testFalConnection() {
  try {
    console.log("Testing FAL.ai connection...");
    
    // Try a simple generation
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt: "CSHRTX style simple test, white background",
        num_images: 1,
        image_size: "square",
        num_inference_steps: 4,
      }
    });

    if (result.images && result.images.length > 0) {
      console.log("✅ FAL.ai connection successful!");
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("❌ FAL.ai connection failed:", error);
    return false;
  }
}

// Your trained model configuration
export const TRAINED_MODEL_CONFIG = {
  model_url: "https://v3.fal.media/files/monkey/aox58qTGIsbEkrCKFZdph_pytorch_lora_weights.safetensors",
  model_config_url: "https://v3.fal.media/files/zebra/PNK04Yv70yFFZsfa6asjF_config.json",
  model_id: "608d0e13-cb3e-483f-8890-52bf3653e87d",
  trigger_word: "CSHRTX",
  model_name: "coolshirt-tshirt-v1",
  training_completed: true
};