
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Canvas as FabricCanvas, FabricText, FabricImage, Control } from "fabric";
import { BELLA_3001C_COLORS } from "@/data/bellaColors";
import { ZoomIn, ZoomOut, RotateCw, Copy, Trash2, Move, MousePointer, ShoppingCart, RefreshCw } from "lucide-react";
import tshirtFrontTemplate from "@/assets/tshirt-front-template.png";
import tshirtBackTemplate from "@/assets/tshirt-back-template.png";

interface DesignCanvasProps {
  selectedColor: string;
  currentSide: "front" | "back";
  activeTool: string;
  onSelectedObjectChange?: (obj: any) => void;
}

export const DesignCanvas = ({ 
  selectedColor, 
  currentSide, 
  activeTool,
  onSelectedObjectChange 
}: DesignCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasZoom, setCanvasZoom] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantities, setQuantities] = useState<{ [size: string]: number }>({
    S: 0, M: 0, L: 0, XL: 0, "2XL": 0, "3XL": 0, "4XL": 0, "5XL": 0
  });
  const [totalPrice, setTotalPrice] = useState(0);

  const currentColor = BELLA_3001C_COLORS.find(c => c.name === selectedColor);
  const tshirtImage = currentSide === "front" ? tshirtFrontTemplate : tshirtBackTemplate;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 500,
      height: 600,
      backgroundColor: "transparent",
      selection: true,
    });

    // Custom control icons matching the reference design
    const deleteIcon = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='16'%20cy='16'%20r='15'%20fill='white'%20stroke='%23e5e7eb'%20stroke-width='1'/%3e%3cpath%20d='M10%2012h12m-1%200v8a1%201%200%2001-1%201h-8a1%201%200%2001-1-1v-8m2%200V9a1%201%200%20011-1h4a1%201%200%20011%201v3m-6%202v6m4-6v6'%20stroke='%23374151'%20stroke-width='1.5'%20fill='none'/%3e%3c/svg%3e";
    const layerIcon = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='16'%20cy='16'%20r='15'%20fill='white'%20stroke='%23e5e7eb'%20stroke-width='1'/%3e%3cpath%20d='M12%2010v12M12%2010l4-4M12%2010l-4%204M20%2022V10M20%2022l4-4M20%2022l-4-4'%20stroke='%23374151'%20stroke-width='1.5'%20fill='none'/%3e%3c/svg%3e";
    const rotateIcon = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='16'%20cy='16'%20r='15'%20fill='white'%20stroke='%23e5e7eb'%20stroke-width='1'/%3e%3cpath%20d='M8%2012a8%208%200%20018-8c3%200%205.5%201.5%207%204M24%2020a8%208%200%2001-8%208c-3%200-5.5-1.5-7-4'%20stroke='%23374151'%20stroke-width='1.5'%20fill='none'/%3e%3cpath%20d='M15%206l2-2%202%202M17%2026l-2%202-2-2'%20stroke='%23374151'%20stroke-width='1.5'%20fill='none'/%3e%3c/svg%3e";
    const stretchIcon = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='16'%20cy='16'%20r='15'%20fill='white'%20stroke='%23e5e7eb'%20stroke-width='1'/%3e%3cpath%20d='M8%2016h16M8%2016l3-3M8%2016l3%203M24%2016l-3-3M24%2016l-3%203'%20stroke='%23374151'%20stroke-width='1.5'%20fill='none'/%3e%3c/svg%3e";
    const scaleIcon = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='16'%20cy='16'%20r='15'%20fill='white'%20stroke='%23e5e7eb'%20stroke-width='1'/%3e%3cpath%20d='M8%2024l16-16M8%2024v-4M8%2024h4M24%208v4M24%208h-4'%20stroke='%23374151'%20stroke-width='1.5'%20fill='none'/%3e%3c/svg%3e";
    const cloneIcon = "data:image/svg+xml,%3csvg%20width='32'%20height='32'%20xmlns='http://www.w3.org/2000/svg'%3e%3ccircle%20cx='16'%20cy='16'%20r='15'%20fill='white'%20stroke='%23e5e7eb'%20stroke-width='1'/%3e%3cpath%20d='M9%209h8v8M15%2015h8v8M9%209v8h8'%20stroke='%23374151'%20stroke-width='1.5'%20fill='none'/%3e%3c/svg%3e";

    // Define custom controls with precise positioning and functionality
    const customControls = {
      // Delete Handle - Top-Left
      'deleteControl': {
        x: -0.5,
        y: -0.5,
        offsetY: -20,
        offsetX: -20,
        cursorStyle: 'pointer',
        mouseUpHandler: function(eventData: any, transformData: any) {
          const target = transformData.target;
          canvas.remove(target);
          canvas.requestRenderAll();
          toast.success("Text deleted");
        },
        render: function(ctx: any, left: any, top: any) {
          const size = 32;
          ctx.save();
          ctx.translate(left, top);
          ctx.drawImage(this.img, -size/2, -size/2, size, size);
          ctx.restore();
        },
        cornerSize: 32
      },

      // Layer Up/Down - Top-Center  
      'layerControl': {
        x: 0,
        y: -0.5,
        offsetY: -20,
        offsetX: 0,
        cursorStyle: 'pointer',
        mouseUpHandler: function(eventData: any, transformData: any) {
          const target = transformData.target;
          const objects = canvas.getObjects();
          const currentIndex = objects.indexOf(target);
          
          if (eventData.e.shiftKey && currentIndex > 0) {
            target.sendBackwards();
            toast.success("Moved backward");
          } else if (currentIndex < objects.length - 1) {
            target.bringForward();
            toast.success("Moved forward");
          }
          canvas.requestRenderAll();
        },
        render: function(ctx: any, left: any, top: any) {
          const size = 32;
          ctx.save();
          ctx.translate(left, top);
          ctx.drawImage(this.img, -size/2, -size/2, size, size);
          ctx.restore();
        },
        cornerSize: 32
      },

      // Rotate Control - Top-Right
      'rotateControl': {
        x: 0.5,
        y: -0.5,
        offsetY: -20,
        offsetX: 20,
        cursorStyle: 'grab',
        actionHandler: function(eventData: any, transformData: any, x: any, y: any) {
          const target = transformData.target;
          const center = target.getCenterPoint();
          const angle = Math.atan2(y - center.y, x - center.x) * 180 / Math.PI + 90;
          target.rotate(angle);
          return true;
        },
        render: function(ctx: any, left: any, top: any) {
          const size = 32;
          ctx.save();
          ctx.translate(left, top);
          ctx.drawImage(this.img, -size/2, -size/2, size, size);
          ctx.restore();
        },
        cornerSize: 32
      },

      // Horizontal Stretch - Mid-Right
      'stretchControl': {
        x: 0.5,
        y: 0,
        offsetY: 0,
        offsetX: 20,
        cursorStyle: 'col-resize',
        actionHandler: function(eventData: any, transformData: any, x: any, y: any) {
          const target = transformData.target;
          const pointer = canvas.getPointer(eventData.e);
          const currentWidth = target.width * target.scaleX;
          const newScaleX = Math.max(0.1, pointer.x / (target.left + target.width/2));
          target.set('scaleX', newScaleX);
          return true;
        },
        render: function(ctx: any, left: any, top: any) {
          const size = 32;
          ctx.save();
          ctx.translate(left, top);
          ctx.drawImage(this.img, -size/2, -size/2, size, size);
          ctx.restore();
        },
        cornerSize: 32
      },

      // Uniform Scale - Bottom-Right (will override default)
      'scaleControl': {
        x: 0.5,
        y: 0.5,
        offsetY: 20,
        offsetX: 20,
        cursorStyle: 'se-resize',
        actionHandler: function(eventData: any, transformData: any, x: any, y: any) {
          const target = transformData.target;
          const pointer = canvas.getPointer(eventData.e);
          const center = target.getCenterPoint();
          const distance = Math.sqrt(Math.pow(pointer.x - center.x, 2) + Math.pow(pointer.y - center.y, 2));
          const originalDistance = Math.sqrt(Math.pow(target.width/2, 2) + Math.pow(target.height/2, 2));
          const scale = Math.max(0.1, distance / originalDistance);
          target.set({scaleX: scale, scaleY: scale});
          return true;
        },
        render: function(ctx: any, left: any, top: any) {
          const size = 32;
          ctx.save();
          ctx.translate(left, top);
          ctx.drawImage(this.img, -size/2, -size/2, size, size);
          ctx.restore();
        },
        cornerSize: 32
      },

      // Duplicate/Clone - Bottom-Left
      'cloneControl': {
        x: -0.5,
        y: 0.5,
        offsetY: 20,
        offsetX: -20,
        cursorStyle: 'pointer',
        mouseUpHandler: function(eventData: any, transformData: any) {
          const target = transformData.target;
          target.clone((cloned: any) => {
            cloned.set({
              left: cloned.left + 10,
              top: cloned.top + 10,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.requestRenderAll();
            toast.success("Text duplicated");
          });
        },
        render: function(ctx: any, left: any, top: any) {
          const size = 32;
          ctx.save();
          ctx.translate(left, top);
          ctx.drawImage(this.img, -size/2, -size/2, size, size);
          ctx.restore();
        },
        cornerSize: 32
      }
    };

    // Load control icons
    const iconMap: { [key: string]: string } = {
      'deleteControl': deleteIcon,
      'layerControl': layerIcon, 
      'rotateControl': rotateIcon,
      'stretchControl': stretchIcon,
      'scaleControl': scaleIcon,
      'cloneControl': cloneIcon
    };

    // Load control icons with proper error handling
    const loadControlIcons = () => {
      return Promise.all(Object.keys(customControls).map(key => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            (customControls as any)[key].img = img;
            resolve(true);
          };
          img.onerror = () => {
            console.warn(`Failed to load icon for ${key}`);
            resolve(false);
          };
          img.src = iconMap[key];
        });
      }));
    };

    // Load icons first, then set up event handlers
    loadControlIcons().then(() => {
      console.log("Custom control icons loaded successfully");
    });

    // Add selection events with enhanced controls
    canvas.on('selection:created', (e) => {
      const obj = e.selected[0];
      console.log("Selection created:", obj.type, obj);
      
      if (obj && (obj.type === 'textbox' || obj.type === 'text')) {
        // Keep default selection behavior but customize controls
        obj.set({
          borderColor: '#3b82f6',
          borderDashArray: [5, 5],
          cornerColor: 'transparent',
          cornerStrokeColor: 'transparent',
          transparentCorners: true
        });
        
        // Add 6 custom controls exactly like the reference
        obj.controls.deleteControl = new Control({
          x: -0.5,
          y: -0.5,
          offsetX: -10,
          offsetY: -10,
          cursorStyle: 'pointer',
          mouseUpHandler: function() {
            canvas.remove(obj);
            canvas.requestRenderAll();
            toast.success("Text deleted");
          },
          render: function(ctx: any, left: any, top: any) {
            const size = 32;
            ctx.save();
            ctx.translate(left, top);
            // White circle with gray border
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // Trash icon
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(-6, -4, 12, 8);
            ctx.moveTo(-8, -6);
            ctx.lineTo(8, -6);
            ctx.moveTo(-4, -8);
            ctx.lineTo(4, -8);
            ctx.stroke();
            ctx.restore();
          }
        });

        obj.controls.layerControl = new Control({
          x: 0,
          y: -0.5,
          offsetX: 0,
          offsetY: -10,
          cursorStyle: 'pointer',
          mouseUpHandler: function() {
            (obj as any).bringToFront();
            canvas.requestRenderAll();
          },
          render: function(ctx: any, left: any, top: any) {
            const size = 32;
            ctx.save();
            ctx.translate(left, top);
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // Up/down arrows
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, -8);
            ctx.lineTo(-4, -4);
            ctx.lineTo(4, -4);
            ctx.closePath();
            ctx.moveTo(0, 8);
            ctx.lineTo(-4, 4);
            ctx.lineTo(4, 4);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
        });

        obj.controls.rotateControl = new Control({
          x: 0.5,
          y: -0.5,
          offsetX: 10,
          offsetY: -10,
          cursorStyle: 'crosshair',
          actionHandler: function(eventData: any, transformData: any, x: any, y: any) {
            const target = transformData.target;
            const center = target.getCenterPoint();
            const angle = Math.atan2(y - center.y, x - center.x) * 180 / Math.PI + 90;
            target.rotate(angle);
            return true;
          },
          render: function(ctx: any, left: any, top: any) {
            const size = 32;
            ctx.save();
            ctx.translate(left, top);
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // Rotate arrows
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, 0, 6, 0, Math.PI * 1.5);
            ctx.moveTo(6, -2);
            ctx.lineTo(4, -6);
            ctx.lineTo(8, -6);
            ctx.stroke();
            ctx.restore();
          }
        });

        obj.controls.stretchControl = new Control({
          x: 0.5,
          y: 0,
          offsetX: 10,
          offsetY: 0,
          cursorStyle: 'ew-resize',
          actionHandler: function(eventData: any, transformData: any, x: any, y: any) {
            // Keep default horizontal scaling behavior
            return false;
          },
          render: function(ctx: any, left: any, top: any) {
            const size = 32;
            ctx.save();
            ctx.translate(left, top);
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // Left-right arrows
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-8, 0);
            ctx.lineTo(8, 0);
            ctx.moveTo(-6, -3);
            ctx.lineTo(-8, 0);
            ctx.lineTo(-6, 3);
            ctx.moveTo(6, -3);
            ctx.lineTo(8, 0);
            ctx.lineTo(6, 3);
            ctx.stroke();
            ctx.restore();
          }
        });

        obj.controls.scaleControl = new Control({
          x: 0.5,
          y: 0.5,
          offsetX: 10,
          offsetY: 10,
          cursorStyle: 'se-resize',
          actionHandler: function(eventData: any, transformData: any, x: any, y: any) {
            // Keep default scaling behavior
            return false;
          },
          render: function(ctx: any, left: any, top: any) {
            const size = 32;
            ctx.save();
            ctx.translate(left, top);
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // Diagonal arrows
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-6, 6);
            ctx.lineTo(6, -6);
            ctx.moveTo(-8, 4);
            ctx.lineTo(-6, 6);
            ctx.lineTo(-4, 4);
            ctx.moveTo(4, -8);
            ctx.lineTo(6, -6);
            ctx.lineTo(8, -8);
            ctx.stroke();
            ctx.restore();
          }
        });

        obj.controls.cloneControl = new Control({
          x: -0.5,
          y: 0.5,
          offsetX: -10,
          offsetY: 10,
          cursorStyle: 'pointer',
          mouseUpHandler: function() {
            (obj as any).clone((cloned: any) => {
              cloned.set({ left: cloned.left + 10, top: cloned.top + 10 });
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
              canvas.requestRenderAll();
              toast.success("Text duplicated");
            });
          },
          render: function(ctx: any, left: any, top: any) {
            const size = 32;
            ctx.save();
            ctx.translate(left, top);
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#d1d5db';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, 0, size/2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            // Clone/layers icon
            ctx.strokeStyle = '#374151';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.rect(-6, -6, 8, 8);
            ctx.rect(-2, -2, 8, 8);
            ctx.stroke();
            ctx.restore();
          }
        });

        console.log("All 6 custom controls added");
        canvas.requestRenderAll();
      }
      setSelectedObject(obj);
      onSelectedObjectChange?.(obj);
    });

    canvas.on('selection:updated', (e) => {
      const obj = e.selected[0];
      setSelectedObject(obj);
      onSelectedObjectChange?.(obj);
    });

    canvas.on('selection:cleared', () => {
      setSelectedObject(null);
      onSelectedObjectChange?.(null);
    });

    // Add keyboard event listener to document for better handling
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObj = fabricCanvas?.getActiveObject();
      if (!activeObj) return;

      const key = e.key;
      const step = e.shiftKey ? 10 : 1; // Shift = 10px, normal = 1px

      switch(key) {
        case 'ArrowUp':
          e.preventDefault();
          activeObj.set('top', activeObj.top - step);
          break;
        case 'ArrowDown': 
          e.preventDefault();
          activeObj.set('top', activeObj.top + step);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          activeObj.set('left', activeObj.left - step);
          break;
        case 'ArrowRight':
          e.preventDefault();
          activeObj.set('left', activeObj.left + step);
          break;
        case 'Enter':
          if (activeObj.type === 'textbox') {
            (activeObj as any).enterEditing?.();
          }
          break;
        case 'Delete':
        case 'Backspace':
          if (!(activeObj as any).isEditing) {
            fabricCanvas.remove(activeObj);
            toast.success("Text deleted");
          }
          break;
      }
      fabricCanvas?.requestRenderAll();
    };

    document.addEventListener('keydown', handleKeyDown);

    setFabricCanvas(canvas);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      canvas.dispose();
    };
  }, [currentSide, onSelectedObjectChange]);

  // Expose canvas methods globally
  useEffect(() => {
    if (!fabricCanvas || !window) return;

    // Expose canvas globally for tool access
    (window as any).designCanvas = {
      addText: (text: string = "Sample Text", options: any = {}) => {
        const textObj = new FabricText(text, {
          left: 150,
          top: 150,
          fontFamily: options.fontFamily || 'Arial',
          fontSize: options.fontSize || 24,
          fill: options.fill || (currentColor?.name === "White" || currentColor?.name === "Vintage White" || 
                currentColor?.name === "Yellow" || currentColor?.name === "Lime" || 
                currentColor?.name === "Pink" || currentColor?.name === "Light Blue" || 
                currentColor?.name === "Mint" || currentColor?.name === "Lavender" || 
                currentColor?.name === "Silver" || currentColor?.name === "Peach" || 
                currentColor?.name === "Heather Grey" || currentColor?.name === "Dusty Blue" || 
                currentColor?.name === "Coral" || currentColor?.name === "Sand" || 
                currentColor?.name === "Mustard" || currentColor?.name === "Gold" 
                ? '#000000' : '#FFFFFF'),
          // Text editing and interaction properties
          editable: true,
          selectable: true,
          moveable: true,
          hasControls: true,
          hasBorders: true,
          lockMovementX: false,
          lockMovementY: false,
          lockRotation: false,
          lockScalingX: false,
          lockScalingY: false,
          // Visual styling for controls
          cornerSize: 12,
          transparentCorners: false,
          cornerColor: '#4F46E5',
          cornerStyle: 'rect',
          borderColor: '#4F46E5',
          borderOpacityWhenMoving: 0.5,
          borderScaleFactor: 2,
          // Text-specific properties
          textAlign: options.textAlign || 'left',
          fontWeight: options.fontWeight || 'normal',
          fontStyle: options.fontStyle || 'normal',
          underline: options.underline || false,
          scaleX: options.scaleX || 1,
          scaleY: options.scaleY || 1,
          rotation: options.rotation || 0,
        });
        
        fabricCanvas.add(textObj);
        fabricCanvas.setActiveObject(textObj);
        fabricCanvas.renderAll();
        setSelectedObject(textObj);
        onSelectedObjectChange?.(textObj);
        
        console.log("Text added with properties:", textObj);
        toast.success("Text added to design");
      },
      
      canvas: fabricCanvas,
      
      addImage: (file: File) => {
        if (!file.type.startsWith("image/")) {
          toast.error("Please select a valid image file");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          FabricImage.fromURL(e.target?.result as string).then((img) => {
            const maxWidth = 200;
            const maxHeight = 200;
            const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
            
            img.set({
              left: 150,
              top: 150,
              scaleX: scale,
              scaleY: scale,
              hasControls: true,
              hasBorders: true,
              cornerSize: 10,
              transparentCorners: false,
              cornerColor: '#4F46E5',
              borderColor: '#4F46E5',
            });

            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
            setSelectedObject(img);
            onSelectedObjectChange?.(img);
            toast.success("Image added to design");
          });
        };
        reader.readAsDataURL(file);
      },

      deleteSelected: () => {
        if (!selectedObject) return;
        fabricCanvas.remove(selectedObject);
        fabricCanvas.renderAll();
        setSelectedObject(null);
        onSelectedObjectChange?.(null);
        toast.success("Element deleted");
      },

      duplicateSelected: () => {
        if (!selectedObject) return;
        selectedObject.clone((cloned: any) => {
          cloned.set({
            left: selectedObject.left + 20,
            top: selectedObject.top + 20,
          });
          fabricCanvas.add(cloned);
          fabricCanvas.setActiveObject(cloned);
          fabricCanvas.renderAll();
          setSelectedObject(cloned);
          onSelectedObjectChange?.(cloned);
        });
        toast.success("Element duplicated");
      },

      rotateSelected: () => {
        if (!selectedObject) return;
        selectedObject.rotate(selectedObject.angle + 15);
        fabricCanvas.renderAll();
        setSelectedObject(selectedObject);
        onSelectedObjectChange?.(selectedObject);
      },

      setRotation: (degrees: number) => {
        if (!selectedObject) return;
        selectedObject.rotate(degrees);
        fabricCanvas.renderAll();
        setSelectedObject(selectedObject);
        onSelectedObjectChange?.(selectedObject);
      },

      centerSelected: () => {
        if (!selectedObject) return;
        selectedObject.center();
        fabricCanvas.renderAll();
      },

      updateSelectedTextProperty: (property: string, value: any) => {
        if (!selectedObject || (selectedObject.type !== "textbox" && selectedObject.type !== "text")) {
          console.log("No text selected or wrong type:", selectedObject?.type);
          return;
        }
        console.log("Updating text property:", property, "to", value);
        selectedObject.set(property, value);
        selectedObject.setCoords();
        fabricCanvas.renderAll();
        fabricCanvas.requestRenderAll();
      },

      clearSelection: () => {
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
        setSelectedObject(null);
        onSelectedObjectChange?.(null);
      },

      addImageFromUrl: (url: string) => {
        FabricImage.fromURL(url).then((img) => {
          const maxWidth = 200;
          const maxHeight = 200;
          const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);
          
          img.set({
            left: 150,
            top: 150,
            scaleX: scale,
            scaleY: scale,
            hasControls: true,
            hasBorders: true,
            cornerSize: 10,
            transparentCorners: false,
            cornerColor: '#4F46E5',
            borderColor: '#4F46E5',
          });

          fabricCanvas.add(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          setSelectedObject(img);
          onSelectedObjectChange?.(img);
          toast.success("AI image added to design");
        });
      }
    };

    return () => {
      delete (window as any).designCanvas;
    };
  }, [fabricCanvas, selectedObject, onSelectedObjectChange]);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    fabricCanvas?.setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.3);
    setZoom(newZoom);
    fabricCanvas?.setZoom(newZoom);
  };

  const handleResetZoom = () => {
    setZoom(1);
    fabricCanvas?.setZoom(1);
  };

  const handleCanvasZoomIn = () => {
    setCanvasZoom(prev => Math.min(prev * 1.2, 2));
  };

  const handleCanvasZoomOut = () => {
    setCanvasZoom(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleCanvasResetZoom = () => {
    setCanvasZoom(1);
  };

  const calculateTotalPrice = (quantities: { [size: string]: number }) => {
    const totalItems = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    let pricePerItem = 12.99; // Base price
    
    // Volume discounts
    if (totalItems >= 50) pricePerItem = 9.99;
    else if (totalItems >= 25) pricePerItem = 10.99;
    else if (totalItems >= 12) pricePerItem = 11.99;
    
    return totalItems * pricePerItem;
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    const newQuantities = { ...quantities, [size]: Math.max(0, quantity) };
    setQuantities(newQuantities);
    setTotalPrice(calculateTotalPrice(newQuantities));
  };

  const getTotalItems = () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const handleCheckout = () => {
    const totalItems = getTotalItems();
    if (totalItems === 0) {
      toast.error("Please select at least one item");
      return;
    }
    
    toast.success(`Proceeding to checkout with ${totalItems} items - $${totalPrice.toFixed(2)}`);
    // Here you would typically redirect to checkout or open payment modal
  };

  return (
    <div className="flex-1 bg-muted/30 p-6 overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Canvas Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{currentSide === "front" ? "Front" : "Back"} Design</Badge>
            <Badge variant="outline">Design Zoom: {Math.round(zoom * 100)}%</Badge>
            <Badge variant="outline">View Zoom: {Math.round(canvasZoom * 100)}%</Badge>
          </div>
          
          {/* Canvas Controls */}
          <div className="flex items-center gap-2">
            {/* Design Canvas Zoom */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom out design area">
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleResetZoom} title="Reset design zoom">
                Fit
              </Button>
              <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom in design area">
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* T-shirt View Zoom */}
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={handleCanvasZoomOut} title="Zoom out t-shirt view">
                <ZoomOut className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCanvasResetZoom} title="Reset t-shirt zoom">
                <RefreshCw className="w-3 h-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleCanvasZoomIn} title="Zoom in t-shirt view">
                <ZoomIn className="w-3 h-3" />
              </Button>
            </div>
            
            {selectedObject && (
              <>
                <div className="w-px h-6 bg-border mx-2" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.duplicateSelected()}
                  title="Duplicate element"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.rotateSelected()}
                  title="Rotate"
                  className="hover:bg-primary/10"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.centerSelected()}
                  title="Center element"
                >
                  <Move className="w-4 h-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => (window as any).designCanvas?.deleteSelected()}
                  title="Delete element"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {/* Next Step Button */}
            <div className="w-px h-6 bg-border mx-2" />
            <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Next Step
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Choose Sizes & Quantities</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Bella Canvas 3001C - {selectedColor}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(quantities).map(([size, quantity]) => (
                        <div key={size} className="flex items-center justify-between">
                          <Label className="text-sm font-medium">{size}</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(size, quantity - 1)}
                              disabled={quantity === 0}
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={quantity}
                              onChange={(e) => handleQuantityChange(size, parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                              min="0"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(size, quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-semibold">
                      <span>Total ({getTotalItems()} items):</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Volume discounts applied automatically
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowCheckout(false)} className="flex-1">
                      Back to Design
                    </Button>
                    <Button onClick={handleCheckout} className="flex-1">
                      Checkout
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Canvas Container */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div 
            className="relative bg-card rounded-lg shadow-creative p-8 transition-transform duration-200"
            style={{ 
              transform: `scale(${canvasZoom})`,
              transformOrigin: 'center'
            }}
          >
            {/* T-shirt Background - REMOVED to prevent click interference */}

            {/* Design Area */}
            <div className="relative flex items-center justify-center">
              <div 
                className="relative"
                style={{
                  width: "500px",
                  height: "600px",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="relative border-2 border-dashed border-primary/30 rounded bg-transparent hover:border-primary/50 transition-colors"
                    style={{
                      width: "300px",
                      height: "350px",
                      marginTop: "80px",
                    }}
                  >
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 rounded"
                      style={{
                        width: "300px",
                        height: "350px",
                      }}
                    />
                    {/* Design area label */}
                    {!selectedObject && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
                          Design Area
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tool Cursor Indicator - REMOVED */}
          </div>
        </div>
      </div>
    </div>
  );
};
