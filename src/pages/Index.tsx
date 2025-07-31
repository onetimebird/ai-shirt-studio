import { useState } from "react";
import { TShirtDesigner } from "@/components/TShirtDesigner";
import { BackgroundRemovalTest } from "@/components/BackgroundRemovalTest";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showBackgroundRemoval, setShowBackgroundRemoval] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Toggle button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setShowBackgroundRemoval(!showBackgroundRemoval)}
          variant="outline"
          size="sm"
        >
          {showBackgroundRemoval ? "Back to Designer" : "Test Background Removal"}
        </Button>
      </div>

      {/* Conditional rendering */}
      {showBackgroundRemoval ? (
        <div className="pt-16 pb-8">
          <BackgroundRemovalTest />
        </div>
      ) : (
        <TShirtDesigner />
      )}
    </div>
  );
};

export default Index;
