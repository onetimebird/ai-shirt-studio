import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { removeBackground, loadImageFromUrl } from '@/lib/backgroundRemoval';
import { toast } from 'sonner';

interface ProcessedImage {
  original: string;
  processed: string;
  name: string;
}

export const BackgroundRemovalTest: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);

  // Heather Sapphire images from the data file
  const heatherSapphireImages = [
    {
      name: 'Heather Sapphire Front',
      url: '/lovable-uploads/c7b395af-21e4-453f-9eaa-32e40b73051c.png'
    },
    {
      name: 'Heather Sapphire Back', 
      url: '/lovable-uploads/11ce3117-8b70-48c0-a677-46268864c011.png'
    }
  ];

  const processImages = async () => {
    setIsProcessing(true);
    const results: ProcessedImage[] = [];

    try {
      for (const image of heatherSapphireImages) {
        toast.info(`Processing ${image.name}...`);
        
        try {
          // Load the image
          const imageElement = await loadImageFromUrl(image.url);
          
          // Remove background
          const processedBlob = await removeBackground(imageElement);
          
          // Create object URL for display
          const processedUrl = URL.createObjectURL(processedBlob);
          
          results.push({
            original: image.url,
            processed: processedUrl,
            name: image.name
          });

          toast.success(`Successfully processed ${image.name}`);
        } catch (error) {
          console.error(`Error processing ${image.name}:`, error);
          toast.error(`Failed to process ${image.name}: ${error}`);
        }
      }

      setProcessedImages(results);
    } catch (error) {
      console.error('Error in batch processing:', error);
      toast.error('Error processing images');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${name.replace(/\s+/g, '_').toLowerCase()}_no_background.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Background Removal Test - Heather Sapphire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              This tool will process the Heather Sapphire t-shirt images to remove white backgrounds using AI.
            </p>
            
            <Button 
              onClick={processImages} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing Images...' : 'Remove Backgrounds from Heather Sapphire Images'}
            </Button>

            {processedImages.length > 0 && (
              <div className="space-y-6 mt-8">
                <h3 className="text-lg font-semibold">Results:</h3>
                
                {processedImages.map((image, index) => (
                  <Card key={index} className="w-full">
                    <CardHeader>
                      <CardTitle className="text-base">{image.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-medium">Original</h4>
                          <img 
                            src={image.original} 
                            alt={`Original ${image.name}`}
                            className="w-full max-w-sm h-auto border rounded-lg"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium">Background Removed</h4>
                          <div className="relative">
                            <img 
                              src={image.processed} 
                              alt={`Processed ${image.name}`}
                              className="w-full max-w-sm h-auto border rounded-lg"
                              style={{ 
                                backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='a' patternUnits='userSpaceOnUse' width='20' height='20'%3e%3crect fill='%23f8f9fa' width='10' height='10'/%3e%3crect fill='%23e9ecef' x='10' y='10' width='10' height='10'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23a)'/%3e%3c/svg%3e")`,
                                backgroundSize: '20px 20px'
                              }}
                            />
                          </div>
                          <Button 
                            onClick={() => downloadImage(image.processed, image.name)}
                            variant="outline"
                            size="sm"
                          >
                            Download PNG
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundRemovalTest;