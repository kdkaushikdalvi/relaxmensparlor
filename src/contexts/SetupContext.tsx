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
  completeSetup: (data: Omit<SetupData, 'isSetupComplete'>) => void;
  resetSetup: () => void;
  resetAll: () => void;
  isLoading: boolean;
}

const DEFAULT_SETUP: SetupData = {
  ownerName: '',
  businessName: '',
  mobileNumber: '',
  isSetupComplete: false,
};

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [setupData, setSetupData] = useState<SetupData>(DEFAULT_SETUP);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from DB when user is authenticated
  useEffect(() => {
    if (!user) {
      setSetupData(DEFAULT_SETUP);
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
          setSetupData({
            ownerName: data.owner_name,
            businessName: data.business_name,
            mobileNumber: data.mobile_number,
            isSetupComplete: data.is_setup_complete,
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const completeSetup = (data: Omit<SetupData, 'isSetupComplete'>) => {
    setSetupData({ ...data, isSetupComplete: true });
  };

  const resetSetup = () => {
    setSetupData(DEFAULT_SETUP);
  };

  const resetAll = async () => {
    if (user) {
      // Delete all user data from DB
      await Promise.all([
        supabase.from('customers').delete().eq('user_id', user.id),
        supabase.from('services').delete().eq('user_id', user.id),
        supabase.from('message_templates').delete().eq('user_id', user.id),
        supabase.from('reminder_history').delete().eq('user_id', user.id),
      ]);
    }
    setSetupData(DEFAULT_SETUP);
    window.location.reload();
  };

  return (
    <SetupContext.Provider
      value={{
        setupData,
        isSetupComplete: setupData.isSetupComplete,
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
  if (!context) throw new Error('useSetup must be used within a SetupProvider');
  return context;
}
