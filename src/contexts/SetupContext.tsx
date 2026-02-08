import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface SetupData {
  ownerName: string;
  businessName: string;
  mobileNumber: string;
  isSetupComplete: boolean;
}

interface SetupContextType {
  setupData: SetupData;
  isSetupComplete: boolean;
  isOfflineMode: boolean;
  setOfflineMode: (offline: boolean) => void;
  completeSetup: (data: Omit<SetupData, 'isSetupComplete'>) => void;
  resetSetup: () => void;
  resetAll: () => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'relax-salon-setup';
const OFFLINE_KEY = 'relax-salon-offline-mode';

const DEFAULT_SETUP: SetupData = {
  ownerName: '',
  businessName: '',
  mobileNumber: '',
  isSetupComplete: false,
};

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [setupData, setSetupData] = useState<SetupData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { return DEFAULT_SETUP; }
    }
    return DEFAULT_SETUP;
  });
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    return localStorage.getItem(OFFLINE_KEY) === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from DB when user is authenticated
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          const dbSetup: SetupData = {
            ownerName: data.owner_name,
            businessName: data.business_name,
            mobileNumber: data.mobile_number,
            isSetupComplete: data.is_setup_complete,
          };
          setSetupData(dbSetup);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbSetup));
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setupData));
  }, [setupData]);

  const setOfflineMode = (offline: boolean) => {
    setIsOfflineMode(offline);
    localStorage.setItem(OFFLINE_KEY, offline ? 'true' : 'false');
  };

  const completeSetup = (data: Omit<SetupData, 'isSetupComplete'>) => {
    setSetupData({ ...data, isSetupComplete: true });
  };

  const resetSetup = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSetupData(DEFAULT_SETUP);
  };

  const resetAll = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('relax-parlor-profile');
    localStorage.removeItem('relax-salon-customers');
    localStorage.removeItem('message-templates');
    localStorage.removeItem('relax-salon-message-templates');
    localStorage.removeItem(OFFLINE_KEY);
    setSetupData(DEFAULT_SETUP);
    window.location.reload();
  };

  return (
    <SetupContext.Provider
      value={{
        setupData,
        isSetupComplete: setupData.isSetupComplete,
        isOfflineMode,
        setOfflineMode,
        completeSetup,
        resetSetup,
        resetAll,
        isLoading,
      }}
    >
      {children}
    </SetupContext.Provider>
  );
}

export function useSetup() {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error('useSetup must be used within a SetupProvider');
  }
  return context;
}
