import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface MessageTemplate {
  id: string;
  name: string;
  message: string;
  isDefault: boolean;
  createdAt: string;
}

interface MessageTemplateContextType {
  templates: MessageTemplate[];
  addTemplate: (name: string, message: string) => MessageTemplate;
  updateTemplate: (id: string, data: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getDefaultTemplate: () => MessageTemplate | undefined;
  setDefaultTemplate: (id: string) => void;
}

const STORAGE_KEY = 'relax-salon-message-templates';

const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: 'default-marathi',
    name: 'मराठी टेम्पलेट',
    message: `नमस्कार {customerName}! सर,

*{businessName}* मध्ये आज तुमची अपॉइंटमेंट घ्यायची आहे का? 💈

सेवा: {services}
{offer}
कृपया रिप्लाय करा किंवा कॉल करा.

धन्यवाद! 🙏`,
    isDefault: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'default-english',
    name: 'English Template',
    message: `Hello {customerName}!

We'd love to see you at *{businessName}* today! 💈

Services: {services}
{offer}
Please reply or call us to confirm.

Thank you! 🙏`,
    isDefault: false,
    createdAt: new Date().toISOString(),
  },
];

const MessageTemplateContext = createContext<MessageTemplateContextType | undefined>(undefined);

export function MessageTemplateProvider({ children }: { children: ReactNode }) {
  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_TEMPLATES;
      }
    }
    return DEFAULT_TEMPLATES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const addTemplate = (name: string, message: string): MessageTemplate => {
    const newTemplate: MessageTemplate = {
      id: Math.random().toString(36).substring(2) + Date.now().toString(36),
      name,
      message,
      isDefault: false,
      createdAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, data: Partial<MessageTemplate>) => {
    setTemplates(prev =>
      prev.map(t => (t.id === id ? { ...t, ...data } : t))
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const getDefaultTemplate = (): MessageTemplate | undefined => {
    return templates.find(t => t.isDefault) || templates[0];
  };

  const setDefaultTemplate = (id: string) => {
    setTemplates(prev =>
      prev.map(t => ({ ...t, isDefault: t.id === id }))
    );
  };

  return (
    <MessageTemplateContext.Provider
      value={{
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        getDefaultTemplate,
        setDefaultTemplate,
      }}
    >
      {children}
    </MessageTemplateContext.Provider>
  );
}

export function useMessageTemplates() {
  const context = useContext(MessageTemplateContext);
  if (!context) {
    throw new Error('useMessageTemplates must be used within a MessageTemplateProvider');
  }
  return context;
}
