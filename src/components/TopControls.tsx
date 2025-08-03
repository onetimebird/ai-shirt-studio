import { Button } from "@/components/ui/button";
import { ShoppingBag, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthModal } from "@/components/AuthModal";
import { CartPopup } from "@/components/CartPopup";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useCart } from "@/contexts/CartContext";

interface TopControlsProps {
  onAuthModalChange?: (isOpen: boolean) => void;
  onCartModalChange?: (isOpen: boolean) => void;
}

export const TopControls = ({ onAuthModalChange, onCartModalChange }: TopControlsProps = {}) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const { getTotalItems } = useCart();

  const totalItems = getTotalItems();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleAuthModalChange = (isOpen: boolean) => {
    setAuthModalOpen(isOpen);
    onAuthModalChange?.(isOpen);
  };

  const handleCartModalChange = (isOpen: boolean) => {
    setCartModalOpen(isOpen);
    onCartModalChange?.(isOpen);
  };

  return (
    <div className="bg-gradient-card border-b border-border px-4 py-3 shadow-glass backdrop-blur-sm">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png" 
            alt="CoolShirt.Ai Logo" 
            className="h-12 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-x-110 hover:scale-y-110"
          />
        </div>


        {/* Right Side - Cart, User, Theme */}
        <div className="flex items-center gap-3">
          <CartPopup onOpenChange={handleCartModalChange}>
            <Button 
              variant="glass" 
              size="default" 
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:before:animation-delay-0 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <>
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-foreground pointer-events-none">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    </>
                  )}
                </div>
                <span>Cart</span>
              </div>
            </Button>
          </CartPopup>
          {user ? (
            <Button 
              variant="glass" 
              size="default"
              onClick={handleSignOut}
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:before:animation-delay-0 hover:shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <User className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          ) : (
            <Button 
              variant="glass" 
              size="default"
              onClick={() => handleAuthModalChange(true)}
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:before:animation-delay-0 hover:shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <User className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex items-center justify-between gap-2 md:hidden">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png" 
            alt="CoolShirt.Ai Logo" 
            className="h-10 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-x-110 hover:scale-y-110"
          />
        </div>

        {/* Cart and User Actions */}
        <div className="flex items-center gap-2">
          {/* Cart and User Icons */}
           <CartPopup onOpenChange={handleCartModalChange}>
            <Button 
              variant="glass" 
              size="default"
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:before:animation-delay-0 hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <>
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-foreground pointer-events-none">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                  </>
                )}
              </div>
            </Button>
          </CartPopup>
          {user ? (
            <Button 
              variant="glass" 
              size="default"
              onClick={handleSignOut}
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <User className="w-5 h-5" />
            </Button>
          ) : (
            <Button 
              variant="glass" 
              size="default"
              onClick={() => handleAuthModalChange(true)}
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <User className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={handleAuthModalChange} />
    </div>
  );
};