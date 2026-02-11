import { useState } from "react";
import { format } from "date-fns";
import { Phone, Bell, CheckCircle, AlertTriangle, Clock, History, Send, Eye } from "lucide-react";
import { Customer } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { isValidPhoneNumber, generateReminderMessage, formatPhoneForWhatsApp } from "@/utils/reminderUtils";
import {
  getReminderStatus,
  ReminderStatus,
  getLastReminderTimeAgo,
  getSentRemindersCount,
} from "@/utils/reminderCategoryUtils";
import { getAvatarGradient, getAvatarTextColor } from "@/utils/avatarColors";
import { useProfile } from "@/contexts/ProfileContext";
import { useCustomers } from "@/hooks/useCustomers";
import { useToast } from "@/hooks/use-toast";
import { useMessageTemplates } from "@/contexts/MessageTemplateContext";
import { WhatsAppReviewDialog } from "@/components/WhatsAppReviewDialog";

interface CustomerCardProps {
  customer: Customer;
  displayId?: number;
  onClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

const statusConfig: Record<ReminderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: {
    label: "Pending",
    color: "text-amber-600 dark:text-amber-400",
    icon: Clock,
  },
  "sent-today": {
    label: "Sent Today",
    color: "text-emerald-600 dark:text-emerald-400",
    icon: CheckCircle,
  },
  overdue: {
    label: "Overdue",
    color: "text-rose-600 dark:text-rose-400",
    icon: AlertTriangle,
  },
  upcoming: {
    label: "Upcoming",
    color: "text-blue-600 dark:text-blue-400",
    icon: Bell,
  },
  none: { label: "", color: "hidden", icon: Bell },
};

export function CustomerCard({
  customer,
  displayId,
  onClick,
  selectable = false,
  selected = false,
  onSelectChange,
  className,
  style,
}: CustomerCardProps) {
  const { profile } = useProfile();
  const { updateCustomer } = useCustomers();
  const { toast } = useToast();
  const { getDefaultTemplate } = useMessageTemplates();

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const hasValidPhone = isValidPhoneNumber(customer.mobileNumber);
  const reminderStatus = getReminderStatus(customer);
  const statusInfo = statusConfig[reminderStatus];
  const lastReminder = getLastReminderTimeAgo(customer);
  const sentCount = getSentRemindersCount(customer);

  const handleSendReminder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasValidPhone) {
      toast({
        title: "Invalid phone number",
        description: "Please update the phone number to send reminders.",
        variant: "destructive",
      });
      return;
    }

    const template = getDefaultTemplate();
    const msg = generateReminderMessage(customer, profile.businessName, undefined, template, profile.ownerName);
    setReviewMessage(msg);
    setReviewOpen(true);
  };

  const handleConfirmSend = () => {
    setReviewOpen(false);
    const today = format(new Date(), "yyyy-MM-dd");

    updateCustomer(customer.id, {
      reminderSentDates: [...(customer.reminderSentDates || []), today],
      reminderHistory: [
        ...(customer.reminderHistory || []),
        { sentAt: new Date().toISOString(), message: "WhatsApp reminder sent" },
      ],
    });

    const phone = formatPhoneForWhatsApp(customer.mobileNumber);
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(reviewMessage)}`, "_blank");
  };

  return (
    <div
      style={style}
      className={cn(
        "font-app group relative overflow-hidden rounded-xl border transition-all duration-200",
        "bg-white dark:bg-slate-900/50 backdrop-blur-sm",
        "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700",
        selected ? "ring-2 ring-primary border-transparent" : "border-slate-200 dark:border-slate-800",
        className,
      )}
    >
      {/* Status indicator (Left side) */}
      <div
        className={cn(
          "absolute top-0 left-0 w-1 h-full transition-colors duration-300",
          reminderStatus === "overdue"
            ? "bg-rose-500"
            : reminderStatus === "sent-today"
              ? "bg-emerald-500"
              : reminderStatus === "pending"
                ? "bg-amber-500"
                : "bg-transparent",
        )}
      />

      {/* Floating Action (Hover only) */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary transition-all duration-200 z-10"
      >
        <Eye className="w-3.5 h-3.5" />
      </button>

      <div className="p-3.5">
        <div className="flex items-start gap-3">
          {/* Avatar Container */}
          <div className="relative flex-shrink-0">
            <div
              className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm",
                getAvatarGradient(customer.fullName),
              )}
            >
              <span className={getAvatarTextColor(customer.fullName)}>{displayId ?? customer.customerId ?? "?"}</span>
            </div>
            {selectable && (
              <div
                className="absolute -top-1.5 -left-1.5 bg-white dark:bg-slate-950 rounded-md p-0.5 shadow-md border"
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox checked={selected} onCheckedChange={(checked) => onSelectChange?.(!!checked)} />
              </div>
            )}
          </div>

          {/* Core Content */}
          <div className="flex-1 min-w-0" onClick={onClick} role="button">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-display font-app text-base sm:text-lg text-foreground truncate">
                {customer.fullName}
              </h3>
              {reminderStatus !== "none" && (
                <div
                  className={cn(
                    "flex items-center text-[10px] font-bold uppercase tracking-wider whitespace-nowrap",
                    statusInfo.color,
                  )}
                >
                  <statusInfo.icon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </div>
              )}
            </div>

            {/* Meta Info Row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
              <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Phone className="w-3 h-3 text-emerald-600" />
                {customer.mobileNumber}
              </div>
              {lastReminder && (
                <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400/80">
                  <History className="w-3 h-3" />
                  <span>{lastReminder}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Action Area */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {customer.interest?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-slate-400"
              >
                {tag}
              </span>
            ))}
            {customer.interest && customer.interest.length > 2 && (
              <span className="text-[10px] text-slate-400">+{customer.interest.length - 2}</span>
            )}
            {sentCount > 0 && customer.interest?.length === 0 && (
              <span className="text-[10px] text-slate-400 italic">{sentCount} reminders sent</span>
            )}
          </div>

          <button
            onClick={handleSendReminder}
            disabled={!hasValidPhone}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95",
              hasValidPhone
                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white"
                : "text-slate-300 dark:text-slate-700 cursor-not-allowed",
            )}
          >
            <Send className="w-3.5 h-3.5" />
            Remind
          </button>
        </div>
      </div>

      <WhatsAppReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={handleConfirmSend}
        message={reviewMessage}
        customerName={customer.fullName}
      />
    </div>
  );
}
