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
      <DialogContent className="max-w-full w-full mx-0 p-0 bg-background border border-border/50 shadow-2xl h-[95vh] overflow-hidden [&>button]:hidden">
        {/* Header with progress stepper */}
        <div className="p-3 pb-2 border-b border-border/20">
          <div className="flex items-center justify-end mb-2">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <span className="text-sm text-muted-foreground">DESIGN</span>
            </div>
            <div className="w-8 h-0.5 bg-primary"></div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary border border-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">2</span>
              </div>
              <span className="text-sm font-medium text-primary">QUANTITY</span>
            </div>
            <div className="w-8 h-0.5 bg-border"></div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground">3</span>
              </div>
              <span className="text-sm text-muted-foreground">REVIEW</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-lg font-semibold mb-1">How Many Do You Need?</h2>
            <p className="text-sm text-muted-foreground">
              Enter quantities to calculate price.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-2 pt-1 overscroll-contain" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
          {/* Product Display */}
          <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-lg mb-2">
            <img 
              src="/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png" 
              alt="T-shirt" 
              className="w-8 h-8 object-contain"
            />
            <div>
              <h3 className="text-[11px] font-medium">RT2000 RushOrderTees Classic</h3>
              <p className="text-[9px] text-muted-foreground capitalize">{selectedColor}</p>
              <Badge variant="secondary" className="mt-0.5 text-[9px] px-1 py-0">{getTotalQuantity()} Items</Badge>
            </div>
          </div>

          {/* Adult Sizes */}
          <div className="mb-2">
            <h3 className="text-[10px] font-medium mb-0.5">Adult Sizes</h3>
            <div className="grid grid-cols-4 gap-1">
              {adultSizes.map((size) => (
                <div key={size} className="text-center">
                  <div className="text-[9px] font-medium mb-0.5">{size}</div>
                  <div className="w-full h-7 border border-border rounded-md flex items-center justify-center bg-background">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] ? quantities[size].toString() : ''}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                      className="w-full h-full text-center bg-transparent border-none outline-none text-[11px]"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Youth Sizes */}
          <div className="mb-2">
            <h3 className="text-[10px] font-medium mb-0.5">Youth Sizes</h3>
            <div className="grid grid-cols-4 gap-1">
              {youthSizes.map((size) => (
                <div key={size} className="text-center">
                  <div className="text-[9px] font-medium mb-0.5">{size}</div>
                  <div className="w-full h-7 border border-border rounded-md flex items-center justify-center bg-background">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] ? quantities[size].toString() : ''}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                      className="w-full h-full text-center bg-transparent border-none outline-none text-[11px]"
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