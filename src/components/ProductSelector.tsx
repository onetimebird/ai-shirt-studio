import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getAllColors, getTotalColorCount, getAvailableColorCount } from '@/data/gildan2000Colors';

const products = [
  {
    id: 'gildan-2000',
    name: 'Gildan 2000',
    description: 'Ultra Cotton T-Shirt',
    type: 'T-Shirt',
    colors: getAllColors().map(color => color.label), // Use complete color list
    price: '$12.99',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
  },
  {
    id: 'gildan-64000',
    name: 'Gildan 64000',
    description: 'Softstyle T-Shirt',
    type: 'T-Shirt',
    colors: ['White', 'Black', 'Heather Grey', 'Navy', 'Red', 'Royal Blue'],
    price: '$11.99',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
  },
  {
    id: 'bella-3001c',
    name: 'Bella 3001C',
    description: 'Canvas Unisex Jersey Tee',
    type: 'T-Shirt',
    colors: ['White', 'Black', 'Heather Grey', 'Navy', 'Vintage Red', 'Forest'],
    price: '$13.99',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
  },
  {
    id: 'gildan-18500',
    name: 'Gildan 18500',
    description: 'Heavy Blend Hoodie',
    type: 'Hoodie',
    colors: ['White', 'Black', 'Dark Heather', 'Navy', 'Red', 'Royal Blue'],
    price: '$24.99',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop'
  },
  {
    id: 'bella-canvas-hoodie',
    name: 'Bella Canvas Hoodie',
    description: 'Canvas Unisex Hoodie',
    type: 'Hoodie',
    colors: ['White', 'Black', 'Heather Grey', 'Navy', 'Forest', 'Maroon'],
    price: '$26.99',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop'
  },
  {
    id: 'bella-3480',
    name: 'Bella 3480',
    description: 'Canvas Tank Top',
    type: 'Tank Top',
    colors: ['White', 'Black', 'Heather Grey', 'Navy', 'Red', 'Royal Blue'],
    price: '$9.99',
    image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200&h=200&fit=crop'
  },
  {
    id: 'bella-6004',
    name: 'Bella 6004',
    description: 'Women\'s The Favorite Tee',
    type: 'Women\'s T-Shirt',
    colors: ['White', 'Black', 'Heather Grey', 'Navy', 'Pink', 'Purple'],
    price: '$14.99',
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop'
  }
];

const colorMap: { [key: string]: string } = {
  'White': '#FFFFFF',
  'Black': '#000000',
  'Navy': '#000080',
  'Red': '#DC2626',
  'Royal Blue': '#1D4ED8',
  'Forest Green': '#15803D',
  'Forest': '#15803D',
  'Heather Grey': '#9CA3AF',
  'Dark Heather': '#6B7280',
  'Vintage Red': '#B91C1C',
  'Maroon': '#7C2D12',
  'Pink': '#EC4899',
  'Purple': '#8B5CF6'
};

interface ProductSelectorProps {
  selectedProduct?: string;
  selectedColor?: string;
  onProductChange?: (productId: string) => void;
  onColorChange?: (color: string) => void;
}

