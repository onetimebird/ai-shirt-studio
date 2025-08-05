import { Button } from "@/components/ui/button";
import { ShoppingCart, User, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AuthModal } from "@/components/AuthModal";
import { CartPopup } from "@/components/CartPopup";
import { QuantityModal } from "@/components/QuantityModal";
import { SaveDesignModal } from "@/components/SaveDesignModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useCart } from "@/contexts/CartContext";
import { useDesign } from "@/contexts/DesignContext";
import { toast } from "sonner";

interface TopControlsProps {
  onAuthModalChange?: (isOpen: boolean) => void;
  onCartModalChange?: (isOpen: boolean) => void;
  selectedProduct?: string;
  selectedColor?: string;
}

export const TopControls = ({ onAuthModalChange, onCartModalChange, selectedProduct, selectedColor }: TopControlsProps = {}) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { currentDesignData } = useDesign();

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

  const handleNextStep = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to continue");
      return;
    }
    
    // Check if current design has objects that could be saved
    const canvas = (window as any).designCanvas?.canvas;
    const hasDesignObjects = canvas && canvas.getObjects().some((obj: any) => 
      obj.type !== 'image' || !obj.isBackground
    );
    
    // If there's a design but it's not saved (no currentDesignData.id), prompt to save first
    if (hasDesignObjects && !currentDesignData?.id) {
      toast.error("Please save your design before proceeding to checkout");
      setIsSaveModalOpen(true);
      return;
    }
    
    setIsQuantityModalOpen(true);
  };

  const getDesignData = () => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return null;
    
    return {
      canvasData: canvas.toJSON(),
      currentSide: (window as any).designCanvas?.currentSide || 'front',
      objects: canvas.getObjects().filter((obj: any) => obj.type !== 'image' || !obj.isBackground),
      productType: selectedProduct || 'gildan-64000',
      productColor: selectedColor || 'cherry-red'
    };
  };

  const generatePreviewImage = () => {
    const canvas = (window as any).designCanvas?.canvas;
    if (!canvas) return undefined;
    return canvas.toDataURL({ format: 'png', quality: 0.8 });
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
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:before:animation-delay-0 hover:shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center gap-2">
                {totalItems > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
                <ShoppingCart className="w-5 h-5" />
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
            className="h-8 w-auto object-contain cursor-pointer transition-all duration-300 hover:scale-x-110 hover:scale-y-110"
          />
        </div>

        {/* Center - Next Step Button (Mobile Only) */}
        <div className="flex-1 flex justify-center px-2">
          <Button 
            size="sm"
            onClick={handleNextStep}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 text-xs px-4 py-2 h-8"
          >
            <ArrowRight className="w-3 h-3 mr-1" strokeWidth={2.5} />
            Next
          </Button>
        </div>

        {/* Cart and User Actions */}
        <div className="flex items-center gap-1">
          {/* Cart and User Icons */}
           <CartPopup onOpenChange={handleCartModalChange}>
            <Button 
              variant="glass" 
              size="sm"
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:before:animation-delay-0 hover:shadow-lg hover:scale-105 transition-transform duration-300 p-2"
            >
              <div className="flex items-center gap-1">
                {totalItems > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium animate-pulse text-[10px]">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
                <ShoppingCart className="w-4 h-4" />
              </div>
            </Button>
          </CartPopup>
          {user ? (
            <Button 
              variant="glass" 
              size="sm"
              onClick={handleSignOut}
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300 p-2"
            >
              <User className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              variant="glass" 
              size="sm"
              onClick={() => handleAuthModalChange(true)}
              className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300 p-2"
            >
              <User className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <AuthModal open={authModalOpen} onOpenChange={handleAuthModalChange} />

      {/* Quantity Modal */}
      <QuantityModal 
        isOpen={isQuantityModalOpen}
        onClose={() => setIsQuantityModalOpen(false)}
        selectedProduct={selectedProduct || 'gildan-64000'}
        selectedColor={selectedColor || 'cherry-red'}
      />

      {/* Save Design Modal */}
      <SaveDesignModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        designData={getDesignData()}
        productType={selectedProduct || 'gildan-64000'}
        productColor={selectedColor || 'cherry-red'}
        previewImage={generatePreviewImage()}
      />
    </div>
  );
};