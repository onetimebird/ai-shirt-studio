import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Palette, Shirt } from "lucide-react";
import { toast } from "sonner";
import tshirtMockup from "@/assets/tshirt-mockup.png";

interface Design {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
}

export const TShirtDesigner = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedColor, setSelectedColor] = useState("white");
  const [selectedSize, setSelectedSize] = useState("M");
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [designHistory, setDesignHistory] = useState<Design[]>([]);

  const tshirtColors = [
    { name: "white", value: "#ffffff", label: "White" },
    { name: "black", value: "#000000", label: "Black" },
    { name: "navy", value: "#1e3a8a", label: "Navy" },
    { name: "red", value: "#dc2626", label: "Red" },
    { name: "green", value: "#16a34a", label: "Green" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

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
    <section id="designer" className="py-20 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            AI T-Shirt Designer
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Describe your perfect design and watch AI bring it to life instantly
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Design Input Section */}
          <div className="space-y-6">
            <Card className="bg-gradient-card shadow-creative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  Describe Your Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="e.g., A cool dragon breathing fire with mountains in the background"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && generateDesign()}
                  />
                  <p className="text-sm text-muted-foreground">
                    Be specific! The more details you provide, the better your design will be.
                  </p>
                </div>
                
                <Button
                  onClick={generateDesign}
                  disabled={isGenerating || !prompt.trim()}
                  variant="creative"
                  size="lg"
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Magic...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Design
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Customization Options */}
            <Card className="bg-gradient-card shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Customize Your T-Shirt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">T-Shirt Color</h4>
                  <div className="flex gap-2 flex-wrap">
                    {tshirtColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name)}
                        className={`w-12 h-12 rounded-full border-4 transition-all ${
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
                  <div className="flex gap-2 flex-wrap">
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
                  <CardTitle>Recent Designs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {designHistory.map((design) => (
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

          {/* Preview Section */}
          <div className="sticky top-6">
            <Card className="bg-gradient-card shadow-creative">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-primary" />
                  Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square max-w-md mx-auto">
                  {/* T-Shirt Base */}
                  <div
                    className="absolute inset-0 rounded-lg"
                    style={{ 
                      backgroundColor: tshirtColors.find(c => c.name === selectedColor)?.value || "#ffffff",
                      backgroundImage: `url(${tshirtMockup})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center"
                    }}
                  />
                  
                  {/* Design Overlay */}
                  {currentDesign && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 bg-white/10 rounded-lg flex items-center justify-center">
                        <img
                          src={currentDesign.imageUrl}
                          alt={currentDesign.prompt}
                          className="w-40 h-40 object-contain rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                  
                  {!currentDesign && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Shirt className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Generate a design to see preview</p>
                      </div>
                    </div>
                  )}
                </div>

                {currentDesign && (
                  <div className="mt-6 space-y-4">
                    <div className="text-center">
                      <Badge variant="secondary" className="text-sm">
                        {currentDesign.prompt}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2 text-sm text-muted-foreground">
                      <span>Color: {tshirtColors.find(c => c.name === selectedColor)?.label}</span>
                      <span>•</span>
                      <span>Size: {selectedSize}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-primary">$24.99</span>
                      </div>
                      
                      <Button
                        onClick={handleOrder}
                        variant="hero"
                        size="lg"
                        className="w-full"
                      >
                        Order Now
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};