export function ProductSelector({ 
  selectedProduct = 'bella-3001c', 
  selectedColor = 'White',
  onProductChange,
  onColorChange 
}: ProductSelectorProps) {
  // Use the props directly instead of internal state
  const selectedProductData = products.find(p => p.id === selectedProduct);

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Set first available color when switching products
      const firstColor = product.colors[0];
      onProductChange?.(productId);
      onColorChange?.(firstColor);
      toast.success(`Switched to ${product.name}`);
    }
  };

  const handleColorSelect = (color: string) => {
    onColorChange?.(color);
    toast.success(`Color changed to ${color}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <Badge variant="secondary" className="text-xs">PRODUCTS</Badge>
        <h2 className="text-2xl font-bold">Manage Your Products</h2>
        <p className="text-muted-foreground text-sm">
          You can select multiple products and colors.
        </p>
      </div>

      {/* Current Selection */}
      {selectedProductData && (
        <Card className="border-2 border-primary bg-gradient-premium/10 shimmer-hover">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">{selectedProductData.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{selectedProductData.description}</p>
              </div>
              <div className="relative">
                <Badge 
                  variant="outline" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg animate-pulse font-semibold px-4 py-2"
                >
                  ✨ Selected
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg capitalize">{selectedColor?.toLowerCase().replace(/-/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">{selectedProductData.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedProductData.id === 'gildan-2000' ? 
                      `${getAvailableColorCount()} of ${getTotalColorCount()} colors available` : 
                      `${selectedProductData.colors.length} colors available`
                    }
                  </p>
                </div>
              </div>
              
              {/* Enhanced Color Swatches Grid */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4 text-lg">Choose Your Color</h4>
                <div className="grid grid-cols-8 gap-3 p-4 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border shadow-inner">
                  {selectedProductData.id === 'gildan-2000' ? (
                    // Enhanced Gildan 2000 color swatches
                    getAllColors().map((colorData) => (
                      <div 
                        key={colorData.name}
                        className="relative group"
                      >
                        <button
                          onClick={() => colorData.available ? handleColorSelect(colorData.name) : toast.info(`${colorData.label} coming soon!`)}
                          className={`w-12 h-12 rounded-full border-3 transition-all duration-500 hover:scale-125 transform relative overflow-hidden group ${
                            colorData.name === selectedColor 
                              ? 'border-white ring-4 ring-purple-400 shadow-2xl scale-110 z-10' 
                              : 'border-gray-300 hover:border-purple-300 hover:shadow-xl hover:z-10'
                          } ${!colorData.available ? 'opacity-60 cursor-not-allowed hover:scale-100' : 'hover:shadow-xl'}`}
                          style={{ 
                            backgroundColor: colorData.value,
                            boxShadow: colorData.name === selectedColor ? 
                              `0 0 30px ${colorData.value}40, 0 8px 32px rgba(0,0,0,0.3)` : 
                              `0 4px 15px ${colorData.value}30`
                          }}
                          title={`${colorData.label}${!colorData.available ? ' (Coming Soon)' : ''}`}
                          disabled={!colorData.available}
                        >
                          {/* Selection indicator */}
                          {colorData.name === selectedColor && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-2.5 h-2.5 text-purple-600" />
                              </div>
                            </div>
                          )}
                          
                          {/* Unavailable overlay */}
                          {!colorData.available && (
                            <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                          )}
                          
                          {/* Hover tooltip */}
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                            {colorData.label}
                            {!colorData.available && ' (Coming Soon)'}
                          </div>
                        </button>
                      </div>
                    ))
                  ) : (
                    // Enhanced swatches for other products
                    selectedProductData.colors.map((color) => (
                      <div 
                        key={color}
                        className="relative group"
                      >
                        <button
                          onClick={() => handleColorSelect(color)}
                          className={`w-12 h-12 rounded-full border-3 transition-all duration-500 hover:scale-125 transform relative overflow-hidden ${
                            color === selectedColor 
                              ? 'border-white ring-4 ring-purple-400 shadow-2xl scale-110 z-10' 
                              : 'border-gray-300 hover:border-purple-300 hover:shadow-xl hover:z-10'
                          }`}
                          style={{ 
                            backgroundColor: colorMap[color] || '#ccc',
                            boxShadow: color === selectedColor ? 
                              `0 0 30px ${colorMap[color] || '#ccc'}40, 0 8px 32px rgba(0,0,0,0.3)` : 
                              `0 4px 15px ${colorMap[color] || '#ccc'}30`
                          }}
                          title={color}
                        >
                          {/* Selection indicator */}
                          {color === selectedColor && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <Check className="w-2.5 h-2.5 text-purple-600" />
                              </div>
                            </div>
                          )}
                          
                          {/* Hover tooltip */}
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none">
                            {color}
                          </div>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Grid */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Available Products</h3>
        <div className="grid gap-3">
          {products.map((product) => (
            <Card 
              key={product.id} 
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                product.id === selectedProduct 
                  ? 'border-primary bg-gradient-premium/10 shadow-elevated shimmer-hover' 
                  : 'hover:border-primary/50 hover:shadow-glass bg-gradient-sidebar'
              }`}
              onClick={() => handleProductSelect(product.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{product.name}</h4>
                      <Badge variant="secondary" className="text-xs">{product.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{product.description}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-medium text-primary">{product.price}</span>
                      <span className="text-xs text-muted-foreground">{product.colors.length} colors</span>
                    </div>
                  </div>
                  {product.id === selectedProduct && (
                    <div className="w-5 h-5 bg-gradient-premium rounded-full flex items-center justify-center shadow-glow gentle-pulse">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Products Section */}
      <Card className="border-dashed border-2 border-muted-foreground/30 hover:border-primary/50 transition-all duration-300 hover:shadow-glass cursor-pointer">
        <CardContent className="p-6 text-center">
          <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2 icon-hover gentle-pulse" />
          <h4 className="font-medium text-muted-foreground">Add Products</h4>
          <p className="text-xs text-muted-foreground mt-1">More products coming soon!</p>
        </CardContent>
      </Card>

      {/* Customization Method */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Customization Method</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-2 border-primary bg-gradient-premium/10 cursor-pointer hover:shadow-elevated transform hover:scale-105 transition-all duration-300 shimmer-hover">
            <CardContent className="p-4 text-center">
              <h4 className="font-medium">Printing</h4>
              <p className="text-xs text-muted-foreground mt-1">No Minimum</p>
            </CardContent>
          </Card>
          <Card className="border border-muted cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-glass transform hover:scale-105 bg-gradient-sidebar">
            <CardContent className="p-4 text-center">
              <h4 className="font-medium text-muted-foreground">Embroidery</h4>
              <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}