import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
  sortOrder?: number;
}

const DEFAULT_SERVICES: Service[] = [
  {
    id: "1",
    name: "हेअर कट",
    description: "Professional haircut and styling",
    icon: "Scissors",
    status: "active",
  },
  {
    id: "2",
    name: "दाढी",
    description: "Classic shave with hot towel",
    icon: "Sparkles",
    status: "active",
  },
  {
    id: "3",
    name: "कोरीव दाढी",
    description: "Precision beard trimming and shaping",
    icon: "Star",
    status: "active",
  },
  {
    id: "4",
    name: "हेअर कलर",
    description: "Hair coloring and highlights",
    icon: "Palette",
    status: "active",
  },
  {
    id: "5",
    name: "मसाज",
    description: "Relaxing head and body massage",
    icon: "Hand",
    status: "active",
  },
  {
    id: "6",
    name: "फेशियल",
    description: "Deep cleansing facial treatment",
    icon: "Smile",
    status: "active",
  },
  {
    id: "7",
    name: "स्पा",
    description: "Premium spa experience",
    icon: "Droplets",
    status: "active",
  },
  {
    id: "8",
    name: "मेकअप",
    description: "Professional makeup services",
    icon: "Heart",
    status: "inactive",
  },
  {
    id: "9",
    name: "हेअर ट्रीटमेंट",
    description: "Hair treatment and conditioning",
    icon: "Zap",
    status: "active",
  },
  {
    id: "10",
    name: "वॅक्सिंग",
    description: "Waxing and hair removal",
    icon: "Star",
    status: "inactive",
  },
  {
    id: "11",
    name: "थ्रेडिंग",
    description: "Eyebrow and facial threading",
    icon: "Eye",
    status: "active",
  },
];

export const SERVICE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
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

const ServicesContext = createContext<ServicesContextType | undefined>(
  undefined
);

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from Supabase
  useEffect(() => {
    if (!user) {
      setServices(DEFAULT_SERVICES);
      setLoaded(true);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .eq("user_id", user.id)
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          setServices(
            data.map((r) => ({
              id: r.id,
              name: r.name,
              description: r.description || "New service",
              icon: r.icon || "Star",
              status: (r.status as "active" | "inactive") || "active",
              sortOrder: r.sort_order,
            }))
          );
        } else {
          // First time user — seed defaults into DB
          setServices(DEFAULT_SERVICES);
          for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
            const s = DEFAULT_SERVICES[i];
            await supabase.from("services").insert({
              id: s.id,
              user_id: user.id,
              name: s.name,
              icon: s.icon,
              status: s.status,
              sort_order: i,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load services:", err);
        setServices(DEFAULT_SERVICES);
      } finally {
        setLoaded(true);
      }
    };

    load();
  }, [user]);

  const syncServiceToDB = async (service: Service, index: number) => {
    if (!user) return;
    await supabase.from("services").upsert({
      id: service.id,
      user_id: user.id,
      name: service.name,
      icon: service.icon,
      status: service.status,
      sort_order: index,
    });
  };

  const addService = (name: string) => {
    const newService: Service = {
      id: Date.now().toString(),
      name: name.trim(),
      description: "New service",
      icon: "Star",
      status: "active",
    };
    setServices((prev) => {
      const next = [...prev, newService];
      syncServiceToDB(newService, next.length - 1);
      return next;
    });
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) =>
      prev.map((s, i) => {
        if (s.id === id) {
          const updated = { ...s, ...updates };
          syncServiceToDB(updated, i);
          return updated;
        }
        return s;
      })
    );
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    if (user) supabase.from("services").delete().eq("id", id).then();
  };

  const reorderServices = (activeId: string, overId: string) => {
    setServices((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === activeId);
      const newIndex = prev.findIndex((s) => s.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = [...prev];
      const [removed] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, removed);
      if (user) next.forEach((s, i) => syncServiceToDB(s, i));
      return next;
    });
  };

  const toggleServiceStatus = (id: string) => {
    updateService(id, {
      status:
        services.find((s) => s.id === id)?.status === "active"
          ? "inactive"
          : "active",
    });
  };

  const resetToDefaults = () => {
    setServices(DEFAULT_SERVICES);
    if (user) {
      supabase
        .from("services")
        .delete()
        .eq("user_id", user.id)
        .then(() => {
          DEFAULT_SERVICES.forEach((s, i) => syncServiceToDB(s, i));
        });
    }
  };

  const getServiceNames = () =>
    services.filter((s) => s.status === "active").map((s) => s.name);

  return (
    <ServicesContext.Provider
      value={{
        services,
        addService,
        updateService,
        deleteService,
        reorderServices,
        toggleServiceStatus,
        resetToDefaults,
        getServiceNames,
      }}
    >
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (!context)
    throw new Error("useServices must be used within a ServicesProvider");
  return context;
}
