import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, X } from "lucide-react";
import { useState } from "react";

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: string;
  selectedColor: string;
}

export const QuantityModal = ({ isOpen, onClose, selectedProduct, selectedColor }: QuantityModalProps) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const adultSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  const youthSizes = ['YXS', 'YS', 'YM', 'YL', 'YXL'];

  const handleQuantityChange = (size: string, value: number) => {
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, value)
    }));
  };

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg mx-auto p-0 bg-background border border-border/50 shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header with progress stepper */}
        <div className="p-6 pb-4 border-b border-border/20">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">1</span>
              </div>
              <span className="text-sm text-muted-foreground">DESIGN</span>
            </div>
            <div className="w-16 h-0.5 bg-primary"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">2</span>
              </div>
              <span className="text-sm font-medium text-primary">QUANTITY</span>
            </div>
            <div className="w-16 h-0.5 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                <span className="text-sm text-muted-foreground">3</span>
              </div>
              <span className="text-sm text-muted-foreground">REVIEW</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold mb-1">How Many Do You Need?</h2>
            <p className="text-sm text-muted-foreground">
              Enter quantities to calculate the price. Save money by increasing quantity and reducing ink colors in your design.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4">
          {/* Product Display */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg mb-6">
            <img 
              src="/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png" 
              alt="T-shirt" 
              className="w-16 h-16 object-contain"
            />
            <div>
              <h3 className="font-medium">RT2000 RushOrderTees Classic</h3>
              <p className="text-sm text-muted-foreground capitalize">{selectedColor}</p>
              <Badge variant="secondary" className="mt-1">{getTotalQuantity()} Items</Badge>
            </div>
          </div>

          {/* Adult Sizes */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Adult Sizes</h3>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {adultSizes.slice(0, 7).map((size) => (
                <div key={size} className="text-center">
                  <div className="text-sm font-medium mb-2">{size}</div>
                  <div className="w-full h-12 border border-border rounded-md flex items-center justify-center bg-background">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] || 0}
                      onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 0)}
                      className="w-full h-full text-center bg-transparent border-none outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <div className="text-sm font-medium mb-2">5XL</div>
                <div className="w-full h-12 border border-border rounded-md flex items-center justify-center bg-background">
                  <input
                    type="number"
                    min="0"
                    value={quantities['5XL'] || 0}
                    onChange={(e) => handleQuantityChange('5XL', parseInt(e.target.value) || 0)}
                    className="w-full h-full text-center bg-transparent border-none outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Youth Sizes */}
          <div className="mb-6">
            <h3 className="font-medium mb-3">Youth Sizes</h3>
            <div className="grid grid-cols-4 gap-3">
              {youthSizes.map((size) => (
                <div key={size} className="text-center">
                  <div className="text-sm font-medium mb-2">{size}</div>
                  <div className="w-full h-12 border border-border rounded-md flex items-center justify-center bg-background">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] || 0}
                      onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 0)}
                      className="w-full h-full text-center bg-transparent border-none outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="p-6 pt-4 border-t border-border/20 bg-background">
          <Button 
            className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-base shadow-lg transition-all duration-300 hover:shadow-xl"
            onClick={() => {
              // Handle calculate pricing
              console.log('Quantities:', quantities);
            }}
          >
            CALCULATE PRICING →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};