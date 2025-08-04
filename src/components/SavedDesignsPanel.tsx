import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { useDesign } from '@/contexts/DesignContext';
import { Trash2, Eye, Edit, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

interface SavedDesignsPanelProps {
  onLoadDesign: (designData: any) => void;
  onClose: () => void;
}

export const SavedDesignsPanel = ({ onLoadDesign, onClose }: SavedDesignsPanelProps) => {
  const { savedDesigns, fetchSavedDesigns, deleteDesign, loadDesign, isLoading } = useDesign();

  useEffect(() => {
    fetchSavedDesigns();
  }, []);

  const handleLoadDesign = async (designId: string) => {
    console.log('[SavedDesignsPanel] Loading design:', designId);
    const design = await loadDesign(designId);
    console.log('[SavedDesignsPanel] Loaded design data:', design);
    if (design) {
      console.log('[SavedDesignsPanel] Calling onLoadDesign with:', design.design_data);
      onLoadDesign(design.design_data);
      onClose();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">Saved Designs</h3>
        <p className="text-sm text-muted-foreground">
          Load a previously saved design
        </p>
      </div>

      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : savedDesigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-muted-foreground mb-4">
              <Edit className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">No saved designs</p>
              <p className="text-sm">Start creating and save your first design!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {savedDesigns.map((design) => (
              <Card key={design.id} className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleLoadDesign(design.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{design.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="capitalize">{design.product_type}</span>
                        <span>•</span>
                        <span className="capitalize">{design.product_color}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(design.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoadDesign(design.id);
                        }}
                        className="h-8 w-8 p-0 bg-primary/10 hover:bg-primary/20"
                        title="Load Design"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Delete Design"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Design</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{design.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteDesign(design.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t">
        <Button variant="outline" onClick={onClose} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
};