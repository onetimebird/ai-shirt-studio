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
                      <svg className="h-4 md:h-5 w-auto" viewBox="0 0 124 32" fill="none">
                        <path d="M46.211 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM47.117 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM66.654 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM84.096 6.749h-6.839a.95.95 0 0 0-.939.802l-2.766 17.537a.57.57 0 0 0 .564.658h3.265a.95.95 0 0 0 .939-.803l.746-4.73a.95.95 0 0 1 .938-.803h2.165c4.505 0 7.105-2.18 7.784-6.5.306-1.89.013-3.375-.872-4.415-.972-1.142-2.696-1.746-4.985-1.746zM85.002 13.154c-.374 2.454-2.249 2.454-4.062 2.454h-1.032l.724-4.583a.57.57 0 0 1 .563-.481h.473c1.235 0 2.4 0 3.002.704.359.42.469 1.044.332 1.906zM104.539 13.075h-3.275a.57.57 0 0 0-.563.481l-.145.916-.229-.332c-.709-1.029-2.29-1.373-3.868-1.373-3.619 0-6.71 2.741-7.312 6.586-.313 1.918.132 3.752 1.22 5.031.998 1.176 2.426 1.666 4.125 1.666 2.916 0 4.533-1.875 4.533-1.875l-.146.91a.57.57 0 0 0 .562.66h2.95a.95.95 0 0 0 .939-.803l1.77-11.209a.568.568 0 0 0-.561-.658zm-4.565 6.374c-.316 1.871-1.801 3.127-3.695 3.127-.951 0-1.711-.305-2.199-.883-.484-.574-.668-1.391-.514-2.301.295-1.855 1.805-3.152 3.67-3.152.93 0 1.686.309 2.184.892.499.589.697 1.411.554 2.317zM115.32 7.537l-2.807 17.858a.57.57 0 0 0 .563.658h2.764a.95.95 0 0 0 .938-.803l2.766-17.537a.57.57 0 0 0-.562-.658h-3.099a.57.57 0 0 0-.563.482z" fill="white"/>
                        <path d="M7.266 29.154l.523-3.322-1.165-.027H1.061L4.927 1.292a.316.316 0 0 1 .314-.268h9.38c3.114 0 5.263.648 6.385 1.927.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644l-.012.077v.676l.526.298a3.69 3.69 0 0 1 1.065.812c.45.513.741 1.165.864 1.938.127.795.085 1.741-.123 2.812-.24 1.232-.628 2.305-1.152 3.183a6.547 6.547 0 0 1-1.825 2.17c-.696.494-1.523.838-2.458 1.027-.906.183-1.928.276-3.034.276h-.719c-.518 0-1.018.196-1.403.54a1.74 1.74 0 0 0-.48 1.314l-.035.183-.48 3.039-.024.125a.537.537 0 0 1-.516.417H7.266z" fill="#253b80"/>
                        <path d="M23.048 7.667c-.028.179-.065.264-.111.548-.737 3.759-3.009 5.036-5.987 5.036h-1.517c-.329 0-.612.24-.66.569l-.477 3.622-.184 1.162-.022.125a.537.537 0 0 1-.516.417H7.266l-.523 3.322-.027.184a.498.498 0 0 0 .492.569h3.852c.304 0 .563-.221.612-.513l.024-.125.477-3.025.03-.164a.671.671 0 0 1 .612-.513h.384c2.749 0 4.904-1.119 5.533-4.357.262-1.355.126-2.489-.523-3.234a2.732 2.732 0 0 0-.659-.592z" fill="#179bd7"/>
                        <path d="M21.754 7.151a9.757 9.757 0 0 0-1.203-.267 15.284 15.284 0 0 0-2.426-.177h-7.352a.672.672 0 0 0-.611.513l-1.463 9.27-.035.183a.498.498 0 0 1 .595-.513h1.517c2.978 0 5.25-1.277 5.987-5.036.046-.284.083-.369.111-.548a3.432 3.432 0 0 1 .659-.592 2.732 2.732 0 0 1 .523 3.234c-.629 3.238-2.784 4.357-5.533 4.357h-.384a.671.671 0 0 0-.612.513l-.03.164-.477 3.025-.024.125a.498.498 0 0 1-.492.569h-3.852.523l.523-3.322H7.266a.537.537 0 0 0 .516-.417l.022-.125.184-1.162.477-3.622c.048-.329.331-.569.66-.569h1.517c2.978 0 5.25-1.277 5.987-5.036.737-3.759 3.009-5.036 5.987-5.036h1.517c.518 0 1.018-.196 1.403-.54a1.74 1.74 0 0 1 .48-1.314l.035-.183c0-.329.331-.569.66-.569h7.352c.91 0 1.733.067 2.426.177.402.064.774.149 1.203.267.264.073.512.162.746.267a4.78 4.78 0 0 1 1.183.915c.526.6.861 1.227 1.023 1.917.17.724.173 1.589.007 2.644-.737 3.759-3.009 5.036-5.987 5.036h-1.517c-.329 0-.612.24-.66.569l-.477 3.622-.184 1.162-.022.125a.537.537 0 0 1-.516.417H21.266z" fill="#222d65"/>
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
                      className="w-full h-8 md:h-10 bg-white hover:bg-gray-50 border border-gray-200 hover:shadow-sm rounded-md transition-all duration-200 flex items-center justify-center"
                      onClick={() => {
                        console.log('Google Pay checkout initiated');
                        // Google Pay API integration would go here
                      }}
                      aria-label="Pay with Google Pay"
                      style={{ minHeight: '40px' }}
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
                      className="w-full h-8 md:h-10 bg-[#5a31f4] hover:bg-[#4c28d4] rounded-md transition-colors duration-200 flex items-center justify-center border-0"
                      onClick={() => {
                        console.log('Shop Pay checkout initiated');
                        // Shop Pay integration would go here
                      }}
                      aria-label="Pay with Shop Pay"
                    >
                      <div className="flex items-center justify-center">
                        <svg className="h-4 md:h-5 w-auto mr-1" viewBox="0 0 40 40" fill="none">
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