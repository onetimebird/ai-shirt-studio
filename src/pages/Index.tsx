import { TShirtDesigner } from "@/components/TShirtDesigner";
import { ColorPickerTest } from "@/components/ColorPickerTest";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ColorPickerTest />
      <TShirtDesigner />
    </div>
  );
};

export default Index;
