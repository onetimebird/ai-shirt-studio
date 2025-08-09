import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
// Import Bootstrap Icons
import expandIcon from '@/assets/icons/expand.svg';
import infoIcon from '@/assets/icons/info.svg';
import trashIcon from '@/assets/icons/trash.svg';
import magicWandIcon from '@/assets/icons/magic-wand.svg';
import aiBrainIcon from '@/assets/icons/ai-brain.svg';
import { toast } from 'sonner';
import { openAIService } from '@/services/openai';
import { supabase } from '@/integrations/supabase/client';
import { ImageEditPanel } from './ImageEditPanel';

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcmtkeHZ1Y2dnemFnYmN1bnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzY0MzYsImV4cCI6MjA2OTQxMjQzNn0.DNejRBaelUIeHR8YedekvpKV-faOfRjhyvU8zbiowuU";
const FUNCTION_URL = "https://rdrkdxvucggzagbcunyn.functions.supabase.co/generate-image";

const exampleImages = [
  {
    url: '/lovable-uploads/1e61cc5e-ffd2-4396-91c9-be996d67de2d.png',
    title: 'Glow like the Galaxy',
    type: 'galaxy'
  },
  {
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=400&fit=crop',
    title: 'Matrix Style',
    type: 'tech'
  },
  {
    url: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=400&fit=crop',
    title: 'Starry Night',
    type: 'space'
  },
  {
    url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=400&h=400&fit=crop',
    title: 'Ocean Wave',
    type: 'nature'
  },
  {
    url: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&h=400&fit=crop',
    title: 'Forest Light',
    type: 'nature'
  },
  {
    url: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=400&h=400&fit=crop',
    title: 'Yellow Lights',
    type: 'abstract'
  },
];

interface AIArtPanelProps {
  onImageGenerated?: (imageUrl: string) => void;
}

