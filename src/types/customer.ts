export interface Customer {
  id: string;
  fullName: string;
  mobileNumber: string;
  interest: string[];
  preferences: string;
  visitingDate: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerFormData = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;

export const INTEREST_OPTIONS = [
  'Haircut',
  'Facial',
  'Coloring',
  'Spa',
  'Manicure',
  'Pedicure',
  'Makeup',
  'Hair Treatment',
  'Waxing',
  'Threading'
] as const;
