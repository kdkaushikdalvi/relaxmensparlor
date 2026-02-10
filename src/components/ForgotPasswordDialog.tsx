import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ForgotPasswordDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-primary text-sm hover:underline">
          Forgot PIN?
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-app flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Reset PIN
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Since this app uses mobile-based login without email, PIN reset requires contacting the administrator.
          </p>
          <p className="text-sm font-medium">
            Please try to remember your PIN or create a new account with a different mobile number.
          </p>
          <Button onClick={() => setOpen(false)} className="w-full h-12" variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}