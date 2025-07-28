
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, Palette, Shirt, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { DesignCanvas } from "./DesignCanvas";
import { DesignToolbar } from "./DesignToolbar";
import { ProductSelector } from "./ProductSelector";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";

interface Design {
  id: string;
  prompt: string;
  imageUrl: string;
  timestamp: Date;
}

export const TShirtDesigner = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedColor, setSelectedColor] = useState("White");
  const [selectedSize, setSelectedSize] = useState("M");
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [designHistory, setDesignHistory] = useState<Design[]>([]);
  const [currentSide, setCurrentSide] = useState<"front" | "back">("front");
  const [activeTab, setActiveTab] = useState<"text" | "image" | "colors">("text");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Text properties
  const [newText, setNewText] = useState("Your Text");
  const [fontSize, setFontSize] = useState([24]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState("center");
  const [selectedObject, setSelectedObject] = useState<any>(null);

  const generateDesign = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a design prompt");
      return;
    }

    setIsGenerating(true);
    try {
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
    toast.success("Order functionality coming soon!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">AI T-Shirt Designer</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] lg:h-screen">
        {/* Sidebar - Mobile Drawer / Desktop Fixed */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-80 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full overflow-y-auto">
            {/* Desktop Header */}
            <div className="hidden lg:block p-6 border-b border-border">
              <h1 className="text-2xl font-bold">AI T-Shirt Designer</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Design custom t-shirts with AI, text, and images
              </p>
            </div>

            {/* AI Design Generator */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                AI Design Generator
              </h3>
              <div className="space-y-3">
                <Input
                  placeholder="e.g., A cool dragon breathing fire"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && generateDesign()}
                />
                <Button
                  onClick={generateDesign}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Product Selector */}
            <div className="p-4 border-b border-border">
              <ProductSelector
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                currentSide={currentSide}
                setCurrentSide={setCurrentSide}
              />
            </div>

            {/* Design History */}
            {designHistory.length > 0 && (
              <div className="p-4">
                <h3 className="font-semibold mb-3">Recent Designs</h3>
                <div className="grid grid-cols-2 gap-2">
                  {designHistory.slice(0, 4).map((design) => (
                    <button
                      key={design.id}
                      onClick={() => setCurrentDesign(design)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                        currentDesign?.id === design.id 
                          ? "border-primary shadow-lg" 
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
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Design Toolbar */}
          <DesignToolbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddText={() => {}}
            onImageUpload={() => {}}
            selectedObject={selectedObject}
            onUpdateTextProperties={() => {}}
            onDeleteSelected={() => {}}
            onDuplicateSelected={() => {}}
            onRotateSelected={() => {}}
            newText={newText}
            setNewText={setNewText}
            fontSize={fontSize}
            setFontSize={setFontSize}
            fontFamily={fontFamily}
            setFontFamily={setFontFamily}
            textColor={textColor}
            setTextColor={setTextColor}
            isBold={isBold}
            setIsBold={setIsBold}
            isItalic={isItalic}
            setIsItalic={setIsItalic}
            isUnderline={isUnderline}
            setIsUnderline={setIsUnderline}
            textAlign={textAlign}
            setTextAlign={setTextAlign}
          />

          {/* Design Canvas */}
          <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
            <DesignCanvas
              side={currentSide}
              selectedColor={selectedColor}
              onSelectedObjectChange={setSelectedObject}
              toolbarProps={{
                newText,
                fontSize,
                fontFamily,
                textColor,
                isBold,
                isItalic,
                isUnderline,
                textAlign,
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