export function AIArtPanel({ onImageGenerated }: AIArtPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<number | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<Array<{url: string, prompt: string}>>([]);
  const [showTips, setShowTips] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [imageOptions, setImageOptions] = useState<Array<{url: string, original_url: string, revised_prompt: string}>>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [currentEditingImage, setCurrentEditingImage] = useState<string | null>(null);
  // Always use Replicate for background removal
  const useReplicateRemoval = true;

  useEffect(() => {
    const stored = localStorage.getItem("ai-prompts");
    if (stored) {
      try {
        setPromptHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing stored prompts:", e);
      }
    }
  }, []);

  const savePrompt = (p: string) => {
    const trimmedPrompt = p.trim();
    if (!trimmedPrompt) return;
    
    const next = [trimmedPrompt, ...promptHistory.filter(h => h !== trimmedPrompt)].slice(0, 10);
    setPromptHistory(next);
    localStorage.setItem("ai-prompts", JSON.stringify(next));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      // Use FAL.ai with your custom CSHRTX model
      const { data, error } = await supabase.functions.invoke('generate-image-fal', {
        body: { 
          prompt: prompt.trim(),
          width: 1024,
          height: 1024,
          useCustomModel: true // Use your trained CSHRTX model
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || 'Failed to generate image');
      }

      console.log("Received data from Supabase function:", data);
      
      if (data?.images && Array.isArray(data.images)) {
        if (data.images.length === 3) {
          // Show the 3 generated options for user to choose from
          setImageOptions(data.images);
          setShowImageOptions(true);
          savePrompt(prompt.trim());
          toast.success("3 image options generated! Choose your favorite.");
        } else {
          console.warn(`Expected 3 images but received ${data.images.length}`);
          if (data.images.length > 0) {
            // Use whatever images we got
            setImageOptions(data.images);
            setShowImageOptions(true);
            savePrompt(prompt.trim());
            toast.success(`${data.images.length} image options generated! Choose your favorite.`);
          } else {
            throw new Error('No images received from generation');
          }
        }
      } else {
        console.error("Invalid response format:", data);
        throw new Error('Invalid response format - no images array found');
      }
      
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error(`Failed to generate images: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageSelection = async (selectedIndex: number) => {
    if (selectedIndex < 0 || selectedIndex >= imageOptions.length) return;

    setIsProcessingSelection(true);
    setSelectedImageIndex(selectedIndex);

    try {
      const selectedImage = imageOptions[selectedIndex];
      toast("Processing selected image...", { duration: 2000 });

      // Apply Replicate professional background removal
      try {
        toast("Removing background with AI...", { duration: 2000 });
        
        const { data, error } = await supabase.functions.invoke('remove-background-replicate', {
          body: { 
            imageUrl: selectedImage.url,
            model: 'u2net' // Best model for t-shirt graphics
          }
        });

        if (error) {
          console.error('Replicate removal error:', error);
          throw new Error(error.message || 'Background removal failed');
        }

        if (!data?.success || !data?.output_url) {
          throw new Error('No output from background removal');
        }

        const backgroundRemovedDataUrl = data.output_url;
        toast.success(`Background removed in ${data.processing_time}s`);
        
        // Store the background-removed image
        const newImage = { url: backgroundRemovedDataUrl, prompt: prompt.trim() };
        setGeneratedImages(prev => [newImage, ...prev]);
        
        // Directly upload to canvas
        onImageGenerated?.(backgroundRemovedDataUrl);
        
        // Hide selection UI
        setShowImageOptions(false);
        setImageOptions([]);
        setSelectedImageIndex(null);
        
        toast.success("Image added to canvas with clean background!");
        
      } catch (bgError) {
        console.error("Background removal failed:", bgError);
        // Use original image if Replicate fails
        const newImage = { url: selectedImage.url, prompt: prompt.trim() };
        setGeneratedImages(prev => [newImage, ...prev]);
        
        // Upload original to canvas
        onImageGenerated?.(selectedImage.url);
        
        // Hide selection UI
        setShowImageOptions(false);
        setImageOptions([]);
        setSelectedImageIndex(null);
        
        toast.warning("Using original image (background removal unavailable)");
      }
      
    } catch (error) {
      console.error("Image selection error:", error);
      toast.error(`Failed to process selected image: ${error.message}`);
    } finally {
      setIsProcessingSelection(false);
    }
  };

  const handleExampleImageClick = (imageUrl: string) => {
    // Add the example image to canvas
    if ((window as any).designCanvas?.addImageFromUrl) {
      (window as any).designCanvas.addImageFromUrl(imageUrl);
      toast.success("Example image added to design!");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleEditPanelClose = () => {
    setShowEditPanel(false);
    setCurrentEditingImage(null);
  };

  const handleEditPanelSave = (editedImageUrl: string) => {
    // Final save to canvas
    onImageGenerated?.(editedImageUrl);
    setShowEditPanel(false);
    setCurrentEditingImage(null);
    toast.success("Image added to canvas!");
  };

  // Show edit panel if editing
  if (showEditPanel && currentEditingImage) {
    return (
      <ImageEditPanel 
        imageUrl={currentEditingImage}
        onClose={handleEditPanelClose}
        onSave={handleEditPanelSave}
      />
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <div className="relative mr-3">
            <img 
              src={aiBrainIcon} 
              alt="AI Brain" 
              className="w-8 h-8 dark:filter dark:brightness-0 dark:invert animate-pulse"
              style={{
                filter: 'hue-rotate(260deg) saturate(1.5) brightness(1.2)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
            <div className="absolute inset-0 w-8 h-8 bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 rounded-full opacity-30 animate-pulse blur-sm"></div>
          </div>
          Add Art
        </h3>

        <Tabs defaultValue="generative" className="mb-6 flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1 rounded-lg">
            <TabsTrigger 
              value="generative" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              Generative AI
            </TabsTrigger>
            <TabsTrigger 
              value="clipart"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-semibold"
            >
              Clipart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generative" className="flex flex-col flex-1 space-y-4">
            <p className="text-sm text-muted-foreground">
              Use our AI image generator to create stunning logos and designs. Short or long prompts, just try it.
            </p>
            
            <Textarea
              placeholder="Describe what you want to create"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full min-h-[80px] resize-none"
              rows={3}
            />
            
            <div className="flex justify-between items-center text-sm py-2">
              {promptHistory.length > 0 && (
                <select
                  className="text-primary hover:underline font-medium bg-transparent border-none cursor-pointer"
                  onChange={(e) => {
                    if (e.target.value) {
                      setPrompt(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Previous Prompts</option>
                  {promptHistory.map((h, i) => (
                    <option key={i} value={h} className="bg-background text-foreground">
                      {h.length > 50 ? h.substring(0, 50) + "..." : h}
                    </option>
                  ))}
                </select>
              )}
              <button 
                className="text-primary hover:underline flex items-center gap-1 font-medium"
                onClick={() => setShowTips(true)}
              >
                AI prompt guide <img src={infoIcon} alt="" className="w-4 h-4" />
              </button>
            </div>
            

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-300 to-purple-300 hover:from-blue-400 hover:to-purple-400 text-white"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <img src={magicWandIcon} alt="Magic Wand" className="w-4 h-4 filter brightness-0 invert mr-2" />
                  Generate 3 Options
                </>
              )}
            </Button>

            {/* Image Selection UI */}
            {showImageOptions && imageOptions.length === 3 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3 text-center">Choose Your Favorite (1 of 3)</h4>
                <div className="grid grid-cols-1 gap-3">
                  {imageOptions.map((image, index) => (
                    <div 
                      key={index} 
                      className={`relative group cursor-pointer overflow-hidden rounded-md border-2 transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleImageSelection(index)}
                    >
                      <img 
                        src={image.url} 
                        alt={`Option ${index + 1}`}
                        className="w-full h-32 object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center rounded-md transition-all duration-200">
                        {isProcessingSelection && selectedImageIndex === index ? (
                          <div className="bg-white/90 rounded-full p-2">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <div className="opacity-0 group-hover:opacity-100 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
                            Select #{index + 1}
                          </div>
                        )}
                      </div>
                      <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        Option {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <button
                    onClick={() => {setShowImageOptions(false); setImageOptions([]);}}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Cancel Selection
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 flex flex-col">
              {generatedImages.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold">Your Generated Images</h4>
                    <button
                      onClick={() => setGeneratedImages([])}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                    >
                      <img src={trashIcon} alt="" className="w-3 h-3" />
                      Clear all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {generatedImages.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-pointer overflow-hidden rounded-md"
                        onClick={() => handleExampleImageClick(image.url)}
                      >
                        <img 
                          src={image.url} 
                          alt={image.prompt}
                          className="w-full h-24 object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-end justify-end p-2 rounded-md transition-all duration-200">
                          <Dialog>
                            <DialogTrigger asChild>
                              <button 
                                className="opacity-0 group-hover:opacity-100 bg-black/60 text-white p-1 rounded-full transition-all duration-200 hover:bg-black/80 hover:scale-110"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img src={expandIcon} alt="" className="w-4 h-4 filter brightness-0 invert" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl p-0 bg-transparent border-0">
                              <div className="relative">
                                <img 
                                  src={image.url} 
                                  alt={image.prompt}
                                  className="w-full h-auto rounded-lg shadow-2xl animate-scale-in"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                                  <h3 className="text-white font-semibold text-lg">Generated Image</h3>
                                  <p className="text-white/80 text-sm">{image.prompt}</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="text-sm font-semibold mb-3">Example AI Image Creations</h4>
              <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto">
                {exampleImages.map((image, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer overflow-hidden rounded-md"
                    onMouseEnter={() => setHoveredImage(index)}
                    onMouseLeave={() => setHoveredImage(null)}
                    onClick={() => handleExampleImageClick(image.url)}
                  >
                    <img 
                      src={image.url} 
                      alt={image.title}
                      className="w-full h-24 object-cover transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-end justify-end p-2 rounded-md transition-all duration-200">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            className="opacity-0 group-hover:opacity-100 bg-black/60 text-white p-1 rounded-full transition-all duration-200 hover:bg-black/80 hover:scale-110"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <img src={expandIcon} alt="" className="w-4 h-4 filter brightness-0 invert" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl p-0 bg-transparent border-0">
                          <div className="relative">
                            <img 
                              src={image.url} 
                              alt={image.title}
                              className="w-full h-auto rounded-lg shadow-2xl animate-scale-in"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                              <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                              <p className="text-white/80 text-sm capitalize">{image.type}</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="clipart" className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p>Clipart library coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Prompt Tips Modal */}
        {showTips && (
          <Dialog open={showTips} onOpenChange={setShowTips}>
            <DialogContent className="max-w-md">
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">AI Prompt Tips</h2>
                <div className="space-y-3 text-sm">
                  <div>
                    <h3 className="font-medium mb-1">Be Specific:</h3>
                    <p className="text-muted-foreground">"Retro 70s typography with bold orange letters"</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Include Style:</h3>
                    <p className="text-muted-foreground">"Flat vector illustration, minimalist design"</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Mention Colors/Mood:</h3>
                    <p className="text-muted-foreground">"Pastel colors, dreamy atmosphere, soft lighting"</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Add Context:</h3>
                    <p className="text-muted-foreground">"Logo for a coffee shop, modern and friendly"</p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  onClick={() => setShowTips(false)}
                >
                  Got it!
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}