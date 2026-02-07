import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Store, Phone, Check, Database } from "lucide-react";
import { useProfile } from "@/contexts/ProfileContext";
import { useSetup } from "@/contexts/SetupContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfileSettingsPage = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const { setupData, completeSetup } = useSetup();
  const { toast } = useToast();

  const [ownerName, setOwnerName] = useState(profile.ownerName || setupData.ownerName);
  const [businessName, setBusinessName] = useState(profile.businessName || setupData.businessName);
  const [mobileNumber, setMobileNumber] = useState(setupData.mobileNumber);
  const [useDatabase, setUseDatabase] = useState(() => {
    return localStorage.getItem('relax-salon-use-db') === 'true';
  });
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSave = () => {
    if (!ownerName.trim() || !businessName.trim() || !mobileNumber.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    updateProfile({ ownerName: ownerName.trim(), businessName: businessName.trim() });
    completeSetup({
      ownerName: ownerName.trim(),
      businessName: businessName.trim(),
      mobileNumber: mobileNumber.trim(),
    });
    
    toast({ title: "Profile updated successfully" });
    navigate(-1);
  };

  const handleToggleDatabase = async (checked: boolean) => {
    if (checked) {
      setIsMigrating(true);
      try {
        // Migrate customers
        const customersRaw = localStorage.getItem('relax-salon-customers');
        if (customersRaw) {
          const customers = JSON.parse(customersRaw);
          for (const c of customers) {
            const { error } = await supabase.from('customers').upsert({
              id: c.id,
              customer_id: c.customerId || 0,
              full_name: c.fullName,
              mobile_number: c.mobileNumber,
              interest: c.interest || [],
              preferences: c.preferences || '',
              visiting_date: c.visitingDate || '',
              reminder_interval: c.reminderInterval || 'none',
              reminder_date: c.reminderDate || null,
              reminder_sent_dates: c.reminderSentDates || [],
            });
            if (error) console.error('Customer migration error:', error);

            // Migrate reminder history
            if (c.reminderHistory?.length) {
              for (const rh of c.reminderHistory) {
                await supabase.from('reminder_history').upsert({
                  customer_id: c.id,
                  sent_at: rh.sentAt,
                  message: rh.message,
                });
              }
            }
          }
        }

        // Migrate services
        const servicesRaw = localStorage.getItem('relax-salon-services-v2');
        if (servicesRaw) {
          const services = JSON.parse(servicesRaw);
          for (let i = 0; i < services.length; i++) {
            const s = services[i];
            await supabase.from('services').upsert({
              id: s.id,
              name: s.name,
              description: s.description || '',
              icon: s.icon || 'Star',
              status: s.status || 'active',
              sort_order: i,
            });
          }
        }

        // Migrate profile
        const { data: existingProfiles } = await supabase.from('profiles').select('id').limit(1);
        const profileData = {
          owner_name: ownerName.trim() || setupData.ownerName,
          business_name: businessName.trim() || setupData.businessName,
          mobile_number: mobileNumber.trim() || setupData.mobileNumber,
          is_setup_complete: setupData.isSetupComplete,
        };
        if (existingProfiles && existingProfiles.length > 0) {
          await supabase.from('profiles').update(profileData).eq('id', existingProfiles[0].id);
        } else {
          await supabase.from('profiles').insert(profileData);
        }

        localStorage.setItem('relax-salon-use-db', 'true');
        setUseDatabase(true);
        toast({ title: "Data migrated to database successfully!" });
      } catch (err) {
        console.error('Migration error:', err);
        toast({ title: "Migration failed", description: "Check console for details", variant: "destructive" });
      } finally {
        setIsMigrating(false);
      }
    } else {
      localStorage.setItem('relax-salon-use-db', 'false');
      setUseDatabase(false);
      toast({ title: "Switched back to local storage" });
    }
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
          <Input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Enter owner name"
            className="h-12"
          />
        </div>

        {/* Mobile Number */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <label className="font-app">Mobile Number</label>
          </div>
          <Input
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter mobile number"
            type="tel"
            className="h-12"
          />
        </div>

        {/* Business Name */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <label className="font-app">Business Name</label>
          </div>
          <Input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter business name"
            className="h-12"
          />
        </div>

        {/* Database Connection */}
        <div className="bg-card rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <label className="font-app">Database Connection</label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="use-database"
              checked={useDatabase}
              onCheckedChange={(checked) => handleToggleDatabase(checked === true)}
              disabled={isMigrating}
            />
            <div className="space-y-1">
              <label htmlFor="use-database" className="text-sm font-medium cursor-pointer">
                {isMigrating ? "Migrating data..." : "Connect to Cloud Database"}
              </label>
              <p className="text-xs text-muted-foreground">
                Migrate and sync your data to the cloud database for backup and multi-device access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
