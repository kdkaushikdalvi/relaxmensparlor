import { format } from 'date-fns';
import { Phone, Calendar, Bell, MessageCircle, CheckCircle, AlertTriangle, Clock, Pencil, Trash2 } from 'lucide-react';
import { Customer } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { 
  canSendReminderToday, 
  wasReminderSentToday, 
  isReminderDueToday,
  isReminderOverdue,
  isValidPhoneNumber,
  openWhatsAppReminder 
} from '@/utils/reminderUtils';
import { getReminderStatus, ReminderStatus } from '@/utils/reminderCategoryUtils';
import { getAvatarGradient, getAvatarTextColor } from '@/utils/avatarColors';
import { useProfile } from '@/contexts/ProfileContext';
import { useCustomers } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
  style?: React.CSSProperties;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

const statusConfig: Record<ReminderStatus, { label: string; className: string; icon: React.ElementType }> = {
  'pending': { label: 'Pending', className: 'bg-primary/10 text-primary border-primary/30', icon: Clock },
  'sent-today': { label: 'Sent Today', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30', icon: CheckCircle },
  'overdue': { label: 'Overdue', className: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertTriangle },
  'upcoming': { label: 'Upcoming', className: 'bg-muted text-muted-foreground border-border', icon: Bell },
  'none': { label: '', className: '', icon: Bell },
};

export function CustomerCard({ 
  customer, 
  onClick, 
  onEdit,
  onDelete,
  className, 
  style,
  selectable = false,
  selected = false,
  onSelectChange 
}: CustomerCardProps) {
  const { profile } = useProfile();
  const { updateCustomer } = useCustomers();
  const { toast } = useToast();
  
  const formattedDate = customer.visitingDate 
    ? format(new Date(customer.visitingDate), 'MMM d, yyyy')
    : 'No date set';

  const canSendReminder = canSendReminderToday(customer);
  const reminderSentToday = wasReminderSentToday(customer);
  const reminderDueToday = isReminderDueToday(customer);
  const isOverdue = isReminderOverdue(customer);
  const hasValidPhone = isValidPhoneNumber(customer.mobileNumber);
  const reminderStatus = getReminderStatus(customer);
  const statusInfo = statusConfig[reminderStatus];

  const showReminderButton = (reminderDueToday || isOverdue) && customer.reminderDate;

  const handleSendReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!hasValidPhone) {
      toast({
        title: "Invalid phone number",
        description: "Please update the customer's phone number to send a reminder.",
        variant: "destructive",
      });
      return;
    }

    const today = format(new Date(), 'yyyy-MM-dd');
    const sentDates = customer.reminderSentDates || [];
    
    updateCustomer(customer.id, {
      reminderSentDates: [...sentDates, today],
      reminderHistory: [
        ...(customer.reminderHistory || []),
        { sentAt: new Date().toISOString(), message: `WhatsApp reminder sent` }
      ],
    });

    openWhatsAppReminder(customer, profile.businessName);

    toast({
      title: "WhatsApp opened",
      description: "Edit the message if needed and send it to the customer.",
    });
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isHighlighted = reminderStatus === 'overdue' || reminderStatus === 'pending';

  return (
    <div
      className={cn(
        "w-full text-left p-3 sm:p-4 rounded-xl glass border relative",
        "gradient-card shadow-card",
        "transition-all duration-300 hover:shadow-elevated",
        "animate-slide-up group",
        isHighlighted ? "border-primary/50 bg-primary/5" : "border-border/30 hover:border-primary/40",
        selected && "ring-2 ring-primary border-primary",
        className
      )}
      style={style}
    >
      {/* Action Icons - Top Right */}
      {!selectable && (onEdit || onDelete) && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-primary/10 hover:bg-primary/20"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Edit"
            >
              <Pencil className="w-4 h-4 text-primary" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 bg-destructive/10 hover:bg-destructive/20"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      )}

      <button
        onClick={onClick}
        className="w-full text-left focus:outline-none"
      >
        <div className="flex items-start gap-3">
          {/* Checkbox for bulk selection */}
          {selectable && (
            <div 
              className="flex-shrink-0 pt-1"
              onClick={handleCheckboxChange}
            >
              <Checkbox 
                checked={selected} 
                onCheckedChange={(checked) => onSelectChange?.(!!checked)}
              />
            </div>
          )}

          {/* Multi-Color Avatar */}
          <div className={cn(
            "flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-glow transition-all duration-300",
            isOverdue ? "bg-destructive/20" : getAvatarGradient(customer.fullName)
          )}>
            <span className={cn(
              "text-base sm:text-lg font-display font-semibold",
              isOverdue ? "text-destructive" : getAvatarTextColor(customer.fullName)
            )}>
              {customer.fullName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-16">
            <h3 className="font-display font-semibold text-base sm:text-lg text-foreground truncate">
              {customer.fullName}
            </h3>

            {/* Phone & Date - Stacked on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 mt-1 text-xs sm:text-sm text-muted-foreground">
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
              <div className="flex flex-wrap gap-1 mt-2">
                {customer.interest.slice(0, 2).map((interest) => (
                  <Badge key={interest} variant="soft" className="text-[10px] sm:text-xs px-2 py-0.5">
                    {interest}
                  </Badge>
                ))}
                {customer.interest.length > 2 && (
                  <Badge variant="secondary" className="text-[10px] sm:text-xs px-2 py-0.5">
                    +{customer.interest.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Reminder Status & Button */}
            {customer.reminderDate && reminderStatus !== 'none' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2 pt-2 border-t border-border/30">
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px] sm:text-xs gap-1 border w-fit", statusInfo.className)}
                >
                  <statusInfo.icon className="w-3 h-3" />
                  {statusInfo.label}
                  {reminderStatus === 'upcoming' && (
                    <span className="ml-1">
                      {format(new Date(customer.reminderDate), 'dd MMM')}
                    </span>
                  )}
                </Badge>
                
                {showReminderButton && (
                  <Button
                    size="sm"
                    variant={reminderSentToday ? "outline" : "default"}
                    disabled={reminderSentToday || !hasValidPhone}
                    onClick={handleSendReminder}
                    className={cn(
                      "h-7 sm:h-8 gap-1 text-[10px] sm:text-xs",
                      reminderSentToday && "opacity-60"
                    )}
                  >
                    {reminderSentToday ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Sent
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3 h-3" />
                        Remind
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}