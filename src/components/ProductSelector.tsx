
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shirt, Palette } from "lucide-react";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";

interface ProductSelectorProps {
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  currentSide: "front" | "back";
  setCurrentSide: (side: "front" | "back") => void;
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

export const ProductSelector = ({
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  currentSide,
  setCurrentSide,
}: ProductSelectorProps) => {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Product Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg">Bella Canvas 3001c</h3>
            <p className="text-sm text-muted-foreground">Unisex Jersey Short Sleeve Tee</p>
          </div>

          {/* Side Selection */}
          <Tabs value={currentSide} onValueChange={(value) => setCurrentSide(value as "front" | "back")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="front">Front</TabsTrigger>
              <TabsTrigger value="back">Back</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Color Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4" />
              <h4 className="font-medium">Color</h4>
            </div>
            <div className="grid grid-cols-8 gap-2 max-h-40 overflow-y-auto">
              {BELLA_3001C_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color.name 
                      ? "border-primary scale-110 shadow-lg" 
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {BELLA_3001C_COLORS.find(c => c.name === selectedColor)?.label}
            </p>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shirt className="w-4 h-4" />
              <h4 className="font-medium">Size</h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSize(size)}
                  className="h-8"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="text-center pt-4 border-t border-border">
            <div className="text-2xl font-bold text-primary">$24.99</div>
            <Button className="w-full mt-3" size="lg">
              Order Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
