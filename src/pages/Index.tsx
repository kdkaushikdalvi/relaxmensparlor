import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ArrowUpDown,
  Calendar,
  Bell,
  MessageCircle,
  CheckSquare,
  Square,
} from "lucide-react";
import { format } from "date-fns";
import { useCustomers } from "@/hooks/useCustomers";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CustomerCard } from "@/components/CustomerCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { useProfile } from "@/contexts/ProfileContext";
import { useToast } from "@/hooks/use-toast";
import {
  ReminderCategory,
  REMINDER_CATEGORIES,
  filterByReminderCategory,
  getReminderCategoryCounts,
  sortByReminderPriority,
  canSendReminderForCategory,
} from "@/utils/reminderCategoryUtils";
import {
  wasReminderSentToday,
  isValidPhoneNumber,
  openWhatsAppReminder,
} from "@/utils/reminderUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* -------------------- Types -------------------- */

type DateGroup = "Today" | "Yesterday" | string;
type SortType = "date" | "name" | "reminder" | "newest";

/* -------------------- Date Group Helpers -------------------- */

const getDateGroup = (dateString: string): DateGroup => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(yesterday.getDate() - 1);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return "Today";
  if (date.getTime() === yesterday.getTime()) return "Yesterday";
  return format(date, "dd MMM yyyy");
};

const groupCustomersByDate = (
  customers: Customer[]
): Record<string, Customer[]> => {
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
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;
    const dateA = new Date(a.split(" ").reverse().join(" "));
    const dateB = new Date(b.split(" ").reverse().join(" "));
    return dateB.getTime() - dateA.getTime();
  });
};

const sortCustomers = (
  customers: Customer[],
  sortType: SortType
): Customer[] => {
  if (sortType === "reminder") return sortByReminderPriority(customers);

  return [...customers].sort((a, b) => {
    if (sortType === "name") return a.fullName.localeCompare(b.fullName);
    if (sortType === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return (
      new Date(b.visitingDate).getTime() - new Date(a.visitingDate).getTime()
    );
  });
};

/* -------------------- Page -------------------- */

const Index = () => {
  const navigate = useNavigate();
  const { customers, searchCustomers, updateCustomer, deleteCustomer } =
    useCustomers();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [reminderFilter, setReminderFilter] = useState<ReminderCategory>("all");
  const [sortType, setSortType] = useState<SortType>("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    localStorage.setItem("theme", "light");
  }, []);

  const reminderCounts = useMemo(
    () => getReminderCategoryCounts(customers),
    [customers]
  );

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

  const handleSelectChange = useCallback(
    (customerId: string, selected: boolean) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (selected) newSet.add(customerId);
        else newSet.delete(customerId);
        return newSet;
      });
    },
    []
  );

  const handleBulkSendReminders = useCallback(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    let sentCount = 0;

    selectedIds.forEach((id) => {
      const customer = customers.find((c) => c.id === id);
      if (
        customer &&
        canSendReminderForCategory(customer) &&
        !wasReminderSentToday(customer)
      ) {
        updateCustomer(id, {
          reminderSentDates: [...(customer.reminderSentDates || []), today],
          reminderHistory: [
            ...(customer.reminderHistory || []),
            {
              sentAt: new Date().toISOString(),
              message: `WhatsApp reminder sent (bulk)`,
            },
          ],
        });
        openWhatsAppReminder(customer, profile.businessName);
        sentCount++;
      }
    });

    setSelectedIds(new Set());
    setBulkSelectMode(false);

    toast({
      title: `${sentCount} reminder${sentCount !== 1 ? "s" : ""} sent`,
      description: "WhatsApp windows opened for selected customers.",
    });
  }, [selectedIds, customers, updateCustomer, profile.businessName, toast]);

  const handleDeleteConfirm = useCallback(() => {
    if (customerToDelete) {
      const name = customerToDelete.fullName;
      deleteCustomer(customerToDelete.id);
      toast({
        title: "Customer deleted",
        description: `${name} has been removed.`,
        variant: "destructive",
      });
      setCustomerToDelete(null);
      setDeleteDialogOpen(false);
    }
  }, [customerToDelete, deleteCustomer, toast]);

  const handleViewCustomer = (customer: Customer) => {
    navigate(`/customer/${customer.id}`);
  };

  const handleEditCustomer = (customer: Customer) => {
    navigate(`/customer/${customer.id}/edit`);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      <Header />

      <main className="pb-24 relative z-10">
        {/* ===== Filters Accordion ===== */}
        <div className="px-4 py-3 sticky top-[64px] z-30">
          <Accordion type="single" collapsible>
            <AccordionItem
              value="filters"
              className="border rounded-2xl shadow-lg"
            >
              <AccordionTrigger className="px-4 py-3">
                <span className="font-app">🔍 Search, Filters & Sort</span>
              </AccordionTrigger>

              <AccordionContent className="p-4 space-y-4">
                {/* Search */}
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name or phone..."
                />

                {/* Reminder Filters */}
                <div className="rounded-xl p-4 border">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="w-5 h-5 text-primary" />
                    <span className="font-app">Reminders</span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {REMINDER_CATEGORIES.map((cat) => {
                      const count = reminderCounts[cat.value];
                      const isActive = reminderFilter === cat.value;

                      return (
                        <Button
                          key={cat.value}
                          variant="ghost"
                          size="sm"
                          onClick={() => setReminderFilter(cat.value)}
                          className={`rounded-full px-4 py-1.5 text-xs ${
                            isActive ? "bg-primary text-white" : "border"
                          }`}
                        >
                          {cat.label} ({count})
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Bulk + Sort */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredCustomers.length} customers
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowUpDown className="w-4 h-4 mr-1" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortType("newest")}>
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortType("reminder")}>
                        Sort by Priority
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortType("date")}>
                        Sort by Visit Date
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortType("name")}>
                        Sort by Name
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* ===== Customer List ===== */}
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
                  <div className="font-bold text-lg mb-3">{group}</div>

                  <div className="space-y-4">
                    {groupCustomers.map((customer, index) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        onClick={() => handleViewCustomer(customer)}
                        onEdit={() => handleEditCustomer(customer)}
                        onDelete={() => handleDeleteCustomer(customer)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* ===== FAB ===== */}
      <div className="fixed bottom-5 right-5 z-40">
        <Button
          onClick={() => navigate("/customer/new")}
          className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg shadow-primary/40 flex items-center justify-center"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </Button>
      </div>

      {/* ===== Delete Dialog ===== */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-app">{customerToDelete?.fullName}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
