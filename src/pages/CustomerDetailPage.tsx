import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ArrowLeft, Edit2, Phone, Calendar, Heart, Clock, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const CustomerDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCustomer, deleteCustomer } = useCustomers();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const customer = id ? getCustomer(id) : undefined;

  if (!customer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Customer not found</p>
          <Button variant="outline" onClick={() => navigate('/')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const formattedDate = customer.visitingDate 
    ? format(new Date(customer.visitingDate), 'MMMM d, yyyy')
    : 'No date set';

  const createdDate = format(new Date(customer.createdAt), 'MMM d, yyyy');

  const handleDelete = () => {
    const name = customer.fullName;
    deleteCustomer(customer.id);
    toast({
      title: "Customer deleted",
      description: `${name} has been removed from your customers.`,
      variant: "destructive",
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with gradient */}
      <div className="relative h-32 gradient-primary flex-shrink-0">
        <div className="absolute top-4 left-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')} 
            className="bg-background/20 hover:bg-background/30 text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Avatar */}
        <div className="absolute -bottom-10 left-5">
          <div className="w-20 h-20 rounded-full bg-card border-4 border-card flex items-center justify-center shadow-elevated">
            <span className="text-3xl font-display font-semibold text-primary">
              {customer.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-14 px-5 pb-5 space-y-5 overflow-y-auto">
        {/* Name & Edit */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-display font-semibold text-foreground">
              {customer.fullName}
            </h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
              <Clock className="w-3.5 h-3.5" />
              Customer since {createdDate}
            </p>
          </div>
          <Button 
            variant="soft" 
            size="sm" 
            onClick={() => navigate(`/customer/${customer.id}/edit`)} 
            className="gap-1.5"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              <Phone className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mobile Number</p>
              <a 
                href={`tel:${customer.mobileNumber}`}
                className="text-foreground font-medium hover:text-primary transition-colors"
              >
                {customer.mobileNumber}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <Calendar className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Visit</p>
              <p className="text-foreground font-medium">{formattedDate}</p>
            </div>
          </div>
        </div>

        {/* Interests */}
        {customer.interest.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
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

        {/* Preferences */}
        {customer.preferences && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Preferences & Notes
            </h3>
            <div className="p-4 rounded-xl bg-muted/50 border border-border/30">
              <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">
                {customer.preferences}
              </p>
            </div>
          </div>
        )}

        {/* Delete Button */}
        <div className="pt-4">
          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
            Delete Customer
          </Button>
        </div>
      </div>

      {/* Call Action */}
      <div className="px-5 py-4 border-t border-border bg-card safe-bottom flex-shrink-0">
        <Button 
          asChild 
          className="w-full gap-2"
        >
          <a href={`tel:${customer.mobileNumber}`}>
            <Phone className="w-5 h-5" />
            Call Customer
          </a>
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-destructive/20">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="pt-2">
              Are you sure you want to delete <span className="font-semibold text-foreground">{customer.fullName}</span>? 
              This action cannot be undone and all their information will be permanently removed.
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
