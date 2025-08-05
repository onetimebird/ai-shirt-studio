import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShirtIcon, Palette, MonitorSpeaker, Scissors } from "lucide-react";
import { useState } from "react";
import { GILDAN_2000_COLORS, getAllColors } from "@/data/gildan2000Colors";
import { GILDAN_64000_COLORS, getAllColors as getAllColors64000 } from "@/data/gildan64000Colors";
import { BELLA_3001C_COLORS, getAllColors as getAllColorsBella } from "@/data/bellaColors";
import { BELLA_6400_COLORS, getAllColors as getAllColorsBella6400 } from "@/data/bella6400Colors";
import { GILDAN_18000_COLORS, getAllColors as getAllColors18000 } from "@/data/gildan18000Colors";
import { GILDAN_18500_COLORS, getAllColors as getAllColors18500 } from "@/data/gildan18500Colors";
import { BELLA_3719_COLORS, getAllColors as getAllColors3719 } from "@/data/bella3719Colors";

interface MobileBottomBarProps {
  selectedProduct: string;
  selectedColor: string;
  decorationMethod: string;
  onProductChange: (product: string) => void;
  onColorChange: (color: string) => void;
  onDecorationChange: (method: string) => void;
}

export const MobileBottomBar = ({
  selectedProduct,
  selectedColor,
  decorationMethod,
  onProductChange,
  onColorChange,
  onDecorationChange,
}: MobileBottomBarProps) => {
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [colorSheetOpen, setColorSheetOpen] = useState(false);

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
    <div className="md:hidden bg-gradient-card border-t border-border backdrop-blur-sm shadow-glass">
      {/* Single Horizontal Scrollable Bar with All Icons */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-3 px-4 py-3 min-w-max">
          {/* Product Selector */}
          <Sheet open={productSheetOpen} onOpenChange={setProductSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="glass" 
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <ShirtIcon className="w-4 h-4" />
                <span className="text-[10px] leading-tight">Product</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <SheetTitle className="text-lg">Select Product</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-4">
                <Select value={selectedProduct} onValueChange={(value) => {
                  onProductChange(value);
                  setProductSheetOpen(false);
                }}>
                  <SelectTrigger className="w-full h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
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
            </SheetContent>
          </Sheet>

          {/* Color Selector */}
          <Sheet open={colorSheetOpen} onOpenChange={setColorSheetOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="glass" 
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1">
                  <div 
                    className="w-3 h-3 rounded border border-border" 
                    style={{ backgroundColor: currentColor?.value }}
                  />
                  <Palette className="w-3 h-3" />
                </div>
                <span className="text-[10px] leading-tight">Color</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] p-0 rounded-t-xl">
              <SheetHeader className="p-4 pb-2 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
                <SheetTitle className="text-lg">Select Color</SheetTitle>
              </SheetHeader>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                  {getAllCurrentColors().map((color) => (
                    <Button
                      key={color.name}
                      variant={selectedColor === color.name ? "default" : "outline"}
                      onClick={() => {
                        onColorChange(color.name);
                        setColorSheetOpen(false);
                      }}
                      className="flex items-center gap-2 justify-start h-12"
                    >
                      <div 
                        className="w-4 h-4 rounded border border-border flex-shrink-0" 
                        style={{ backgroundColor: color.value }}
                      />
                      <span className="text-sm truncate">{color.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Digital Print Button */}
          <Button 
            variant={decorationMethod === "screen-print" ? "default" : "glass"}
            size="sm"
            onClick={() => onDecorationChange("screen-print")}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <MonitorSpeaker className="w-4 h-4" />
            <span className="text-[10px] leading-tight">Digital</span>
          </Button>

          {/* Embroidery Button */}
          <Button 
            variant={decorationMethod === "embroidery" ? "default" : "glass"}
            size="sm"
            onClick={() => onDecorationChange("embroidery")}
            className="flex flex-col items-center gap-1 h-auto py-2 px-3 min-w-[60px] relative overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <Scissors className="w-4 h-4" />
            <span className="text-[10px] leading-tight">Embroider</span>
          </Button>

          {/* Spacer for scrolling */}
          <div className="w-4 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};