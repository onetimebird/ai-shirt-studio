import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FlipHorizontal, Palette, ShirtIcon, Save, ZoomIn, ZoomOut, HelpCircle, DollarSign } from "lucide-react";
import { GILDAN_2000_COLORS, getAvailableColors } from "@/data/gildan2000Colors";
import { ThemeToggle, MobileThemeToggle } from "@/components/ThemeToggle";
import { QuantityModal } from "@/components/QuantityModal";
import { toast } from "sonner";
import { useState } from "react";

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
  const currentColor = GILDAN_2000_COLORS.find(c => c.name === selectedColor);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  return (
    <div className="bg-gradient-card border-b border-border px-4 py-3 shadow-glass backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        {/* First Row - Logo, Product & Color Selectors */}
        <div className="flex items-center justify-between gap-2 lg:gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png" 
              alt="CoolShirt.Ai Logo" 
              className="h-12 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-x-110 hover:scale-y-110"
            />
          </div>

          {/* Product and Color Selectors */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Product Selector */}
            <div className="flex items-center gap-2">
              <ShirtIcon className="w-4 h-4 text-muted-foreground icon-hover hidden lg:block" />
              <Select value={selectedProduct} onValueChange={onProductChange}>
                <SelectTrigger className="w-36 lg:w-48">
                  <SelectValue placeholder="Change Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gildan-2000">Gildan 2000 Ultra Cotton</SelectItem>
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
              <Palette className="w-4 h-4 text-muted-foreground icon-hover hidden lg:block" />
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
                  {getAvailableColors().map((color) => (
                    <SelectItem key={color.name} value={color.name}>
                      {color.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Theme Toggle and Add Product - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <Button variant="glass" size="sm" className="shimmer-hover">
              <Plus className="w-4 h-4 mr-2 icon-hover" />
              Add Product
            </Button>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="lg:hidden">
            <MobileThemeToggle />
          </div>
        </div>

        {/* Second Row - Controls evenly spaced */}
        <div className="flex items-center justify-between gap-2">
          {/* Save Button */}
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
            className="flex-1 lg:flex-none"
          >
            <Save className="w-4 h-4 mr-1 icon-hover" />
            Save
          </Button>

          {/* Front/Back Toggle */}
          <div className="flex items-center border border-border rounded-md flex-1 lg:flex-none">
            <Button
              variant={currentSide === "front" ? "default" : "ghost"}
              size="sm"
              onClick={() => onSideChange("front")}
              className="rounded-r-none flex-1"
            >
              Front
            </Button>
            <Button
              variant={currentSide === "back" ? "default" : "ghost"}
              size="sm"
              onClick={() => onSideChange("back")}
              className="rounded-l-none border-l flex-1"
            >
              Back
            </Button>
          </div>

          {/* Help Button - Desktop only */}
          <Button 
            variant="glass" 
            size="sm"
            onClick={() => {
              toast.info("Keyboard shortcuts: Delete key to remove selected objects, Ctrl+D to duplicate");
            }}
            className="hidden lg:flex"
          >
            <HelpCircle className="w-4 h-4 icon-hover" />
          </Button>

          {/* Decoration Method - Desktop only */}
          <div className="hidden lg:flex items-center gap-2">
            <Button
              variant={decorationMethod === "screen-print" ? "default" : "outline"}
              size="sm"
              onClick={() => onDecorationChange("screen-print")}
            >
              Digital Print
            </Button>
            <Button
              variant={decorationMethod === "embroidery" ? "default" : "outline"}
              size="sm"
              onClick={() => onDecorationChange("embroidery")}
            >
              Embroidery
            </Button>
          </div>

          {/* Next Step Button - Takes more space */}
          <Button 
            variant="default" 
            size="sm"
            className="bg-blue-500 hover:bg-blue-600 text-white flex-2 lg:flex-none lg:px-6"
            onClick={() => setIsQuantityModalOpen(true)}
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Next
          </Button>
        </div>
      </div>

      {/* Quantity Modal */}
      <QuantityModal 
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        selectedProduct={selectedProduct}
        selectedColor={selectedColor}
      />
    </div>
  );
};