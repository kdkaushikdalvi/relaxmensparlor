import { format } from 'date-fns';
import { Phone, Calendar, ChevronRight, Bell, MessageCircle, CheckCircle } from 'lucide-react';
import { Customer } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  canSendReminderToday, 
  wasReminderSentToday, 
  isReminderDueToday,
  isValidPhoneNumber,
  openWhatsAppReminder 
} from '@/utils/reminderUtils';
import { useProfile } from '@/contexts/ProfileContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CustomerCard({ customer, onClick, className, style }: CustomerCardProps) {
  const { profile } = useProfile();
  const { updateCustomer } = useCustomers();
  const { toast } = useToast();
  
  const formattedDate = customer.visitingDate 
    ? format(new Date(customer.visitingDate), 'MMM d, yyyy')
    : 'No date set';

  const canSendReminder = canSendReminderToday(customer);
  const reminderSentToday = wasReminderSentToday(customer);
  const reminderDueToday = isReminderDueToday(customer);
  const hasValidPhone = isValidPhoneNumber(customer.mobileNumber);

  const handleSendReminder = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    if (!hasValidPhone) {
      toast({
        title: "Invalid phone number",
        description: "Please update the customer's phone number to send a reminder.",
        variant: "destructive",
      });
      return;
    }

    // Mark reminder as sent for today
    const today = format(new Date(), 'yyyy-MM-dd');
    const sentDates = customer.reminderSentDates || [];
    
    updateCustomer(customer.id, {
      reminderSentDates: [...sentDates, today],
      reminderHistory: [
        ...(customer.reminderHistory || []),
        { sentAt: new Date().toISOString(), message: `WhatsApp reminder sent` }
      ],
    });

    // Open WhatsApp
    openWhatsAppReminder(customer, profile.businessName);

    toast({
      title: "WhatsApp opened",
      description: "Edit the message if needed and send it to the customer.",
    });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-xl glass border border-border/30",
        "gradient-card shadow-card",
        "transition-all duration-300 hover:shadow-elevated hover:border-primary/40",
        "hover:scale-[1.01] active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-primary/30",
        "animate-slide-up group",
        className
      )}
      style={style}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow transition-all duration-300 group-hover:shadow-elevated">
          <span className="text-lg font-display font-semibold text-primary-foreground">
            {customer.fullName.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display font-semibold text-lg text-foreground truncate">
              {customer.fullName}
            </h3>
            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </div>

          {/* Phone & Date */}
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              {customer.mobileNumber}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          {/* Interests */}
          {customer.interest.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {customer.interest.slice(0, 3).map((interest) => (
                <Badge key={interest} variant="soft" className="text-xs">
                  {interest}
                </Badge>
              ))}
              {customer.interest.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{customer.interest.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Reminder Status & Button */}
          {customer.reminderDate && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center gap-2 text-xs">
                <Bell className={cn(
                  "w-3.5 h-3.5",
                  reminderDueToday ? "text-primary" : "text-muted-foreground"
                )} />
                <span className={cn(
                  reminderDueToday ? "text-primary font-medium" : "text-muted-foreground"
                )}>
                  {reminderSentToday 
                    ? "Sent today ✓" 
                    : reminderDueToday 
                      ? "Due today" 
                      : `${format(new Date(customer.reminderDate), 'dd MMM')}`
                  }
                </span>
              </div>
              
              {reminderDueToday && (
                <Button
                  size="sm"
                  variant={reminderSentToday ? "outline" : "default"}
                  disabled={reminderSentToday || !hasValidPhone}
                  onClick={handleSendReminder}
                  className={cn(
                    "h-8 gap-1.5 text-xs",
                    reminderSentToday && "opacity-60"
                  )}
                >
                  {reminderSentToday ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Sent
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-3.5 h-3.5" />
                      Send Reminder
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}