import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Lock, Sparkles } from 'lucide-react';
import brandLogo from '@/assets/brand-logo.png';

const getTodayPin = () => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${day}${month}`;
};

const STORAGE_KEY = 'app_pin_verified_date';

const getTodayDateString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

export const PinProtection = ({ children }: { children: React.ReactNode }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const storedDate = localStorage.getItem(STORAGE_KEY);
    const todayDate = getTodayDateString();
    
    // Check if already verified today (using full date string for daily reset)
    if (storedDate === todayDate) {
      setIsLocked(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const todayPin = getTodayPin();
    const todayDate = getTodayDateString();
    
    if (pin === todayPin) {
      // Store the full date string so it only needs to be entered once per day
      localStorage.setItem(STORAGE_KEY, todayDate);
      setIsLocked(false);
      setError('');
    } else {
      setError('Invalid PIN. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPin('');
    }
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <Dialog open={isLocked} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md border-0 bg-gradient-to-br from-background via-background to-primary/5 shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          {/* Logo with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-lg">
              <img 
                src={brandLogo} 
                alt="Brand Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          {/* Title and description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Secure Access
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Welcome back! Enter today's security PIN to access your customer management dashboard.
            </p>
          </div>

          {/* Decorative element */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span>Your data is protected with daily verification</span>
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>

          {/* PIN Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Enter 4-Digit PIN
              </label>
              <Input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                placeholder="••••"
                className={`text-center text-2xl tracking-[0.5em] font-mono h-14 bg-muted/50 border-2 transition-all duration-200 ${
                  shake ? 'animate-shake border-destructive' : 'border-border focus:border-primary'
                }`}
                autoFocus
              />
              {error && (
                <p className="text-destructive text-sm animate-fade-in">{error}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
              disabled={pin.length !== 4}
            >
              <Lock className="w-4 h-4 mr-2" />
              Unlock Dashboard
            </Button>
          </form>

          {/* Hint */}
          <div className="text-xs text-muted-foreground/60 bg-muted/30 rounded-lg px-4 py-2">
            💡 Hint: Today's PIN format is <span className="font-mono font-semibold text-primary">DDMM</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
