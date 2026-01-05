import { Users, Search } from 'lucide-react';

interface EmptyStateProps {
  type: 'no-customers' | 'no-results';
  searchQuery?: string;
}

export function EmptyState({ type, searchQuery }: EmptyStateProps) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
          No results found
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          No customers match "{searchQuery}". Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-glow animate-pulse-soft">
        <Users className="w-10 h-10 text-primary-foreground" />
      </div>
      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
        Welcome to Relax Salon!
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-6">
        Start building your customer base by adding your first customer.
      </p>
      <p className="text-xs text-muted-foreground">
        Tap the <span className="text-primary font-medium">+</span> button below to get started
      </p>
    </div>
  );
}
