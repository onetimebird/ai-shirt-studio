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

  const handleQuantityChange = (size: string, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value) || 0;
    setQuantities(prev => ({
      ...prev,
      [size]: Math.max(0, numValue)
    }));
  };

  const getTotalQuantity = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xs mx-auto p-0 bg-background border border-border/50 shadow-2xl max-h-[98vh] overflow-hidden touch-pan-y">
        {/* Header with progress stepper */}
        <div className="p-3 pb-2 border-b border-border/20">
          <div className="flex items-center justify-between mb-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1 mb-2 scale-90">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-[10px] font-medium text-primary">1</span>
              </div>
              <span className="text-[10px] text-muted-foreground">DESIGN</span>
            </div>
            <div className="w-8 h-0.5 bg-primary"></div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary border border-primary flex items-center justify-center">
                <span className="text-[10px] font-medium text-primary-foreground">2</span>
              </div>
              <span className="text-[10px] font-medium text-primary">QUANTITY</span>
            </div>
            <div className="w-8 h-0.5 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">3</span>
              </div>
              <span className="text-[10px] text-muted-foreground">REVIEW</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-sm font-semibold mb-0.5">How Many Do You Need?</h2>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Enter quantities to calculate price.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 pt-2" style={{ touchAction: 'pan-y' }}>
          {/* Product Display */}
          <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg mb-3">
            <img 
              src="/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png" 
              alt="T-shirt" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h3 className="text-xs font-medium">RT2000 RushOrderTees Classic</h3>
              <p className="text-[10px] text-muted-foreground capitalize">{selectedColor}</p>
              <Badge variant="secondary" className="mt-0.5 text-[10px] px-1 py-0">{getTotalQuantity()} Items</Badge>
            </div>
          </div>

          {/* Adult Sizes */}
          <div className="mb-3">
            <h3 className="text-xs font-medium mb-1">Adult Sizes</h3>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {adultSizes.slice(0, 7).map((size) => (
                <div key={size} className="text-center">
                  <div className="text-[10px] font-medium mb-0.5">{size}</div>
                  <div className="w-full h-8 border border-border rounded-md flex items-center justify-center bg-background">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] ? quantities[size].toString() : ''}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                      className="w-full h-full text-center bg-transparent border-none outline-none text-xs"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="text-center">
                <div className="text-[10px] font-medium mb-0.5">5XL</div>
                <div className="w-full h-8 border border-border rounded-md flex items-center justify-center bg-background">
                  <input
                    type="number"
                    min="0"
                    value={quantities['5XL'] ? quantities['5XL'].toString() : ''}
                    onChange={(e) => handleQuantityChange('5XL', e.target.value)}
                    className="w-full h-full text-center bg-transparent border-none outline-none text-xs"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Youth Sizes */}
          <div className="mb-3">
            <h3 className="text-xs font-medium mb-1">Youth Sizes</h3>
            <div className="grid grid-cols-4 gap-1.5">
              {youthSizes.map((size) => (
                <div key={size} className="text-center">
                  <div className="text-[10px] font-medium mb-0.5">{size}</div>
                  <div className="w-full h-8 border border-border rounded-md flex items-center justify-center bg-background">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] ? quantities[size].toString() : ''}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                      className="w-full h-full text-center bg-transparent border-none outline-none text-xs"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="p-3 pt-2 border-t border-border/20 bg-background">
          <Button 
            className="w-full h-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm shadow-lg transition-all duration-300 hover:shadow-xl"
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