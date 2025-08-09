import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDesign } from '@/contexts/DesignContext';
import { Loader2 } from 'lucide-react';

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  designData: any;
  productType: string;
  productColor: string;
  previewImage?: string;
}

export const SaveDesignModal = ({
  isOpen,
  onClose,
  designData,
  productType,
  productColor,
  previewImage
}: SaveDesignModalProps) => {
  const [designName, setDesignName] = useState('');
  const { saveDesign, isLoading } = useDesign();

  const handleSave = async () => {
    if (!designName.trim()) return;
    
    await saveDesign(designName, designData, productType, productColor, previewImage);
    setDesignName('');
    onClose();
  };

  const handleClose = () => {
    setDesignName('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Design</DialogTitle>
          <DialogDescription>
            Give your design a name so you can easily find it later.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              placeholder="Enter design name..."
              className="col-span-3"
              maxLength={50}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!designName.trim() || isLoading}
            className="bg-gradient-primary hover:bg-gradient-primary/90"
          >
            <img src="/icons/save.png" className="w-4 h-4 mr-2 filter brightness-0 invert dark:brightness-0 dark:invert" alt="Save" />
            Save Design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};