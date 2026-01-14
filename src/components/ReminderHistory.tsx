import { format } from "date-fns";
import { History, MessageCircle, Clock, User } from "lucide-react";
import {
  Customer,
  ReminderHistory as ReminderHistoryType,
} from "@/types/customer";
import { useCustomers } from "@/hooks/useCustomers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReminderHistoryProps {
  customerId?: string; // If provided, show only this customer's history
  limit?: number;
}

interface HistoryEntry {
  customer: Customer;
  reminder: ReminderHistoryType;
}

export function ReminderHistory({ customerId, limit }: ReminderHistoryProps) {
  const { customers, getCustomer } = useCustomers();

  // Get all reminder history entries
  const historyEntries: HistoryEntry[] = [];

  if (customerId) {
    const customer = getCustomer(customerId);
    if (customer?.reminderHistory) {
      customer.reminderHistory.forEach((reminder) => {
        historyEntries.push({ customer, reminder });
      });
    }
  } else {
    customers.forEach((customer) => {
      if (customer.reminderHistory) {
        customer.reminderHistory.forEach((reminder) => {
          historyEntries.push({ customer, reminder });
        });
      }
    });
  }

  // Sort by date (newest first)
  historyEntries.sort(
    (a, b) =>
      new Date(b.reminder.sentAt).getTime() -
      new Date(a.reminder.sentAt).getTime()
  );

  // Apply limit if provided
  const displayEntries = limit
    ? historyEntries.slice(0, limit)
    : historyEntries;

  if (displayEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <History className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-sm">No reminder history yet</p>
        <p className="text-xs mt-1">Sent reminders will appear here</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3 pr-4">
        {displayEntries.map((entry, index) => (
          <div
            key={`${entry.customer.id}-${entry.reminder.sentAt}-${index}`}
            className={cn(
              "p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors",
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-app text-primary-foreground">
                  {entry.customer.fullName.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-app truncate">
                    {entry.customer.fullName}
                  </h4>
                  <Badge
                    variant="outline"
                    className="text-xs gap-1 flex-shrink-0"
                  >
                    <MessageCircle className="w-3 h-3" />
                    WhatsApp
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {entry.reminder.message}
                </p>

                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(
                      new Date(entry.reminder.sentAt),
                      "dd MMM yyyy, hh:mm a"
                    )}
                  </span>
                  {!customerId && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {entry.customer.mobileNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
