
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
                      className="w-full h-10 md:h-12 bg-[#ffc439] hover:bg-[#ffb800] rounded-lg transition-colors duration-200 flex items-center justify-center border-0 font-bold"
                      onClick={() => {
                        console.log('PayPal checkout initiated');
                        // PayPal SDK integration would go here
                      }}
                      aria-label="Pay with PayPal"
                    >
                      <svg className="h-6 w-auto" viewBox="0 0 325 88" fill="none">
                        <path d="M71.3 12.3c-3.8-3.7-9.4-5.3-16.7-5.3H25c-1.3 0-2.4 1-2.6 2.2l-7.6 48.4c-.2.8.5 1.5 1.3 1.5h9.5l2.4-15.2v.4c.2-1.2 1.3-2.2 2.6-2.2h5.4c10.6 0 18.9-4.3 21.3-16.7 0-.2 0-.4.1-.6-.1 0-.1-.1 0-.1.8-5.5-.1-9.2-3.1-12.4z" fill="#003087"/>
                        <path d="M34.1 27.8c.2-1.2 1.3-2.2 2.6-2.2h13.6c1.6 0 3.1.1 4.5.3 1.4.2 2.7.5 3.9.9.6.2 1.2.4 1.7.7.5.2 1 .5 1.4.8.8.5 1.5 1.2 2 1.9 2.4 3.2 3.1 7.9 1.8 14.2-2.4 12.4-10.7 16.7-21.3 16.7h-5.4c-1.3 0-2.4 1-2.6 2.2L33 70.5c-.1.7.4 1.3 1.1 1.3h7.6c1.1 0 2.1-.8 2.3-1.9v-.2l1.4-9.1v-.3c.2-1.1 1.2-1.9 2.3-1.9h1.4c9.3 0 16.6-3.8 18.7-14.7.9-4.5.4-8.3-1.4-10.9-.6-.8-1.3-1.5-2.1-2-.8-.5-1.7-.9-2.7-1.2-1-.3-2.1-.5-3.2-.6-1.1-.1-2.3-.2-3.5-.2H39.7c-.7 0-1.3.3-1.7.8-.4.5-.7 1.1-.8 1.8l-2.6 16.5-.5 3.2z" fill="#0070ba"/>
                        <path d="M134.9 12.3c-3.8-3.7-9.4-5.3-16.7-5.3H88.6c-1.3 0-2.4 1-2.6 2.2l-7.6 48.4c-.2.8.5 1.5 1.3 1.5h9.8l-2.7 17.1c-.2.7.4 1.3 1.1 1.3h8.6c1.1 0 2.1-.8 2.3-1.9v-.2l1.6-10.1v-.3c.2-1.1 1.2-1.9 2.3-1.9h1.4c9.3 0 16.6-3.8 18.7-14.7.9-4.5.4-8.3-1.4-10.9-1.8-2.5-4.8-3.8-8.5-3.8z" fill="#003087"/>
                        <path d="M160.8 25.8c-.9 5.8-4.3 5.8-7.8 5.8h-2l1.4-8.8c.1-.7.7-1.2 1.3-1.2h1.1c2.9 0 5.6 0 7 1.7 1.1 1.3 1.3 3 .9 2.5zm-1.5-13.3H140c-1.1 0-2.1.8-2.3 1.9L130.5 62c-.1.7.4 1.3 1.1 1.3h6.9c.8 0 1.5-.6 1.6-1.3l2-12.7c.2-1.1 1.2-1.9 2.3-1.9h5.3c11 0 17.4-5.3 19-19.9.7-7.1-.1-12.7-2.7-16.7-2.8-4.4-7.8-6.7-14.4-6.7z" fill="#0070ba"/>
                        <path d="M187.3 25.8c-.9 5.8-4.3 5.8-7.8 5.8h-2l1.4-8.8c.1-.7.7-1.2 1.3-1.2h1.1c2.9 0 5.6 0 7 1.7 1.1 1.3 1.3 3 .9 2.5zm-1.5-13.3h-19.3c-1.1 0-2.1.8-2.3 1.9L157 62c-.1.7.4 1.3 1.1 1.3h7.4c1.1 0 2.1-.8 2.3-1.9l1.9-12.1c.2-1.1 1.2-1.9 2.3-1.9h5.3c11 0 17.4-5.3 19-19.9.7-7.1-.1-12.7-2.7-16.7-2.8-4.4-7.8-6.7-14.4-6.7z" fill="#003087"/>
                        <path d="M213.9 25.8c-.9 5.8-4.3 5.8-7.8 5.8h-2l1.4-8.8c.1-.7.7-1.2 1.3-1.2h1.1c2.9 0 5.6 0 7 1.7 1.1 1.3 1.3 3 .9 2.5zm-1.5-13.3h-19.3c-1.1 0-2.1.8-2.3 1.9L183.6 62c-.1.7.4 1.3 1.1 1.3h6.9c.8 0 1.5-.6 1.6-1.3l2-12.7c.2-1.1 1.2-1.9 2.3-1.9h5.3c11 0 17.4-5.3 19-19.9.7-7.1-.1-12.7-2.7-16.7-2.8-4.4-7.8-6.7-14.4-6.7z" fill="#0070ba"/>
                        <path d="M240.4 25.8c-.9 5.8-4.3 5.8-7.8 5.8h-2l1.4-8.8c.1-.7.7-1.2 1.3-1.2h1.1c2.9 0 5.6 0 7 1.7 1.1 1.3 1.3 3 .9 2.5zm-1.5-13.3h-19.3c-1.1 0-2.1.8-2.3 1.9L210.1 62c-.1.7.4 1.3 1.1 1.3h7.4c1.1 0 2.1-.8 2.3-1.9l1.9-12.1c.2-1.1 1.2-1.9 2.3-1.9h5.3c11 0 17.4-5.3 19-19.9.7-7.1-.1-12.7-2.7-16.7-2.8-4.4-7.8-6.7-14.4-6.7z" fill="#003087"/>
                        <path d="M266.9 25.8c-.9 5.8-4.3 5.8-7.8 5.8h-2l1.4-8.8c.1-.7.7-1.2 1.3-1.2h1.1c2.9 0 5.6 0 7 1.7 1.1 1.3 1.3 3 .9 2.5zm-1.5-13.3h-19.3c-1.1 0-2.1.8-2.3 1.9L236.6 62c-.1.7.4 1.3 1.1 1.3h6.9c.8 0 1.5-.6 1.6-1.3l2-12.7c.2-1.1 1.2-1.9 2.3-1.9h5.3c11 0 17.4-5.3 19-19.9.7-7.1-.1-12.7-2.7-16.7-2.8-4.4-7.8-6.7-14.4-6.7z" fill="#0070ba"/>
                        <path d="M293.4 25.8c-.9 5.8-4.3 5.8-7.8 5.8h-2l1.4-8.8c.1-.7.7-1.2 1.3-1.2h1.1c2.9 0 5.6 0 7 1.7 1.1 1.3 1.3 3 .9 2.5zm-1.5-13.3h-19.3c-1.1 0-2.1.8-2.3 1.9L263.1 62c-.1.7.4 1.3 1.1 1.3h7.4c1.1 0 2.1-.8 2.3-1.9l1.9-12.1c.2-1.1 1.2-1.9 2.3-1.9h5.3c11 0 17.4-5.3 19-19.9.7-7.1-.1-12.7-2.7-16.7-2.8-4.4-7.8-6.7-14.4-6.7z" fill="#0070ba"/>
                      </svg>
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
                      <svg className="h-6 w-auto" viewBox="0 0 165 35" fill="none">
                        <rect width="165" height="35" rx="4" fill="black"/>
                        <g transform="translate(20, 7)">
                          <path d="M8.9 5.7c-.1-1.4 1.1-2.3 1.1-2.3-.6-.9-1.6-1-1.9-1-.8-.1-1.6.5-2 .5s-.8-.5-1.4-.5c-.9 0-1.8.5-2.3 1.4-.9 1.5-.2 3.7.7 4.9.4.6.9 1.2 1.6 1.2.6 0 .8-.4 1.5-.4s.9.4 1.5.4c.6 0 1.1-.6 1.5-1.2.5-.7.7-1.4.7-1.4s-1.5-.6-1.5-2.3z" fill="white"/>
                          <path d="M7.4 3.6c.4-.5.7-1.2.6-1.9-.6 0-1.3.4-1.7.9-.4.4-.7 1.1-.6 1.7.7.1 1.3-.4 1.7-.7z" fill="white"/>
                        </g>
                        <text x="50" y="23" fill="white" fontSize="17" fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif" fontWeight="400">Pay</text>
                      </svg>
                    </button>

                    {/* Google Pay Button */}
                    <button
                      className="w-full h-10 md:h-12 bg-white hover:bg-gray-50 border border-gray-200 hover:shadow-sm rounded-lg transition-all duration-200 flex items-center justify-center"
                      onClick={() => {
                        console.log('Google Pay checkout initiated');
                        // Google Pay API integration would go here
                      }}
                      aria-label="Pay with Google Pay"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-[#4285f4] mr-0.5"></div>
                          <div className="w-3 h-3 rounded-full bg-[#ea4335] mr-0.5"></div>
                          <div className="w-3 h-3 rounded-full bg-[#fbbc04] mr-0.5"></div>
                          <div className="w-3 h-3 rounded-full bg-[#34a853]"></div>
                        </div>
                        <span className="text-gray-700 font-medium text-sm ml-1">Pay</span>
                      </div>
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
