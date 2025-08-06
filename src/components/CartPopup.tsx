
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartPopupProps {
  children: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
}

export const CartPopup = ({ children, onOpenChange }: CartPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCart();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] bg-background/95 backdrop-blur-md border-border/50 flex flex-col h-full pr-12">
        <SheetHeader className="space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base md:text-lg font-semibold">Your Bag</SheetTitle>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary text-xs md:text-sm px-2 py-1 rounded-full">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>
          <Separator />
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Your bag is empty</h3>
              <p className="text-muted-foreground mb-6">Start designing and add some products to your bag!</p>
              <Button 
                variant="default" 
                onClick={() => setIsOpen(false)}
                className="bg-gradient-primary hover:bg-gradient-primary/90"
              >
                Keep Designing
              </Button>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 py-4 scrollbar-hide">
                <div className="space-y-3 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border/50 hover:bg-primary/10 hover:border-primary/30 dark:hover:bg-primary/20 dark:hover:border-primary/40 transition-all duration-200 cursor-pointer">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={item.designData?.previewImage || item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-1 min-w-0">
                        <h4 className="font-medium leading-tight text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.designName && `${item.designName} • `}{item.color} • Size {item.size}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-5 w-5 p-0 text-xs"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="text-xs w-5 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-5 w-5 p-0 text-xs"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="border-t border-border/50 pt-3 space-y-3 flex-shrink-0 pb-2">
                <div className="flex justify-between items-center text-base md:text-lg font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="space-y-2">
                  {/* Express Checkout Options */}
                  <div className="space-y-2">
                    <p className="text-[10px] md:text-xs text-muted-foreground text-center">Express checkout</p>
                    
                    {/* PayPal Button */}
                    <button
                      className="w-full h-10 md:h-12 bg-[#ffc439] hover:bg-[#ffb800] rounded-lg transition-colors duration-200 flex items-center justify-center border-0"
                      onClick={() => {
                        console.log('PayPal checkout initiated');
                        // PayPal SDK integration would go here
                      }}
                      aria-label="Pay with PayPal"
                    >
                      <img 
                        src="/lovable-uploads/8dcd71a2-b267-4ef6-b9f7-7140434f5c9b.png" 
                        alt="PayPal" 
                        className="h-5 w-auto"
                      />
                    </button>

                    {/* Apple Pay Button */}
                    <button
                      className="w-full h-10 md:h-12 bg-black hover:bg-gray-800 rounded-lg transition-colors duration-200 flex items-center justify-center border-0"
                      onClick={() => {
                        console.log('Apple Pay checkout initiated');
                        // Apple Pay Web API integration would go here
                      }}
                      aria-label="Pay with Apple Pay"
                    >
                      <img 
                        src="/lovable-uploads/874ee8ca-08a3-4fa5-bd7a-10fb110f4bcf.png" 
                        alt="Apple Pay" 
                        className="h-5 w-auto"
                      />
                    </button>

                    {/* Google Pay Button */}
                    <button
                      className="w-full h-10 md:h-12 bg-black hover:bg-gray-800 border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200 flex items-center justify-center"
                      onClick={() => {
                        console.log('Google Pay checkout initiated');
                        // Google Pay API integration would go here
                      }}
                      aria-label="Pay with Google Pay"
                    >
                      <img 
                        src="/lovable-uploads/e4a53d90-7cc0-4f5e-a40b-d2eadf224294.png" 
                        alt="Google Pay" 
                        className="h-5 w-auto"
                      />
                    </button>

                    {/* Shop Pay Button */}
                    <button
                      className="w-full h-10 md:h-12 bg-[#5a31f4] hover:bg-[#4c28d4] rounded-lg transition-colors duration-200 flex items-center justify-center border-0"
                      onClick={() => {
                        console.log('Shop Pay checkout initiated');
                        // Shop Pay integration would go here
                      }}
                      aria-label="Pay with Shop Pay"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="h-5 w-auto mr-1" viewBox="0 0 40 40" fill="none">
                          <circle cx="20" cy="20" r="20" fill="white"/>
                          <path d="M20 8l6 6-6 6-6-6z" fill="#5a31f4"/>
                        </svg>
                        <span className="text-white font-semibold text-sm">Shop</span>
                        <span className="text-white/80 font-normal text-sm ml-1">Pay</span>
                      </div>
                    </button>
                  </div>
                  
                  <div className="relative my-2 md:my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-[10px] md:text-xs uppercase">
                      <span className="px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white h-10 md:h-12 text-sm"
                  >
                    Checkout
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full h-9 md:h-10 text-xs md:text-sm"
                    onClick={() => handleOpenChange(false)}
                  >
                    Keep Designing
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
