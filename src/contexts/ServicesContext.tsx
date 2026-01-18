import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const DEFAULT_SERVICES = [
  "हेअर कट",
  "दाढी",
  "कोरीव दाढी",
  "हेअर कलर",
  "मसाज",
  "फेशियल",
  "स्पा",
  "मेकअप",
  "हेअर ट्रीटमेंट",
  "वॅक्सिंग",
  "थ्रेडिंग",
];

interface ServicesContextType {
  services: string[];
  addService: (service: string) => void;
  updateService: (oldService: string, newService: string) => void;
  deleteService: (service: string) => void;
  resetToDefaults: () => void;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

const STORAGE_KEY = 'relax-salon-services';

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<string[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_SERVICES;
      }
    }
    return DEFAULT_SERVICES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  }, [services]);

  const addService = (service: string) => {
    const trimmed = service.trim();
    if (trimmed && !services.includes(trimmed)) {
      setServices(prev => [...prev, trimmed]);
    }
  };

  const updateService = (oldService: string, newService: string) => {
    const trimmed = newService.trim();
    if (trimmed && !services.includes(trimmed)) {
      setServices(prev => prev.map(s => s === oldService ? trimmed : s));
    }
  };

  const deleteService = (service: string) => {
    setServices(prev => prev.filter(s => s !== service));
  };

  const resetToDefaults = () => {
    setServices(DEFAULT_SERVICES);
  };

  return (
    <ServicesContext.Provider value={{ services, addService, updateService, deleteService, resetToDefaults }}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}
