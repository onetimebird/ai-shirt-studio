import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { getAllColors, getTotalColorCount, getAvailableColorCount } from '@/data/gildan2000Colors';
import { getAllColors as getAllColors64000, getTotalColorCount as getTotalColorCount64000, getAvailableColorCount as getAvailableColorCount64000 } from '@/data/gildan64000Colors';
import { getAllColors as getAllColorsBella, getTotalColorCount as getTotalColorCountBella, getAvailableColorCount as getAvailableColorCountBella } from '@/data/bellaColors';
import { getAllColors as getAllColorsBella6400, getTotalColorCount as getTotalColorCountBella6400, getAvailableColorCount as getAvailableColorCountBella6400 } from '@/data/bella6400Colors';
import { getAllColors as getAllColors18000, getTotalColorCount as getTotalColorCount18000, getAvailableColorCount as getAvailableColorCount18000 } from '@/data/gildan18000Colors';
import { getAllColors as getAllColors18500, getTotalColorCount as getTotalColorCount18500, getAvailableColorCount as getAvailableColorCount18500 } from '@/data/gildan18500Colors';
import { getAllColors as getAllColors3719, getTotalColorCount as getTotalColorCount3719, getAvailableColorCount as getAvailableColorCount3719 } from '@/data/bella3719Colors';

