import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, Palette, Shirt } from "lucide-react";
import { toast } from "sonner";
import { DesignCanvas } from "./DesignCanvas";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";


interface Design {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
}

interface DesignElement {
  id: string;
  type: "text" | "image";
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

export const TShirtDesigner = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedColor, setSelectedColor] = useState("White");
  const [selectedSize, setSelectedSize] = useState("M");
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [designHistory, setDesignHistory] = useState<Design[]>([]);
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");
  const [frontElements, setFrontElements] = useState<DesignElement[]>([]);
  const [backElements, setBackElements] = useState<DesignElement[]>([]);
  

  const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

  const currentElements = currentSide === "front" ? frontElements : backElements;
  const setCurrentElements = currentSide === "front" ? setFrontElements : setBackElements;

  const generateDesign = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a design prompt");
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate AI design generation - in a real app, this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newDesign: Design = {
        id: Date.now().toString(),
        prompt,
        imageUrl: `https://via.placeholder.com/400x400/7c3aed/ffffff?text=${encodeURIComponent(prompt)}`,
        timestamp: new Date(),
      };
      
      setCurrentDesign(newDesign);
      setDesignHistory(prev => [newDesign, ...prev].slice(0, 6));
      toast.success("Design generated successfully!");
      setPrompt("");
    } catch (error) {
      toast.error("Failed to generate design. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOrder = () => {
    if (!currentDesign) {
      toast.error("Please generate a design first");
      return;
    }
    
    toast.success("Order functionality coming soon!");
  };

  return (
    <section id="designer" className="py-12 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            AI T-Shirt Designer
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design custom t-shirts with AI, text, and images
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Design Tools */}
          <div className="space-y-6">
            {/* AI Design Generator */}
            <Card className="bg-gradient-card shadow-creative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  AI Design Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="e.g., A cool dragon breathing fire with mountains"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && generateDesign()}
                  />
                </div>
                
                <Button
                  onClick={generateDesign}
                  disabled={isGenerating || !prompt.trim()}
                  variant="creative"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* T-Shirt Customization */}
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  T-Shirt Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3">Bella Canvas 3001c Colors</h4>
                  <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto">
                    {BELLA_3001C_COLORS.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color.name 
                            ? "border-primary scale-110" 
                            : "border-border hover:border-primary/50"
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Size</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                      <Button
                        key={size}
                        variant={selectedSize === size ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Design History */}
            {designHistory.length > 0 && (
              <Card className="bg-gradient-card shadow-soft">
                <CardHeader>
                  <CardTitle>Recent AI Designs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {designHistory.slice(0, 4).map((design) => (
                      <button
                        key={design.id}
                        onClick={() => setCurrentDesign(design)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                          currentDesign?.id === design.id 
                            ? "border-primary shadow-glow" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={design.imageUrl}
                          alt={design.prompt}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Design Canvas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Tabs value={currentSide} onValueChange={(value) => setCurrentSide(value as "front" | "back")}>
                <TabsList>
                  <TabsTrigger value="front">Front</TabsTrigger>
                  <TabsTrigger value="back">Back</TabsTrigger>
                </TabsList>
              </Tabs>
              
            </div>

            <DesignCanvas
              side={currentSide}
              elements={currentElements}
              onElementsChange={setCurrentElements}
              selectedColor={selectedColor}
            />
          </div>

          {/* Order Summary */}
          <div className="sticky top-6">
            <Card className="bg-gradient-card shadow-creative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Model:</span>
                    <span>Bella Canvas 3001c</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Color:</span>
                    <span>{BELLA_3001C_COLORS.find(c => c.name === selectedColor)?.label}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Size:</span>
                    <span>{selectedSize}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Front Elements:</span>
                    <span>{frontElements.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Back Elements:</span>
                    <span>{backElements.length}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">$24.99</span>
                  </div>
                  
                  <Button
                    onClick={handleOrder}
                    variant="hero"
                    size="lg"
                    className="w-full mt-4"
                    disabled={frontElements.length === 0 && backElements.length === 0 && !currentDesign}
                  >
                    Order Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};