import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Customer, CustomerFormData } from '@/types/customer';

const STORAGE_KEY = 'relax-salon-customers';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

// Sample customer for first-time users
const SAMPLE_CUSTOMER: Customer = {
  id: 'sample-customer-1',
  fullName: 'JAYSING GADEKAR',
  mobileNumber: '8275883781',
  interest: ['Haircut', 'Facial'],
  preferences: 'Prefers appointments in evening',
  visitingDate: new Date().toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  reminderInterval: '1week',
  reminderDate: new Date().toISOString().split('T')[0], // Set to today for demo
  reminderSentDates: [],
  reminderHistory: [],
};

interface CustomerContextType {
  customers: Customer[];
  isLoading: boolean;
  addCustomer: (data: CustomerFormData) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => Customer | null;
  deleteCustomer: (id: string) => boolean;
  getCustomer: (id: string) => Customer | undefined;
  searchCustomers: (query: string) => Customer[];
}

const CustomerContext = createContext<CustomerContextType | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load customers from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomers(parsed);
      } catch (error) {
        console.error('Failed to parse customers from localStorage:', error);
        // If no customers, add sample
        setCustomers([SAMPLE_CUSTOMER]);
      }
    } else {
      // First time user - add sample customer
      setCustomers([SAMPLE_CUSTOMER]);
    }
    setIsLoading(false);
  }, []);

  // Save customers to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    }
  }, [customers, isLoading]);

  const addCustomer = useCallback((data: CustomerFormData): Customer => {
    const now = new Date().toISOString();
    const newCustomer: Customer = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
      reminderSentDates: [],
      reminderHistory: [],
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((id: string, data: Partial<Customer>): Customer | null => {
    let updatedCustomer: Customer | null = null;
    setCustomers(prev =>
      prev.map(customer => {
        if (customer.id === id) {
          updatedCustomer = {
            ...customer,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          return updatedCustomer;
        }
        return customer;
      })
    );
    return updatedCustomer;
  }, []);

  const deleteCustomer = useCallback((id: string): boolean => {
    let deleted = false;
    setCustomers(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index !== -1) {
        deleted = true;
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      }
      return prev;
    });
    return deleted;
  }, []);

  const getCustomer = useCallback((id: string): Customer | undefined => {
    return customers.find(c => c.id === id);
  }, [customers]);

  const searchCustomers = useCallback((query: string): Customer[] => {
    if (!query.trim()) return customers;
    const lowerQuery = query.toLowerCase().trim();
    return customers.filter(c =>
      c.fullName.toLowerCase().includes(lowerQuery) ||
      c.mobileNumber.includes(lowerQuery)
    );
  }, [customers]);

  return (
    <CustomerContext.Provider value={{
      customers,
      isLoading,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      getCustomer,
      searchCustomers,
    }}>
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomers() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomers must be used within a CustomerProvider');
  }
  return context;
}
