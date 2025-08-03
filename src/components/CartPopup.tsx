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
              <ScrollArea className="flex-1 py-4">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-card/50 border border-border/50">
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <h4 className="font-medium leading-tight">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.color} • Size {item.size}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
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
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground text-center">Express checkout</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="h-12 bg-[#0070f3] hover:bg-[#0060df] text-white border-[#0070f3] hover:border-[#0060df]"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm1.262-8.13a.641.641 0 0 0 .633-.74L8.89 11.9c-.082-.518.35-.9.874-.9h2.19c4.298 0 7.664-1.747 8.647-6.797.03-.149.054-.294.077-.437.292-1.867-.002-3.137-1.012-4.287C18.554.543 16.546 0 13.976 0H6.516c-.524 0-.972.382-1.054.9L2.355 20.437a.641.641 0 0 0 .633.74h4.606l1.12-7.106c.082-.518.526-.9 1.05-.9h2.19z"/>
                        </svg>
                        PayPal
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-12 bg-[#5a31f4] hover:bg-[#4c28d4] text-white border-[#5a31f4] hover:border-[#4c28d4]"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.337 2.225c-.77-.13-1.573-.225-2.402-.225C9.73 2 7.47 4.26 7.47 7.465c0 2.74 1.892 5.045 4.43 5.045 1.378 0 2.63-.585 3.507-1.52l.945.945c-.877.935-2.129 1.52-3.507 1.52-2.538 0-4.43-2.305-4.43-5.045C8.415 4.26 10.675 2 13.88 2c.829 0 1.632.095 2.402.225L15.337 2.225z"/>
                        </svg>
                        Shop Pay
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        className="h-12 bg-black hover:bg-gray-800 text-white border-black hover:border-gray-800"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        Apple Pay
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-12 bg-white hover:bg-gray-50 text-gray-900 border-gray-300 hover:border-gray-400"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google Pay
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