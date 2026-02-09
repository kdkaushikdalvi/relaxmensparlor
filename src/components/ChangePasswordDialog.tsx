import { useState } from 'react';
import { Lock, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function ChangePasswordDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        toast({ title: error.message || 'Failed to change password', variant: 'destructive' });
      } else {
        toast({ title: 'Password changed successfully' });
        setOpen(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="bg-card rounded-xl border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="font-app">Change Password</p>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-app">Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="h-12"
            minLength={6}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12"
            minLength={6}
          />
          <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
