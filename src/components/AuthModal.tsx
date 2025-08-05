import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useTheme } from "@/components/ThemeProvider";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to complete your signup.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Authentication Error", 
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const SocialButton = ({ 
    provider, 
    logoSrc, 
    label 
  }: { 
    provider: 'google' | 'facebook'; 
    logoSrc: string; 
    label: string; 
  }) => (
    <Button
      variant="outline"
      className="w-full justify-start gap-3 h-10 md:h-12 text-foreground border-border hover:bg-accent/50"
      onClick={() => handleSocialAuth(provider)}
    >
      <div className="w-5 h-5 flex items-center justify-center">
        <img src={logoSrc} alt={`${provider} logo`} className="w-5 h-5 object-contain" />
      </div>
      {label}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md mx-auto bg-background/95 backdrop-blur-sm border-border/50 max-h-[90vh] overflow-y-auto">
        <div className="space-y-2 md:space-y-3 p-1">
          {/* Company Logo */}
           <div className="flex justify-center py-2">
             <img 
               src="/lovable-uploads/16ccf455-e917-4c90-a109-a200491db97c.png" 
               alt="CoolShirt.Ai Logo" 
               className="h-8 md:h-12 w-auto object-contain"
             />
          </div>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              {isSignUp ? "Create Account" : "Welcome back"}
            </h2>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3 md:space-y-4">
            <div className="space-y-1 md:space-y-2">
              <Label htmlFor="email" className="text-sm">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-10 md:h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-1 md:space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">Password</Label>
                {!isSignUp && (
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs text-primary hover:text-primary/80 p-0 h-auto"
                    onClick={handleForgotPassword}
                  >
                    Forgot password?
                  </Button>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 h-10 md:h-12"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </Label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-10 md:h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              disabled={loading}
            >
              {loading ? "Please wait..." : (isSignUp ? "Create Account" : "Sign In")}
            </Button>
          </form>

          <div className="text-center py-4">
            <span className="text-sm text-muted-foreground">or continue with</span>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <SocialButton
              provider="google"
              logoSrc="/lovable-uploads/4ba5e67d-f81c-403f-9053-5f21f4555c31.png"
              label="Continue with Google"
            />
            <SocialButton
              provider="facebook" 
              logoSrc="/lovable-uploads/b13162d1-3f99-4a37-9aa9-2270208f101e.png"
              label="Continue with Facebook"
            />
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-10 md:h-12 text-foreground border-border hover:bg-accent/50"
              onClick={() => handleSocialAuth('apple')}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <img 
                  src={theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) 
                    ? "/lovable-uploads/0795ed3e-347a-489f-93c5-894f19bddf3f.png" 
                    : "/lovable-uploads/20987df2-74e1-4dc3-af61-a729a615d183.png"
                  } 
                  alt="Apple logo" 
                  className="w-5 h-5 object-contain" 
                />
              </div>
              Continue with Apple
            </Button>
          </div>

          {/* Toggle Sign In/Sign Up */}
          <div className="text-center pt-4">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {isSignUp ? (
                <>Already have an account? <span className="font-semibold">Sign In</span></>
              ) : (
                <>Don't have an account? <span className="font-semibold">Create one</span></>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}