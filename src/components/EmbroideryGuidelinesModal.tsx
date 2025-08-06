import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface EmbroideryGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmbroideryGuidelinesModal = ({ isOpen, onClose }: EmbroideryGuidelinesModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-6 h-6 text-warning" />
            Embroidery Guidelines
          </DialogTitle>
          <DialogDescription className="text-base">
            Please note: Not all designs are suitable for embroidery. To ensure quality stitching, embroidery is limited to:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* What Works */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-success flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              What Works Well for Embroidery
            </h3>
            <ul className="space-y-2 ml-7">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Text and basic spot-colour artwork only</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Left chest-sized front placements only</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Simple logos with solid colors</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Bold, clear text designs</span>
              </li>
            </ul>
          </div>

          {/* What Doesn't Work */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-destructive flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Not Suitable for Embroidery
            </h3>
            <ul className="space-y-2 ml-7">
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>No large back or full-front designs</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>Highly detailed or photographic images</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>Multi-gradient designs</span>
              </li>
              <li className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>Complex artwork with many colors</span>
              </li>
            </ul>
          </div>

          {/* Alternative Recommendation */}
          <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
            <p className="text-sm">
              <strong>For larger or more complex designs:</strong> Choose our Digital Print option.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};