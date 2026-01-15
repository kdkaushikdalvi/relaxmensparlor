import { useNavigate, useLocation } from "react-router-dom";
import { Menu, Plus, RefreshCw } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import brandLogo from "@/assets/brand-logo.png";

export function Header() {
  const { profile } = useProfile();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === "/";

  const handleForceRefresh = () => {
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    }

    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-primary/10 shadow-lg shadow-black/5 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* LEFT */}
        <div className="flex items-center gap-4">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-11 h-11 rounded-xl border border-border/40 bg-background/60 shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <Menu className="w-5 h-5 text-primary" />
          </Button>

          {/* Business Info */}
          <div className="leading-tight">
            <h1 className="font-app uppercase text-bold text-purple-600 text-bold">
              {profile.businessName}
            </h1>
            <p className="text-xs  uppercase text-pink-500 text-bold">
              {profile.ownerName}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">
          {/* Force Refresh */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleForceRefresh}
            title="Force Refresh"
            className="w-11 h-11 rounded-xl relative overflow-hidden transition-all duration-300 active:scale-90 hover:-translate-y-0.5"
            style={{
              background:
                "linear-gradient(135deg, hsl(269.8, 70.3%, 60%), hsl(269.8, 70.3%, 48%))",
              boxShadow: "0 8px 20px hsla(269.8, 70.3%, 55.1%, 0.45)",
            }}
          >
            {/* Glow layer */}
            <div className="absolute inset-0 bg-[hsl(269.8,70.3%,55.1%)] opacity-40 blur-lg" />

            {/* Glass shine */}
            <div className="absolute inset-0 bg-white/10" />

            {/* Icon */}
            <RefreshCw className="w-5 h-5 text-white relative z-10 transition-transform duration-300 group-hover:rotate-180" />
          </Button>

          {/* Add Button */}
          {isHomePage && (
            <Button
              onClick={() => navigate("/customer/new")}
              className="w-11 h-11 rounded-xl relative overflow-hidden transition-all duration-300 active:scale-90 hover:-translate-y-0.5"
              style={{
                background:
                  "linear-gradient(135deg, hsl(269.8, 70.3%, 60%), hsl(269.8, 70.3%, 48%))",
                boxShadow: "0 8px 20px hsla(269.8, 70.3%, 55.1%, 0.45)",
              }}
              title="Add Customer"
            >
              {/* Glow */}
              <div className="absolute inset-0 rounded-full bg-[hsl(269.8,70.3%,55.1%)] blur-md opacity-60 animate-pulse" />

              {/* Icon */}
              <Plus className="w-6 h-6 relative z-10" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
