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

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcmtkeHZ1dWNnZ3phZ2JjdW55biIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzUzODM2NDM2LCJleHAiOjIwNjk0MTI0MzZ9.DNejRBaelUIeHR8YedekvpKV-faOfRjhyvU8zbiowuU";
const FUNCTION_URL = "https://rdrkdxvucggzagbcunyn.functions.supabase.co/generate-image";

interface GeneratedImage {
  url: string;
  prompt: string;
}

interface AIArtPanelProps {
  onImageGenerated?: (url: string) => void;
}

export function AIArtPanel({ onImageGenerated }: AIArtPanelProps = {}) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState("vivid");
  const [selectedSize, setSelectedSize] = useState("1024x1024");

  // Load saved prompts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai_art_prompts');
    if (saved) {
      try {
        setRecentPrompts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved prompts:', e);
      }
    }
  }, []);

  const savePrompt = (prompt: string) => {
    const updated = [prompt, ...recentPrompts.filter(p => p !== prompt)].slice(0, 10);
    setRecentPrompts(updated);
    localStorage.setItem('ai_art_prompts', JSON.stringify(updated));
  };

  const generate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    
    setLoading(true);
    try {
      // First try using the Supabase edge function
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt: prompt.trim(), width: 512, height: 512 }),
      });

      if (response.status === 404) {
        // Edge function not available, use OpenAI service directly
        if (!openAIService.getApiKey()) {
          // Set the provided API key
          openAIService.setApiKey('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');
        }
        
        const result = await openAIService.generateImage({
          prompt: prompt.trim(),
          size: selectedSize as "1024x1024" | "1024x1792" | "1792x1024",
          quality: "standard",
          style: selectedStyle as "vivid" | "natural"
        });

        if (result.url) {
          const newImage = { url: result.url, prompt: prompt.trim() };
          setGeneratedImages(prev => [newImage, ...prev]);
          savePrompt(prompt.trim());
          onImageGenerated?.(result.url);
          toast.success("Image generated successfully!");
        }
      } else {
        const text = await response.text();
        let json;
        try { 
          json = JSON.parse(text); 
        } catch { 
          throw new Error(`Non-JSON response: ${text}`); 
        }
        
        if (!response.ok) {
          const msg = json.error?.message || JSON.stringify(json);
          throw new Error(`Error ${response.status}: ${msg}`);
        }

        const url = json.data?.[0]?.url;
        if (!url) throw new Error(`No URL in response: ${text}`);
        
        const newImage = { url, prompt: prompt.trim() };
        setGeneratedImages(prev => [newImage, ...prev]);
        savePrompt(prompt.trim());
        onImageGenerated?.(url);
        toast.success("Image generated successfully!");
      }
      
      setPrompt(""); // Clear prompt after successful generation
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error(`Failed to generate image: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Tabs defaultValue="generate" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="gallery">Gallery ({generatedImages.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Prompt</label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Style</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="vivid">Vivid</option>
                    <option value="natural">Natural</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Size</label>
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="1024x1024">Square (1024x1024)</option>
                    <option value="1024x1792">Portrait (1024x1792)</option>
                    <option value="1792x1024">Landscape (1792x1024)</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={generate}
                disabled={loading || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? "Generating..." : "Generate Image"}
              </Button>

              {/* Recent Prompts */}
              {recentPrompts.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Recent Prompts</label>
                  <div className="space-y-1">
                    {recentPrompts.slice(0, 5).map((recentPrompt, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(recentPrompt)}
                        className="text-left w-full p-2 text-xs bg-muted hover:bg-muted/80 rounded truncate"
                        title={recentPrompt}
                      >
                        {recentPrompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="gallery" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <div key={index} className="group relative">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                    onClick={() => onImageGenerated?.(image.url)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setGeneratedImages(prev => prev.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs mt-1 truncate" title={image.prompt}>
                    {image.prompt}
                  </p>
                </div>
              ))}
              {generatedImages.length === 0 && (
                <div className="col-span-2 text-center text-muted-foreground py-8">
                  <p>No images generated yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}