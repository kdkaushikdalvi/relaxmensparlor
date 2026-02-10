import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Phone, LogIn, UserPlus, Loader2, User, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ForgotPasswordDialog } from '@/components/ForgotPasswordDialog';
import brandLogo from '@/assets/brand-logo-transparent.png';

const AuthPage = () => {
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const toEmail = (phone: string) => `${phone.replace(/\D/g, '')}@relaxsalon.app`;
  const toPassword = (p: string) => `${p}##`; // pad to meet 6-char minimum

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = mobile.replace(/\D/g, '');
    if (!cleaned || cleaned.length < 10) {
      toast({ title: 'Please enter a valid mobile number (min 10 digits)', variant: 'destructive' });
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast({ title: 'PIN must be exactly 4 digits', variant: 'destructive' });
      return;
    }

    if (!isLogin) {
      if (!ownerName.trim()) {
        toast({ title: 'Please enter your name', variant: 'destructive' });
        return;
      }
      if (!businessName.trim()) {
        toast({ title: 'Please enter your shop name', variant: 'destructive' });
        return;
      }
    }

    setIsSubmitting(true);
    const email = toEmail(cleaned);

    try {
      if (isLogin) {
        const { error } = await signIn(email, toPassword(pin));
        if (error) {
          const msg = error.message?.includes('Invalid login')
            ? 'Invalid mobile number or PIN'
            : error.message || 'Login failed';
          toast({ title: msg, variant: 'destructive' });
        }
      } else {
        const { error } = await signUp(email, toPassword(pin));
        if (error) {
          const msg = error.message?.includes('already registered')
            ? 'This mobile number is already registered. Please sign in.'
            : error.message || 'Signup failed';
          toast({ title: msg, variant: 'destructive' });
        } else {
          // Save profile to DB after successful signup
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await supabase.from('profiles').insert({
              user_id: session.user.id,
              owner_name: ownerName.trim(),
              business_name: businessName.trim(),
              mobile_number: cleaned,
              is_setup_complete: true,
            });
          }
          toast({ title: 'Account created! You are now signed in.' });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img src={brandLogo} alt="Logo" className="w-20 h-20 rounded-2xl" />
          <h1 className="text-2xl font-app font-bold text-foreground">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {isLogin ? 'Sign in to manage your salon' : 'Set up your salon in seconds'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Your name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className="h-12 pl-11" autoFocus />
              </div>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input placeholder="Shop name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-12 pl-11" />
              </div>
            </>
          )}

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input type="tel" placeholder="Mobile number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} className="h-12 pl-11" maxLength={10} />
          </div>

          <div className="relative">
            <Input
              type="password"
              inputMode="numeric"
              placeholder="4-digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="h-12 pl-4 text-center tracking-[0.5em] text-lg"
              maxLength={4}
            />
          </div>

          <Button type="submit" className="w-full h-12 gap-2 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <><LogIn className="w-5 h-5" /> Sign In</>
            ) : (
              <><UserPlus className="w-5 h-5" /> Sign Up</>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <div className="text-center space-y-2">
          {isLogin && <div><ForgotPasswordDialog /></div>}
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
