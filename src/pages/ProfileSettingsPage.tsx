import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Store, Phone, Check, Wifi, WifiOff } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useSetup } from "@/contexts/SetupContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { setupData, completeSetup, isOfflineMode, setOfflineMode } = useSetup();
  const { user } = useAuth();
  const { toast } = useToast();

  const [ownerName, setOwnerName] = useState(profile.ownerName || setupData.ownerName);
  const [businessName, setBusinessName] = useState(profile.businessName || setupData.businessName);
  const [mobileNumber, setMobileNumber] = useState(setupData.mobileNumber);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSave = async () => {
    if (!ownerName.trim() || !businessName.trim() || !mobileNumber.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    updateProfile({ ownerName: ownerName.trim(), businessName: businessName.trim() });
    completeSetup({
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      mobileNumber: mobileNumber.trim(),
    });

    // Save to DB if online
    if (!isOfflineMode && user) {
      try {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        const profileData = {
          owner_name: ownerName.trim(),
          business_name: businessName.trim(),
          mobile_number: mobileNumber.trim(),
          is_setup_complete: true,
          user_id: user.id,
        };

        if (existing) {
          await supabase.from('profiles').update(profileData).eq('id', existing.id);
        } else {
          await supabase.from('profiles').insert(profileData);
        }
      } catch (err) {
        console.error('Profile save error:', err);
      }
    }

    toast({ title: "Profile updated successfully" });
    navigate(-1);
  };

  const handleOfflineToggle = (checked: boolean) => {
    setOfflineMode(checked);
    toast({
      title: checked ? "Offline mode enabled" : "Online mode enabled",
      description: checked
        ? "Data will be stored locally on this device only."
        : "Data will be saved to the cloud database.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-12 w-12 rounded-full bg-primary/20 hover:bg-primary/20"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Button>
            <h1 className="text-lg font-app text-white">Profile Settings</h1>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Check className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Owner Name */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <label className="font-app">Owner Name</label>
          </div>
          <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Enter owner name" className="h-12" />
        </div>

        {/* Mobile Number */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <label className="font-app">Mobile Number</label>
          </div>
          <Input value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))} placeholder="Enter mobile number" type="tel" className="h-12" maxLength={10} />
        </div>

        {/* Business Name */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <label className="font-app">Business Name</label>
          </div>
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Enter business name" className="h-12" />
        </div>

        {/* Offline Mode Toggle */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                {isOfflineMode ? <WifiOff className="w-5 h-5 text-amber-600" /> : <Wifi className="w-5 h-5 text-amber-600" />}
              </div>
              <div>
                <label className="font-app block">Offline Mode</label>
                <p className="text-xs text-muted-foreground">
                  {isOfflineMode ? "Data stored locally only" : "Data synced to cloud"}
                </p>
              </div>
            </div>
            <Switch checked={isOfflineMode} onCheckedChange={handleOfflineToggle} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
