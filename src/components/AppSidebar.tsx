// AppSidebar.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Store,
  Pencil,
  Trash2,
  AlertTriangle,
  Settings,
  Globe,
  Upload,
  History,
  MessageSquare,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { useProfile } from "@/contexts/ProfileContext";
import { useSetup } from "@/contexts/SetupContext";
import { useCustomers } from "@/hooks/useCustomers";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
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

  const now = new Date();

  const day = now
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
  const month = now
    .toLocaleDateString("en-US", { month: "short" })
    .toUpperCase();
  const dateNum = now.getDate();

  const shortDate = `${dateNum} ${month}, ${day}`;

  return (
    <Sidebar className="font-app border-r bg-gradient-to-b from-white to-white">
      {/* ===== Header ===== */}
      <SidebarHeader className="p-3">
        <div className="w-full">
          <div
            className="
        w-full
        px-4 py-3
        rounded-2xl
        border border-primary/30
        bg-primary/5
        shadow-sm
        flex items-center justify-between
      "
          >
            {/* Date */}
            <p className="text-xl font-bold text-primary tracking-wide">
              {shortDate}
            </p>

            {/* Calendar Icon */}
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 pb-6">
        <Accordion type="multiple" className="space-y-3">
          <PremiumAccordion
            title="Profile Settings"
            icon={<Settings className="text-indigo-600" />}
          >
            <SettingRow
              icon={<User className="text-blue-600" />}
              label="Owner"
              value={profile.ownerName}
              onEdit={() => startEditing("ownerName")}
            />
            <SettingRow
              icon={<Store className="text-emerald-600" />}
              label="Business"
              value={profile.businessName}
              onEdit={() => startEditing("businessName")}
            />
          </PremiumAccordion>

          <PremiumAccordion
            title="Share Website"
            icon={<Globe className="text-sky-600" />}
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

          <PremiumAccordion
            title="Message Templates"
            icon={<MessageSquare className="text-purple-600" />}
          >
            <MessageTemplateManager />
          </PremiumAccordion>

          <PremiumAccordion
            title="Reminder History"
            icon={<History className="text-orange-600" />}
          >
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/reminder-history")}
            >
              View History
            </Button>
          </PremiumAccordion>

          {installPrompt && (
            <PremiumAccordion
              title="Install App"
              icon={<Download className="text-green-600" />}
            >
              <Button className="w-full" onClick={handleInstallPWA}>
                Install Now
              </Button>
            </PremiumAccordion>
          )}

          {/* Danger Zone */}
          <AccordionItem value="danger" className="border-none">
            <AccordionTrigger className="px-4 py-3 rounded-xl bg-red-50 border text-red-600">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-app">Reset</span>
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

      {/* Edit Dialog */}
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

function PremiumAccordion({ title, icon, children }: any) {
  return (
    <AccordionItem value={title} className="border-none">
      <AccordionTrigger className="px-4 py-3 rounded-xl bg-white border shadow-sm">
        <div className="flex items-center gap-2 font-app font-app">
          {icon}
          <span>{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="p-2 space-y-2">{children}</AccordionContent>
    </AccordionItem>
  );
}

function SettingRow({ icon, label, value, onEdit }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-white border">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-app">{value}</p>
        </div>
      </div>
      <Button size="icon" variant="ghost" onClick={onEdit}>
        <Pencil className="w-4 h-4 text-gray-600" />
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
            destructive ? "text-red-600 border-red-300" : ""
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
