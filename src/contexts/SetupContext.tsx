import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const STORAGE_KEY = 'relax-salon-setup';

const DEFAULT_SETUP: SetupData = {
  ownerName: '',
  businessName: '',
  mobileNumber: '',
  isSetupComplete: false,
};

const SetupContext = createContext<SetupContextType | undefined>(undefined);

export function SetupProvider({ children }: { children: ReactNode }) {
  const [setupData, setSetupData] = useState<SetupData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_SETUP;
      }
    }
    return DEFAULT_SETUP;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(setupData));
  }, [setupData]);

  const completeSetup = (data: Omit<SetupData, 'isSetupComplete'>) => {
    setSetupData({
      ...data,
      isSetupComplete: true,
    });
  };

  const resetSetup = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSetupData(DEFAULT_SETUP);
  };

  const resetAll = () => {
    // Clear all app data
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('relax-parlor-profile');
    localStorage.removeItem('relax-salon-customers');
    localStorage.removeItem('message-templates');
    localStorage.removeItem('relax-salon-message-templates');
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
