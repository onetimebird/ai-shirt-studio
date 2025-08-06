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
                      className="w-full h-8 md:h-10 bg-[#0070ba] hover:bg-[#005ea6] rounded-md transition-colors duration-200 flex items-center justify-center border-0"
                      onClick={() => {
                        console.log('PayPal checkout initiated');
                        // PayPal SDK integration would go here
                      }}
                      aria-label="Pay with PayPal"
                    >
                      <svg className="h-4 md:h-5 w-auto" viewBox="0 0 101 25" fill="none">
                        <path d="M12.017 0L12.99 0C17.793 0 21.516 1.581 23.527 4.552C25.355 7.29 24.862 10.972 22.48 15.193C19.829 19.954 15.5 22.5 10.274 22.5H7.741C6.85 22.5 6.097 23.15 5.985 24.029L4.915 31.096C4.839 31.638 4.405 32.04 3.856 32.04H0.139C-0.549 32.04 -1.035 31.382 -0.896 30.707L3.467 5.727C3.58 4.848 4.333 4.198 5.224 4.198H12.017V0Z" fill="white"/>
                        <path d="M35.045 0L36.018 0C40.821 0 44.544 1.581 46.555 4.552C48.383 7.29 47.89 10.972 45.508 15.193C42.857 19.954 38.528 22.5 33.302 22.5H30.769C29.878 22.5 29.125 23.15 29.013 24.029L27.943 31.096C27.867 31.638 27.433 32.04 26.884 32.04H23.167C22.479 32.04 21.993 31.382 22.132 30.707L26.495 5.727C26.608 4.848 27.361 4.198 28.252 4.198H35.045V0Z" fill="white"/>
                        <path d="M57.877 0C62.68 0 66.403 1.581 68.414 4.552C70.242 7.29 69.749 10.972 67.367 15.193C64.716 19.954 60.387 22.5 55.161 22.5H52.628C51.737 22.5 50.984 23.15 50.872 24.029L49.802 31.096C49.726 31.638 49.292 32.04 48.743 32.04H45.026C44.338 32.04 43.852 31.382 43.991 30.707L48.354 5.727C48.467 4.848 49.22 4.198 50.111 4.198H57.877V0Z" fill="white"/>
                      </svg>
                    </button>

                    {/* Apple Pay Button */}
                    <button
                      className="w-full h-8 md:h-10 bg-black hover:bg-gray-800 rounded-md transition-colors duration-200 flex items-center justify-center border-0"
                      onClick={() => {
                        console.log('Apple Pay checkout initiated');
                        // Apple Pay Web API integration would go here
                      }}
                      aria-label="Pay with Apple Pay"
                    >
                      <svg className="h-4 md:h-5 w-auto" viewBox="0 0 165 35" fill="none">
                        <rect width="165" height="35" rx="6" fill="black"/>
                        <path d="M19.0234 15.2305C18.9453 12.3633 21.3516 10.918 21.4688 10.8398C20.1797 8.91797 18.0781 8.64844 17.3359 8.625C15.5547 8.44531 13.8164 9.69922 12.9297 9.69922C12.0234 9.69922 10.6172 8.64844 9.125 8.67969C7.20313 8.71094 5.38281 9.83594 4.41406 11.6094C2.42969 15.2305 3.92188 20.6445 5.84375 23.6133C6.80469 25.0781 7.94531 26.7031 9.4375 26.6445C10.8984 26.5859 11.4688 25.7188 13.2422 25.7188C15.0156 25.7188 15.5547 26.6445 17.0781 26.6133C18.6406 26.5859 19.6328 25.1367 20.5938 23.6719C21.7344 21.9688 22.1875 20.293 22.2031 20.2148C22.1719 20.2031 19.1016 19.0625 19.0234 15.2305Z" fill="white"/>
                        <path d="M16.5625 6.92188C17.3359 5.96094 17.8438 4.66406 17.6953 3.35938C16.6094 3.40625 15.2734 4.07813 14.4688 5.03906C13.7344 5.89063 13.1172 7.23438 13.2891 8.49219C14.5078 8.58594 15.7578 7.89844 16.5625 6.92188Z" fill="white"/>
                        <text x="45" y="21" fill="white" fontSize="14" fontFamily="system-ui, -apple-system, sans-serif">Pay</text>
                      </svg>
                    </button>

                    {/* Google Pay Button */}
                    <button
                      className="w-full h-8 md:h-10 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-md transition-colors duration-200 flex items-center justify-center"
                      onClick={() => {
                        console.log('Google Pay checkout initiated');
                        // Google Pay API integration would go here
                      }}
                      aria-label="Pay with Google Pay"
                    >
                      <svg className="h-4 md:h-5 w-auto" viewBox="0 0 160 35" fill="none">
                        <rect width="160" height="35" rx="6" fill="white" stroke="#dadce0"/>
                        <path d="M60.3 16.6c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5.7 1.5 1.5 1.5 1.5-.7 1.5-1.5zm-4.2 0c0-1.5 1.2-2.7 2.7-2.7s2.7 1.2 2.7 2.7-1.2 2.7-2.7 2.7-2.7-1.2-2.7-2.7z" fill="#5f6368"/>
                        <text x="75" y="21" fill="#3c4043" fontSize="14" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="500">Pay</text>
                        <g transform="translate(15,10)">
                          <path d="M12.24 10.285c-1.218 0-2.213.995-2.213 2.213s.995 2.213 2.213 2.213 2.213-.995 2.213-2.213-.995-2.213-2.213-2.213z" fill="#34a853"/>
                          <path d="M22.1 10.285c-1.218 0-2.213.995-2.213 2.213s.995 2.213 2.213 2.213 2.213-.995 2.213-2.213-.995-2.213-2.213-2.213z" fill="#fbbc04"/>
                          <path d="M22.1 0.142c-1.218 0-2.213.995-2.213 2.213s.995 2.213 2.213 2.213 2.213-.995 2.213-2.213-.995-2.213-2.213-2.213z" fill="#ea4335"/>
                          <path d="M12.24 0.142c-1.218 0-2.213.995-2.213 2.213s.995 2.213 2.213 2.213 2.213-.995 2.213-2.213-.995-2.213-2.213-2.213z" fill="#4285f4"/>
                        </g>
                      </svg>
                    </button>

                    {/* Shop Pay Button */}
                    <button
                      className="w-full h-8 md:h-10 bg-[#5a31f4] hover:bg-[#4c28d4] rounded-md transition-colors duration-200 flex items-center justify-center border-0"
                      onClick={() => {
                        console.log('Shop Pay checkout initiated');
                        // Shop Pay integration would go here
                      }}
                      aria-label="Pay with Shop Pay"
                    >
                      <svg className="h-4 md:h-5 w-auto" viewBox="0 0 120 35" fill="none">
                        <rect width="120" height="35" rx="6" fill="#5a31f4"/>
                        <text x="25" y="21" fill="white" fontSize="14" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="600">Shop</text>
                        <text x="60" y="21" fill="white" fontSize="14" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="300">Pay</text>
                        <circle cx="12" cy="17.5" r="6" fill="white" opacity="0.9"/>
                        <path d="M12 14l2.5 2.5L12 19l-2.5-2.5L12 14z" fill="#5a31f4"/>
                      </svg>
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
                    className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white h-8 md:h-10 text-sm"
                  >
                    Checkout
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full h-7 md:h-9 text-xs md:text-sm"
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