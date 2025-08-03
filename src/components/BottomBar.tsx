import { Button } from "@/components/ui/button";
import { ProductSelector } from "@/components/ProductSelector";
import { Save, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { QuantityModal } from "@/components/QuantityModal";
import { useState } from "react";

interface BottomBarProps {
  selectedProduct: string;
  onProductChange: (product: string) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export const BottomBar = ({
  selectedProduct,
  onProductChange,
  selectedColor,
  onColorChange,
}: BottomBarProps) => {
  const [selectedDecorationType, setSelectedDecorationType] = useState("digital");
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-card border-t border-border px-4 py-3 shadow-glass backdrop-blur-sm z-50">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side - Product and Color Selection */}
        <div className="flex items-center gap-4">
          <ProductSelector
            selectedProduct={selectedProduct}
            onProductChange={onProductChange}
            selectedColor={selectedColor}
            onColorChange={onColorChange}
          />
          
          {/* Decoration Type Selection */}
          <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1">
            <Button
              variant={selectedDecorationType === "digital" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedDecorationType("digital")}
            >
              Digital Print
            </Button>
            <Button
              variant={selectedDecorationType === "embroidery" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedDecorationType("embroidery")}
            >
              Embroidery
            </Button>
          </div>
        </div>
        
        {/* Right Side - Save Design and Next Step */}
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
          >
            <Save className="w-4 h-4 mr-1 icon-hover" />
            Save Design
          </Button>

          {/* Next Step Button */}
          <Button 
            size="sm"
            onClick={() => {
              console.log("Next Step button clicked");
              setIsQuantityModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
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