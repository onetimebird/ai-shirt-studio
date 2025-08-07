// src/components/RightPanel.tsx
import { useState, useEffect } from "react";
import { applyCustomControlsToObject } from '@/lib/fabricTextControls';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { removeBackground, loadImage } from "@/lib/backgroundRemoval";
import { openAIService } from "@/services/openai";
import { Text as FabricText, Textbox as FabricTextbox } from "fabric";
import { AIArtPanel } from "@/components/AIArtPanel";
import { CustomColorPicker } from "@/components/CustomColorPicker";
import { ProductSelector } from "@/components/ProductSelector";
import { AiGenerator } from "./AiGenerator";
import {
  Type,
  Palette,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  RotateCw,
  Copy,
  Trash2,
  Move,
  Wand2,
  Key,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { BELLA_3001C_COLORS } from "../data/bellaColors";
import { GILDAN_64000_COLORS } from "../data/gildan64000Colors";
import { BELLA_6400_COLORS } from "../data/bella6400Colors";
import { GILDAN_18000_COLORS } from "../data/gildan18000Colors";
import { GILDAN_18500_COLORS } from "../data/gildan18500Colors";
import { BELLA_3719_COLORS } from "../data/bella3719Colors";

interface RightPanelProps {
  activeTool: string;
  selectedObject: any;
  onTextPropertiesChange: (props: any) => void;
  onImageUpload: (file: File) => void;
  onProductColorChange: (color: string) => void;
  textObjects: any[];
  imageObjects?: any[];
  selectedProduct?: string;
  selectedColor?: string;
  onProductChange?: (productId: string) => void;
  uploadedFile?: File | null;
}

const FONTS = [
  // System Fonts
  { name: "Arial", value: "Arial" },
  { name: "Helvetica", value: "Helvetica" },
  { name: "Impact", value: "Impact" },
  
  // Essential T-Shirt Design Fonts
  { name: "Oswald", value: "Oswald" },
  { name: "Anton", value: "Anton" },
  { name: "Bebas Neue", value: "Bebas Neue" },
  { name: "Montserrat", value: "Montserrat" },
  { name: "Poppins", value: "Poppins" },
  { name: "Roboto", value: "Roboto" },
  { name: "Open Sans", value: "Open Sans" },
  { name: "Lato", value: "Lato" },
  { name: "Inter", value: "Inter" },
  
  // Collegiate & Athletic Fonts
  { name: "Graduate", value: "Graduate" },
  { name: "Alfa Slab One", value: "Alfa Slab One" },
  { name: "Black Ops One", value: "Black Ops One" },
  { name: "Staatliches", value: "Staatliches" },
  { name: "Squada One", value: "Squada One" },
  { name: "Big Shoulders Display", value: "Big Shoulders Display" },
  { name: "Concert One", value: "Concert One" },
  { name: "Press Start 2P", value: "Press Start 2P" },
  { name: "Rajdhani", value: "Rajdhani" },
  { name: "Play", value: "Play" },
  { name: "Saira Condensed", value: "Saira Condensed" },
  
  // Bold Sports & Team Fonts
  { name: "Russo One", value: "Russo One" },
  { name: "Righteous", value: "Righteous" },
  { name: "Archivo Black", value: "Archivo Black" },
  { name: "Fjalla One", value: "Fjalla One" },
  { name: "Fugaz One", value: "Fugaz One" },
  { name: "Titan One", value: "Titan One" },
  { name: "Bowlby One", value: "Bowlby One" },
  { name: "Bungee", value: "Bungee" },
  { name: "Bungee Shade", value: "Bungee Shade" },
  { name: "Teko", value: "Teko" },
  
  // Fun & Decorative
  { name: "Bangers", value: "Bangers" },
  { name: "Fredoka One", value: "Fredoka One" },
  { name: "Fredoka", value: "Fredoka" },
  { name: "Permanent Marker", value: "Permanent Marker" },
  { name: "Creepster", value: "Creepster" },
  { name: "Passion One", value: "Passion One" },
  { name: "Acme", value: "Acme" },
  
  // Script & Elegant
  { name: "Pacifico", value: "Pacifico" },
  { name: "Dancing Script", value: "Dancing Script" },
  { name: "Lobster", value: "Lobster" },
  { name: "Satisfy", value: "Satisfy" },
  { name: "Playfair Display", value: "Playfair Display" },
  
  // Modern & Tech (Perfect for Esports)
  { name: "Orbitron", value: "Orbitron" },
  { name: "Audiowide", value: "Audiowide" },
  { name: "Exo", value: "Exo" },
  { name: "Michroma", value: "Michroma" },
  { name: "Electrolize", value: "Electrolize" },
  
  // Clean & Professional
  { name: "Nunito", value: "Nunito" },
  { name: "Source Sans Pro", value: "Source Sans Pro" },
  { name: "Ubuntu", value: "Ubuntu" },
  { name: "Raleway", value: "Raleway" },
  { name: "Work Sans", value: "Work Sans" },
  { name: "Rubik", value: "Rubik" },
  { name: "Barlow", value: "Barlow" },
  { name: "Kanit", value: "Kanit" },
  { name: "Saira", value: "Saira" },
  { name: "Changa", value: "Changa" },
  { name: "Roboto Condensed", value: "Roboto Condensed" },
  
  // Serif & Classic
  { name: "Merriweather", value: "Merriweather" },
  { name: "PT Sans", value: "PT Sans" },
  { name: "Crimson Text", value: "Crimson Text" },
  { name: "Abril Fatface", value: "Abril Fatface" },
  
  // Rounded & Friendly
  { name: "Comfortaa", value: "Comfortaa" },
  { name: "Quicksand", value: "Quicksand" },
  { name: "Josefin Sans", value: "Josefin Sans" },
  { name: "Kalam", value: "Kalam" },

  // Advanced Collegiate/Athletic/Sports Fonts
  { name: "Big Shoulders Stencil Display", value: "Big Shoulders Stencil Display" },
  { name: "Alumni Sans", value: "Alumni Sans" },
  { name: "Anton SC", value: "Anton SC" },
  { name: "Bungee Outline", value: "Bungee Outline" },
  { name: "Faster One", value: "Faster One" },
  { name: "Chakra Petch", value: "Chakra Petch" },
  { name: "Syncopate", value: "Syncopate" },
  { name: "Kranky", value: "Kranky" },
  { name: "Frijole", value: "Frijole" },
  { name: "Metal Mania", value: "Metal Mania" },
  { name: "Hanalei Fill", value: "Hanalei Fill" },
  { name: "Bungee Hairline", value: "Bungee Hairline" },
  { name: "Wallpoet", value: "Wallpoet" },
  { name: "Eater", value: "Eater" },
  { name: "Jolly Lodger", value: "Jolly Lodger" },
  { name: "Griffy", value: "Griffy" },
  { name: "Lacquer", value: "Lacquer" },
  { name: "Rye", value: "Rye" },
  { name: "UnifrakturCook", value: "UnifrakturCook" },
  { name: "Fredericka the Great", value: "Fredericka the Great" },
  { name: "Rammetto One", value: "Rammetto One" },
  { name: "Covered By Your Grace", value: "Covered By Your Grace" },
  { name: "Shadows Into Light", value: "Shadows Into Light" },
  { name: "Special Elite", value: "Special Elite" },
  { name: "Monoton", value: "Monoton" },
  { name: "Megrim", value: "Megrim" },
  { name: "Nosifer", value: "Nosifer" },
  { name: "Butcherman", value: "Butcherman" },
  { name: "New Rocker", value: "New Rocker" },
];

export const RightPanel: React.FC<RightPanelProps> = ({
  activeTool,
  selectedObject,
  onTextPropertiesChange,
  onImageUpload,
  onProductColorChange,
  textObjects = [],
  imageObjects = [],
  selectedProduct = "bella-3001c",
  selectedColor = "White",
  onProductChange,
  uploadedFile
}) => {
  const [tab, setTab] = useState(activeTool);

  useEffect(() => {
    setTab(activeTool);
  }, [activeTool]);

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      orientation="vertical"
      className="h-full flex"
    >
      <TabsList className="flex flex-col space-y-2 p-4 bg-gray-50">
        <TabsTrigger value="text" className="w-full justify-start">
          <Type className="w-4 h-4 mr-2" />
          Text
        </TabsTrigger>
        <TabsTrigger value="upload" className="w-full justify-start">
          <ImageIcon className="w-4 h-4 mr-2" />
          Upload
        </TabsTrigger>
        <TabsTrigger value="ai" className="w-full justify-start">
          <Wand2 className="w-4 h-4 mr-2" />
          AI Generate
        </TabsTrigger>
        <TabsTrigger value="product" className="w-full justify-start">
          <Palette className="w-4 h-4 mr-2" />
          Product
        </TabsTrigger>
      </TabsList>

      <div className="flex-1">
        <TabsContent value="upload" className="p-4 overflow-auto">
          <p className="mb-2 font-medium">Upload your own image</p>
          <input
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={(e) => e.target.files && onImageUpload(e.target.files[0])}
          />
        </TabsContent>

        <TabsContent value="ai" className="p-4 overflow-auto">
          <p className="mb-2 font-medium">Generate with AI</p>
          <AIArtPanel onImageGenerated={(url) => (window as any).designCanvas?.addImageFromUrl?.(url)} />
        </TabsContent>

        <TabsContent value="text" className="p-4 overflow-auto">
          <p className="mb-2 font-medium">Add a text box</p>
          <Button onClick={() => (window as any).designCanvas?.addText?.()}>
            Add Text
          </Button>

          {selectedObject && selectedObject.type === "textbox" && (
            <div className="mt-4 space-y-2">
              <div>
                <Label>Text</Label>
                <Input
                  value={selectedObject.text}
                  onChange={(e) =>
                    onTextPropertiesChange({ text: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Font Size</Label>
                <Input
                  type="number"
                  value={selectedObject.fontSize}
                  onChange={(e) =>
                    onTextPropertiesChange({ fontSize: parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedObject.fill}
                  onChange={(e) =>
                    onTextPropertiesChange({ fill: e.target.value })
                  }
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="product" className="p-4 overflow-auto">
          <p className="mb-2 font-medium">Change Product / Color</p>
          <ProductSelector
            selectedProduct={selectedProduct!}
            selectedColor={selectedColor!}
            onProductChange={onProductChange!}
            onColorChange={onProductColorChange}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};