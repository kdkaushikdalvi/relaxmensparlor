import { useNavigate } from "react-router-dom";
import { X, Send, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WhatsAppReviewDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  message: string;
  customerName: string;
}

export function WhatsAppReviewDialog({
  open,
  onClose,
  onSubmit,
  message,
  customerName,
}: WhatsAppReviewDialogProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl p-0 gap-0 [&>button]:hidden w-full h-full sm:w-auto sm:h-auto sm:max-h-[85vh] max-sm:rounded-none max-sm:max-w-full">
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <DialogTitle className="text-base">Review Message</DialogTitle>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </DialogHeader>

        {/* Message preview */}
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1.5">To: {customerName}</p>
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-3 text-sm whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
            {message}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 p-4 pt-2 border-t">
          <Button onClick={onSubmit} className="w-full gap-2 h-11">
            <Send className="w-4 h-4" />
            Submit
          </Button>
          <Button
            variant="outline"
            className="w-full gap-2 h-11"
            onClick={() => {
              onClose();
              navigate("/message-templates");
            }}
          >
            <Pencil className="w-4 h-4" />
            Edit Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
