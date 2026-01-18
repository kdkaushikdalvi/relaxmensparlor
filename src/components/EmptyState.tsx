import { Users, Search, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/contexts/ProfileContext";

interface EmptyStateProps {
  type: "no-customers" | "no-results";
  searchQuery?: string;
}

export function EmptyState({ type, searchQuery }: EmptyStateProps) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const shopName = profile.businessName || "your shop";

  if (type === "no-results") {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-display font-app text-foreground mb-2">
          No results found
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          No customers match "{searchQuery}". Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
      <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mb-8 shadow-glow animate-float animate-glow-pulse">
        <Users className="w-12 h-12 text-primary-foreground" />
      </div>
      <h3 className="text-2xl font-display font-app text-foreground mb-3">
        No customers added yet
      </h3>
      <p className="text-muted-foreground text-sm max-w-xs mb-8">
        Start building your customer base at {shopName} by adding your first customer.
      </p>
      <Button
        size="lg"
        onClick={() => navigate("/customer/new")}
        className="h-14 px-8 text-lg gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg"
      >
        <Plus className="w-6 h-6" />
        Add Customer
      </Button>
    </div>
  );
}
