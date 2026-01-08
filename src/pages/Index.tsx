import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CustomerCard } from '@/components/CustomerCard';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const { customers, searchCustomers } = useCustomers();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => 
    searchCustomers(searchQuery),
    [searchCustomers, searchQuery]
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

        {/* Customer List */}
        <div className="px-4 space-y-3">
          {customers.length === 0 ? (
            <EmptyState type="no-customers" />
          ) : filteredCustomers.length === 0 ? (
            <EmptyState type="no-results" searchQuery={searchQuery} />
          ) : (
            filteredCustomers.map((customer, index) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onClick={() => navigate(`/customer/${customer.id}`)}
                style={{ animationDelay: `${index * 50}ms` }}
              />
            ))
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
