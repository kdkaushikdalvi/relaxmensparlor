import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, LogIn, UserPlus, Loader2 } from 'lucide-react';
import brandLogo from '@/assets/brand-logo-transparent.png';

const AuthPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({ title: 'Please fill in all fields', variant: 'destructive' });
      return;
    }

    if (password.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          const msg = error.message?.includes('Invalid login')
            ? 'Invalid email or password'
            : error.message || 'Login failed';
          toast({ title: msg, variant: 'destructive' });
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          const msg = error.message?.includes('already registered')
            ? 'This email is already registered. Please sign in.'
            : error.message || 'Signup failed';
          toast({ title: msg, variant: 'destructive' });
        } else {
          toast({ title: 'Account created! Please check your email to verify your account.' });
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
            {isLogin ? 'Sign in to manage your salon' : 'Sign up to get started'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 pl-11"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 pl-11"
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full h-12 gap-2 text-base" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Sign Up
              </>
            )}
          </Button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-muted-foreground">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
