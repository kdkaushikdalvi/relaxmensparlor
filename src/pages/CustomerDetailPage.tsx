import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  X,
  Edit2,
  Phone,
  Calendar,
  Heart,
  Clock,
  FileText,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useCustomers } from "@/hooks/useCustomers";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";

const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCustomer, deleteCustomer } = useCustomers();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const customer = id ? getCustomer(id) : undefined;

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Customer not found</p>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mt-4"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = customer.visitingDate
    ? format(new Date(customer.visitingDate), "MMMM d, yyyy")
    : "No date set";

  const createdDate = format(new Date(customer.createdAt), "MMM d, yyyy");

  const handleDelete = () => {
    const name = customer.fullName;
    deleteCustomer(customer.id);
    toast({
      title: "Customer deleted",
      description: `${name} has been removed from your customers.`,
      variant: "destructive",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <div className="px-3 py-2 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-12 w-12 rounded-full bg-primary/10 hover:bg-primary/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <span className="font-app text-foreground">Details</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => navigate(`/customer/${customer.id}/edit`)}
            title="Edit"
          >
            <Edit2 className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => setShowDeleteDialog(true)}
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Profile Card */}
        <div className="bg-card rounded-xl border p-4 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-app text-primary">
            {customer.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-app">{customer.fullName}</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5" />
              Customer since {createdDate}
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Mobile Number</p>
              <a
                href={`tel:${customer.mobileNumber}`}
                className="font-app text-foreground"
              >
                {customer.mobileNumber}
              </a>
            </div>
          </div>

          <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Last Visit</p>
              <p className="font-app text-foreground">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Interests */}
        {customer.interest.length > 0 && (
          <div className="bg-card border rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-app flex items-center gap-2">
              <Heart className="w-4 h-4 text-primary" />
              Interests
            </h3>
            <div className="flex flex-wrap gap-2">
              {customer.interest.map((interest) => (
                <Badge key={interest} variant="soft">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {customer.preferences && (
          <div className="bg-card border rounded-xl p-4 space-y-2">
            <h3 className="text-sm font-app flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Notes
            </h3>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {customer.preferences}
            </p>
          </div>
        )}
      </div>

      {/* Call Button */}
      <div className="p-4 border-t bg-card">
        <Button asChild className="w-full gap-2">
          <a href={`tel:${customer.mobileNumber}`}>
            <Phone className="w-5 h-5" />
            Call Customer
          </a>
        </Button>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to delete{" "}
              <span className="font-app">{customer.fullName}</span>? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerDetailPage;
