import { useState, useEffect } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { Customer, CustomerFormData, INTEREST_OPTIONS } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onDelete?: () => void;
  onClose: () => void;
  isOpen: boolean;
}

export function CustomerForm({ customer, onSubmit, onDelete, onClose, isOpen }: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    mobileNumber: '',
    interest: [],
    preferences: '',
    visitingDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CustomerFormData, string>>>({});

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName,
        mobileNumber: customer.mobileNumber,
        interest: customer.interest,
        preferences: customer.preferences,
        visitingDate: customer.visitingDate,
      });
    } else {
      setFormData({
        fullName: '',
        mobileNumber: '',
        interest: [],
        preferences: '',
        visitingDate: new Date().toISOString().split('T')[0],
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CustomerFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10,15}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Enter a valid mobile number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interest: prev.interest.includes(interest)
        ? prev.interest.filter(i => i !== interest)
        : [...prev.interest, interest],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-card rounded-t-3xl sm:rounded-2xl shadow-elevated animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-border bg-card/95 backdrop-blur-sm">
          <h2 className="text-xl font-display font-semibold text-foreground">
            {customer ? 'Edit Customer' : 'New Customer'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Full Name *</label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Enter customer's full name"
              className={cn(errors.fullName && 'border-destructive focus:ring-destructive')}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mobile Number *</label>
            <Input
              type="tel"
              value={formData.mobileNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
              placeholder="Enter mobile number"
              className={cn(errors.mobileNumber && 'border-destructive focus:ring-destructive')}
            />
            {errors.mobileNumber && (
              <p className="text-sm text-destructive">{errors.mobileNumber}</p>
            )}
          </div>

          {/* Visiting Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Visiting Date</label>
            <Input
              type="date"
              value={formData.visitingDate}
              onChange={(e) => setFormData(prev => ({ ...prev, visitingDate: e.target.value }))}
            />
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Interests</label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
                    formData.interest.includes(interest)
                      ? "bg-primary text-primary-foreground shadow-card"
                      : "bg-muted text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Preferred Styles / Notes</label>
            <textarea
              value={formData.preferences}
              onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
              placeholder="Any specific preferences or notes..."
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-body resize-none"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="sticky bottom-0 flex items-center gap-3 px-5 py-4 border-t border-border bg-card/95 backdrop-blur-sm safe-bottom">
          {customer && onDelete && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={onDelete}
              className="flex-shrink-0"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          )}
          <Button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 gap-2"
          >
            <Save className="w-5 h-5" />
            {customer ? 'Save Changes' : 'Add Customer'}
          </Button>
        </div>
      </div>
    </div>
  );
}
