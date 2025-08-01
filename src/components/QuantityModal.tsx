import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, X, Check, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Import the products data for pricing
const products = [
  {
    id: 'gildan-2000',
    name: 'Gildan 2000 Ultra Cotton T-Shirt',
    frontOnlyPrice: 12.95,
    frontBackPrice: 18.95,
  },
  {
    id: 'gildan-64000',
    name: 'Gildan 64000 Softstyle T-Shirt',
    frontOnlyPrice: 13.95,
    frontBackPrice: 19.95,
  },
  {
    id: 'bella-3001c',
    name: 'Bella 3001 Premium T-Shirt',
    frontOnlyPrice: 18.95,
    frontBackPrice: 24.95,
  },
  {
    id: 'bella-6400',
    name: 'Bella 6400 Premium Women\'s Tee',
    frontOnlyPrice: 18.95,
    frontBackPrice: 24.95,
  },
  {
    id: 'gildan-18000',
    name: 'Gildan 18000 Crewneck',
    frontOnlyPrice: 22.95,
    frontBackPrice: 28.95,
  },
  {
    id: 'gildan-18500',
    name: 'Gildan 18500 Hoodie',
    frontOnlyPrice: 27.95,
    frontBackPrice: 33.95,
  },
  {
    id: 'bella-3719',
    name: 'Bella 3719 Premium Hoodie',
    frontOnlyPrice: 49.95,
    frontBackPrice: 55.95,
  }
];

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: string;
  selectedColor: string;
}

