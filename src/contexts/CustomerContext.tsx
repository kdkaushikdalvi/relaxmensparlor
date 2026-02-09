import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Customer, CustomerFormData } from "@/types/customer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const generateId = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36);

interface CustomerContextType {
  customers: Customer[];
  isLoading: boolean;
  addCustomer: (data: CustomerFormData) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<Customer>) => Promise<Customer | null>;
  deleteCustomer: (id: string) => Promise<boolean>;
  getCustomer: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load customers from Supabase
  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setCustomers(data.map((r) => ({
            id: r.id,
            customerId: r.customer_id,
            fullName: r.full_name,
            mobileNumber: r.mobile_number,
            interest: r.interest || [],
            preferences: r.preferences || '',
            visitingDate: r.visiting_date || '',
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            reminderInterval: (r.reminder_interval as any) || 'none',
            reminderDate: r.reminder_date || undefined,
            reminderSentDates: r.reminder_sent_dates || [],
            reminderHistory: [],
          })));
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user]);

  const addCustomer = useCallback(async (data: CustomerFormData): Promise<Customer> => {
    const now = new Date().toISOString();
    const maxCustomerId = customers.reduce((max, c) => Math.max(max, c.customerId || 0), 0);
    const newCustomer: Customer = {
      ...data,
      id: generateId(),
      customerId: maxCustomerId + 1,
      createdAt: now,
      updatedAt: now,
      reminderSentDates: [],
      reminderHistory: [],
    };

    if (user) {
      const { error } = await supabase.from('customers').insert({
        id: newCustomer.id,
        user_id: user.id,
        full_name: newCustomer.fullName,
        mobile_number: newCustomer.mobileNumber,
        interest: newCustomer.interest,
        preferences: newCustomer.preferences,
        visiting_date: newCustomer.visitingDate,
        reminder_interval: newCustomer.reminderInterval || 'none',
        reminder_date: newCustomer.reminderDate || null,
        reminder_sent_dates: newCustomer.reminderSentDates || [],
        customer_id: newCustomer.customerId,
      });
      if (error) console.error('Failed to save customer:', error);
    }

    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  }, [customers, user]);

  const updateCustomer = useCallback(
    async (id: string, data: Partial<Customer>): Promise<Customer | null> => {
      let updatedCustomer: Customer | null = null;
      setCustomers((prev) =>
        prev.map((customer) => {
          if (customer.id === id) {
            updatedCustomer = { ...customer, ...data, updatedAt: new Date().toISOString() };
            return updatedCustomer;
          }
          return customer;
        })
      );

      if (user && updatedCustomer) {
        const c = updatedCustomer as Customer;
        await supabase.from('customers').update({
          full_name: c.fullName,
          mobile_number: c.mobileNumber,
          interest: c.interest,
          preferences: c.preferences,
          visiting_date: c.visitingDate,
          reminder_interval: c.reminderInterval || 'none',
          reminder_date: c.reminderDate || null,
          reminder_sent_dates: c.reminderSentDates || [],
          updated_at: c.updatedAt,
        }).eq('id', id);
      }

      return updatedCustomer;
    },
    [user]
  );

  const deleteCustomer = useCallback(async (id: string): Promise<boolean> => {
    const exists = customers.some((c) => c.id === id);
    if (!exists) return false;

    setCustomers((prev) => prev.filter((c) => c.id !== id));

    if (user) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) console.error('Failed to delete customer:', error);
    }

    return true;
  }, [customers, user]);

  const getCustomer = useCallback(
    (id: string): Customer | undefined => customers.find((c) => c.id === id),
    [customers]
  );

  const searchCustomers = useCallback(
    (query: string): Customer[] => {
      if (!query.trim()) return customers;
      const lowerQuery = query.toLowerCase().trim();
      return customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(lowerQuery) ||
          c.mobileNumber.includes(lowerQuery)
      );
    },
    [customers]
  );

  return (
    <CustomerContext.Provider
      value={{ customers, isLoading, addCustomer, updateCustomer, deleteCustomer, getCustomer, searchCustomers }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
}
