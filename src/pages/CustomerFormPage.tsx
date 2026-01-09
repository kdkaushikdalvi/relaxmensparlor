import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Save, SkipForward, Check, X } from 'lucide-react';
import { Customer, CustomerFormData, INTEREST_OPTIONS } from '@/types/customer';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type FormStep = 'name' | 'phone' | 'date' | 'interests' | 'preferences';

const STEPS: FormStep[] = ['name', 'phone', 'date', 'interests', 'preferences'];

const STEP_CONFIG: Record<FormStep, { title: string; subtitle: string; required: boolean }> = {
  name: { title: 'Customer Name', subtitle: "What's the customer's full name?", required: true },
  phone: { title: 'Mobile Number', subtitle: 'Enter their contact number', required: true },
  date: { title: 'Visiting Date', subtitle: 'When are they visiting?', required: false },
  interests: { title: 'Services Interested', subtitle: 'What services are they looking for?', required: false },
  preferences: { title: 'Notes & Preferences', subtitle: 'Any special requests or notes?', required: false },
};

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCustomer, addCustomer, updateCustomer } = useCustomers();
  const { toast } = useToast();
  
  const customer = id ? getCustomer(id) : undefined;
  const isEditing = !!customer;
  
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
    if (customer) {
      setFormData({
        fullName: customer.fullName,
        mobileNumber: customer.mobileNumber,
        interest: customer.interest,
        preferences: customer.preferences,
        visitingDate: customer.visitingDate,
      });
    }
  }, [customer]);

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
      const digitsOnly = formData.mobileNumber.replace(/\D/g, '');
      if (!digitsOnly) {
        setError('Please enter a mobile number');
        return false;
      }
      if (digitsOnly.length !== 10) {
        setError('Mobile number must be exactly 10 digits');
        return false;
      }
    }
    
    return true;
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numeric input
    const digitsOnly = value.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = digitsOnly.slice(0, 10);
    setFormData(prev => ({ ...prev, mobileNumber: limited }));
  };

  const handleSubmit = () => {
    if (isEditing && customer) {
      updateCustomer(customer.id, formData);
      toast({
        title: "Customer updated",
        description: `${formData.fullName}'s information has been updated.`,
      });
      navigate(`/customer/${customer.id}`);
    } else {
      const newCustomer = addCustomer(formData);
      toast({
        title: "Customer added",
        description: `${formData.fullName} has been added to your customers.`,
      });
      navigate('/');
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (isLastStep) {
        handleSubmit();
      } else {
        setCurrentStep(STEPS[currentStepIndex + 1]);
        setError('');
      }
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      handleSubmit();
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

  const handleClose = () => {
    if (isEditing && customer) {
      navigate(`/customer/${customer.id}`);
    } else {
      navigate('/');
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

  const renderStepContent = () => {
    const renderInputWithNextButton = (input: React.ReactNode) => (
      <div className="flex items-center gap-3">
        <div className="flex-1">{input}</div>
        <Button
          type="button"
          onClick={handleNext}
          size="icon"
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-lg flex-shrink-0"
        >
          {isLastStep ? <Save className="w-6 h-6" /> : <ArrowRight className="w-6 h-6" />}
        </Button>
      </div>
    );

    switch (currentStep) {
      case 'name':
        return renderInputWithNextButton(
          <Input
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter full name"
            className={cn("h-14 text-lg", error && 'border-destructive focus:ring-destructive')}
          />
        );
      
      case 'phone':
        return renderInputWithNextButton(
          <Input
            type="tel"
            inputMode="numeric"
            value={formData.mobileNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="Enter 10-digit mobile number"
            maxLength={10}
            className={cn("h-14 text-lg", error && 'border-destructive focus:ring-destructive')}
          />
        );
      
      case 'date':
        return renderInputWithNextButton(
          <Input
            type="date"
            value={formData.visitingDate}
            onChange={(e) => setFormData(prev => ({ ...prev, visitingDate: e.target.value }))}
            className="h-14 text-lg"
          />
        );
      
      case 'interests':
        return (
          <div className="space-y-4">
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
            <Button
              type="button"
              onClick={handleNext}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
            >
              {isLastStep ? <><Save className="w-5 h-5 mr-2" /> Save</> : <><ArrowRight className="w-5 h-5 mr-2" /> Next</>}
            </Button>
          </div>
        );
      
      case 'preferences':
        return (
          <div className="space-y-4">
            <textarea
              value={formData.preferences}
              onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
              placeholder="Any specific preferences or notes..."
              rows={4}
              className="flex w-full rounded-lg border border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 font-body resize-none"
            />
            <Button
              type="button"
              onClick={handleNext}
              className="w-full h-12 bg-green-500 hover:bg-green-600 text-white"
            >
              <Save className="w-5 h-5 mr-2" /> Save Customer
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sticky Header with Next Button */}
      <div className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b border-primary/20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <Button variant="ghost" size="icon" onClick={handleBack} className="w-8 h-8 text-[hsl(var(--header-foreground))] hover:bg-primary/20">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <span className="text-sm text-[hsl(var(--header-foreground)/0.7)]">
              {isEditing ? 'Edit Customer' : 'New Customer'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!stepConfig.required && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                className="gap-1 text-[hsl(var(--header-foreground)/0.7)] hover:bg-primary/20"
                size="sm"
              >
                <SkipForward className="w-4 h-4" />
                Skip
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleClose} className="w-8 h-8 text-[hsl(var(--header-foreground))] hover:bg-primary/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 pt-4 pb-2 bg-card">
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
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
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

    </div>
  );
};

export default CustomerFormPage;
