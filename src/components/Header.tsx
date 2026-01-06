import { ThemeToggle } from './ThemeToggle';
import brandLogo from '@/assets/brand-logo.png';

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-border/30 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="w-10" /> {/* Spacer for centering */}
        <div className="flex items-center gap-3">
          <img 
            src={brandLogo} 
            alt="Relax Mens Parlor Logo" 
            className="w-14 h-14 object-contain drop-shadow-lg"
          />
          <div className="text-center">
            <h1 className="text-xl font-display font-semibold gradient-text tracking-wide">
              Relax Mens Parlor
            </h1>
            <p className="text-xs text-muted-foreground font-body tracking-wider uppercase">
              Customer Management
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
