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
      <DialogContent className="max-w-full lg:max-w-4xl w-full mx-0 lg:mx-auto p-0 bg-background border border-border/50 shadow-2xl h-[95vh] lg:h-[85vh] overflow-hidden [&>button]:hidden z-[60]">
        {/* Header with progress stepper */}
        <div className="p-3 lg:p-6 pb-2 lg:pb-4 border-b border-border/20">
          <div className="flex items-center justify-end mb-2 lg:mb-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 lg:p-2">
              <X className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 lg:gap-4 mb-3 lg:mb-6">
            <div className="flex items-center gap-1.5 lg:gap-3">
              <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-xs lg:text-base font-medium text-primary">1</span>
              </div>
              <span className="text-sm lg:text-lg text-muted-foreground">DESIGN</span>
            </div>
            <div className="w-8 lg:w-16 h-0.5 lg:h-1 bg-primary"></div>
            <div className="flex items-center gap-1.5 lg:gap-3">
              <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-primary border border-primary flex items-center justify-center">
                <span className="text-xs lg:text-base font-medium text-primary-foreground">2</span>
              </div>
              <span className="text-sm lg:text-lg font-medium text-primary">QUANTITY</span>
            </div>
            <div className="w-8 lg:w-16 h-0.5 lg:h-1 bg-border"></div>
            <div className="flex items-center gap-1.5 lg:gap-3">
              <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-xs lg:text-base text-muted-foreground">3</span>
              </div>
              <span className="text-sm lg:text-lg text-muted-foreground">REVIEW</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-lg lg:text-3xl font-semibold mb-1 lg:mb-3">How Many Do You Need?</h2>
            <p className="text-sm lg:text-xl text-muted-foreground mb-1 lg:mb-2">
              Enter quantities to calculate price.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-8 pt-0 lg:pt-4 overscroll-contain" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
          {/* Product Display */}
          <div className="flex items-center gap-2 lg:gap-4 p-1.5 lg:p-4 bg-muted/30 rounded-lg mb-2 lg:mb-6">
            <img 
              src="/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png" 
              alt="T-shirt" 
              className="w-8 h-8 lg:w-16 lg:h-16 object-contain"
            />
            <div>
              <h3 className="text-[11px] lg:text-xl font-medium">Gildan 2000</h3>
              <p className="text-[9px] lg:text-base text-muted-foreground capitalize">{selectedColor}</p>
              <Badge variant="secondary" className="mt-0.5 lg:mt-2 text-[9px] lg:text-sm px-1 lg:px-3 py-0 lg:py-1">{getTotalQuantity()} Items</Badge>
            </div>
          </div>

          {/* Adult Sizes */}
          <div className="mb-2 lg:mb-8">
            <h3 className="text-[10px] lg:text-lg font-medium mb-0.5 lg:mb-3">Adult Sizes</h3>
            <div className="grid grid-cols-4 lg:grid-cols-8 gap-1 lg:gap-4">
              {adultSizes.map((size) => (
                <div key={size} className="text-center">
                  <div className="text-[9px] lg:text-base font-medium mb-0.5 lg:mb-2">{size}</div>
                  <div className="w-full h-9 lg:h-16 border-2 border-border rounded-md lg:rounded-lg flex items-center justify-center bg-background hover:border-primary/50 transition-colors">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] ? quantities[size].toString() : ''}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                      className="w-full h-full text-center bg-transparent border-none outline-none text-sm lg:text-xl font-medium text-foreground"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Youth Sizes */}
          <div className="mb-2 lg:mb-8">
            <h3 className="text-[10px] lg:text-lg font-medium mb-0.5 lg:mb-3">Youth Sizes</h3>
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-1 lg:gap-4">
              {youthSizes.map((size) => (
                <div key={size} className="text-center">
                  <div className="text-[9px] lg:text-base font-medium mb-0.5 lg:mb-2">{size}</div>
                  <div className="w-full h-9 lg:h-16 border-2 border-border rounded-md lg:rounded-lg flex items-center justify-center bg-background hover:border-primary/50 transition-colors">
                    <input
                      type="number"
                      min="0"
                      value={quantities[size] ? quantities[size].toString() : ''}
                      onChange={(e) => handleQuantityChange(size, e.target.value)}
                      className="w-full h-full text-center bg-transparent border-none outline-none text-sm lg:text-xl font-medium text-foreground"
                      placeholder="0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Bottom Button */}
        <div className="p-3 lg:p-8 pt-2 lg:pt-6 border-t border-border/20 bg-background">
          <Button 
            className="w-full h-10 lg:h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm lg:text-xl shadow-lg transition-all duration-300 hover:shadow-xl"
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