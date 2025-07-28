import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Type, 
  Palette, 
  Image as ImageIcon,
  Sparkles,
  Grid3X3,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";

interface RightPanelProps {
  activeTool: string;
  selectedObject: any;
  onTextPropertiesChange: (properties: any) => void;
  onImageUpload: (file: File) => void;
}

const fonts = [
  "Arial", "Helvetica", "Times New Roman", "Georgia", "Impact", 
  "Comic Sans MS", "Trebuchet MS", "Verdana", "Courier New", "Palatino"
];

const effects = [
  { name: "None", value: "none" },
  { name: "Distressed", value: "distressed" },
  { name: "Outline", value: "outline" },
  { name: "Shadow", value: "shadow" },
  { name: "Glow", value: "glow" },
];

const templates = [
  { name: "Sports Team", category: "sports" },
  { name: "Birthday Party", category: "celebration" },
  { name: "Corporate Event", category: "business" },
  { name: "Family Reunion", category: "family" },
  { name: "Band Merch", category: "music" },
  { name: "Vintage Style", category: "retro" },
];

export const RightPanel = ({ 
  activeTool, 
  selectedObject,
  onTextPropertiesChange,
  onImageUpload 
}: RightPanelProps) => {
  const [fontSize, setFontSize] = useState([24]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [textColor, setTextColor] = useState("#000000");
  const [effect, setEffect] = useState("none");

  return (
    <div className="w-80 bg-card border-l border-border overflow-y-auto shadow-soft">
      <div className="p-4">
        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="properties" className="space-y-4 mt-4">
            {/* Text Properties */}
            {(activeTool === "text" || selectedObject?.type === "text") && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    Text Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Font Family */}
                  <div>
                    <Label className="text-xs">Font Family</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fonts.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Font Size */}
                  <div>
                    <Label className="text-xs">Size: {fontSize[0]}px</Label>
                    <Slider
                      value={fontSize}
                      onValueChange={setFontSize}
                      max={72}
                      min={8}
                      step={1}
                      className="mt-2"
                    />
                  </div>

                  {/* Text Color */}
                  <div>
                    <Label className="text-xs">Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-8 p-0 border-0"
                      />
                      <Input
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1 h-8"
                      />
                    </div>
                  </div>

                  {/* Text Formatting */}
                  <div>
                    <Label className="text-xs">Formatting</Label>
                    <div className="flex gap-1 mt-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Bold className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Italic className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Underline className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div>
                    <Label className="text-xs">Alignment</Label>
                    <div className="flex gap-1 mt-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <AlignLeft className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <AlignCenter className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <AlignRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Color Swatches */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: 32 }, (_, i) => (
                    <button
                      key={i}
                      className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: `hsl(${i * 11.25}, ${i % 2 === 0 ? 70 : 50}%, ${50 + (i % 3) * 20}%)`
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Image Upload */}
            {activeTool === "upload" && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Upload Image
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onImageUpload(file);
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button asChild className="w-full">
                      <span>Choose File</span>
                    </Button>
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PNG, JPEG, PDF
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="effects" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Text Effects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {effects.map((effect) => (
                    <Button
                      key={effect.value}
                      variant="outline"
                      size="sm"
                      className="h-12 text-xs"
                    >
                      {effect.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Design Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-12"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                          <Grid3X3 className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{template.name}</div>
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};