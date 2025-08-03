import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, ShoppingCart, Trash2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

interface CartPopupProps {
  children: React.ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
}

export const CartPopup = ({ children, onOpenChange }: CartPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };
  
  // Mock cart items - replace with actual cart state management
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Premium T-Shirt",
      color: "Navy Blue",
      size: "M",
      quantity: 2,
      price: 24.99,
      image: "/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png"
    },
    {
      id: "2", 
      name: "Classic Hoodie",
      color: "Black",
      size: "L",
      quantity: 1,
      price: 49.99,
      image: "/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png"
    },
    {
      id: "3",
      name: "Vintage Tank Top",
      color: "White",
      size: "S",
      quantity: 3,
      price: 19.99,
      image: "/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png"
    },
    {
      id: "4",
      name: "Designer Sweatshirt",
      color: "Gray",
      size: "XL",
      quantity: 1,
      price: 59.99,
      image: "/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png"
    },
    {
      id: "5",
      name: "Sport Jersey",
      color: "Red",
      size: "L",
      quantity: 2,
      price: 34.99,
      image: "/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png"
    },
    {
      id: "6",
      name: "Polo Shirt",
      color: "Green",
      size: "M",
      quantity: 1,
      price: 29.99,
      image: "/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png"
    },
    {
      id: "7",
      name: "Long Sleeve Tee",
      color: "Purple",
      size: "S",
      quantity: 4,
      price: 27.99,
      image: "/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png"
    }
  ]);

  const removeItem = (id: string) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] bg-background/95 backdrop-blur-md border-border/50 flex flex-col h-full">
        <SheetHeader className="space-y-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-semibold">Your Bag</SheetTitle>
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded-full">
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
              <ScrollArea className="flex-1 py-4 [&>[data-radix-scroll-area-viewport]]:max-h-96 scrollbar-hide">
                <div className="space-y-3 pr-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-1 min-w-0">
                        <h4 className="font-medium leading-tight text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {item.color} • Size {item.size}
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

              <div className="border-t border-border/50 pt-4 space-y-4 flex-shrink-0 pb-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="space-y-3">
                  {/* Express Checkout Options */}
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground text-center">Express checkout</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="h-10 px-3 bg-[#ffc439] hover:bg-[#e6b033] border-[#ffc439] hover:border-[#e6b033]"
                      >
                        <img 
                          src="/lovable-uploads/paypal-logo.png" 
                          alt="PayPal" 
                          className="h-4 object-contain"
                        />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-10 px-3 bg-[#5a31f4] hover:bg-[#4c28d4] border-[#5a31f4] hover:border-[#4c28d4]"
                      >
                        <img 
                          src="/lovable-uploads/40ae333d-fa55-46e1-b0cd-4fcc5daeba84.png" 
                          alt="Shop Pay" 
                          className="h-4 object-contain"
                        />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="h-10 px-3 bg-black hover:bg-gray-800 border-black hover:border-gray-800"
                      >
                        <img 
                          src="/lovable-uploads/apple-pay-logo.png" 
                          alt="Apple Pay" 
                          className="h-4 object-contain filter brightness-0 invert"
                        />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-10 px-3 bg-white hover:bg-gray-50 text-gray-900 border-gray-300 hover:border-gray-400"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white"
                    size="lg"
                  >
                    Checkout
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full"
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