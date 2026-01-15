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
  const isCustomerForm = location.pathname === "/customer/new" || location.pathname.endsWith("/edit");

  // Get current step title for form page
  const getFormTitle = () => {
    if (location.pathname === "/customer/new") {
      return "Add Customer";
    }
    return "Edit Customer";
  };

  const handleForceRefresh = () => {
    // Clear all caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    // Clear service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
      });
    }
    // Force reload
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-primary/10 safe-top">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="w-11 h-11 rounded-xl border border-border/40 bg-background/60 shadow-sm hover:shadow-md transition-all"
          >
            <Menu className="w-5 h-5 text-primary" />
          </Button>

          {/* Animated Logo */}
          <div className="relative">
            {/* Glow pulse */}
            <div className="absolute inset-0 rounded-full bg-primary/30 blur-md animate-pulse" />

            {/* Rotating dashed ring */}
            <div className="absolute -inset-1 rounded-full border-2 border-dashed border-primary/50 animate-spin-slow" />

            {/* Logo container */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/60 shadow-lg bg-background">
              <img
                src={brandLogo}
                alt={`${profile.businessName} Logo`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Business Info */}
          <div className="leading-tight">
            <h1 className="text-base font-app tracking-tight font-app uppercase">
              {profile.businessName}
            </h1>
            <p className="text-xs text-muted-foreground font-app uppercase">
              {profile.ownerName}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Force Refresh Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleForceRefresh}
            className="w-10 h-10 rounded-xl"
            title="Force Refresh"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </Button>

          {/* Add Customer Button - Only on home page */}
          {isHomePage && (
            <Button
              onClick={() => navigate("/customer/new")}
              className="h-10 px-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/30"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
