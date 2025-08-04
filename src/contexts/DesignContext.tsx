import { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SavedDesign {
  id: string;
  name: string;
  design_data: any;
  product_type: string;
  product_color: string;
  preview_image?: string;
  created_at: string;
  updated_at: string;
}

interface DesignContextType {
  savedDesigns: SavedDesign[];
  currentDesignData: any;
  isLoading: boolean;
  saveDesign: (name: string, designData: any, productType: string, productColor: string, previewImage?: string) => Promise<void>;
  loadDesign: (designId: string) => Promise<SavedDesign | null>;
  deleteDesign: (designId: string) => Promise<void>;
  fetchSavedDesigns: () => Promise<void>;
  setCurrentDesignData: (data: any) => void;
  updateDesign: (designId: string, name: string, designData: any) => Promise<void>;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const useDesign = () => {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
};

interface DesignProviderProps {
  children: ReactNode;
}

export const DesignProvider = ({ children }: DesignProviderProps) => {
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);
  const [currentDesignData, setCurrentDesignData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const saveDesign = async (
    name: string, 
    designData: any, 
    productType: string, 
    productColor: string, 
    previewImage?: string
  ) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save designs');
        return;
      }

      const { data, error } = await supabase
        .from('saved_designs')
        .insert({
          user_id: user.id,
          name,
          design_data: designData,
          product_type: productType,
          product_color: productColor,
          preview_image: previewImage
        })
        .select()
        .single();

      if (error) throw error;

      setSavedDesigns(prev => [data, ...prev]);
      toast.success('Design saved successfully!');
    } catch (error) {
      console.error('Error saving design:', error);
      toast.error('Failed to save design');
    } finally {
      setIsLoading(false);
    }
  };

  const updateDesign = async (designId: string, name: string, designData: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_designs')
        .update({
          name,
          design_data: designData,
          updated_at: new Date().toISOString()
        })
        .eq('id', designId)
        .select()
        .single();

      if (error) throw error;

      setSavedDesigns(prev => 
        prev.map(design => design.id === designId ? data : design)
      );
      toast.success('Design updated successfully!');
    } catch (error) {
      console.error('Error updating design:', error);
      toast.error('Failed to update design');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDesign = async (designId: string): Promise<SavedDesign | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('id', designId)
        .single();

      if (error) throw error;

      const enrichedDesignData = {
        name: data.name,
        id: data.id,
        preview_image: data.preview_image
      };
      
      console.log('[DesignContext] Loading design:', {
        designId,
        designName: data.name,
        previewImage: data.preview_image,
        hasDesignData: !!data.design_data
      });
      
      // Merge with existing design data if it's an object
      if (data.design_data && typeof data.design_data === 'object') {
        Object.assign(enrichedDesignData, data.design_data);
      }
      
      console.log('[DesignContext] Final enriched design data:', enrichedDesignData);
      setCurrentDesignData(enrichedDesignData);
      return data;
    } catch (error) {
      console.error('Error loading design:', error);
      toast.error('Failed to load design');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDesign = async (designId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('saved_designs')
        .delete()
        .eq('id', designId);

      if (error) throw error;

      setSavedDesigns(prev => prev.filter(design => design.id !== designId));
      toast.success('Design deleted successfully!');
    } catch (error) {
      console.error('Error deleting design:', error);
      toast.error('Failed to delete design');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSavedDesigns = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_designs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setSavedDesigns(data || []);
    } catch (error) {
      console.error('Error fetching designs:', error);
      toast.error('Failed to load saved designs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DesignContext.Provider value={{
      savedDesigns,
      currentDesignData,
      isLoading,
      saveDesign,
      loadDesign,
      deleteDesign,
      fetchSavedDesigns,
      setCurrentDesignData,
      updateDesign
    }}>
      {children}
    </DesignContext.Provider>
  );
};