import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';

type DateGroup = 'Today' | 'Yesterday' | 'Older';

const getDateGroup = (dateString: string): DateGroup => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Reset time for comparison
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  
  if (date.getTime() === today.getTime()) return 'Today';
  if (date.getTime() === yesterday.getTime()) return 'Yesterday';
  return 'Older';
};

const groupCustomersByDate = (customers: Customer[]): Record<DateGroup, Customer[]> => {
  const groups: Record<DateGroup, Customer[]> = {
    'Today': [],
    'Yesterday': [],
    'Older': [],
  };
  
  customers.forEach(customer => {
    const group = getDateGroup(customer.visitingDate);
    groups[group].push(customer);
  });
  
  return groups;
};

const DATE_GROUP_ORDER: DateGroup[] = ['Today', 'Yesterday', 'Older'];

const Index = () => {
  const navigate = useNavigate();
  const { customers, searchCustomers } = useCustomers();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => 
    searchCustomers(searchQuery),
    [searchCustomers, searchQuery]
  );

  const groupedCustomers = useMemo(() => 
    groupCustomersByDate(filteredCustomers),
    [filteredCustomers]
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient glow */}
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

        {/* Customer Count */}
        {customers.length > 0 && (
          <div className="px-4 pb-2">
            <p className="text-sm text-muted-foreground">
              {filteredCustomers.length === customers.length 
                ? `${customers.length} customer${customers.length !== 1 ? 's' : ''}`
                : `${filteredCustomers.length} of ${customers.length} customers`
              }
            </p>
          </div>
        )}

        {/* Customer List with Sticky Date Sections */}
        <div className="px-4">
          {customers.length === 0 ? (
            <EmptyState type="no-customers" />
          ) : filteredCustomers.length === 0 ? (
            <EmptyState type="no-results" searchQuery={searchQuery} />
          ) : (
            DATE_GROUP_ORDER.map((group) => {
              const groupCustomers = groupedCustomers[group];
              if (groupCustomers.length === 0) return null;
              
              return (
                <div key={group} className="mb-2">
                  {/* Sticky Date Header */}
                  <div className="sticky top-[76px] z-20 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-border/50">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                      {group}
                    </span>
                  </div>
                  
                  {/* Customers in this group */}
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
