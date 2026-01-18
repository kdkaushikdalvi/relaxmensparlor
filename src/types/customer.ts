export type ReminderInterval = 'today' | '1week' | '2weeks' | '3weeks' | '4weeks' | 'none';

export interface ReminderHistory {
  sentAt: string;
  message: string;
}

export interface Customer {
  id: string;
  customerId: number; // Auto-incrementing ID starting from 1
  fullName: string;
  mobileNumber: string;
  interest: string[];
  preferences: string;
  visitingDate: string;
  createdAt: string;
  updatedAt: string;
  // Reminder fields
  reminderInterval?: ReminderInterval;
  reminderDate?: string;
  reminderSentDates?: string[]; // Track dates when reminders were sent
  reminderHistory?: ReminderHistory[];
}

export type CustomerFormData = Omit<Customer, 'id' | 'customerId' | 'createdAt' | 'updatedAt' | 'reminderHistory' | 'reminderSentDates'>;

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

export const REMINDER_INTERVALS: { value: ReminderInterval; label: string; days: number }[] = [
  { value: 'today', label: 'Today', days: 0 },
  { value: '1week', label: '1 Week', days: 7 },
  { value: '2weeks', label: '2 Weeks', days: 14 },
  { value: '3weeks', label: '3 Weeks', days: 21 },
  { value: '4weeks', label: '4 Weeks', days: 28 },
];
