import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowUpDown, Calendar, Bell, MessageCircle, CheckSquare, Square } from 'lucide-react';
import { format, isToday, isYesterday, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
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
  canSendReminderForCategory 
} from '@/utils/reminderCategoryUtils';
import { 
  wasReminderSentToday, 
  isValidPhoneNumber, 
  openWhatsAppReminder 
} from '@/utils/reminderUtils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DateGroup = 'Today' | 'Yesterday' | string;
type SortType = 'date' | 'name' | 'reminder';

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
  
  customers.forEach(customer => {
    const group = getDateGroup(customer.visitingDate);
    if (!groups[group]) {
      groups[group] = [];
    }
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
  if (sortType === 'reminder') {
    return sortByReminderPriority(customers);
  }
  
  return [...customers].sort((a, b) => {
    if (sortType === 'name') {
      return a.fullName.localeCompare(b.fullName);
    }
    return new Date(b.visitingDate).getTime() - new Date(a.visitingDate).getTime();
  });
};

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

  const reminderCounts = useMemo(() => 
    getReminderCategoryCounts(customers),
    [customers]
  );

  const filteredCustomers = useMemo(() => {
    const searched = searchCustomers(searchQuery);
    const filtered = filterByReminderCategory(searched, reminderFilter);
    return sortCustomers(filtered, sortType);
  }, [searchCustomers, searchQuery, reminderFilter, sortType]);

  const groupedCustomers = useMemo(() => 
    groupCustomersByDate(filteredCustomers),
    [filteredCustomers]
  );

  const selectableCustomers = useMemo(() => 
    filteredCustomers.filter(c => canSendReminderForCategory(c) && !wasReminderSentToday(c) && isValidPhoneNumber(c.mobileNumber)),
    [filteredCustomers]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === selectableCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableCustomers.map(c => c.id)));
    }
  }, [selectableCustomers, selectedIds]);

  const handleSelectChange = useCallback((customerId: string, selected: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(customerId);
      } else {
        newSet.delete(customerId);
      }
      return newSet;
    });
  }, []);

  const handleBulkSendReminders = useCallback(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    let sentCount = 0;

    selectedIds.forEach(id => {
      const customer = customers.find(c => c.id === id);
      if (customer && canSendReminderForCategory(customer) && !wasReminderSentToday(customer)) {
        updateCustomer(id, {
          reminderSentDates: [...(customer.reminderSentDates || []), today],
          reminderHistory: [
            ...(customer.reminderHistory || []),
            { sentAt: new Date().toISOString(), message: `WhatsApp reminder sent (bulk)` }
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
      description: "WhatsApp windows opened for selected customers.",
    });
  }, [selectedIds, customers, updateCustomer, profile.businessName, toast]);

  const getCategoryLabel = (category: ReminderCategory): string => {
    const config = REMINDER_CATEGORIES.find(c => c.value === category);
    return config?.label || 'All';
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 gradient-glow pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <Header />
      
      <main className="pb-24 relative z-10">
        {/* Search */}
        <div className="px-4 py-4">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder="Search by name or phone..."
          />
        </div>

        {/* Reminder Category Filters with Counters */}
        <div className="px-4 pb-3">
          <div className="glass rounded-xl p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Reminders</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="text-xl font-bold text-primary">{customers.length}</span>
              </div>
            </div>
            
            {/* Category Filter Buttons with Counts */}
            <div className="flex gap-2 flex-wrap">
              {REMINDER_CATEGORIES.map((cat) => {
                const count = reminderCounts[cat.value];
                const isActive = reminderFilter === cat.value;
                const isUrgent = cat.value === 'overdue' || cat.value === 'today';
                
                return (
                  <Button
                    key={cat.value}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReminderFilter(cat.value)}
                    className={`text-xs ${
                      isActive 
                        ? isUrgent 
                          ? 'bg-destructive text-destructive-foreground' 
                          : 'bg-primary text-primary-foreground' 
                        : isUrgent && count > 0
                          ? 'border-destructive/50 text-destructive'
                          : 'border-primary/30 text-muted-foreground'
                    }`}
                  >
                    {cat.label} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bulk Actions & Sort */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {bulkSelectMode ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs gap-1"
                >
                  {selectedIds.size === selectableCustomers.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedIds.size === selectableCustomers.length ? 'Deselect All' : 'Select All'}
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
                <p className="text-sm text-muted-foreground">
                  {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
                </p>
                {selectableCustomers.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBulkSelectMode(true)}
                    className="text-xs gap-1 border-primary/30"
                  >
                    <MessageCircle className="w-3 h-3" />
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
                Sort by {sortType === 'date' ? 'Date' : sortType === 'name' ? 'Name' : 'Priority'}
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

        {/* Customer List with Sticky Date Sections */}
        <div className="px-4">
          {customers.length === 0 ? (
            <EmptyState type="no-customers" />
          ) : filteredCustomers.length === 0 ? (
            <EmptyState type="no-results" searchQuery={searchQuery} />
          ) : (
            sortDateGroups(Object.keys(groupedCustomers)).map((group) => {
              const groupCustomers = groupedCustomers[group];
              if (!groupCustomers || groupCustomers.length === 0) return null;
              
              return (
                <div key={group} className="mb-4">
                  {/* Sticky Date Header */}
                  <div className="sticky top-[76px] z-20 -mx-4 px-4 py-3">
                    <div className="bg-gradient-to-r from-primary/15 via-primary/10 to-transparent rounded-xl px-4 py-3 border-l-4 border-primary shadow-sm backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <span className="text-lg font-bold text-foreground tracking-tight">
                            {group}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {groupCustomers.length} customer{groupCustomers.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    {groupCustomers.map((customer, index) => {
                      const isSelectable = canSendReminderForCategory(customer) && !wasReminderSentToday(customer) && isValidPhoneNumber(customer.mobileNumber);
                      
                      return (
                        <CustomerCard
                          key={customer.id}
                          customer={customer}
                          onClick={() => navigate(`/customer/${customer.id}`)}
                          style={{ animationDelay: `${index * 50}ms` }}
                          selectable={bulkSelectMode && isSelectable}
                          selected={selectedIds.has(customer.id)}
                          onSelectChange={(selected) => handleSelectChange(customer.id, selected)}
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

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 safe-bottom z-40">
        <Button 
          variant="fab" 
          size="fab" 
          onClick={() => navigate('/customer/new')}
          className="animate-scale-in"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
