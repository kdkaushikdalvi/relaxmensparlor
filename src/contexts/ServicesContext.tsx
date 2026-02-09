import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Scissors, Sparkles, Palette, Hand, Smile, Droplets, Heart, Star, Zap, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSetup } from '@/contexts/SetupContext';

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'active' | 'inactive';
  sortOrder?: number;
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

export const SERVICE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Scissors, Sparkles, Palette, Hand, Smile, Droplets, Heart, Star, Zap, Eye,
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
  const { user } = useAuth();
  const { isOfflineMode } = useSetup();
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from DB or localStorage
  useEffect(() => {
    const load = async () => {
      if (!isOfflineMode && user) {
        try {
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('user_id', user.id)
            .order('sort_order', { ascending: true });

          if (!error && data && data.length > 0) {
            const mapped: Service[] = data.map((r) => ({
              id: r.id,
              name: r.name,
              description: r.description || 'New service',
              icon: r.icon || 'Star',
              status: (r.status as 'active' | 'inactive') || 'active',
              sortOrder: r.sort_order,
            }));
            setServices(mapped);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
            setLoaded(true);
            return;
          }
        } catch (err) {
          console.error('Failed to load services from DB:', err);
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
            setServices(parsed);
            setLoaded(true);
            return;
          }
        } catch { /* ignore */ }
      }
      setServices(DEFAULT_SERVICES);
      setLoaded(true);
    };

    load();
  }, [user, isOfflineMode]);

  // Save to localStorage when offline
  useEffect(() => {
    if (loaded && isOfflineMode) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    }
  }, [services, loaded, isOfflineMode]);

  const syncServiceToDB = async (service: Service, index: number) => {
    if (isOfflineMode || !user) return;
    try {
      await supabase.from('services').upsert({
        id: service.id,
        user_id: user.id,
        name: service.name,
        description: service.description,
        icon: service.icon,
        status: service.status,
        sort_order: index,
      });
    } catch (err) {
      console.error('Failed to sync service:', err);
    }
  };

  const addService = (name: string) => {
    const newService: Service = {
      id: Date.now().toString(),
      name: name.trim(),
      description: 'New service',
      icon: 'Star',
      status: 'active',
    };
    setServices(prev => {
      const next = [...prev, newService];
      syncServiceToDB(newService, next.length - 1);
      return next;
    });
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => {
      const next = prev.map((s, i) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          syncServiceToDB(updated, i);
          return updated;
        }
        return s;
      });
      return next;
    });
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    if (!isOfflineMode && user) {
      supabase.from('services').delete().eq('id', id).then();
    }
  };

  const reorderServices = (activeId: string, overId: string) => {
    setServices(prev => {
      const oldIndex = prev.findIndex(s => s.id === activeId);
      const newIndex = prev.findIndex(s => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = [...prev];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      // Sync all sort orders
      if (!isOfflineMode && user) {
        next.forEach((s, i) => syncServiceToDB(s, i));
      }
      return next;
    });
  };

  const toggleServiceStatus = (id: string) => {
    updateService(id, { status: services.find(s => s.id === id)?.status === 'active' ? 'inactive' : 'active' });
  };

  const resetToDefaults = () => {
    setServices(DEFAULT_SERVICES);
    if (!isOfflineMode && user) {
      // Delete all and re-insert defaults
      supabase.from('services').delete().eq('user_id', user.id).then(() => {
        DEFAULT_SERVICES.forEach((s, i) => syncServiceToDB(s, i));
      });
    }
  };

  const getServiceNames = () => services.filter(s => s.status === 'active').map(s => s.name);

  return (
    <ServicesContext.Provider value={{ services, addService, updateService, deleteService, reorderServices, toggleServiceStatus, resetToDefaults, getServiceNames }}>
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
