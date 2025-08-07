import { getAllColors } from '@/data/gildan2000Colors';
import { getAllColors as getAllColors64000 } from '@/data/gildan64000Colors';
import { getAllColors as getAllColorsBella } from '@/data/bellaColors';
import { getAllColors as getAllColorsBella6400 } from '@/data/bella6400Colors';
import { getAllColors as getAllColors18000 } from '@/data/gildan18000Colors';
import { getAllColors as getAllColors18500 } from '@/data/gildan18500Colors';
import { getAllColors as getAllColors3719 } from '@/data/bella3719Colors';

// Function to get the correct product image based on product and color
export const getProductImage = (productId: string, colorName: string): string => {
  const colorKey = colorName.toLowerCase().replace(/\s+/g, '-');
  
  switch (productId) {
    case 'gildan-2000':
      const gildan2000Color = getAllColors().find(c => c.name === colorKey);
      return gildan2000Color?.frontImage || "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png";
    
    case 'gildan-64000':
      const gildan64000Color = getAllColors64000().find(c => c.name === colorKey);
      return gildan64000Color?.frontImage || "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png";
    
    case 'bella-3001c':
      const bellaColor = getAllColorsBella().find(c => c.name === colorKey);
      return bellaColor?.frontImage || "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png";
    
    case 'bella-6400':
      const bella6400Color = getAllColorsBella6400().find(c => c.name === colorKey);
      return bella6400Color?.frontImage || "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png";
    
    case 'gildan-18000':
      const gildan18000Color = getAllColors18000().find(c => c.name === colorKey);
      return gildan18000Color?.frontImage || "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png";
    
    case 'gildan-18500':
      const gildan18500Color = getAllColors18500().find(c => c.name === colorKey);
      return gildan18500Color?.frontImage || "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png";
    
    case 'bella-3719':
      const bella3719Color = getAllColors3719().find(c => c.name === colorKey);
      return bella3719Color?.frontImage || "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png";
    
    default:
      return "/lovable-uploads/adad2959-903a-4b3a-864e-6bc78cf5bfa1.png";
  }
};