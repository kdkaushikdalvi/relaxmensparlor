import { Menu } from 'lucide-react';
import { format } from 'date-fns';
import { useProfile } from '@/contexts/ProfileContext';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import brandLogo from '@/assets/brand-logo.png';

export function Header() {
  const { profile } = useProfile();
  const { toggleSidebar } = useSidebar();
  const today = format(new Date(), 'dd MMM');

  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b border-primary/20 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side: Menu + Logo + Text */}
        <div className="flex items-center gap-3">
          {/* Menu Button - Now on left */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-10 h-10 rounded-full glass border-border/30 hover:shadow-glow transition-all duration-300"
          >
            <Menu className="w-5 h-5 text-primary" />
            <span className="sr-only">Open menu</span>
          </Button>

          <div className="relative">
            {/* Animated glow ring */}
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-glow-pulse" />
            {/* Rotating border effect */}
            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-primary/40 animate-spin-slow" />
            {/* Logo container */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 shadow-glow bg-background">
              <img 
                src={brandLogo} 
                alt={`${profile.businessName} Logo`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-lg font-display font-semibold text-[hsl(var(--header-foreground))] tracking-wide">
              {profile.businessName}
            </h1>
            <p className="text-xs text-[hsl(var(--header-foreground)/0.7)] font-body tracking-wider uppercase">
              {profile.ownerName}
            </p>
          </div>
        </div>
        
        {/* Right side: Date Badge only */}
        <div className="flex items-center">
          {/* Today's Date Badge */}
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 border border-primary/30">
            <span className="text-xs font-semibold text-primary text-center leading-tight">
              {today}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
