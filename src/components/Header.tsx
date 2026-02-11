import { useNavigate, useLocation } from "react-router-dom";
import { Menu, RefreshCw } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const { profile } = useProfile();
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const isHomePage = location.pathname === "/";

  const handleForceRefresh = async () => {
    setIsRefreshing(true);

    // Let loader render before heavy work
    await new Promise((res) => setTimeout(res, 500));

    // Clear caches
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }

    // Unregister service workers
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
    setIsRefreshing(false);

    // Reload app
    window.location.reload();
  };

  return (
    <>
      {/* FULLSCREEN LOADER */}
      {isRefreshing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/90 shadow-xl">
            <RefreshCw className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="text-sm font-semibold text-gray-700">
              Refreshing app...
            </p>
          </div>
        </div>
      )}

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
              <h1 className=" text-lg font-app uppercase text-bold bg-gradient-to-r from-pink-500 via-blue-800 to-red-800 bg-clip-text text-transparent loading-glow">
                {profile.businessName}
              </h1>
              <p className="text-xs uppercase bg-gradient-to-r from-green-800 via-blue-800 to-red-800 bg-clip-text text-transparent">
                {profile.ownerName}
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-1">
            {/* Force Refresh */}
            <div
              onClick={!isRefreshing ? handleForceRefresh : undefined}
              title="Force Refresh"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (!isRefreshing && (e.key === "Enter" || e.key === " ")) {
                  handleForceRefresh();
                }
              }}
              className={`w-8 h-8 rounded-xl relative overflow-hidden flex items-center justify-center
    transition-all duration-300 active:scale-90 hover:-translate-y-0.5
    ${isRefreshing ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                background:
                  "linear-gradient(135deg, hsl(269.8, 70.3%, 60%), hsl(269.8, 70.3%, 48%))",
                boxShadow: "0 8px 20px hsla(269.8, 70.3%, 55.1%, 0.45)",
                pointerEvents: isRefreshing ? "none" : "auto",
              }}
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-[hsl(269.8,70.3%,55.1%)] opacity-40 blur-lg" />

              {/* Glass */}
              <div className="absolute inset-0 bg-white/10" />

              {/* Icon */}
              <RefreshCw
                className={`w-4 h-4 text-white relative z-10 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
