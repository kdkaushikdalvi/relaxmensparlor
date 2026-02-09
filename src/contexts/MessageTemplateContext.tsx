import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MessageTemplate {
  id: string;
  name: string;
  message: string;
  isDefault: boolean;
  createdAt: string;
}

interface MessageTemplateContextType {
  templates: MessageTemplate[];
  addTemplate: (name: string, message: string) => void;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getDefaultTemplate: () => MessageTemplate | undefined;
  setDefaultTemplate: (id: string) => void;
}

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "default-marathi",
    name: "मराठी टेम्पलेट",
    message: `नमस्कार {customerName},\n    आज तुमची अपॉइंटमेंट घ्यायची आहे का?\n    कृपया रिप्लाय करा किंवा कॉल करा.\n    धन्यवाद! 🙏`,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "default-english",
    name: "Test Template",
    message: `Hello {customerName}!\n    We'd love to see you today!\n    Please reply or call us to confirm.\n    Thank you! 🙏`,
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
];

const MessageTemplateContext = createContext<MessageTemplateContextType | undefined>(undefined);

export function MessageTemplateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  // Load from Supabase
  useEffect(() => {
    if (!user) {
      setTemplates(DEFAULT_TEMPLATES);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('message_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
          setTemplates(data.map((r: any) => ({
            id: r.id,
            name: r.name,
            message: r.message,
            isDefault: r.is_default,
            createdAt: r.created_at,
          })));
        } else {
          // Seed defaults
          setTemplates(DEFAULT_TEMPLATES);
          for (const t of DEFAULT_TEMPLATES) {
            await supabase.from('message_templates').insert({
              id: t.id,
              user_id: user.id,
              name: t.name,
              message: t.message,
              is_default: t.isDefault,
            });
          }
        }
      } catch (err) {
        console.error('Failed to load templates:', err);
        setTemplates(DEFAULT_TEMPLATES);
      }
    };

    load();
  }, [user]);

  const addTemplate = (name: string, message: string) => {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const newTemplate: MessageTemplate = {
      id,
      name,
      message,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);

    if (user) {
      supabase.from('message_templates').insert({
        id,
        user_id: user.id,
        name,
        message,
        is_default: false,
      }).then();
    }
  };

  const updateTemplate = (id: string, data: Partial<MessageTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t)));

    if (user) {
      const dbData: any = {};
      if (data.name !== undefined) dbData.name = data.name;
      if (data.message !== undefined) dbData.message = data.message;
      if (data.isDefault !== undefined) dbData.is_default = data.isDefault;
      supabase.from('message_templates').update(dbData).eq('id', id).then();
    }
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    if (user) supabase.from('message_templates').delete().eq('id', id).then();
  };

  const getDefaultTemplate = (): MessageTemplate | undefined => {
    return templates.find((t) => t.isDefault) || templates[0];
  };

  const setDefaultTemplate = (id: string) => {
    setTemplates((prev) => prev.map((t) => ({ ...t, isDefault: t.id === id })));

    if (user) {
      // Set all to false, then set the selected one to true
      supabase.from('message_templates').update({ is_default: false }).eq('user_id', user.id).then(() => {
        supabase.from('message_templates').update({ is_default: true }).eq('id', id).then();
      });
    }
  };

  return (
    <MessageTemplateContext.Provider
      value={{ templates, addTemplate, updateTemplate, deleteTemplate, getDefaultTemplate, setDefaultTemplate }}
    >
      {children}
    </MessageTemplateContext.Provider>
  );
}

export function useMessageTemplates() {
  const context = useContext(MessageTemplateContext);
  if (!context) throw new Error("useMessageTemplates must be used within a MessageTemplateProvider");
  return context;
}
