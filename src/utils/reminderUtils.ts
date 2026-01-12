import { addDays, format, isToday, isBefore, parseISO, startOfToday } from 'date-fns';
import { Customer, ReminderInterval, REMINDER_INTERVALS } from '@/types/customer';

/**
 * Calculate the reminder date based on visit date and interval
 */
export function calculateReminderDate(visitDate: string, interval: ReminderInterval): string | undefined {
  if (interval === 'none' || !interval) return undefined;
  
  const intervalConfig = REMINDER_INTERVALS.find(i => i.value === interval);
  if (!intervalConfig) return undefined;
  
  const baseDate = parseISO(visitDate);
  const reminderDate = addDays(baseDate, intervalConfig.days);
  return format(reminderDate, 'yyyy-MM-dd');
}

/**
 * Check if reminder is overdue (before today)
 */
export function isReminderOverdue(customer: Customer): boolean {
  if (!customer.reminderDate) return false;
  const reminderDate = parseISO(customer.reminderDate);
  const today = startOfToday();
  return isBefore(reminderDate, today);
}

/**
 * Check if reminder can be sent today (due today or overdue)
 */
export function canSendReminderToday(customer: Customer): boolean {
  // No reminder date set
  if (!customer.reminderDate) return false;
  
  // Check if reminder date is today or overdue
  const reminderDate = parseISO(customer.reminderDate);
  const isDueToday = isToday(reminderDate);
  const isOverdue = isBefore(reminderDate, startOfToday());
  
  if (!isDueToday && !isOverdue) return false;
  
  // Check if reminder was already sent today
  const today = format(new Date(), 'yyyy-MM-dd');
  if (customer.reminderSentDates?.includes(today)) return false;
  
  // Check if phone number is valid (10 digits)
  if (!isValidPhoneNumber(customer.mobileNumber)) return false;
  
  return true;
}

/**
 * Check if reminder was already sent today
 */
export function wasReminderSentToday(customer: Customer): boolean {
  const today = format(new Date(), 'yyyy-MM-dd');
  return customer.reminderSentDates?.includes(today) || false;
}

/**
 * Check if reminder date is today
 */
export function isReminderDueToday(customer: Customer): boolean {
  if (!customer.reminderDate) return false;
  const reminderDate = parseISO(customer.reminderDate);
  return isToday(reminderDate);
}

/**
 * Validate phone number (10 digits)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
}

/**
 * Format phone number for WhatsApp (add country code)
 */
export function formatPhoneForWhatsApp(phone: string, countryCode: string = '91'): string {
  const digitsOnly = phone.replace(/\D/g, '');
  return `${countryCode}${digitsOnly}`;
}

/**
 * Generate WhatsApp reminder message
 */
export function generateReminderMessage(customer: Customer, businessName: string): string {
  const services = customer.interest.length > 0 
    ? customer.interest.join(', ') 
    : 'our services';
  
  return `Hi ${customer.fullName}! 👋

It's time for your appointment at *${businessName}*! 💈

We noticed you were interested in: ${services}

Would you like to book your next visit? We'd love to see you again! 😊

Reply to confirm your appointment or call us directly.

Thank you! 🙏`;
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsAppReminder(customer: Customer, businessName: string): void {
  const phone = formatPhoneForWhatsApp(customer.mobileNumber);
  const message = generateReminderMessage(customer, businessName);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
  window.open(whatsappUrl, '_blank');
}

/**
 * Get reminder status label
 */
export function getReminderStatusLabel(customer: Customer): string {
  if (!customer.reminderDate) return 'No reminder set';
  
  if (wasReminderSentToday(customer)) return 'Reminder sent today';
  
  if (isReminderDueToday(customer)) return 'Reminder due today';
  
  const reminderDate = parseISO(customer.reminderDate);
  return `Reminder: ${format(reminderDate, 'dd MMM yyyy')}`;
}
