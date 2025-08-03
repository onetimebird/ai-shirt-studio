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
            size="default" 
            className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Cart
          </Button>
          <Button 
            variant="glass" 
            size="default"
            className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <User className="w-5 h-5 mr-2" />
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
            size="default"
            className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <ShoppingCart className="w-5 h-5" />
          </Button>
          <Button 
            variant="glass" 
            size="default"
            className="relative overflow-hidden hover:before:absolute hover:before:inset-0 hover:before:bg-gradient-to-r hover:before:from-transparent hover:before:via-gray-300/30 hover:before:to-transparent hover:before:-translate-x-full hover:before:animate-[shimmer_2.5s_ease-in-out_infinite] hover:shadow-lg hover:scale-105 transition-all duration-300"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>

    </div>
  );
};