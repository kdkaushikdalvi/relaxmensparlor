import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Save, Trash2, SkipForward, Check } from 'lucide-react';
import { Customer, CustomerFormData, INTEREST_OPTIONS } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => void;
  onDelete?: () => void;
  onClose: () => void;
  isOpen: boolean;
}

type FormStep = 'name' | 'phone' | 'date' | 'interests' | 'preferences';

const STEPS: FormStep[] = ['name', 'phone', 'date', 'interests', 'preferences'];

const STEP_CONFIG: Record<FormStep, { title: string; subtitle: string; required: boolean }> = {
  name: { title: 'Customer Name', subtitle: "What's the customer's full name?", required: true },
  phone: { title: 'Mobile Number', subtitle: 'Enter their contact number', required: true },
  date: { title: 'Visiting Date', subtitle: 'When are they visiting?', required: false },
  interests: { title: 'Services Interested', subtitle: 'What services are they looking for?', required: false },
  preferences: { title: 'Notes & Preferences', subtitle: 'Any special requests or notes?', required: false },
};

export function CustomerForm({ customer, onSubmit, onDelete, onClose, isOpen }: CustomerFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>('name');
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: '',
    mobileNumber: '',
    interest: [],
    preferences: '',
    visitingDate: new Date().toISOString().split('T')[0],
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
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
      setCurrentStep('name');
      setError('');
    }
  }, [customer, isOpen]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const stepConfig = STEP_CONFIG[currentStep];

  const validateCurrentStep = (): boolean => {
    setError('');
    
    if (currentStep === 'name') {
      if (!formData.fullName.trim()) {
        setError('Please enter the customer name');
        return false;
      }
    }
    
    if (currentStep === 'phone') {
      if (!formData.mobileNumber.trim()) {
        setError('Please enter a mobile number');
        return false;
      }
      if (!/^\d{10,15}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
        setError('Please enter a valid mobile number');
        return false;
      }
    }
    
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        onSubmit(formData);
      } else {
        setCurrentStep(STEPS[currentStepIndex + 1]);
        setError('');
      }
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      onSubmit(formData);
    } else {
      setCurrentStep(STEPS[currentStepIndex + 1]);
      setError('');
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
      setError('');
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 'name':
        return (
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter full name"
            className={cn("h-14 text-lg", error && 'border-destructive focus:ring-destructive')}
            autoFocus
          />
        );
      
      case 'phone':
        return (
          <Input
            type="tel"
            inputMode="numeric"
            value={formData.mobileNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, mobileNumber: e.target.value }))}
            placeholder="Enter mobile number"
            className={cn("h-14 text-lg", error && 'border-destructive focus:ring-destructive')}
            autoFocus
          />
        );
      
      case 'date':
        return (
          <Input
            type="date"
            value={formData.visitingDate}
            onChange={(e) => setFormData(prev => ({ ...prev, visitingDate: e.target.value }))}
            className="h-14 text-lg"
          />
        );
      
      case 'interests':
        return (
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={cn(
                  "px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                  formData.interest.includes(interest)
                    ? "bg-primary text-primary-foreground shadow-card scale-105"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                )}
              >
                {formData.interest.includes(interest) && (
                  <Check className="w-4 h-4 inline mr-1.5" />
                )}
                {interest}
              </button>
            ))}
          </div>
        );
      
      case 'preferences':
        return (
          <textarea
            value={formData.preferences}
            onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
            placeholder="Any specific preferences or notes..."
            rows={4}
            className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-body resize-none"
            autoFocus
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card rounded-t-3xl sm:rounded-2xl shadow-elevated animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="w-8 h-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {customer ? 'Edit Customer' : 'New Customer'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 pt-4 pb-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentStepIndex 
                  ? "w-8 bg-primary" 
                  : index < currentStepIndex 
                    ? "w-2 bg-primary/50" 
                    : "w-2 bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step Content */}
        <div className="p-6 space-y-4 min-h-[200px]">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-2xl font-display font-semibold text-foreground">
              {stepConfig.title}
            </h2>
            <p className="text-muted-foreground text-sm">
              {stepConfig.subtitle}
              {!stepConfig.required && <span className="text-primary ml-1">(Optional)</span>}
            </p>
          </div>

          {renderStepContent()}

          {error && (
            <p className="text-sm text-destructive text-center animate-fade-in">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-border safe-bottom">
          {customer && onDelete && isFirstStep && (
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
          
          {!stepConfig.required && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              className="gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </Button>
          )}
          
          <Button
            type="button"
            onClick={handleNext}
            className="flex-1 gap-2"
          >
            {isLastStep ? (
              <>
                <Save className="w-5 h-5" />
                {customer ? 'Save Changes' : 'Add Customer'}
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
