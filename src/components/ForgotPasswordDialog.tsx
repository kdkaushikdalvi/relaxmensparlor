import { useState } from 'react';
import { Phone, Loader2, KeyRound } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ForgotPasswordDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'mobile' | 'reset'>('mobile');

  const toEmail = (phone: string) => `${phone.replace(/\D/g, '')}@relaxsalon.app`;

  const handleCheckMobile = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = mobile.replace(/\D/g, '');
    if (cleaned.length < 10) {
      toast({ title: 'Enter a valid 10-digit mobile number', variant: 'destructive' });
      return;
    }
    // Since we can't verify identity without email/OTP, we just move to reset step
    // The actual password reset will happen via admin or re-login
    setStep('reset');
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Try signing in won't work without old password, so we use signInWithPassword 
      // with a wrong password to check if account exists, then inform user
      const cleaned = mobile.replace(/\D/g, '');
      const email = toEmail(cleaned);
      
      // For mobile-based auth without email verification, the only way to reset
      // is if the user is already logged in (change password) or contact support.
      // We'll attempt a password reset via Supabase magic link as fallback.
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) {
        toast({ 
          title: 'Unable to reset password', 
          description: 'Please contact the app administrator for help.',
          variant: 'destructive' 
        });
      } else {
        toast({ 
          title: 'Password reset requested',
          description: 'Since this app uses mobile-based login, please contact support to reset your password.',
        });
        setOpen(false);
        setStep('mobile');
        setMobile('');
        setNewPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setStep('mobile'); setMobile(''); setNewPassword(''); } }}>
      <DialogTrigger asChild>
        <button type="button" className="text-primary text-sm hover:underline">
          Forgot password?
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-app flex items-center gap-2">
            <KeyRound className="w-5 h-5" />
            Reset Password
          </DialogTitle>
        </DialogHeader>
        {step === 'mobile' ? (
          <form onSubmit={handleCheckMobile} className="space-y-4">
            <p className="text-sm text-muted-foreground">Enter your registered mobile number</p>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                className="h-12 pl-11"
                maxLength={10}
              />
            </div>
            <Button type="submit" className="w-full h-12">Continue</Button>
          </form>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Since this app uses mobile-based login without email verification, password reset requires contacting the administrator.
            </p>
            <p className="text-sm font-medium">
              Please try to remember your password or create a new account.
            </p>
            <Button onClick={() => { setOpen(false); setStep('mobile'); }} className="w-full h-12" variant="outline">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
