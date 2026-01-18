import { useState, useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpDown, History } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { useCustomers } from "@/hooks/useCustomers";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CustomerCard } from "@/components/CustomerCard";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Customer } from "@/types/customer";
import { useProfile } from "@/contexts/ProfileContext";
import { useToast } from "@/hooks/use-toast";
import {
  ReminderCategory,
  REMINDER_CATEGORIES,
  filterByReminderCategory,
  getReminderCategoryCounts,
  sortByReminderPriority,
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

type DateGroup = "Today" | "Yesterday" | "Unknown Date" | string;
type SortType = "customerId" | "name";

/* -------------------- Date Helpers -------------------- */

const safeParseDate = (dateString?: string): Date | null => {
  if (!dateString) return null;

  let d: Date;

  try {
    d = parseISO(dateString);
  } catch {
    d = new Date(dateString);
  }

  if (!isValid(d)) return null;
  return d;
};

const getDateGroup = (dateString?: string): DateGroup => {
  const date = safeParseDate(dateString);
  if (!date) return "Unknown Date";

  const today = new Date();
  const yesterday = new Date();

  today.setHours(0, 0, 0, 0);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";

  return format(d, "dd MMM yyyy");
};

const groupCustomersByDate = (
  customers: Customer[]
): Record<string, Customer[]> => {
  const groups: Record<string, Customer[]> = {};

  customers.forEach((customer) => {
    const group = getDateGroup(customer.visitingDate || customer.createdAt);
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
    if (a === "Unknown Date") return 1;
    if (b === "Unknown Date") return -1;

    const da = safeParseDate(a);
    const db = safeParseDate(b);

    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;

    return db.getTime() - da.getTime();
  });
};

const sortCustomers = (
  customers: Customer[],
  sortType: SortType
): Customer[] => {
  return [...customers].sort((a, b) => {
    if (sortType === "name") return a.fullName.localeCompare(b.fullName);

    // Default: sort by customer ID (ascending - 1, 2, 3...)
    const idA = a.customerId || 0;
    const idB = b.customerId || 0;
    return idA - idB;
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
  const [sortType, setSortType] = useState<SortType>("customerId");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", "light");
  }, []);

  // Auto-switch from "All" to "Yet to be Sent" after 10 seconds
  useEffect(() => {
    if (reminderFilter === "all") {
      const timer = setTimeout(() => {
        setReminderFilter("all");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [reminderFilter]);

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
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search by name or phone..."
                />
                <div className="rounded-xl border">
                  <div className="flex gap-2 py-2 flex-wrap ml-2">
                    {REMINDER_CATEGORIES.map((cat) => {
                      const count = reminderCounts[cat.value];
                      const isActive = reminderFilter === cat.value;
                      return (
                        <Button
                          key={cat.value}
                          variant="ghost"
                          size="sm"
                          onClick={() => setReminderFilter(cat.value)}
                          className={`rounded-full px-4 py-1.5 text-xs relative ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "border"
                          }`}
                        >
                          {cat.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
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
                      <DropdownMenuItem onClick={() => setSortType("customerId")}>
                        By Customer ID
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortType("name")}>
                        By Name
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

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
                  <div className="font-app text-lg mb-3">{group}</div>

                  <div className="space-y-4">
                    {groupCustomers.map((customer, index) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        displayId={customer.customerId}
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
