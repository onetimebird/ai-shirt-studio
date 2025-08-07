// src/components/RightPanel.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { openAIService } from "@/services/openai";
import { Text as FabricText, Textbox as FabricTextbox } from "fabric";
import { AIArtPanel } from "@/components/AIArtPanel";
import { ProductSelector } from "@/components/ProductSelector";
import { AiGenerator } from "./AiGenerator";

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
}

export const RightPanel: React.FC<RightPanelProps> = ({
  activeTool,
  selectedObject,
  onTextPropertiesChange,
  onImageUpload,
  onProductColorChange,
  textObjects,
  imageObjects,
  selectedProduct,
  selectedColor,
  onProductChange,
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
        <TabsTrigger value="upload">Upload Image</TabsTrigger>
        <TabsTrigger value="text">Add Text</TabsTrigger>
        <TabsTrigger value="ai">AI Image Generator</TabsTrigger>
        <TabsTrigger value="product">Change Product</TabsTrigger>
        <TabsTrigger value="reset">Reset Design</TabsTrigger>
        <TabsTrigger value="help">Help</TabsTrigger>
      </TabsList>

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
  <AIArtPanel />
</TabsContent>

      <TabsContent value="text" className="p-4 overflow-auto">
        <p className="mb-2 font-medium">Add a text box</p>
        <Button onClick={() => window.designCanvas.addText()}>
          Add Text
        </Button>
        {selectedObject &&
          selectedObject.type === "textbox" && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Text Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label>Font Size</Label>
                <Slider
                  value={[selectedObject.fontSize]}
                  onValueChange={([size]) =>
                    onTextPropertiesChange({ fontSize: size })
                  }
                  max={72}
                />
                <Label>Color</Label>
                <Input
                  type="color"
                  value={selectedObject.fill}
                  onChange={(e) =>
                    onTextPropertiesChange({ fill: e.target.value })
                  }
                />
              </CardContent>
            </Card>
          )}
      </TabsContent>

      <TabsContent value="ai" className="p-4 overflow-auto">
        <p className="mb-2 font-medium">Generate with AI</p>
        <AiGenerator onImage={(url) => window.designCanvas.addImageFromUrl(url)} />
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

      <TabsContent value="reset" className="p-4 overflow-auto">
        <p className="mb-2 font-medium">Reset Your Design</p>
        <Button variant="outline" onClick={() => window.designCanvas.reset()}>
          Reset Design
        </Button>
      </TabsContent>

      <TabsContent value="help" className="p-4 overflow-auto">
        <p className="mb-2 font-medium">Help & Support</p>
        <p>
          Need assistance? Email{" "}
          <a href="mailto:support@coolshirt.ai" className="text-blue-600 underline">
            support@coolshirt.ai
          </a>
        </p>
      </TabsContent>
    </Tabs>
  );
}