const products = [
  {
    id: 'gildan-2000',
    name: 'Gildan 2000 Ultra Cotton',
    description: 'Ultra Cotton T-Shirt',
    type: 'T-Shirt',
    colors: getAllColors().map(color => color.label), // Use complete color list
    frontOnlyPrice: 12.95,
    frontBackPrice: 18.95,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
  },
  {
    id: 'gildan-64000',
    name: 'Gildan 64000 Softstyle',
    description: 'Softstyle T-Shirt',
    type: 'T-Shirt',
    colors: getAllColors64000().map(color => color.label), // Use complete color list
    frontOnlyPrice: 13.95,
    frontBackPrice: 19.95,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
  },
  {
    id: 'bella-3001c',
    name: 'Bella 3001C Premium',
    description: 'Premium Unisex Jersey Tee',
    type: 'T-Shirt',
    colors: getAllColorsBella().map(color => color.label), // Use complete color list
    frontOnlyPrice: 15.95,
    frontBackPrice: 21.95,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'
  },
  {
    id: 'bella-6400',
    name: 'Bella 6400 Women\'s Tee',
    description: 'Women\'s Relaxed Tee',
    type: 'Women\'s T-Shirt',
    colors: getAllColorsBella6400().map(color => color.label), // Use complete color list
    frontOnlyPrice: 16.95,
    frontBackPrice: 22.95,
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=200&h=200&fit=crop'
  },
  {
    id: 'gildan-18000',
    name: 'Gildan 18000 Crewneck',
    description: 'Heavy Blend Crewneck Sweatshirt',
    type: 'Sweatshirt',
    colors: getAllColors18000().map(color => color.label), // Use complete color list
    frontOnlyPrice: 24.95,
    frontBackPrice: 30.95,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop'
  },
  {
    id: 'gildan-18500',
    name: 'Gildan 18500 Hoodie',
    description: 'Heavy Blend Hoodie',
    type: 'Hoodie',
    colors: getAllColors18500().map(color => color.label), // Use complete color list
    frontOnlyPrice: 27.95,
    frontBackPrice: 33.95,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop'
  },
  {
    id: 'bella-3719',
    name: 'Bella 3719 Premium Hoodie',
    description: 'Premium Unisex Hoodie',
    type: 'Premium Hoodie',
    colors: getAllColors3719().map(color => color.label), // Use complete color list
    frontOnlyPrice: 49.95,
    frontBackPrice: 55.95,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=200&h=200&fit=crop'
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

  // Helper function to format price display
  const formatPriceDisplay = (product: typeof products[0]) => {
    return `From $${product.frontOnlyPrice.toFixed(2)}`;
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      // Set first available color when switching products
      const firstColor = product.colors[0];
      onProductChange?.(productId);
      onColorChange?.(firstColor);
      toast.success(`Switched to ${product.name}`);
      
      // DEBUG: Let's see what scroll containers actually exist
      console.log('=== DEBUGGING SCROLL CONTAINERS ===');
      console.log('All elements with overflow-y-auto:', document.querySelectorAll('[class*="overflow-y-auto"]'));
      console.log('All elements with data-state="open":', document.querySelectorAll('[data-state="open"]'));
      console.log('Sheet content elements:', document.querySelectorAll('[class*="SheetContent"]'));
      console.log('Current scroll positions:', {
        window: window.scrollY,
        body: document.body.scrollTop,
        documentElement: document.documentElement.scrollTop
      });
      
      // Try all possible scroll targets and log results
      const targets = [
        { name: 'window', element: window },
        { name: 'mobile sheet', element: document.querySelector('[data-state="open"] .overflow-y-auto.h-full') },
        { name: 'right panel', element: document.querySelector('.w-full.lg\\:w-80.bg-card.border-l.border-border.overflow-y-auto') },
        { name: 'sheet content', element: document.querySelector('[data-state="open"]') },
        { name: 'any overflow-auto', element: document.querySelector('.overflow-y-auto') }
      ];
      
      targets.forEach(target => {
        console.log(`${target.name}:`, target.element);
        if (target.element) {
          if (target.name === 'window') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            (target.element as Element).scrollTo({ top: 0, behavior: 'smooth' });
          }
          console.log(`Attempted scroll on ${target.name}`);
        }
      });
    }
  };

  const handleColorSelect = (color: string) => {
    onColorChange?.(color);
    toast.success(`Color changed to ${color}`);
  };

  return (
    <div className="space-y-6 max-h-screen overflow-y-auto pb-4 scrollbar-hide">
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
            <div className="text-center mb-4">
              <Badge 
                variant="outline" 
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none shadow-lg animate-pulse font-semibold px-4 py-2"
              >
                ✨ Selected
              </Badge>
            </div>
            <div className="text-center">
              <CardTitle className="text-xl font-bold">{selectedProductData.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{selectedProductData.description}</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg capitalize">{selectedColor?.toLowerCase().replace(/-/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">{formatPriceDisplay(selectedProductData)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedProductData.id === 'gildan-2000' ? 
                      `${getAvailableColorCount()} of ${getTotalColorCount()} colors available` : 
                      selectedProductData.id === 'gildan-64000' ?
                      `${getAvailableColorCount64000()} of ${getTotalColorCount64000()} colors available` :
                      selectedProductData.id === 'bella-3001c' ?
                      `${getAvailableColorCountBella()} of ${getTotalColorCountBella()} colors available` :
                      selectedProductData.id === 'bella-6400' ?
                      `${getAvailableColorCountBella6400()} of ${getTotalColorCountBella6400()} colors available` :
                      selectedProductData.id === 'gildan-18000' ?
                      `${getAvailableColorCount18000()} of ${getTotalColorCount18000()} colors available` :
                      selectedProductData.id === 'gildan-18500' ?
                      `${getAvailableColorCount18500()} of ${getTotalColorCount18500()} colors available` :
                      selectedProductData.id === 'bella-3719' ?
                      `${getAvailableColorCount3719()} of ${getTotalColorCount3719()} colors available` :
                      `${selectedProductData.colors.length} colors available`
                    }
                  </p>
                </div>
              </div>
              
              {/* Color Swatches Grid */}
              <div className="mt-6">
                <h4 className="font-semibold mb-4 text-lg">Choose Your Color</h4>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  {selectedProductData.id === 'gildan-2000' ? (
                    <div className="grid grid-cols-6 gap-3">
                      {getAllColors().map((colorData) => (
                        <div key={colorData.name} className="relative group">
                          <button
                            onClick={() => colorData.available ? handleColorSelect(colorData.name) : toast.info(`${colorData.label} coming soon!`)}
                            className={`w-6 h-6 rounded-md transition-all duration-200 border ${
                              colorData.name === selectedColor 
                                ? 'border-green-500 shadow-lg scale-110' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                            } ${!colorData.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundColor: colorData.value }}
                            disabled={!colorData.available}
                          >
                            {colorData.name === selectedColor && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-2 h-2 text-white drop-shadow-lg" />
                              </div>
                            )}
                            {!colorData.available && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                            {colorData.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedProductData.id === 'gildan-64000' ? (
                    <div className="grid grid-cols-6 gap-3">
                      {getAllColors64000().map((colorData) => (
                        <div key={colorData.name} className="relative group">
                          <button
                            onClick={() => colorData.available ? handleColorSelect(colorData.name) : toast.info(`${colorData.label} coming soon!`)}
                            className={`w-6 h-6 rounded-md transition-all duration-200 border ${
                              colorData.name === selectedColor 
                                ? 'border-green-500 shadow-lg scale-110' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                            } ${!colorData.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundColor: colorData.value }}
                            disabled={!colorData.available}
                           >
                             {colorData.name === selectedColor && (
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <Check className="w-2 h-2 text-white drop-shadow-lg" />
                               </div>
                             )}
                             {!colorData.available && (
                               <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                               </div>
                             )}
                           </button>
                           <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                             {colorData.label}
                           </div>
                         </div>
                       ))}
                    </div>
                  ) : selectedProductData.id === 'bella-3001c' ? (
                    <div className="grid grid-cols-6 gap-3">
                      {getAllColorsBella().map((colorData) => (
                        <div key={colorData.name} className="relative group">
                          <button
                            onClick={() => colorData.available ? handleColorSelect(colorData.name) : toast.info(`${colorData.label} coming soon!`)}
                            className={`w-6 h-6 rounded-md transition-all duration-200 border ${
                              colorData.name === selectedColor 
                                ? 'border-green-500 shadow-lg scale-110' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                            } ${!colorData.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundColor: colorData.value }}
                            disabled={!colorData.available}
                          >
                            {colorData.name === selectedColor && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-2 h-2 text-white drop-shadow-lg" />
                              </div>
                            )}
                            {!colorData.available && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                            {colorData.label}
                          </div>
                        </div>
                       ))}
                      </div>
                  ) : selectedProductData.id === 'bella-6400' ? (
                    <div className="grid grid-cols-6 gap-3">
                      {getAllColorsBella6400().map((colorData) => (
                        <div key={colorData.name} className="relative group">
                          <button
                            onClick={() => colorData.available ? handleColorSelect(colorData.name) : toast.info(`${colorData.label} coming soon!`)}
                            className={`w-6 h-6 rounded-md transition-all duration-200 border ${
                              colorData.name === selectedColor 
                                ? 'border-green-500 shadow-lg scale-110' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                            } ${!colorData.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundColor: colorData.value }}
                            disabled={!colorData.available}
                          >
                            {colorData.name === selectedColor && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-2 h-2 text-white drop-shadow-lg" />
                              </div>
                            )}
                            {!colorData.available && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                            {colorData.label}
                          </div>
                        </div>
                       ))}
                      </div>
                  ) : selectedProductData.id === 'gildan-18500' ? (
                    <div className="grid grid-cols-6 gap-3">
                      {getAllColors18500().map((colorData) => (
                        <div key={colorData.name} className="relative group">
                          <button
                            onClick={() => colorData.available ? handleColorSelect(colorData.name) : toast.info(`${colorData.label} coming soon!`)}
                            className={`w-6 h-6 rounded-md transition-all duration-200 border ${
                              colorData.name === selectedColor 
                                ? 'border-green-500 shadow-lg scale-110' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                            } ${!colorData.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundColor: colorData.value }}
                            disabled={!colorData.available}
                          >
                            {colorData.name === selectedColor && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-2 h-2 text-white drop-shadow-lg" />
                              </div>
                            )}
                            {!colorData.available && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                            {colorData.label}
                          </div>
                        </div>
                       ))}
                      </div>
                  ) : selectedProductData.id === 'bella-3719' ? (
                    <div className="grid grid-cols-6 gap-3">
                      {getAllColors3719().map((colorData) => (
                        <div key={colorData.name} className="relative group">
                          <button
                            onClick={() => colorData.available ? handleColorSelect(colorData.name) : toast.info(`${colorData.label} coming soon!`)}
                            className={`w-6 h-6 rounded-md transition-all duration-200 border ${
                              colorData.name === selectedColor 
                                ? 'border-green-500 shadow-lg scale-110' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                            } ${!colorData.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundColor: colorData.value }}
                            disabled={!colorData.available}
                          >
                            {colorData.name === selectedColor && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-2 h-2 text-white drop-shadow-lg" />
                              </div>
                            )}
                            {!colorData.available && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                            {colorData.label}
                          </div>
                        </div>
                      ))}
                     </div>
                  ) : selectedProductData.id === 'gildan-18000' ? (
                    <div className="grid grid-cols-6 gap-3">
                      {getAllColors18000().map((colorData) => (
                        <div key={colorData.name} className="relative group">
                          <button
                            onClick={() => colorData.available ? handleColorSelect(colorData.name) : toast.info(`${colorData.label} coming soon!`)}
                            className={`w-6 h-6 rounded-md transition-all duration-200 border ${
                              colorData.name === selectedColor 
                                ? 'border-green-500 shadow-lg scale-110' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                            } ${!colorData.available ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{ backgroundColor: colorData.value }}
                            disabled={!colorData.available}
                          >
                            {colorData.name === selectedColor && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-2 h-2 text-white drop-shadow-lg" />
                              </div>
                            )}
                            {!colorData.available && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                              </div>
                            )}
                          </button>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                            {colorData.label}
                          </div>
                        </div>
                      ))}
                     </div>
                  ) : (
                    <div className="grid grid-cols-6 gap-3">
                      {selectedProductData.colors.map((color) => (
                        <div key={color} className="relative group">
                          <button
                            onClick={() => handleColorSelect(color)}
                            className={`w-6 h-6 rounded-md transition-all duration-200 border cursor-pointer ${
                              color === selectedColor 
                                ? 'border-green-500 shadow-lg scale-110' 
                                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                            }`}
                            style={{ backgroundColor: colorMap[color] || '#ccc' }}
                          >
                            {color === selectedColor && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check className="w-2 h-2 text-white drop-shadow-lg" />
                              </div>
                            )}
                          </button>
                          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 pointer-events-none">
                            {color}
                          </div>
                        </div>
                      ))}
                    </div>
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm leading-tight break-words">{product.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className="text-xs whitespace-nowrap flex-shrink-0 px-2 py-1 ml-2"
                      >
                        {product.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 leading-tight">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">{formatPriceDisplay(product)}</span>
                      <span className="text-xs text-muted-foreground">{product.colors.length} colors</span>
                    </div>
                  </div>
                  {product.id === selectedProduct && (
                    <div className="w-5 h-5 bg-gradient-premium rounded-full flex items-center justify-center shadow-glow gentle-pulse flex-shrink-0">
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