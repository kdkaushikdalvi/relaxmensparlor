import { Menu } from "lucide-react";
import { format } from "date-fns";
import { useProfile } from "@/contexts/ProfileContext";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import brandLogo from "@/assets/brand-logo.png";

export function Header() {
  const { profile } = useProfile();
  const { toggleSidebar } = useSidebar();

  const day = format(new Date(), "EEE"); // Sat
  const dateNum = format(new Date(), "dd"); // 10
  const month = format(new Date(), "MMM"); // Jan

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
            <h1 className="text-base font-semibold tracking-tight">
              {profile.businessName}
            </h1>
            <p className="text-xs text-muted-foreground">
              {profile.ownerName}
            </p>
          </div>
        </div>

        {/* Right Section - Date Widget */}
        <div className="flex items-center">
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-primary/20 bg-primary/5 shadow-sm">

            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                {day}
              </p>
              <p className="text-2xl font-bold text-primary leading-none">
                {dateNum}
              </p>
            </div>

            <div className="text-lg font-semibold text-primary/80">
              {month}
            </div>

          </div>
        </div>

      </div>
    </header>
  );
}
