// AppSidebar.tsx - Simplified navigation with page routes
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  AlertTriangle,
  MessageSquare,
  Download,
  History,
  UserCircle,
  RotateCcw,
  Share2,
  Scissors,
  LogOut,
} from "lucide-react";
import { useSetup } from "@/contexts/SetupContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import brandLogo from "@/assets/brand-logo2.png";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

export function AppSidebar() {
  const navigate = useNavigate();
  const { resetAll } = useSetup();
  const { signOut } = useAuth();
  const { toggleSidebar } = useSidebar();

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const now = new Date();
  const day = now.toLocaleDateString("mr-IN", { weekday: "long" });
  const month = now.toLocaleDateString("mr-IN", { month: "long" });
  const dateNum = now.getDate();
  const formattedDate = `${dateNum} ${month}
                         ${day}`;

  const navigateTo = (path: string) => {
    navigate(path);
    toggleSidebar();
  };

  return (
    <Sidebar className="font-app border-r bg-gradient-to-b from-white to-white">
      {/* ===== Header ===== */}
      <SidebarHeader className="p-3">
        <div className="w-full">
          <div className="w-full px-4 py-3 rounded-2xl border border-primary/30 bg-primary/5 shadow-sm flex items-center justify-between">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/40 blur-lg animate-pulse" />
              <div className="absolute -inset-1 rounded-full border-2 border-dashed border-primary/50 animate-spin-slow" />
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/60 shadow-lg bg-background">
                <img src={brandLogo} className="w-full h-full object-cover" />
              </div>
            </div>
            <p className="text-xl font-app tracking-wide ml-4 bg-gradient-to-r from-pink-500 via-blue-800 to-red-800 bg-clip-text text-transparent">
              {formattedDate}
            </p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pb-6">
        <div className="space-y-2">
          <NavButton icon={<UserCircle className="w-5 h-5 text-indigo-600" />} label="Profile" onClick={() => navigateTo("/profile")} />
          <NavButton icon={<MessageSquare className="w-5 h-5 text-purple-600" />} label="Template" onClick={() => navigateTo("/message-templates")} />
          <NavButton icon={<History className="w-5 h-5 text-blue-600" />} label="History" onClick={() => navigateTo("/reminder-history")} />
          <NavButton icon={<Scissors className="w-5 h-5 text-amber-600" />} label="Services" onClick={() => navigateTo("/services")} />
          <NavButton icon={<Share2 className="w-5 h-5 text-sky-600" />} label="Share" onClick={() => navigateTo("/share")} />
          <NavButton icon={<RotateCcw className="w-5 h-5 text-red-500" />} label="Reset" onClick={() => setResetOpen(true)} variant="danger" />
          <NavButton icon={<Download className="w-5 h-5 text-green-600" />} label="Install App" onClick={handleInstallPWA} />
          <NavButton
            icon={<LogOut className="w-5 h-5 text-gray-600" />}
            label="Sign Out"
            onClick={async () => {
              await signOut();
              toggleSidebar();
            }}
          />
        </div>
      </SidebarContent>

      {/* Reset Sheet */}
      <Sheet open={resetOpen} onOpenChange={setResetOpen}>
        <SheetContent side="left" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Reset Options
            </SheetTitle>
            <SheetDescription>These actions cannot be undone</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-2">
            <ConfirmReset
              label="Reset Everything"
              onConfirm={resetAll}
              destructive
            />
          </div>
        </SheetContent>
      </Sheet>
    </Sidebar>
  );
}

function NavButton({
  icon, label, onClick, variant,
}: {
  icon: React.ReactNode; label: string; onClick: () => void; variant?: "danger";
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm transition-all hover:shadow-md active:scale-[0.98] ${
        variant === "danger" ? "bg-red-50 border-red-200 hover:bg-red-100" : "bg-white hover:bg-gray-50"
      }`}
    >
      {icon}
      <span className={`font-app font-medium ${variant === "danger" ? "text-red-600" : "text-foreground"}`}>
        {label}
      </span>
    </button>
  );
}

function ConfirmReset({ label, onConfirm, destructive = false }: any) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={`w-full justify-start ${destructive ? "text-red-600 border-red-300" : ""}`}>
          <Trash2 className="w-4 h-4 mr-2" /> {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription>This will delete all your data. This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, Reset</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