export const QuantityModal = ({ isOpen, onClose, selectedProduct, selectedColor }: QuantityModalProps) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [hasCalculated, setHasCalculated] = useState(false);
  const [hasFrontDesign, setHasFrontDesign] = useState(false);
  const [hasBackDesign, setHasBackDesign] = useState(false);

  const adultSizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  const youthSizes = ['YXS', 'YS', 'YM', 'YL', 'YXL'];
  const sizeUpcharge = 3.00; // Additional cost for 2XL and up
  const upchargeSizes = ['2XL', '3XL', '4XL', '5XL']; // Sizes that get the upcharge

  // Check for designs on front and back when modal opens
  useEffect(() => {
    if (isOpen) {
      checkForDesigns();
    }
  }, [isOpen]);

  const checkForDesigns = () => {
    const designCanvas = (window as any).designCanvas;
    if (designCanvas) {
      // Check saved states for front and back designs
      const frontState = designCanvas.frontState;
      const backState = designCanvas.backState;
      
      // Also check current canvas objects for the current side
      const canvas = designCanvas.canvas;
      if (canvas) {
        const objects = canvas.getObjects();
        const userObjects = objects.filter((obj: any) => 
          obj.type !== 'image' || !obj.isTemplate
        );
        
        // Update front design status
        setHasFrontDesign((frontState && frontState.length > 0) || 
          (designCanvas.currentSide === 'front' && userObjects.length > 0));
        
        // Update back design status  
        setHasBackDesign((backState && backState.length > 0) || 
          (designCanvas.currentSide === 'back' && userObjects.length > 0));
      } else {
        // Fallback to saved states only
        setHasFrontDesign(frontState && frontState.length > 0);
        setHasBackDesign(backState && backState.length > 0);
      }
    }
  };

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

  const getProductData = () => {
    return products.find(p => p.id === selectedProduct) || products[0];
  };

  const calculateTotalPrice = () => {
    const product = getProductData();
    const baseUnitPrice = (hasFrontDesign && hasBackDesign) ? product.frontBackPrice : product.frontOnlyPrice;
    
    let totalPrice = 0;
    
    Object.entries(quantities).forEach(([size, qty]) => {
      if (qty > 0) {
        const unitPrice = upchargeSizes.includes(size) ? baseUnitPrice + sizeUpcharge : baseUnitPrice;
        totalPrice += qty * unitPrice;
      }
    });
    
    return totalPrice;
  };

  const getSizeUpchargeInfo = () => {
    const upchargeQty = Object.entries(quantities).reduce((sum, [size, qty]) => {
      return sum + (upchargeSizes.includes(size) ? qty : 0);
    }, 0);
    
    const regularQty = getTotalQuantity() - upchargeQty;
    
    return { upchargeQty, regularQty };
  };

  const handleCalculatePricing = () => {
    if (getTotalQuantity() === 0) {
      toast.error("Please select at least one item");
      return;
    }
    setHasCalculated(true);
    toast.success("Price calculated! Review your order below.");
  };

  const handleAddToCart = () => {
    // Future cart functionality
    toast.success("Added to cart!");
    onClose();
  };

  const productData = getProductData();
  const totalPrice = calculateTotalPrice();
  const unitPrice = (hasFrontDesign && hasBackDesign) ? productData.frontBackPrice : productData.frontOnlyPrice;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full lg:max-w-4xl w-full mx-0 lg:mx-auto p-0 bg-background border border-border/50 shadow-2xl h-[95vh] lg:h-[85vh] overflow-hidden [&>button]:hidden z-[120]">
        {/* Header with progress stepper */}
        <div className="pt-1 px-1.5 lg:pt-2 lg:px-3 pb-1 lg:pb-1.5 border-b border-border/20">
          <div className="flex items-center justify-end mb-1">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-0.5">
              <X className="w-4 h-4 lg:w-5 lg:h-5" />
            </Button>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-1.5 lg:gap-3 mb-2 lg:mb-3">
            <div className="flex items-center gap-1 lg:gap-1.5">
              <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-xs lg:text-sm font-medium text-primary">1</span>
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">DESIGN</span>
            </div>
            <div className="w-6 lg:w-10 h-0.5 bg-primary"></div>
            <div className="flex items-center gap-1 lg:gap-1.5">
              <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-primary border border-primary flex items-center justify-center">
                <span className="text-xs lg:text-sm font-medium text-primary-foreground">2</span>
              </div>
              <span className="text-xs lg:text-sm font-medium text-primary">QUANTITY</span>
            </div>
            <div className="w-6 lg:w-10 h-0.5 bg-border"></div>
            <div className="flex items-center gap-1 lg:gap-1.5">
              <div className="w-5 h-5 lg:w-7 lg:h-7 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-xs lg:text-sm text-muted-foreground">3</span>
              </div>
              <span className="text-xs lg:text-sm text-muted-foreground">REVIEW</span>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-lg lg:text-2xl font-semibold mb-1">How Many Do You Need?</h2>
            <p className="text-sm lg:text-base text-muted-foreground mb-1">
              Enter quantities to calculate price.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-2 lg:p-8 pt-1 lg:pt-2 overscroll-contain" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
          {/* Product Display */}
          <div className="flex items-center gap-2 lg:gap-4 p-1.5 lg:p-4 bg-muted/30 rounded-lg mb-2 lg:mb-6">
            <img 
              src="/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png" 
              alt="T-shirt" 
              className="w-8 h-8 lg:w-16 lg:h-16 object-contain"
            />
            <div className="flex-1">
              <h3 className="text-[11px] lg:text-xl font-medium">{productData.name}</h3>
              <p className="text-[9px] lg:text-base text-muted-foreground capitalize">{selectedColor?.replace(/-/g, ' ')}</p>
              <div className="flex items-center gap-2 mt-0.5 lg:mt-2">
                <Badge variant="secondary" className="text-[9px] lg:text-sm px-1 lg:px-3 py-0 lg:py-1">
                  {getTotalQuantity()} Items
                </Badge>
                {hasFrontDesign && (
                  <Badge variant="outline" className="text-[8px] lg:text-xs px-1 lg:px-2 py-0 lg:py-0.5 bg-green-50 text-green-700 border-green-200">
                    Front Design
                  </Badge>
                )}
                {hasBackDesign && (
                  <Badge variant="outline" className="text-[8px] lg:text-xs px-1 lg:px-2 py-0 lg:py-0.5 bg-blue-50 text-blue-700 border-blue-200">
                    Back Design
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] lg:text-base text-muted-foreground">Starting at</p>
              <p className="text-[11px] lg:text-xl font-bold text-primary">${unitPrice.toFixed(2)}</p>
              <p className="text-[8px] lg:text-xs text-gray-400">Add $3.00 for 2XL+</p>
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

          {/* Pricing Summary - Only shown after calculation */}
          {hasCalculated && getTotalQuantity() > 0 && (
            <Card className="mb-4 lg:mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-3 lg:p-6">
                <div className="flex items-center gap-2 mb-3 lg:mb-4">
                  <div className="w-6 h-6 lg:w-8 lg:h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                  </div>
                  <h3 className="text-sm lg:text-xl font-semibold text-green-800">Order Summary</h3>
                </div>
                
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs lg:text-base text-green-700">Product:</span>
                    <span className="text-xs lg:text-base font-medium text-green-800">{productData.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs lg:text-base text-green-700">Color:</span>
                    <span className="text-xs lg:text-base font-medium text-green-800 capitalize">{selectedColor?.replace(/-/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs lg:text-base text-green-700">Design Type:</span>
                    <span className="text-xs lg:text-base font-medium text-green-800">
                      {(hasFrontDesign && hasBackDesign) ? 'Front + Back' : 'Front Only'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs lg:text-base text-green-700">Total Quantity:</span>
                    <span className="text-xs lg:text-base font-medium text-green-800">{getTotalQuantity()} items</span>
                  </div>
                  
                  {(() => {
                    const { regularQty, upchargeQty } = getSizeUpchargeInfo();
                    return (
                      <>
                        {regularQty > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs lg:text-base text-green-700">Standard sizes (S-XL):</span>
                            <span className="text-xs lg:text-base font-medium text-green-800">{regularQty} × ${unitPrice.toFixed(2)}</span>
                          </div>
                        )}
                        {upchargeQty > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs lg:text-base text-green-700">Large sizes (2XL-5XL):</span>
                            <span className="text-xs lg:text-base font-medium text-green-800">{upchargeQty} × ${(unitPrice + sizeUpcharge).toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  
                  <div className="border-t border-green-200 pt-2 lg:pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm lg:text-lg font-semibold text-green-800">Total Price:</span>
                      <span className="text-lg lg:text-2xl font-bold text-green-800">${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Fixed Bottom Button */}
        <div className="p-3 lg:p-8 pt-2 lg:pt-6 border-t border-border/20 bg-background">
          {!hasCalculated || getTotalQuantity() === 0 ? (
            <Button 
              className="w-full h-10 lg:h-16 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium text-sm lg:text-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={handleCalculatePricing}
            >
              CALCULATE PRICING →
            </Button>
          ) : (
            <Button 
              className="w-full h-10 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium text-sm lg:text-xl shadow-lg transition-all duration-300 hover:shadow-xl"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              ADD TO CART - ${totalPrice.toFixed(2)}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};