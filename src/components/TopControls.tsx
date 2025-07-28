import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, FlipHorizontal, Palette, ShirtIcon } from "lucide-react";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";

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
    <div className="bg-card border-b border-border px-4 py-3 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Product Selector */}
          <div className="flex items-center gap-2">
            <ShirtIcon className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedProduct} onValueChange={onProductChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Change Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bella-3001c">Bella Canvas 3001C - Unisex Tee</SelectItem>
                <SelectItem value="bella-hoodie">Bella Canvas Hoodie</SelectItem>
                <SelectItem value="bella-tank">Bella Canvas Tank Top</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-muted-foreground" />
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
              <SelectContent>
                {BELLA_3001C_COLORS.map((color) => (
                  <SelectItem key={color.name} value={color.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded border border-border"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Add Product Button */}
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Decoration Method */}
          <div className="flex items-center gap-2">
            <Badge variant={decorationMethod === "screen-print" ? "default" : "outline"}>
              Screen Print
            </Badge>
            <Badge variant={decorationMethod === "embroidery" ? "default" : "outline"}>
              Embroidery
            </Badge>
          </div>

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

          {/* Flip Button */}
          <Button variant="outline" size="sm">
            <FlipHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};