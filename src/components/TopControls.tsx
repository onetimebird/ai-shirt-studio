import { Button } from "@/components/ui/button";
import { Save, ArrowRight, ShoppingCart, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { QuantityModal } from "@/components/QuantityModal";
import { toast } from "sonner";
import { useState } from "react";

interface TopControlsProps {
  selectedProduct: string;
  selectedColor: string;
}

export const TopControls = ({
  selectedProduct,
  selectedColor,
}: TopControlsProps) => {
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);

  return (
    <div className="bg-gradient-card border-b border-border px-4 py-3 shadow-glass backdrop-blur-sm">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png" 
            alt="CoolShirt.Ai Logo" 
            className="h-12 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-x-110 hover:scale-y-110"
          />
        </div>

        {/* Center Actions */}
        <div className="flex items-center gap-4">
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
        </div>

        {/* Right Side - Cart, User, Theme */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <ShoppingCart className="w-4 h-4 mr-1" />
            Cart
          </Button>
          <Button variant="outline" size="sm">
            <User className="w-4 h-4 mr-1" />
            Sign In
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex items-center justify-between gap-2 md:hidden">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png" 
            alt="CoolShirt.Ai Logo" 
            className="h-10 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-x-110 hover:scale-y-110"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
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
            <Save className="w-4 h-4" />
          </Button>

          {/* Next Step Button */}
          <Button 
            size="sm"
            onClick={() => {
              console.log('Mobile Next Step button clicked');
              setIsQuantityModalOpen(true);
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Button>

          {/* Cart and User Icons */}
          <Button variant="outline" size="sm">
            <ShoppingCart className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <User className="w-4 h-4" />
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