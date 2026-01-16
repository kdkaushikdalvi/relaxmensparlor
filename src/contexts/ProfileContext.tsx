import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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

const PROFILE_KEY = 'relax-parlor-profile';

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>(() => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try {
        return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
      } catch {
        return DEFAULT_PROFILE;
      }
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

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
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
