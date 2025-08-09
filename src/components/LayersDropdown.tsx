import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface LayersDropdownProps {
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onBringForward?: () => void;
  onSendBackward?: () => void;
  trigger?: React.ReactNode; // custom trigger (icon button for overlays)
  align?: "start" | "center" | "end";
}

export function LayersDropdown({
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  trigger,
  align = "start",
}: LayersDropdownProps) {
  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-1">
      Layer
      <ChevronDown className="h-3 w-3" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? defaultTrigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent sideOffset={6} align={align} className="min-w-48 z-[10000]">
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onBringToFront?.(); }}>
          Bring to Front
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onBringForward?.(); }}>
          Bring Forward
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onSendBackward?.(); }}>
          Send Backward
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onSendToBack?.(); }}>
          Send to Back
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
