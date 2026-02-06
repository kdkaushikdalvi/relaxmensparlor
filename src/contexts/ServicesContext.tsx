import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Scissors, Sparkles, Palette, Hand, Smile, Droplets, Heart, Star, Zap, Eye } from 'lucide-react';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
}

const DEFAULT_SERVICES: Service[] = [
  { id: '1', name: 'हेअर कट', description: 'Professional haircut and styling', icon: 'Scissors', status: 'active' },
  { id: '2', name: 'दाढी', description: 'Classic shave with hot towel', icon: 'Sparkles', status: 'active' },
  { id: '3', name: 'कोरीव दाढी', description: 'Precision beard trimming and shaping', icon: 'Star', status: 'active' },
  { id: '4', name: 'हेअर कलर', description: 'Hair coloring and highlights', icon: 'Palette', status: 'active' },
  { id: '5', name: 'मसाज', description: 'Relaxing head and body massage', icon: 'Hand', status: 'active' },
  { id: '6', name: 'फेशियल', description: 'Deep cleansing facial treatment', icon: 'Smile', status: 'active' },
  { id: '7', name: 'स्पा', description: 'Premium spa experience', icon: 'Droplets', status: 'active' },
  { id: '8', name: 'मेकअप', description: 'Professional makeup services', icon: 'Heart', status: 'inactive' },
  { id: '9', name: 'हेअर ट्रीटमेंट', description: 'Hair treatment and conditioning', icon: 'Zap', status: 'active' },
  { id: '10', name: 'वॅक्सिंग', description: 'Waxing and hair removal', icon: 'Star', status: 'inactive' },
  { id: '11', name: 'थ्रेडिंग', description: 'Eyebrow and facial threading', icon: 'Eye', status: 'active' },
];

// Icon mapping for rendering
export const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors,
  Sparkles,
  Palette,
  Hand,
  Smile,
  Droplets,
  Heart,
  Star,
  Zap,
  Eye,
};

interface ServicesContextType {
  services: Service[];
  addService: (name: string) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  reorderServices: (activeId: string, overId: string) => void;
  toggleServiceStatus: (id: string) => void;
  resetToDefaults: () => void;
  getServiceNames: () => string[];
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

const STORAGE_KEY = 'relax-salon-services-v2';

export function ServicesProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
          return parsed;
        }
      } catch {
        // Fall through to defaults
      }
    }
    return DEFAULT_SERVICES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  }, [services]);

  const addService = (name: string) => {
    const newService: Service = {
      id: Date.now().toString(),
      name: name.trim(),
      description: 'New service',
      icon: 'Star',
      status: 'active',
    };
    setServices(prev => [...prev, newService]);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const reorderServices = (activeId: string, overId: string) => {
    setServices(prev => {
      const oldIndex = prev.findIndex(s => s.id === activeId);
      const newIndex = prev.findIndex(s => s.id === overId);
      
      if (oldIndex === -1 || newIndex === -1) return prev;
      
      const newServices = [...prev];
      const [removed] = newServices.splice(oldIndex, 1);
      newServices.splice(newIndex, 0, removed);
      
      return newServices;
    });
  };

  const toggleServiceStatus = (id: string) => {
    setServices(prev => 
      prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s)
    );
  };

  const resetToDefaults = () => {
    setServices(DEFAULT_SERVICES);
  };

  const getServiceNames = () => {
    return services.filter(s => s.status === 'active').map(s => s.name);
  };

  return (
    <ServicesContext.Provider value={{ 
      services, 
      addService,
      updateService,
      deleteService,
      reorderServices, 
      toggleServiceStatus, 
      resetToDefaults,
      getServiceNames 
    }}>
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
