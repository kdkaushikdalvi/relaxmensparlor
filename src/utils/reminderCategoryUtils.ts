import { parseISO, isToday, isBefore, startOfToday, formatDistanceToNow, differenceInDays } from 'date-fns';
import { Customer } from '@/types/customer';

export type ReminderCategory = 'yet-to-send' | 'sent-today' | '3-days' | '7-days' | '2-weeks' | '4-weeks';

export interface ReminderCategoryConfig {
  value: ReminderCategory;
  label: string;
  priority: number;
}

export const REMINDER_CATEGORIES: ReminderCategoryConfig[] = [
  { value: 'yet-to-send', label: 'Yet to be Sent', priority: 0 },
  { value: 'sent-today', label: 'Sent Today', priority: 1 },
  { value: '3-days', label: '3 Days Ago', priority: 2 },
  { value: '7-days', label: '7 Days Ago', priority: 3 },
  { value: '2-weeks', label: '2 Weeks Ago', priority: 4 },
  { value: '4-weeks', label: '4 Weeks Ago', priority: 5 },
];

/**
 * Get last sent date from reminder history
 */
export function getLastSentDate(customer: Customer): Date | null {
  if (!customer.reminderHistory?.length) return null;
  
  const lastReminder = customer.reminderHistory[customer.reminderHistory.length - 1];
  if (!lastReminder?.sentAt) return null;
  
  try {
    return parseISO(lastReminder.sentAt);
  } catch {
    return null;
  }
}

/**
 * Check if customer has sent reminder history
 */
export function hasSentReminders(customer: Customer): boolean {
  return (customer.reminderHistory?.length || 0) > 0;
}

/**
 * Check if customer has active (pending) reminders - never sent any reminder
 */
export function hasActiveReminder(customer: Customer): boolean {
  return !hasSentReminders(customer);
}

/**
 * Check if reminder was sent today
 */
export function wasSentToday(customer: Customer): boolean {
  const lastSent = getLastSentDate(customer);
  if (!lastSent) return false;
  return isToday(lastSent);
}

/**
 * Check if reminder was sent within a specific day range
 */
export function wasSentInRange(customer: Customer, minDays: number, maxDays: number): boolean {
  const lastSent = getLastSentDate(customer);
  if (!lastSent) return false;
  
  const daysDiff = differenceInDays(new Date(), lastSent);
  return daysDiff >= minDays && daysDiff <= maxDays;
}

/**
 * Get time since last reminder was sent
 */
export function getLastReminderTimeAgo(customer: Customer): string | null {
  if (!customer.reminderHistory?.length) return null;
  
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
 * Filter customers by reminder category based on last sent date
 */
export function filterByReminderCategory(customers: Customer[], category: ReminderCategory): Customer[] {
  return customers.filter(customer => {
    switch (category) {
      case 'yet-to-send':
        return !hasSentReminders(customer);
      case 'sent-today':
        return wasSentToday(customer);
      case '3-days':
        return wasSentInRange(customer, 2, 4); // 2-4 days ago
      case '7-days':
        return wasSentInRange(customer, 5, 9); // 5-9 days ago
      case '2-weeks':
        return wasSentInRange(customer, 10, 18); // ~2 weeks
      case '4-weeks':
        return wasSentInRange(customer, 19, 35); // ~4 weeks
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
    'yet-to-send': 0,
    'sent-today': 0,
    '3-days': 0,
    '7-days': 0,
    '2-weeks': 0,
    '4-weeks': 0,
  };
  
  customers.forEach(customer => {
    if (!hasSentReminders(customer)) {
      counts['yet-to-send']++;
    } else if (wasSentToday(customer)) {
      counts['sent-today']++;
    } else if (wasSentInRange(customer, 2, 4)) {
      counts['3-days']++;
    } else if (wasSentInRange(customer, 5, 9)) {
      counts['7-days']++;
    } else if (wasSentInRange(customer, 10, 18)) {
      counts['2-weeks']++;
    } else if (wasSentInRange(customer, 19, 35)) {
      counts['4-weeks']++;
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
  return true;
}

/**
 * Get reminder status for display
 */
export type ReminderStatus = 'pending' | 'sent-today' | 'overdue' | 'upcoming' | 'none';

export function getReminderStatus(customer: Customer): ReminderStatus {
  if (!customer.reminderDate) return 'none';
  
  const today = new Date().toISOString().split('T')[0];
  const wasSentTodayFlag = customer.reminderSentDates?.includes(today);
  
  const reminderDate = parseISO(customer.reminderDate);
  const todayStart = startOfToday();
  
  if (isToday(reminderDate)) {
    return wasSentTodayFlag ? 'sent-today' : 'pending';
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
    
    if (a.reminderDate && b.reminderDate) {
      return new Date(a.reminderDate).getTime() - new Date(b.reminderDate).getTime();
    }
    
    return 0;
  });
}
