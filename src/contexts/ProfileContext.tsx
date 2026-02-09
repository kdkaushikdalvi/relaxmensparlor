import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  ownerName: string;
  businessName: string;
}

interface ProfileContextType {
  profile: Profile;
  updateProfile: (profile: Partial<Profile>) => void;
}

const DEFAULT_PROFILE: Profile = {
  ownerName: '',
  businessName: '',
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  // Load profile from Supabase
  useEffect(() => {
    if (!user) {
      setProfile(DEFAULT_PROFILE);
      return;
    }

    const load = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('owner_name, business_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          setProfile({
            ownerName: data.owner_name,
            businessName: data.business_name,
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    load();
  }, [user]);

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within a ProfileProvider');
  return context;
}
