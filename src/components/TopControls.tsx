import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FlipHorizontal, Palette, ShirtIcon, Save, ZoomIn, ZoomOut, HelpCircle, DollarSign, ArrowRight } from "lucide-react";
import { GILDAN_2000_COLORS, getAllColors } from "@/data/gildan2000Colors";
import { GILDAN_64000_COLORS, getAllColors as getAllColors64000 } from "@/data/gildan64000Colors";
import { BELLA_3001C_COLORS, getAllColors as getAllColorsBella } from "@/data/bellaColors";
import { BELLA_6400_COLORS, getAllColors as getAllColorsBella6400 } from "@/data/bella6400Colors";
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
  // Get current color based on selected product
  const getCurrentColors = () => {
    switch (selectedProduct) {
      case 'gildan-64000':
        return GILDAN_64000_COLORS;
      case 'bella-3001c':
        return BELLA_3001C_COLORS;
      case 'bella-6400':
        return BELLA_6400_COLORS;
      default:
        return GILDAN_2000_COLORS;
    }
  };

  const getAllCurrentColors = () => {
    switch (selectedProduct) {
      case 'gildan-64000':
        return getAllColors64000();
      case 'bella-3001c':
        return getAllColorsBella();
      case 'bella-6400':
        return getAllColorsBella6400();
      default:
        return getAllColors();
    }
  };

  const currentColor = getCurrentColors().find(c => c.name === selectedColor);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  return (
    <div className="bg-gradient-card border-b border-border px-4 py-3 shadow-glass backdrop-blur-sm">
      {/* Desktop - Single Row Layout */}
      <div className="hidden md:flex items-center justify-between gap-2 lg:gap-4 flex-wrap">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png" 
            alt="CoolShirt.Ai Logo" 
            className="h-12 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-x-110 hover:scale-y-110"
          />
        </div>

        {/* Product Selector */}
        <div className="flex items-center gap-2 min-w-0">
          <ShirtIcon className="w-4 h-4 text-muted-foreground icon-hover flex-shrink-0" />
          <Select value={selectedProduct} onValueChange={onProductChange}>
            <SelectTrigger className="w-40 lg:w-56 min-w-0">
              <SelectValue placeholder="Change Product">
                {(() => {
                  const productMap: { [key: string]: string } = {
                    'gildan-2000': 'Gildan 2000 Ultra Cotton T-Shirt',
                    'gildan-64000': 'Gildan 64000 Softstyle T-Shirt',
                    'bella-3001c': 'Bella 3001 Premium T-Shirt',
                    'bella-6400': 'Bella 6400 Premium Women\'s Tee',
                    'gildan-18000': 'Gildan 18000 Crewneck',
                    'gildan-18500': 'Gildan 18500 Hoodie',
                    'bella-3719': 'Bella 3719 Premium Hoodie'
                  };
                  return <span className="truncate block">{productMap[selectedProduct] || 'Select Product'}</span>;
                })()}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-[120]">
              <SelectItem value="gildan-2000">Gildan 2000 Ultra Cotton T-Shirt</SelectItem>
              <SelectItem value="gildan-64000">Gildan 64000 Softstyle T-Shirt</SelectItem>
              <SelectItem value="bella-3001c">Bella 3001 Premium T-Shirt</SelectItem>
              <SelectItem value="bella-6400">Bella 6400 Premium Women's Tee</SelectItem>
              <SelectItem value="gildan-18000">Gildan 18000 Crewneck</SelectItem>
              <SelectItem value="gildan-18500">Gildan 18500 Hoodie</SelectItem>
              <SelectItem value="bella-3719">Bella 3719 Premium Hoodie</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Color Picker */}
        <div className="flex items-center gap-2 min-w-0">
          <Palette className="w-4 h-4 text-muted-foreground icon-hover flex-shrink-0" />
          <Select value={selectedColor} onValueChange={onColorChange}>
            <SelectTrigger className="w-36 lg:w-48 min-w-0">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-border" 
                  style={{ backgroundColor: currentColor?.value }}
                />
                <span>{currentColor?.label}</span>
              </div>
            </SelectTrigger>
            <SelectContent className="bg-background border border-border shadow-lg z-[120] max-h-80 overflow-y-auto">
              {getAllCurrentColors().map((color) => (
                <SelectItem key={color.name} value={color.name}>
                  <div className="flex items-center gap-2 w-full">
                    <div 
                      className="w-4 h-4 rounded border border-border flex-shrink-0" 
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="flex-1">{color.label}</span>
                    {!color.available && <span className="text-xs text-muted-foreground">Coming Soon</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
        >
          <Save className="w-4 h-4 mr-1 icon-hover" />
          Save
        </Button>

        {/* Next Step Button */}
        <Button 
          size="lg"
          onClick={() => {
            console.log('Desktop Next Step button clicked');
            setIsQuantityModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
        >
          <ArrowRight className="w-4 h-4 mr-1" strokeWidth={2.5} />
          Next Step
        </Button>

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

        {/* Decoration Method */}
        <div className="flex items-center gap-2">
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

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
      <div className="flex flex-col gap-3 md:hidden">
        {/* First Row - Logo, Product & Color Selectors */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png" 
              alt="CoolShirt.Ai Logo" 
              className="h-16 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-x-110 hover:scale-y-110"
            />
          </div>

          {/* Product and Color Selectors */}
          <div className="flex items-center gap-2">
            {/* Product Selector */}
            <Select value={selectedProduct} onValueChange={onProductChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Change Product">
                  {(() => {
                    const productMap: { [key: string]: string } = {
                      'gildan-2000': 'Gildan 2000 Ultra Cotton T-Shirt',
                      'gildan-64000': 'Gildan 64000 Softstyle T-Shirt',
                      'bella-3001c': 'Bella 3001 Premium T-Shirt',
                      'bella-6400': 'Bella 6400 Premium Women\'s Tee',
                      'gildan-18000': 'Gildan 18000 Crewneck',
                      'gildan-18500': 'Gildan 18500 Hoodie',
                      'bella-3719': 'Bella 3719 Premium Hoodie'
                    };
                    return <span className="truncate block text-xs">{productMap[selectedProduct] || 'Select Product'}</span>;
                  })()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-[120]">
                <SelectItem value="gildan-2000">Gildan 2000 Ultra Cotton T-Shirt</SelectItem>
                <SelectItem value="gildan-64000">Gildan 64000 Softstyle T-Shirt</SelectItem>
                <SelectItem value="bella-3001c">Bella 3001 Premium T-Shirt</SelectItem>
                <SelectItem value="bella-6400">Bella 6400 Premium Women's Tee</SelectItem>
                <SelectItem value="gildan-18000">Gildan 18000 Crewneck</SelectItem>
                <SelectItem value="gildan-18500">Gildan 18500 Hoodie</SelectItem>
                <SelectItem value="bella-3719">Bella 3719 Premium Hoodie</SelectItem>
              </SelectContent>
            </Select>

            {/* Color Picker */}
            <Select value={selectedColor} onValueChange={onColorChange}>
              <SelectTrigger className="w-32 min-w-fit">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded border border-border" 
                    style={{ backgroundColor: currentColor?.value }}
                  />
                  <span className="text-xs">{currentColor?.label}</span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-[120] max-h-80 overflow-y-auto">
                {getAllCurrentColors().map((color) => (
                  <SelectItem key={color.name} value={color.name}>
                    <div className="flex items-center gap-2 w-full">
                      <div 
                        className="w-4 h-4 rounded border border-border flex-shrink-0" 
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="flex-1">{color.label}</span>
                      {!color.available && <span className="text-xs text-muted-foreground">Coming Soon</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile Theme Toggle */}
          <MobileThemeToggle />
        </div>

        {/* Second Row - Controls evenly spaced with proper overflow handling */}
        <div className="flex items-center justify-between gap-2 min-w-0">
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
            className="flex-1 min-w-0"
          >
            <Save className="w-4 h-4 mr-1 icon-hover" />
            Save
          </Button>

          {/* Front/Back Toggle */}
          <div className="flex items-center border border-border rounded-md flex-1 min-w-0">
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

          {/* Next Step Button - NEW button following exact same pattern as Save button */}
          <Button 
            size="sm"
            onClick={() => {
              console.log('NEW Next Step button clicked');
              setIsQuantityModalOpen(true);
            }}
            className="flex-1 min-w-0 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4 mr-1" strokeWidth={2.5} />
            Next Step
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