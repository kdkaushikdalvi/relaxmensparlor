import { useState } from "react";
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
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useProfile } from "@/contexts/ProfileContext";
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
import brandLogo from "@/assets/brand-logo-transparent.png";

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
  const { profile, updateProfile } = useProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [editField, setEditField] = useState<
    "ownerName" | "businessName" | null
  >(null);
  const [editValue, setEditValue] = useState("");
  const [copied, setCopied] = useState(false);

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
    setEditField(null);
    setEditValue("");
  };

  const resetKey = (key: string) => {
    localStorage.removeItem(key);
    window.location.reload();
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(WEBSITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareWebsite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.businessName,
          text: `Check out ${profile.businessName}!`,
          url: WEBSITE_URL,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      // Simple CSV parsing (name, phone format)
      if (file.name.endsWith('.csv')) {
        const lines = content.split('\n').filter(line => line.trim());
        const customers = lines.slice(1).map(line => {
          const [name, phone] = line.split(',').map(s => s.trim());
          return { name, phone, visits: [] };
        }).filter(c => c.name && c.phone);
        
        // Merge with existing customers
        const existing = JSON.parse(localStorage.getItem('relax-salon-customers') || '[]');
        localStorage.setItem('relax-salon-customers', JSON.stringify([...existing, ...customers]));
        window.location.reload();
      }
    };
    reader.readAsText(file);
  };

  return (
    <Sidebar className="border-r border-border/50 bg-gradient-to-b from-background via-background to-background/95 backdrop-blur-xl">
      {/* Header */}
      <SidebarHeader className="p-3 sm:p-6 border-b border-border/40">
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg">
            <img
              src={brandLogo}
              alt="Brand Logo"
              className="w-[85%] h-[85%] object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-semibold text-primary truncate max-w-[180px]">
              {profile.businessName}
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Accordion Content */}
      <SidebarContent className="py-3 px-2 sm:py-4">
        <Accordion type="multiple" className="space-y-2">

          {/* ========== PROFILE ========== */}
          <AccordionItem value="profile" className="border-none">
            <AccordionTrigger className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-card/50 border hover:bg-card transition-colors">
              <SidebarGroupLabel className="p-0 flex items-center gap-2 text-sm sm:text-base">
                <Settings className="w-4 h-4 flex-shrink-0" /> 
                <span>Profile Settings</span>
              </SidebarGroupLabel>
            </AccordionTrigger>

            <AccordionContent className="pb-0">
              <SidebarGroup>
                <SidebarGroupContent className="px-1 pt-2 space-y-2">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Owner</p>
                        <p className="font-medium text-sm sm:text-base truncate">{profile.ownerName}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => startEditing("ownerName")}>
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>

                  {/* Business */}
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl border bg-card/50 hover:bg-card transition-colors">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] sm:text-xs text-muted-foreground">Business</p>
                        <p className="font-medium text-sm sm:text-base truncate">{profile.businessName}</p>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" onClick={() => startEditing("businessName")}>
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </AccordionContent>
          </AccordionItem>

          {/* ========== APPEARANCE ========== */}
          <AccordionItem value="appearance" className="border-none">
            <AccordionTrigger className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-card/50 border hover:bg-card transition-colors">
              <SidebarGroupLabel className="p-0 flex items-center gap-2 text-sm sm:text-base">
                <Palette className="w-4 h-4 flex-shrink-0" /> 
                <span>Appearance</span>
              </SidebarGroupLabel>
            </AccordionTrigger>

            <AccordionContent className="pb-0">
              <SidebarMenu className="px-1 pt-2">
                <SidebarMenuItem>
                  <SidebarMenuButton className="h-auto py-2.5 sm:py-3">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-sm sm:text-base">Theme</span>
                      <ThemeToggle />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </AccordionContent>
          </AccordionItem>

          {/* ========== SHARE ========== */}
          <AccordionItem value="share" className="border-none">
            <AccordionTrigger className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-card/50 border hover:bg-card transition-colors">
              <SidebarGroupLabel className="p-0 flex items-center gap-2 text-sm sm:text-base">
                <Globe className="w-4 h-4 flex-shrink-0" /> 
                <span>Share Website</span>
              </SidebarGroupLabel>
            </AccordionTrigger>

            <AccordionContent className="pb-0">
              <div className="flex flex-col items-center gap-3 py-3 px-2">
                <div className="bg-white p-3 rounded-xl shadow-md">
                  <QRCodeSVG value={WEBSITE_URL} size={120} />
                </div>
                <p className="text-[10px] sm:text-xs break-all text-center text-muted-foreground px-2 leading-relaxed">
                  {WEBSITE_URL}
                </p>
                
                <div className="grid grid-cols-1 gap-2 w-full px-2">
                  <Button 
                    size="sm" 
                    onClick={copyToClipboard} 
                    variant="outline" 
                    className="w-full h-9 text-xs sm:text-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={shareWebsite} 
                    variant="outline" 
                    className="w-full h-9 text-xs sm:text-sm"
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> 
                    Share
                  </Button>
                  
                  <Button 
                    size="sm" 
                    onClick={() => window.open(WEBSITE_URL, "_blank")} 
                    className="w-full h-9 text-xs sm:text-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> 
                    Open Website
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ========== IMPORT CONTACTS ========== */}
          <AccordionItem value="import" className="border-none">
            <AccordionTrigger className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-card/50 border hover:bg-card transition-colors">
              <SidebarGroupLabel className="p-0 flex items-center gap-2 text-sm sm:text-base">
                <UserPlus className="w-4 h-4 flex-shrink-0" /> 
                <span>Import Contacts</span>
              </SidebarGroupLabel>
            </AccordionTrigger>

            <AccordionContent className="pb-0">
              <div className="flex flex-col gap-3 py-3 px-2">
                <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed px-1">
                  Import customers from a CSV file with columns: <strong>name</strong>, <strong>phone</strong>
                </p>
                
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline" className="w-full h-9 text-xs sm:text-sm pointer-events-none">
                    <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> 
                    Choose CSV File
                  </Button>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileImport}
                  className="hidden"
                />
                
                <div className="text-[10px] sm:text-xs text-muted-foreground space-y-1.5 p-2.5 sm:p-3 bg-muted/50 rounded-lg border">
                  <p className="font-semibold text-foreground">CSV Format Example:</p>
                  <code className="block bg-background p-2 rounded text-[10px] leading-relaxed overflow-x-auto">
                    name,phone<br />
                    John Doe,1234567890<br />
                    Jane Smith,9876543210
                  </code>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* ========== RESET ========== */}
          <AccordionItem value="reset" className="border-none">
            <AccordionTrigger className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-colors">
              <SidebarGroupLabel className="p-0 flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> 
                <span>Reset Actions</span>
              </SidebarGroupLabel>
            </AccordionTrigger>

            <AccordionContent className="space-y-2 px-1 pt-2 pb-0">
              <ConfirmReset
                label="Reset PIN"
                title="Reset App PIN"
                description="This will ask for PIN again."
                onConfirm={() => resetKey("app_pin_verified_date")}
              />

              <ConfirmReset
                label="Reset Profile"
                title="Reset Profile"
                description="This will delete profile info."
                onConfirm={() => resetKey("relax-parlor-profile")}
              />

              <ConfirmReset
                label="Remove All Customers"
                title="Delete All Customers"
                description="This cannot be undone."
                onConfirm={() => resetKey("relax-salon-customers")}
              />
            </AccordionContent>
          </AccordionItem>

        </Accordion>
      </SidebarContent>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[90vw] max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Edit Information</DialogTitle>
            <DialogDescription className="text-sm">Update the value below</DialogDescription>
          </DialogHeader>

          <Input 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)} 
            autoFocus 
            className="h-10 text-base"
          />

          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="h-9">
              Cancel
            </Button>
            <Button onClick={saveEdit} className="h-9">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}

/* ============================= */
/* Confirm Reset Button */
/* ============================= */

function ConfirmReset({
  title,
  description,
  onConfirm,
  label,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  label: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10 h-9 text-xs sm:text-sm"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" /> 
          {label}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="w-[90vw] max-w-md rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm">{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="h-9 w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="h-9 w-full sm:w-auto m-0">
            Yes, Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}