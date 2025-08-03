import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, ShirtIcon, Save, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { QuantityModal } from "@/components/QuantityModal";
import { GILDAN_2000_COLORS, getAllColors } from "@/data/gildan2000Colors";
import { GILDAN_64000_COLORS, getAllColors as getAllColors64000 } from "@/data/gildan64000Colors";
import { BELLA_3001C_COLORS, getAllColors as getAllColorsBella } from "@/data/bellaColors";
import { BELLA_6400_COLORS, getAllColors as getAllColorsBella6400 } from "@/data/bella6400Colors";
import { GILDAN_18000_COLORS, getAllColors as getAllColors18000 } from "@/data/gildan18000Colors";
import { GILDAN_18500_COLORS, getAllColors as getAllColors18500 } from "@/data/gildan18500Colors";
import { BELLA_3719_COLORS, getAllColors as getAllColors3719 } from "@/data/bella3719Colors";

interface BottomBarProps {
  selectedProduct: string;
  selectedColor: string;
  decorationMethod: string;
  onProductChange: (product: string) => void;
  onColorChange: (color: string) => void;
  onDecorationChange: (method: string) => void;
}

export const BottomBar = ({
  selectedProduct,
  selectedColor,
  decorationMethod,
  onProductChange,
  onColorChange,
  onDecorationChange,
}: BottomBarProps) => {
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  // Get current color based on selected product
  const getCurrentColors = () => {
    switch (selectedProduct) {
      case 'gildan-64000':
        return GILDAN_64000_COLORS;
      case 'bella-3001c':
        return BELLA_3001C_COLORS;
      case 'bella-6400':
        return BELLA_6400_COLORS;
      case 'gildan-18000':
        return GILDAN_18000_COLORS;
      case 'gildan-18500':
        return GILDAN_18500_COLORS;
      case 'bella-3719':
        return BELLA_3719_COLORS;
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
      case 'gildan-18000':
        return getAllColors18000();
      case 'gildan-18500':
        return getAllColors18500();
      case 'bella-3719':
        return getAllColors3719();
      default:
        return getAllColors();
    }
  };

  const currentColor = getCurrentColors().find(c => c.name === selectedColor);

  return (
    <div className="sticky bottom-0 bg-gradient-card border-t border-border px-4 py-6 shadow-glass backdrop-blur-sm z-40">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4 lg:gap-6">
        {/* Left Side - Product and Color Selectors */}
        <div className="flex items-center gap-4 lg:gap-6">
        {/* Product Selector */}
        <div className="flex items-center gap-2">
          <ShirtIcon className="w-4 h-4 text-muted-foreground icon-hover flex-shrink-0" />
          <Select value={selectedProduct} onValueChange={onProductChange}>
            <SelectTrigger className="w-56 h-14 text-base">
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
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground icon-hover flex-shrink-0" />
          <Select value={selectedColor} onValueChange={onColorChange}>
            <SelectTrigger className="w-48 h-14 text-base">
              <SelectValue placeholder="Change Color">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border border-border" 
                    style={{ backgroundColor: currentColor?.value }}
                  />
                  <span>{currentColor?.label}</span>
                </div>
              </SelectValue>
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

        {/* Decoration Method */}
        <div className="flex items-center gap-2">
          <Button
            variant={decorationMethod === "screen-print" ? "default" : "outline"}
            size="lg"
            onClick={() => onDecorationChange("screen-print")}
            className="h-14 px-6 text-base"
          >
            Digital Print
          </Button>
          <Button
            variant={decorationMethod === "embroidery" ? "default" : "outline"}
            size="lg"
            onClick={() => onDecorationChange("embroidery")}
            className="h-14 px-6 text-base"
          >
            Embroidery
          </Button>
        </div>
        </div>

        {/* Right Side - Action Buttons */}
        <div className="flex items-center gap-6">
          {/* Save Button */}
          <Button 
            variant="creative" 
            size="lg"
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
            className="text-base px-6 py-3 h-12"
          >
            <Save className="w-5 h-5 mr-2 icon-hover" />
            Save Design
          </Button>

          {/* Next Step Button - 1.5x larger */}
          <Button 
            size="lg"
            onClick={() => {
              console.log('Desktop Next Step button clicked');
              setIsQuantityModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-lg px-8 py-4 h-16 min-w-[200px]"
          >
            <ArrowRight className="w-6 h-6 mr-3" strokeWidth={2.5} />
            Next Step
          </Button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Product and Color Selectors */}
        <div className="flex items-center gap-2">
          {/* Product Selector */}
          <Select value={selectedProduct} onValueChange={onProductChange}>
            <SelectTrigger className="flex-1 h-12 text-sm">
              <SelectValue placeholder="Change Product">
                {(() => {
                  const productMap: { [key: string]: string } = {
                    'gildan-2000': 'Gildan 2000',
                    'gildan-64000': 'Gildan 64000',
                    'bella-3001c': 'Bella 3001',
                    'bella-6400': 'Bella 6400',
                    'gildan-18000': 'Gildan 18000',
                    'gildan-18500': 'Gildan 18500',
                    'bella-3719': 'Bella 3719'
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
            <SelectTrigger className="flex-1 h-12 text-sm">
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

        {/* Decoration Method */}
        <div className="flex items-center gap-2">
          <Button
            variant={decorationMethod === "screen-print" ? "default" : "outline"}
            size="sm"
            onClick={() => onDecorationChange("screen-print")}
            className="flex-1 h-12 text-sm"
          >
            Digital Print
          </Button>
          <Button
            variant={decorationMethod === "embroidery" ? "default" : "outline"}
            size="sm"
            onClick={() => onDecorationChange("embroidery")}
            className="flex-1 h-12 text-sm"
          >
            Embroidery
          </Button>
        </div>

        {/* Mobile Action Buttons */}
        <div className="flex items-center gap-3">
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
            className="flex-1 text-sm px-4 py-3 h-12"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>

          {/* Next Step Button - 1.5x larger on mobile */}
          <Button 
            size="sm"
            onClick={() => {
              console.log('Mobile Next Step button clicked');
              setIsQuantityModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 flex-[1.5] text-sm px-6 py-3 h-12 min-w-[120px]"
          >
            <ArrowRight className="w-5 h-5 mr-2" strokeWidth={2.5} />
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