import { parseISO, isToday, isBefore, isAfter, startOfToday, endOfWeek, endOfMonth, endOfYear, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { Customer } from '@/types/customer';

export type ReminderCategory = 'all' | 'today' | 'overdue' | 'week' | 'month' | 'year';

export interface ReminderCategoryConfig {
  value: ReminderCategory;
  label: string;
  priority: number;
}

export const REMINDER_CATEGORIES: ReminderCategoryConfig[] = [
  { value: 'all', label: 'All', priority: 0 },
  { value: 'today', label: 'Today Due', priority: 1 },
  { value: 'overdue', label: 'Overdue', priority: 2 },
  { value: 'week', label: 'This Week', priority: 3 },
  { value: 'month', label: 'This Month', priority: 4 },
  { value: 'year', label: 'This Year', priority: 5 },
];

/**
 * Get the reminder category for a customer
 */
export function getCustomerReminderCategory(customer: Customer): ReminderCategory | null {
  if (!customer.reminderDate) return null;
  
  const reminderDate = parseISO(customer.reminderDate);
  const today = startOfToday();
  
  // Check if overdue (before today)
  if (isBefore(reminderDate, today)) {
    return 'overdue';
  }
  
  // Check if today
  if (isToday(reminderDate)) {
    return 'today';
  }
  
  // Check if this week
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  if (!isAfter(reminderDate, weekEnd)) {
    return 'week';
  }
  
  // Check if this month
  const monthEnd = endOfMonth(today);
  if (!isAfter(reminderDate, monthEnd)) {
    return 'month';
  }
  
  // Check if this year
  const yearEnd = endOfYear(today);
  if (!isAfter(reminderDate, yearEnd)) {
    return 'year';
  }
  
  return null;
}

/**
 * Filter customers by reminder category
 */
export function filterByReminderCategory(customers: Customer[], category: ReminderCategory): Customer[] {
  if (category === 'all') return customers;
  
  return customers.filter(customer => {
    const customerCategory = getCustomerReminderCategory(customer);
    
    switch (category) {
      case 'today':
        return customerCategory === 'today';
      case 'overdue':
        return customerCategory === 'overdue';
      case 'week':
        return customerCategory === 'today' || customerCategory === 'week';
      case 'month':
        return customerCategory === 'today' || customerCategory === 'week' || customerCategory === 'month';
      case 'year':
        return customerCategory !== null;
      default:
        return true;
    }
  });
}

/**
 * Get count for each reminder category
 */
export function getReminderCategoryCounts(customers: Customer[]): Record<ReminderCategory, number> {
  const counts: Record<ReminderCategory, number> = {
    all: customers.length,
    today: 0,
    overdue: 0,
    week: 0,
    month: 0,
    year: 0,
  };
  
  customers.forEach(customer => {
    const category = getCustomerReminderCategory(customer);
    if (category === 'today') {
      counts.today++;
      counts.week++;
      counts.month++;
      counts.year++;
    } else if (category === 'overdue') {
      counts.overdue++;
    } else if (category === 'week') {
      counts.week++;
      counts.month++;
      counts.year++;
    } else if (category === 'month') {
      counts.month++;
      counts.year++;
    } else if (category === 'year') {
      counts.year++;
    }
  });
  
  return counts;
}

/**
 * Check if reminder can be sent (today or overdue)
 */
export function canSendReminderForCategory(customer: Customer): boolean {
  const category = getCustomerReminderCategory(customer);
  return category === 'today' || category === 'overdue';
}

/**
 * Get reminder status for display
 */
export type ReminderStatus = 'pending' | 'sent-today' | 'overdue' | 'upcoming' | 'none';

export function getReminderStatus(customer: Customer): ReminderStatus {
  if (!customer.reminderDate) return 'none';
  
  const today = new Date().toISOString().split('T')[0];
  const wasSentToday = customer.reminderSentDates?.includes(today);
  
  const category = getCustomerReminderCategory(customer);
  
  if (category === 'today') {
    return wasSentToday ? 'sent-today' : 'pending';
  }
  
  if (category === 'overdue') {
    return 'overdue';
  }
  
  return 'upcoming';
}

/**
 * Sort customers by reminder priority (overdue first, then today, then upcoming)
 */
export function sortByReminderPriority(customers: Customer[]): Customer[] {
  return [...customers].sort((a, b) => {
    const statusA = getReminderStatus(a);
    const statusB = getReminderStatus(b);
    
    const priorityOrder: Record<ReminderStatus, number> = {
      'overdue': 0,
      'pending': 1,
      'sent-today': 2,
      'upcoming': 3,
      'none': 4,
    };
    
    const priorityDiff = priorityOrder[statusA] - priorityOrder[statusB];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Secondary sort by reminder date
    if (a.reminderDate && b.reminderDate) {
      return new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime();
    }
    
    return 0;
  });
}
