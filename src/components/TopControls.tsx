import { Button } from "@/components/ui/button";
import { ShoppingCart, User } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const TopControls = () => {

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
          <Button 
            variant="glass" 
            size="sm" 
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Cart
          </Button>
          <Button 
            variant="glass" 
            size="sm"
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <User className="w-4 h-4 mr-1" />
            Sign In
          </Button>
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
          <Button 
            variant="glass" 
            size="sm"
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
          <Button 
            variant="glass" 
            size="sm"
            className="relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full before:animate-[shimmer_3s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>

    </div>
  );
};