import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpDown, Calendar, Bell, MessageCircle, CheckSquare, Square } from 'lucide-react';
import { format } from 'date-fns';
import { useCustomers } from '@/hooks/useCustomers';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { useProfile } from '@/contexts/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import {
  ReminderCategory,
  REMINDER_CATEGORIES,
  filterByReminderCategory,
  getReminderCategoryCounts,
  sortByReminderPriority,
  canSendReminderForCategory,
} from '@/utils/reminderCategoryUtils';
import {
  wasReminderSentToday,
  isValidPhoneNumber,
  openWhatsAppReminder,
} from '@/utils/reminderUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DateGroup = 'Today' | 'Yesterday' | string;
type SortType = 'date' | 'name' | 'reminder';

/* -------------------- Date Group Helpers -------------------- */

const getDateGroup = (dateString: string): DateGroup => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return format(date, 'dd MMM yyyy');
};

const groupCustomersByDate = (customers: Customer[]): Record<string, Customer[]> => {
  const groups: Record<string, Customer[]> = {};
  customers.forEach((customer) => {
    const group = getDateGroup(customer.visitingDate);
    if (!groups[group]) groups[group] = [];
    groups[group].push(customer);
  });
  return groups;
};

const sortDateGroups = (groups: string[]): string[] => {
  return groups.sort((a, b) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    if (a === 'Yesterday') return -1;
    if (b === 'Yesterday') return 1;
    const dateA = new Date(a.split(' ').reverse().join(' '));
    const dateB = new Date(b.split(' ').reverse().join(' '));
    return dateB.getTime() - dateA.getTime();
  });
};

const sortCustomers = (customers: Customer[], sortType: SortType): Customer[] => {
  if (sortType === 'reminder') return sortByReminderPriority(customers);

  return [...customers].sort((a, b) => {
    if (sortType === 'name') return a.fullName.localeCompare(b.fullName);
    return new Date(b.visitingDate).getTime() - new Date(a.visitingDate).getTime();
  });
};

/* -------------------- Page -------------------- */

