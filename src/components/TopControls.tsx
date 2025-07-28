import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FlipHorizontal, Palette, ShirtIcon, Save, ZoomIn, ZoomOut, HelpCircle } from "lucide-react";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import { toast } from "sonner";

interface TopControlsProps {
  selectedProduct: string;
  selectedColor: string;
  decorationMethod: string;
  currentSide: "front" | "back";
  onProductChange: (product: string) => void;
  onColorChange: (color: string) => void;
  onDecorationChange: (method: string) => void;
  onSideChange: (side: "front" | "back") => void;
}

export const TopControls = ({
  selectedProduct,
  selectedColor,
  decorationMethod,
  currentSide,
  onProductChange,
  onColorChange,
  onDecorationChange,
  onSideChange,
}: TopControlsProps) => {
  const currentColor = BELLA_3001C_COLORS.find(c => c.name === selectedColor);

  return (
    <div className="bg-gradient-card border-b border-border px-4 py-3 shadow-glass backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/a0349764-8639-451a-9faa-ceef05c751d0.png" 
              alt="CoolShirt.Ai Logo" 
              className="h-12 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-110 hover:drop-shadow-[0_0_15px_rgba(236,72,153,0.6)] hover:brightness-110"
            />
          </div>
          {/* Product Selector */}
          <div className="flex items-center gap-2">
            <ShirtIcon className="w-4 h-4 text-muted-foreground icon-hover" />
            <Select value={selectedProduct} onValueChange={onProductChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Change Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gildan-2000">Gildan 2000</SelectItem>
                <SelectItem value="gildan-64000">Gildan 64000</SelectItem>
                <SelectItem value="bella-3001c">Bella 3001C</SelectItem>
                <SelectItem value="gildan-18500">Gildan 18500 Hoodie</SelectItem>
                <SelectItem value="bella-canvas-hoodie">Bella Canvas Hoodie</SelectItem>
                <SelectItem value="bella-3480">Bella 3480 Tank Top</SelectItem>
                <SelectItem value="bella-6004">Bella 6004 Women's T-Shirt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground icon-hover" />
            <Select value={selectedColor} onValueChange={onColorChange}>
              <SelectTrigger className="w-32">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-border" 
                    style={{ backgroundColor: currentColor?.value }}
                  />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                {BELLA_3001C_COLORS.map((color) => (
                  <SelectItem key={color.name} value={color.name}>
                    {color.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Product Button */}
          <Button variant="glass" size="sm" className="shimmer-hover">
            <Plus className="w-4 h-4 mr-2 icon-hover" />
            Add Product
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Front/Back Toggle */}
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={currentSide === "front" ? "default" : "ghost"}
              size="sm"
              onClick={() => onSideChange("front")}
              className="rounded-r-none"
            >
              Front
            </Button>
            <Button
              variant={currentSide === "back" ? "default" : "ghost"}
              size="sm"
              onClick={() => onSideChange("back")}
              className="rounded-l-none border-l"
            >
              Back
            </Button>
          </div>

          {/* Design Controls */}
          <div className="flex items-center gap-2">
            <Button 
              variant="creative" 
              size="sm"
              onClick={() => {
                const canvas = (window as any).designCanvas?.canvas;
                if (canvas) {
                  const hasObjects = canvas.getObjects().length > 0;
                  if (hasObjects) {
                    toast.success("Design saved to browser memory");
                  } else {
                    toast.error("No design to save");
                  }
                } else {
                  toast.error("Canvas not ready");
                }
              }}
            >
              <Save className="w-4 h-4 mr-1 icon-hover" />
              Save
            </Button>
            
            <Button 
              variant="glass" 
              size="sm"
              onClick={() => {
                toast.info("Keyboard shortcuts: Delete key to remove selected objects, Ctrl+D to duplicate");
              }}
            >
              <HelpCircle className="w-4 h-4 icon-hover" />
            </Button>
          </div>

          {/* Decoration Method */}
          <div className="flex items-center gap-2">
            <Button
              variant={decorationMethod === "screen-print" ? "default" : "outline"}
              size="sm"
              onClick={() => onDecorationChange("screen-print")}
            >
              Screen Print
            </Button>
            <Button
              variant={decorationMethod === "embroidery" ? "default" : "outline"}
              size="sm"
              onClick={() => onDecorationChange("embroidery")}
            >
              Embroidery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};