import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  designName: string;
  designUrl: string;
}

export const ShareDesignModal = ({
  isOpen,
  onClose,
  designName,
  designUrl
}: ShareDesignModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(designUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Design link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out my design: ${designName}`);
    const body = encodeURIComponent(`I created this awesome design and wanted to share it with you!\n\n${designUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleFacebookShare = () => {
    const url = encodeURIComponent(designUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(`Check out my awesome t-shirt design: ${designName}`);
    const url = encodeURIComponent(designUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
  };

  const handleInstagramShare = () => {
    // Instagram doesn't have direct URL sharing, so we'll copy the link and guide user
    handleCopyLink();
    toast({
      title: "Link copied for Instagram",
      description: "Paste this link in your Instagram bio or story!",
    });
  };

  const handleContinueToPricing = () => {
    // This would navigate to pricing page or cart
    toast({
      title: "Coming soon",
      description: "Pricing functionality will be available soon!",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-background via-background to-background/95 border-primary/20">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
        
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Share your design
          </DialogTitle>
          <DialogDescription className="text-base">
            Your design "{designName}" has been saved and emailed to you.{' '}
            <br />Copy your design link below and share with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Copy Link Section */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={designUrl}
                readOnly
                className="flex-1 bg-muted/50 border-primary/20"
              />
              <Button 
                onClick={handleCopyLink}
                className="bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground px-6"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="glass"
                size="lg"
                className="w-16 h-16 rounded-xl bg-muted/50 hover:bg-muted border-primary/20"
                onClick={handleEmailShare}
              >
                <Mail size={64} />
              </Button>
              <span className="text-sm text-muted-foreground">Email</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="glass"
                size="lg"
                className="w-16 h-16 rounded-xl bg-muted/50 hover:bg-muted border-primary/20"
                onClick={handleFacebookShare}
              >
                <Facebook size={64} />
              </Button>
              <span className="text-sm text-muted-foreground">Share</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="glass"
                size="lg"
                className="w-16 h-16 rounded-xl bg-muted/50 hover:bg-muted border-primary/20"
                onClick={handleTwitterShare}
              >
                <Twitter size={64} />
              </Button>
              <span className="text-sm text-muted-foreground">Tweet</span>
            </div>

            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="glass"
                size="lg"
                className="w-16 h-16 rounded-xl bg-muted/50 hover:bg-muted border-primary/20"
                onClick={handleInstagramShare}
              >
                <Instagram size={64} />
              </Button>
              <span className="text-sm text-muted-foreground">Pin</span>
            </div>
          </div>

          {/* Continue to Pricing Button */}
          <Button 
            onClick={handleContinueToPricing}
            className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground py-6 text-lg font-semibold rounded-xl"
          >
            Continue to Pricing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};