const Index = () => {
  const navigate = useNavigate();
  const { customers, searchCustomers, updateCustomer } = useCustomers();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [reminderFilter, setReminderFilter] = useState<ReminderCategory>('all');
  const [sortType, setSortType] = useState<SortType>('reminder');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSelectMode, setBulkSelectMode] = useState(false);

  const reminderCounts = useMemo(() => getReminderCategoryCounts(customers), [customers]);

  const filteredCustomers = useMemo(() => {
    const searched = searchCustomers(searchQuery);
    const filtered = filterByReminderCategory(searched, reminderFilter);
    return sortCustomers(filtered, sortType);
  }, [searchCustomers, searchQuery, reminderFilter, sortType]);

  const groupedCustomers = useMemo(
    () => groupCustomersByDate(filteredCustomers),
    [filteredCustomers]
  );

  const selectableCustomers = useMemo(
    () =>
      filteredCustomers.filter(
        (c) =>
          canSendReminderForCategory(c) &&
          !wasReminderSentToday(c) &&
          isValidPhoneNumber(c.mobileNumber)
      ),
    [filteredCustomers]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === selectableCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableCustomers.map((c) => c.id)));
    }
  }, [selectableCustomers, selectedIds]);

  const handleSelectChange = useCallback((customerId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) newSet.add(customerId);
      else newSet.delete(customerId);
      return newSet;
    });
  }, []);

  const handleBulkSendReminders = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let sentCount = 0;

    selectedIds.forEach((id) => {
      const customer = customers.find((c) => c.id === id);
      if (customer && canSendReminderForCategory(customer) && !wasReminderSentToday(customer)) {
        updateCustomer(id, {
          reminderSentDates: [...(customer.reminderSentDates || []), today],
          reminderHistory: [
            ...(customer.reminderHistory || []),
            { sentAt: new Date().toISOString(), message: `WhatsApp reminder sent (bulk)` },
          ],
        });
        openWhatsAppReminder(customer, profile.businessName);
        sentCount++;
      }
    });

    setSelectedIds(new Set());
    setBulkSelectMode(false);

    toast({
      title: `${sentCount} reminder${sentCount !== 1 ? 's' : ''} sent`,
      description: 'WhatsApp windows opened for selected customers.',
    });
  }, [selectedIds, customers, updateCustomer, profile.businessName, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.12),transparent_40%)]" />

      <Header />

      <main className="pb-24 relative z-10">
        {/* Search */}
        <div className="px-4 py-4 sticky top-[64px] z-30 backdrop-blur-xl">
          <div className="glass rounded-2xl p-4 border border-primary/20 shadow-lg">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name or phone..."
            />
          </div>
        </div>

        {/* Reminder Filters */}
        <div className="px-4 pb-3">
          <div className="glass rounded-2xl p-4 border border-primary/20 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-primary" />
              <span className="font-semibold">Reminders</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {REMINDER_CATEGORIES.map((cat) => {
                const count = reminderCounts[cat.value];
                const isActive = reminderFilter === cat.value;
                const isUrgent = cat.value === 'overdue' || cat.value === 'today';

                return (
                  <Button
                    key={cat.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => setReminderFilter(cat.value)}
                    className={`
                      rounded-full px-4 py-1.5 text-xs font-medium transition-all
                      ${
                        isActive
                          ? isUrgent
                            ? 'bg-destructive text-white shadow-md scale-105'
                            : 'bg-primary text-white shadow-md scale-105'
                          : isUrgent && count > 0
                          ? 'border border-destructive/40 text-destructive bg-destructive/5'
                          : 'border border-primary/20 text-muted-foreground hover:bg-primary/5'
                      }
                    `}
                  >
                    {cat.label} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bulk + Sort Bar */}
        <div className="px-4 pb-3">
          <div className="glass rounded-2xl p-3 flex items-center justify-between border border-primary/20 shadow-md">
            <div className="flex items-center gap-2">
              {bulkSelectMode ? (
                <>
                  <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs gap-1">
                    {selectedIds.size === selectableCustomers.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Select All
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    disabled={selectedIds.size === 0}
                    onClick={handleBulkSendReminders}
                    className="text-xs gap-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send ({selectedIds.size})
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setBulkSelectMode(false);
                      setSelectedIds(new Set());
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground">
                    {filteredCustomers.length} customers
                  </span>
                  {selectableCustomers.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBulkSelectMode(true)}
                      className="text-xs gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Bulk Send
                    </Button>
                  )}
                </>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  <ArrowUpDown className="w-3 h-3" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortType('reminder')}>
                  Sort by Priority
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortType('date')}>
                  Sort by Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortType('name')}>
                  Sort by Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* List */}
        <div className="px-4">
          {customers.length === 0 ? (
            <EmptyState type="no-customers" />
          ) : filteredCustomers.length === 0 ? (
            <EmptyState type="no-results" searchQuery={searchQuery} />
          ) : (
            sortDateGroups(Object.keys(groupedCustomers)).map((group) => {
              const groupCustomers = groupedCustomers[group];
              if (!groupCustomers?.length) return null;

              return (
                <div key={group} className="mb-6">
                  {/* Date Header */}
                  <div className="sticky top-[180px] z-20 -mx-4 px-4 py-3">
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border border-primary/20 backdrop-blur-xl shadow-lg">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
                      <div className="relative flex items-center gap-4 px-5 py-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{group}</div>
                          <div className="text-xs text-muted-foreground">
                            {groupCustomers.length} customers
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-3">
                    {groupCustomers.map((customer, index) => {
                      const isSelectable =
                        canSendReminderForCategory(customer) &&
                        !wasReminderSentToday(customer) &&
                        isValidPhoneNumber(customer.mobileNumber);

                      return (
                        <CustomerCard
                          key={customer.id}
                          customer={customer}
                          onClick={() => navigate(`/customer/${customer.id}`)}
                          style={{ animationDelay: `${index * 50}ms` }}
                          selectable={bulkSelectMode && isSelectable}
                          selected={selectedIds.has(customer.id)}
                          onSelectChange={(selected) =>
                            handleSelectChange(customer.id, selected)
                          }
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          variant="fab"
          size="fab"
          onClick={() => navigate('/customer/new')}
          className="shadow-2xl shadow-primary/40 hover:scale-110 transition-transform"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
