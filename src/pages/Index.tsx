import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, ArrowUpDown, Calendar } from 'lucide-react';
import { format, isToday, isYesterday, startOfWeek, startOfMonth, startOfYear, isAfter } from 'date-fns';
import { useCustomers } from '@/hooks/useCustomers';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type DateGroup = 'Today' | 'Yesterday' | string;
type FilterType = 'all' | 'today' | 'week' | 'month' | 'year';
type SortType = 'date' | 'name';

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

const filterCustomersByPeriod = (customers: Customer[], filter: FilterType): Customer[] => {
  if (filter === 'all') return customers;
  
  const now = new Date();
  
  return customers.filter(customer => {
    const visitDate = new Date(customer.visitingDate);
    
    switch (filter) {
      case 'today':
        return isToday(visitDate);
      case 'week':
        return isAfter(visitDate, startOfWeek(now, { weekStartsOn: 1 }));
      case 'month':
        return isAfter(visitDate, startOfMonth(now));
      case 'year':
        return isAfter(visitDate, startOfYear(now));
      default:
        return true;
    }
  });
};

const sortCustomers = (customers: Customer[], sortType: SortType): Customer[] => {
  return [...customers].sort((a, b) => {
    if (sortType === 'name') {
      return a.fullName.localeCompare(b.fullName);
    }
    return new Date(b.visitingDate).getTime() - new Date(a.visitingDate).getTime();
  });
};

const Index = () => {
  const navigate = useNavigate();
  const { customers, searchCustomers } = useCustomers();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date');

  const filteredCustomers = useMemo(() => {
    const searched = searchCustomers(searchQuery);
    const filtered = filterCustomersByPeriod(searched, filter);
    return sortCustomers(filtered, sortType);
  }, [searchCustomers, searchQuery, filter, sortType]);

  const groupedCustomers = useMemo(() => 
    groupCustomersByDate(filteredCustomers),
    [filteredCustomers]
  );

  const filterLabels: Record<FilterType, string> = {
    all: 'All',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    year: 'Year',
  };

  const getFilterCount = (filterType: FilterType) => {
    const filtered = filterCustomersByPeriod(customers, filterType);
    return filtered.length;
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

        {/* Total Customer Count with Filters */}
        <div className="px-4 pb-3">
          <div className="glass rounded-xl p-4 border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">Total Customers</span>
              </div>
              <span className="text-2xl font-bold text-primary">{customers.length}</span>
            </div>
            
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {(['all', 'today', 'week', 'month', 'year'] as FilterType[]).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className={`text-xs ${filter === f ? 'bg-primary text-primary-foreground' : 'border-primary/30 text-muted-foreground'}`}
                >
                  {filterLabels[f]} ({getFilterCount(f)})
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="px-4 pb-2 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                <ArrowUpDown className="w-3 h-3" />
                Sort by {sortType === 'date' ? 'Date' : 'Name'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
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
                  {/* Redesigned Sticky Date Header */}
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
                    {groupCustomers.map((customer, index) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onClick={() => navigate(`/customer/${customer.id}`)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      />
                    ))}
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
