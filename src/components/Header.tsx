import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border safe-top">
      <div className="flex items-center justify-center gap-3 px-4 py-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full gradient-primary shadow-card">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-display font-semibold text-foreground tracking-wide">
            Relax Salon Parlor
          </h1>
          <p className="text-xs text-muted-foreground font-body tracking-wider uppercase">
            Customer Management
          </p>
        </div>
      </div>
    </header>
  );
}
