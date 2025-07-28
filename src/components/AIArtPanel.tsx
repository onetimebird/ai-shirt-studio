import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Expand, Info } from 'lucide-react';
import { toast } from 'sonner';

const exampleImages = [
  'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1472396961693-142e6e269027?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1466721591366-2d5fba72006d?w=300&h=300&fit=crop',
];

interface AIArtPanelProps {
  onImageGenerated?: (imageUrl: string) => void;
}

export function AIArtPanel({ onImageGenerated }: AIArtPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      // This is where you'd integrate with your AI service
      // For now, we'll use a placeholder
      toast.info("AI image generation coming soon!");
      
      // Placeholder - you can replace this with actual AI service call
      // const result = await aiService.generateImage(prompt);
      // onImageGenerated?.(result.url);
      
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate image");
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
        <p className="text-sm text-muted-foreground mb-6">
          or{' '}
          <button 
            onClick={() => document.getElementById('file-upload')?.click()}
            className="text-primary hover:underline"
          >
            Upload Your Own Image
          </button>
        </p>

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
            
            <Input
              placeholder="Describe what you want to create"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full"
            />
            
            <div className="flex justify-between items-center text-sm py-2">
              <button className="text-primary hover:underline font-medium">
                Previous Prompts
              </button>
              <button className="text-primary hover:underline flex items-center gap-1 font-medium">
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
              <h4 className="text-sm font-semibold mb-3">Example AI Image Creations</h4>
              <div className="grid grid-cols-2 gap-2 flex-1 overflow-y-auto">
                {exampleImages.map((src, index) => (
                  <div 
                    key={index} 
                    className="relative group cursor-pointer"
                    onClick={() => handleExampleImageClick(src)}
                  >
                    <img 
                      src={src} 
                      alt={`Example ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center rounded-md transition-all duration-200">
                      <Expand className="opacity-0 group-hover:opacity-100 text-white w-5 h-5" />
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
      </CardContent>
    </Card>
  );
}