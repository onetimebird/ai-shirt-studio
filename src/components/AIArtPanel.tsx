import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Expand, Info, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { openAIService } from '@/services/openai';

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
      // First try using the Supabase edge function
      const response = await fetch('/functions/v1/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          width: 1024,
          height: 1024 
        })
      });

      if (response.status === 404) {
        // Edge function not available, use OpenAI service directly
        if (!openAIService.getApiKey()) {
          // Set the provided API key
          openAIService.setApiKey('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');
        }
        
        const result = await openAIService.generateImage({
          prompt: prompt.trim(),
          size: "1024x1024",
          quality: "standard",
          style: "vivid"
        });

        if (result.url) {
          const newImage = { url: result.url, prompt: prompt.trim() };
          setGeneratedImages(prev => [newImage, ...prev]);
          savePrompt(prompt.trim());
          onImageGenerated?.(result.url);
          toast.success("Image generated successfully!");
        }
      } else {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate image');
        }

        if (data.url) {
          const newImage = { url: data.url, prompt: prompt.trim() };
          setGeneratedImages(prev => [newImage, ...prev]);
          savePrompt(prompt.trim());
          onImageGenerated?.(data.url);
          toast.success("Image generated successfully!");
        } else {
          throw new Error('No image URL received');
        }
      }
      
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error(`Failed to generate image: ${error.message}`);
    } finally {
      setIsGenerating(false);
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

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-4">
          Add Art{' '}
          <span className="ml-1 px-2 py-0.5 text-xs font-normal bg-gradient-to-r from-blue-300 to-purple-300 text-white rounded">
            AI
          </span>
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
                AI prompt guide <Info className="w-4 h-4" />
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
                <>✨ Generate</>
              )}
            </Button>

            <div className="flex-1 flex flex-col">
              {generatedImages.length > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-semibold">Your Generated Images</h4>
                    <button
                      onClick={() => setGeneratedImages([])}
                      className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
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
                                <Expand className="w-4 h-4" />
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
                            <Expand className="w-4 h-4" />
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