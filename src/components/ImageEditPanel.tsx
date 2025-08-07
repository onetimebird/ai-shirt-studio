import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { X, RotateCcw } from 'lucide-react';

interface ImageEditPanelProps {
  imageUrl: string;
  onClose: () => void;
  onSave?: (editedImageUrl: string) => void;
}

export function ImageEditPanel({ imageUrl, onClose, onSave }: ImageEditPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<'normal' | 'single-color' | 'black-white'>('normal');
  const [selectedColor, setSelectedColor] = useState('#4285f4');
  const [size, setSize] = useState([0.6]);
  const [rotation, setRotation] = useState([0]);

  const colors = [
    '#4285f4', '#000000', '#1a365d', '#d69e2e', '#ffffff'
  ];

  const handleSave = () => {
    // In a real implementation, you would apply the filters and transformations
    // to the image and return the edited version
    onSave?.(imageUrl);
    onClose();
  };

  const handleResetToDefaults = () => {
    setSelectedFilter('normal');
    setSelectedColor('#4285f4');
    setSize([0.6]);
    setRotation([0]);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Edit Your Artwork</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mb-6">
          Our design professionals will select ink colors for you or tell us your preferred colors at checkout.
        </p>

        {/* Image Preview */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={imageUrl} 
              alt="Preview" 
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${size[0]}) rotate(${rotation[0]}deg)`,
                filter: selectedFilter === 'single-color' ? 'grayscale(1)' : 
                       selectedFilter === 'black-white' ? 'grayscale(1) contrast(2)' : 'none'
              }}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-3">Filters</h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'normal', label: 'Normal', preview: imageUrl },
              { key: 'single-color', label: 'Single Color', preview: imageUrl },
              { key: 'black-white', label: 'Black/White', preview: imageUrl }
            ].map((filter) => (
              <div
                key={filter.key}
                className={`cursor-pointer p-2 rounded-lg border-2 transition-colors ${
                  selectedFilter === filter.key ? 'border-blue-500' : 'border-gray-200'
                }`}
                onClick={() => setSelectedFilter(filter.key as any)}
              >
                <div className="w-full h-16 bg-gray-100 rounded mb-2 overflow-hidden">
                  <img 
                    src={filter.preview} 
                    alt={filter.label}
                    className="w-full h-full object-contain"
                    style={{
                      filter: filter.key === 'single-color' ? 'grayscale(1)' : 
                             filter.key === 'black-white' ? 'grayscale(1) contrast(2)' : 'none'
                    }}
                  />
                </div>
                <span className="text-xs text-center block">{filter.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Edit Colors */}
        {selectedFilter === 'single-color' && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3">Edit Colors</h4>
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-blue-500 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Remove Background</span>
            <div className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Crop & Trim</span>
            <div className="w-12 h-6 bg-blue-500 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Super Resolution</span>
            <div className="w-12 h-6 bg-gray-300 rounded-full relative">
              <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Size</span>
              <span className="text-sm text-gray-500">{size[0].toFixed(1)}</span>
            </div>
            <Slider
              value={size}
              onValueChange={setSize}
              max={10}
              min={0.2}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Rotate</span>
              <span className="text-sm text-gray-500">{rotation[0]}°</span>
            </div>
            <Slider
              value={rotation}
              onValueChange={setRotation}
              max={360}
              min={-360}
              step={15}
              className="w-full"
            />
          </div>
        </div>

        {/* Reset Button */}
        <Button 
          variant="outline" 
          onClick={handleResetToDefaults}
          className="mb-6 w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset to Defaults
        </Button>

        {/* Action Buttons */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Center</span>
          </div>
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Layering</span>
          </div>
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Flip</span>
          </div>
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Lock</span>
          </div>
          <div className="text-center">
            <Button variant="outline" size="icon" className="mb-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </Button>
            <span className="text-xs">Duplicate</span>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-300 to-purple-300 hover:from-blue-400 hover:to-purple-400 text-white"
        >
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}