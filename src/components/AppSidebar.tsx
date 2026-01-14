// AppSidebar.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  User,
  Store,
  Pencil,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Settings,
  Sparkles,
  Globe,
  Upload,
  UserPlus,
  Copy,
  Share2,
  Check,
  History,
  MessageSquare,
  Download,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useProfile } from "@/contexts/ProfileContext";
import { useSetup } from "@/contexts/SetupContext";
import { useCustomers } from "@/hooks/useCustomers";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageTemplateManager } from "./MessageTemplateManager";
import brandLogo from "@/assets/brand-logo2.png";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const WEBSITE_URL = "https://relaxmensparlor.lovable.app";

export function AppSidebar() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { resetSetup, resetAll, setupData } = useSetup();
  const { customers } = useCustomers();

  const [editOpen, setEditOpen] = useState(false);
  const [editField, setEditField] = useState<
    "ownerName" | "businessName" | null
  >(null);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const startEditing = (field: "ownerName" | "businessName") => {
    setEditField(field);
    setEditValue(profile[field]);
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (editField && editValue.trim()) {
      updateProfile({ [editField]: editValue.trim() });
    }
    setEditOpen(false);
  };

  const resetProfile = () => {
    localStorage.removeItem("relax-salon-setup");
    localStorage.removeItem("relax-parlor-profile");
    resetSetup();
    window.location.reload();
  };

  const resetCustomers = () => {
    const defaultCustomer = {
      id: crypto.randomUUID(),
      fullName: setupData.ownerName || "Test Customer",
      mobileNumber: setupData.mobileNumber || "9999999999",
      visitingDate: new Date().toISOString().split("T")[0],
      interest: ["Haircut"],
      preferences: "Default test customer",
      createdAt: new Date().toISOString(),
      reminderInterval: "none" as const,
    };
    localStorage.setItem(
      "relax-salon-customers",
      JSON.stringify([defaultCustomer])
    );
    window.location.reload();
  };

  const handleInstallPWA = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setInstallPrompt(null);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(WEBSITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWebsite = async () => {
    if (navigator.share) {
      await navigator.share({
        title: profile.businessName,
        text: `Check out ${profile.businessName}!`,
        url: WEBSITE_URL,
      });
    } else {
      copyToClipboard();
    }
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const lines = content.split("\n").filter(Boolean);
      const customers = lines.slice(1).map((line) => {
        const [name, phone] = line.split(",").map((s) => s.trim());
        return { name, phone, visits: [] };
      });
      const existing = JSON.parse(
        localStorage.getItem("relax-salon-customers") || "[]"
      );
      localStorage.setItem(
        "relax-salon-customers",
        JSON.stringify([...existing, ...customers])
      );
      window.location.reload();
    };
    reader.readAsText(file);
  };

  return (
    <Sidebar className="border-r border-white/10 bg-gradient-to-b from-background/80 via-background/90 to-background/80 backdrop-blur-xl">
      {/* ===== Header ===== */}
      <SidebarHeader className="p-2">
        <div className="rounded-xl p-2 bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-white/20 shadow-md flex items-center gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl bg-white/30 flex items-center justify-center shrink-0">
            <img
              src={brandLogo}
              className="w-[100%] h-[100%] object-contain border border-white/20 border-rose-700 rounded-xl"
              alt="Logo"
            />
          </div>

          {/* Name + Status */}
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-semibold text-sm leading-tight truncate">
              {profile.businessName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-[11px] text-muted-foreground">Active</span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pb-6">
        <Accordion type="multiple" className="space-y-3">
          {/* ========== PROFILE ========== */}
          <PremiumAccordion
            title="Profile Settings"
            icon={<Settings className="w-4 h-4" />}
          >
            <SettingRow
              icon={<User className="w-4 h-4" />}
              label="Owner"
              value={profile.ownerName}
              onEdit={() => startEditing("ownerName")}
            />
            <SettingRow
              icon={<Store className="w-4 h-4" />}
              label="Business"
              value={profile.businessName}
              onEdit={() => startEditing("businessName")}
            />
          </PremiumAccordion>

          {/* ========== SHARE ========== */}
          <PremiumAccordion
            title="Share Website"
            icon={<Globe className="w-4 h-4" />}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-3 rounded-xl shadow">
                <QRCodeSVG value={WEBSITE_URL} size={120} />
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={copyToClipboard}
              >
                {copied ? "Copied!" : "Copy Link"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={shareWebsite}
              >
                Share
              </Button>
              <Button
                className="w-full"
                onClick={() => window.open(WEBSITE_URL)}
              >
                Open Website
              </Button>
            </div>
          </PremiumAccordion>

          {/* ========== TEMPLATES ========== */}
          <PremiumAccordion
            title="Message Templates"
            icon={<MessageSquare className="w-4 h-4" />}
          >
            <MessageTemplateManager />
          </PremiumAccordion>

          {/* ========== HISTORY ========== */}
          <PremiumAccordion
            title="Reminder History"
            icon={<History className="w-4 h-4" />}
          >
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/reminder-history")}
            >
              View History
            </Button>
          </PremiumAccordion>

          {/* ========== IMPORT ========== */}
          <PremiumAccordion
            title="Import Customers"
            icon={<Upload className="w-4 h-4" />}
          >
            <label>
              <Button variant="outline" className="w-full">
                Choose CSV File
              </Button>
              <input
                type="file"
                hidden
                accept=".csv"
                onChange={handleFileImport}
              />
            </label>
          </PremiumAccordion>

          {/* ========== INSTALL ========== */}
          {installPrompt && (
            <PremiumAccordion
              title="Install App"
              icon={<Download className="w-4 h-4" />}
            >
              <Button className="w-full" onClick={handleInstallPWA}>
                Install Now
              </Button>
            </PremiumAccordion>
          )}

          {/* ========== DANGER ZONE ========== */}
          <AccordionItem value="danger" className="border-none">
            <AccordionTrigger className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Danger Zone
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 p-2">
              <ConfirmReset label="Reset Profile" onConfirm={resetProfile} />
              <ConfirmReset
                label="Reset Customers"
                onConfirm={resetCustomers}
              />
              <ConfirmReset
                label="Reset Everything"
                onConfirm={resetAll}
                destructive
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SidebarContent>

      {/* ===== Edit Dialog ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit</DialogTitle>
            <DialogDescription>Update value</DialogDescription>
          </DialogHeader>
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <Button onClick={saveEdit}>Save</Button>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}

/* ============================= */
/* Small Components */
/* ============================= */

function PremiumAccordion({ title, icon, children }: any) {
  return (
    <AccordionItem value={title} className="border-none">
      <AccordionTrigger className="px-4 py-3 rounded-xl bg-white/70 dark:bg-black/40 border backdrop-blur-xl shadow">
        <div className="flex items-center gap-2">
          {icon} {title}
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-2 space-y-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

function SettingRow({ icon, label, value, onEdit }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-black/30 border">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-medium">{value}</p>
        </div>
      </div>
      <Button size="icon" variant="ghost" onClick={onEdit}>
        <Pencil className="w-4 h-4" />
      </Button>
    </div>
  );
}

function ConfirmReset({ label, onConfirm, destructive = false }: any) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start ${
            destructive ? "text-red-500 border-red-500/30" : ""
          }`}
        >
          <Trash2 className="w-4 h-4 mr-2" /> {label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Yes, Reset</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
