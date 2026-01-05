import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer, CustomerFormData } from '@/types/customer';
import { Header } from '@/components/Header';
import { SearchBar } from '@/components/SearchBar';
import { CustomerCard } from '@/components/CustomerCard';
import { CustomerForm } from '@/components/CustomerForm';
import { CustomerDetail } from '@/components/CustomerDetail';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, getCustomer, searchCustomers } = useCustomers();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>();

  const filteredCustomers = useMemo(() => 
    searchCustomers(searchQuery),
    [searchCustomers, searchQuery]
  );

  const handleAddCustomer = (data: CustomerFormData) => {
    addCustomer(data);
    setIsFormOpen(false);
    setEditingCustomer(undefined);
    toast({
      title: "Customer added",
      description: `${data.fullName} has been added to your customers.`,
    });
  };

  const handleUpdateCustomer = (data: CustomerFormData) => {
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, data);
      setIsFormOpen(false);
      setEditingCustomer(undefined);
      setIsDetailOpen(false);
      setSelectedCustomer(undefined);
      toast({
        title: "Customer updated",
        description: `${data.fullName}'s information has been updated.`,
      });
    }
  };

  const handleDeleteCustomer = () => {
    if (editingCustomer) {
      const name = editingCustomer.fullName;
      deleteCustomer(editingCustomer.id);
      setIsFormOpen(false);
      setEditingCustomer(undefined);
      setIsDetailOpen(false);
      setSelectedCustomer(undefined);
      toast({
        title: "Customer deleted",
        description: `${name} has been removed from your customers.`,
        variant: "destructive",
      });
    }
  };

  const openCustomerDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const openEditForm = () => {
    setEditingCustomer(selectedCustomer);
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setEditingCustomer(undefined);
    setIsFormOpen(true);
  };

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
                onClick={() => openCustomerDetail(customer)}
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
          onClick={openNewForm}
          className="animate-scale-in"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      {/* Customer Form Modal */}
      <CustomerForm
        customer={editingCustomer}
        onSubmit={editingCustomer ? handleUpdateCustomer : handleAddCustomer}
        onDelete={editingCustomer ? handleDeleteCustomer : undefined}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCustomer(undefined);
        }}
        isOpen={isFormOpen}
      />

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <CustomerDetail
          customer={selectedCustomer}
          onEdit={openEditForm}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedCustomer(undefined);
          }}
          isOpen={isDetailOpen}
        />
      )}
    </div>
  );
};

export default Index;
