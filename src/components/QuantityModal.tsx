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
      <DialogContent className="max-w-sm mx-auto p-0 bg-background border border-border/50 shadow-2xl max-h-[95vh] overflow-hidden">
        {/* Header with progress stepper */}
        <div className="p-4 pb-3 border-b border-border/20">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">1</span>
              </div>
              <span className="text-xs text-muted-foreground">DESIGN</span>
            </div>
            <div className="w-12 h-0.5 bg-primary"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary border-2 border-primary flex items-center justify-center">
                <span className="text-xs font-medium text-primary-foreground">2</span>
              </div>
              <span className="text-xs font-medium text-primary">QUANTITY</span>
            </div>
            <div className="w-12 h-0.5 bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                <span className="text-xs text-muted-foreground">3</span>
              </div>
              <span className="text-xs text-muted-foreground">REVIEW</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-base font-semibold mb-1">How Many Do You Need?</h2>
            <p className="text-xs text-muted-foreground">
              Enter quantities to calculate the price.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 pt-3">
          {/* Product Display */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg mb-4">
            <img 
              src="/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png" 
              alt="T-shirt" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h3 className="text-sm font-medium">RT2000 RushOrderTees Classic</h3>
              <p className="text-xs text-muted-foreground capitalize">{selectedColor}</p>
              <Badge variant="secondary" className="mt-1 text-xs">{getTotalQuantity()} Items</Badge>
            </div>
          </div>

          {/* Adult Sizes */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Adult Sizes</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {adultSizes.slice(0, 7).map((size) => (
                <div key={size} className="text-center">
                  <div className="text-xs font-medium mb-1">{size}</div>
                  <div className="w-full h-10 border border-border rounded-md flex items-center justify-center bg-background">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] ? quantities[size].toString() : ''}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                      className="w-full h-full text-center bg-transparent border-none outline-none text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-xs font-medium mb-1">5XL</div>
                <div className="w-full h-10 border border-border rounded-md flex items-center justify-center bg-background">
                  <input
                    type="number"
                    min="0"
                    value={quantities['5XL'] ? quantities['5XL'].toString() : ''}
                    onChange={(e) => handleQuantityChange('5XL', e.target.value)}
                    className="w-full h-full text-center bg-transparent border-none outline-none text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Youth Sizes */}
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Youth Sizes</h3>
            <div className="grid grid-cols-4 gap-2">
              {youthSizes.map((size) => (
                <div key={size} className="text-center">
                  <div className="text-xs font-medium mb-1">{size}</div>
                  <div className="w-full h-10 border border-border rounded-md flex items-center justify-center bg-background">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] ? quantities[size].toString() : ''}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                      className="w-full h-full text-center bg-transparent border-none outline-none text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="p-4 pt-3 border-t border-border/20 bg-background">
          <Button 
            className="w-full h-11 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm shadow-lg transition-all duration-300 hover:shadow-xl"
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