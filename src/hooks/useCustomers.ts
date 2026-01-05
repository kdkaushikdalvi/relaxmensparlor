import { useState, useEffect, useCallback } from 'react';
import { Customer, CustomerFormData } from '@/types/customer';

const STORAGE_KEY = 'relax-salon-customers';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load customers from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCustomers(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse customers from localStorage:', error);
      }
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
    };
    setCustomers(prev => [newCustomer, ...prev]);
    return newCustomer;
  }, []);

  const updateCustomer = useCallback((id: string, data: Partial<CustomerFormData>): Customer | null => {
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

  return {
    customers,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    searchCustomers,
  };
}
