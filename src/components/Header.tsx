import { ThemeToggle } from './ThemeToggle';
import brandLogo from '@/assets/brand-logo.png';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b border-primary/20 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Animated glow ring */}
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-glow-pulse" />
            {/* Rotating border effect */}
            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-primary/40 animate-spin-slow" />
            {/* Logo container */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/50 shadow-glow bg-background">
              <img 
                src={brandLogo} 
                alt="Relax Mens Parlor Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-lg font-display font-semibold text-[hsl(var(--header-foreground))] tracking-wide">
              Relax Mens Parlor
            </h1>
            <p className="text-xs text-[hsl(var(--header-foreground)/0.7)] font-body tracking-wider uppercase">
              Jaying Gadekar
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
