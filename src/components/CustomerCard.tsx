import { useState } from 'react';
import { format } from 'date-fns';
import { Phone, Calendar, ChevronRight, Trash2, AlertTriangle } from 'lucide-react';
import { Customer } from '@/types/customer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { cn } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onClick: () => void;
  onDelete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CustomerCard({ customer, onClick, onDelete, className, style }: CustomerCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const formattedDate = customer.visitingDate 
    ? format(new Date(customer.visitingDate), 'MMM d, yyyy')
    : 'No date set';

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete?.();
    setShowDeleteDialog(false);
  };

  return (
    <>
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left p-4 rounded-xl glass border border-border/30",
          "gradient-card shadow-card",
          "transition-all duration-300 hover:shadow-elevated hover:border-primary/40",
          "hover:scale-[1.01] active:scale-[0.99]",
          "focus:outline-none focus:ring-2 focus:ring-primary/30",
          "animate-slide-up group",
          className
        )}
        style={style}
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow transition-all duration-300 group-hover:shadow-elevated">
            <span className="text-lg font-display font-semibold text-primary-foreground">
              {customer.fullName.charAt(0).toUpperCase()}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-semibold text-lg text-foreground truncate">
                {customer.fullName}
              </h3>
              <div className="flex items-center gap-1">
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteClick}
                    className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </div>
            </div>

            {/* Phone & Date */}
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {customer.mobileNumber}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate}
              </span>
            </div>

            {/* Interests */}
            {customer.interest.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {customer.interest.slice(0, 3).map((interest) => (
                  <Badge key={interest} variant="soft" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {customer.interest.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{customer.interest.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </button>

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
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
