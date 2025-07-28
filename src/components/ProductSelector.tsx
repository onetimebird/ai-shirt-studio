import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';

const products = [
  {
    id: 'gildan-2000',
    name: 'Gildan 2000',
    description: 'Ultra Cotton T-Shirt',
    type: 'T-Shirt',
    colors: ['White', 'Black', 'Navy', 'Red', 'Royal Blue', 'Forest Green'],
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
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{selectedProductData.name}</CardTitle>
              <Badge variant="outline">Selected</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{selectedProductData.description}</p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="relative">
                <img 
                  src={selectedProductData.image} 
                  alt={selectedProductData.name}
                  className="w-20 h-20 object-cover rounded-lg border-2 border-primary"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{selectedColor}</p>
                <p className="text-xs text-muted-foreground">{selectedProductData.price}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedProductData.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                        color === selectedColor 
                          ? 'border-primary ring-2 ring-primary/30' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      style={{ backgroundColor: colorMap[color] || '#ccc' }}
                      title={color}
                    />
                  ))}
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
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                product.id === selectedProduct 
                  ? 'border-primary bg-primary/5' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleProductSelect(product.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded border"
                  />
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
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
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
      <Card className="border-dashed border-2 border-muted-foreground/30">
        <CardContent className="p-6 text-center">
          <Plus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <h4 className="font-medium text-muted-foreground">Add Products</h4>
          <p className="text-xs text-muted-foreground mt-1">More products coming soon!</p>
        </CardContent>
      </Card>

      {/* Customization Method */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Customization Method</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-2 border-primary bg-primary/5 cursor-pointer">
            <CardContent className="p-4 text-center">
              <h4 className="font-medium">Printing</h4>
              <p className="text-xs text-muted-foreground mt-1">No Minimum</p>
            </CardContent>
          </Card>
          <Card className="border border-muted cursor-pointer hover:border-primary/50 transition-colors">
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