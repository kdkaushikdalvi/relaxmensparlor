import { parseISO, isToday, isBefore, startOfToday, formatDistanceToNow } from 'date-fns';
import { Customer } from '@/types/customer';

export type ReminderCategory = 'all' | 'active' | 'sent';

export interface ReminderCategoryConfig {
  value: ReminderCategory;
  label: string;
  priority: number;
}

export const REMINDER_CATEGORIES: ReminderCategoryConfig[] = [
  { value: 'all', label: 'All', priority: 0 },
  { value: 'active', label: 'Active Reminders', priority: 1 },
  { value: 'sent', label: 'Sent', priority: 2 },
];

/**
 * Check if customer has sent reminder history
 */
export function hasSentReminders(customer: Customer): boolean {
  return (customer.reminderHistory?.length || 0) > 0;
}

/**
 * Check if customer has active (pending) reminders
 */
export function hasActiveReminder(customer: Customer): boolean {
  if (!customer.reminderDate) return false;
  
  const today = new Date().toISOString().split('T')[0];
  const wasSentToday = customer.reminderSentDates?.includes(today);
  
  // Active if not sent today
  return !wasSentToday;
}

/**
 * Get time since last reminder was sent
 */
export function getLastReminderTimeAgo(customer: Customer): string | null {
  if (!customer.reminderHistory?.length) return null;
  
  // Get the most recent reminder
  const lastReminder = customer.reminderHistory[customer.reminderHistory.length - 1];
  if (!lastReminder?.sentAt) return null;
  
  try {
    const sentDate = parseISO(lastReminder.sentAt);
    return formatDistanceToNow(sentDate, { addSuffix: true });
  } catch {
    return null;
  }
}

/**
 * Get count of sent reminders for history badge
 */
export function getSentRemindersCount(customer: Customer): number {
  return customer.reminderHistory?.length || 0;
}

/**
 * Filter customers by reminder category
 */
export function filterByReminderCategory(customers: Customer[], category: ReminderCategory): Customer[] {
  if (category === 'all') return customers;
  
  return customers.filter(customer => {
    switch (category) {
      case 'active':
        return hasActiveReminder(customer);
      case 'sent':
        return hasSentReminders(customer);
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
    active: 0,
    sent: 0,
  };
  
  customers.forEach(customer => {
    if (hasActiveReminder(customer)) {
      counts.active++;
    }
    if (hasSentReminders(customer)) {
      counts.sent++;
    }
  });
  
  return counts;
}

/**
 * Get total history count across all customers
 */
export function getTotalHistoryCount(customers: Customer[]): number {
  return customers.reduce((total, customer) => {
    return total + (customer.reminderHistory?.length || 0);
  }, 0);
}

/**
 * Check if reminder can be sent (today or overdue)
 */
export function canSendReminderForCategory(customer: Customer): boolean {
  // Always allow sending reminders
  return true;
}

/**
 * Get reminder status for display
 */
export type ReminderStatus = 'pending' | 'sent-today' | 'overdue' | 'upcoming' | 'none';

export function getReminderStatus(customer: Customer): ReminderStatus {
  if (!customer.reminderDate) return 'none';
  
  const today = new Date().toISOString().split('T')[0];
  const wasSentToday = customer.reminderSentDates?.includes(today);
  
  const reminderDate = parseISO(customer.reminderDate);
  const todayStart = startOfToday();
  
  if (isToday(reminderDate)) {
    return wasSentToday ? 'sent-today' : 'pending';
  }
  
  if (isBefore(reminderDate, todayStart)) {
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
