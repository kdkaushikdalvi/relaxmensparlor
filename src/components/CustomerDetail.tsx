import { format } from 'date-fns';
import { X, Edit2, Phone, Calendar, Heart, Clock, FileText } from 'lucide-react';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CustomerDetailProps {
  customer: Customer;
  onEdit: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function CustomerDetail({ customer, onEdit, onClose, isOpen }: CustomerDetailProps) {
  if (!isOpen) return null;

  const formattedDate = customer.visitingDate 
    ? format(new Date(customer.visitingDate), 'MMMM d, yyyy')
    : 'No date set';

  const createdDate = format(new Date(customer.createdAt), 'MMM d, yyyy');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-card rounded-t-3xl sm:rounded-2xl shadow-elevated animate-slide-up overflow-hidden">
        {/* Header with gradient */}
        <div className="relative h-32 gradient-primary">
          <div className="absolute top-4 right-4">
            <Button variant="ghost" size="icon" onClick={onClose} className="bg-background/20 hover:bg-background/30 text-primary-foreground">
              <X className="w-5 h-5" />
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
        <div className="pt-14 px-5 pb-5 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
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
            <Button variant="soft" size="sm" onClick={onEdit} className="gap-1.5">
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
        </div>

        {/* Call Action */}
        <div className="px-5 py-4 border-t border-border safe-bottom">
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
      </div>
    </div>
  );
}
