import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Save, SkipForward, Check, X, Bell } from 'lucide-react';
import { CustomerFormData, INTEREST_OPTIONS, REMINDER_INTERVALS, ReminderInterval } from '@/types/customer';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { calculateReminderDate } from '@/utils/reminderUtils';

type FormStep = 'name' | 'phone' | 'date' | 'reminder' | 'interests';

const STEPS: FormStep[] = ['name', 'phone', 'date', 'reminder', 'interests'];

const STEP_CONFIG: Record<FormStep, { title: string; subtitle: string; required: boolean }> = {
  name: { title: 'Customer Name', subtitle: "What's the customer's full name?", required: true },
  phone: { title: 'Mobile Number', subtitle: 'Enter their contact number', required: true },
  date: { title: 'Visiting Date', subtitle: 'When are they visiting?', required: false },
  reminder: { title: 'Reminder', subtitle: 'When should we remind this customer?', required: false },
  interests: { title: 'Services & Notes', subtitle: 'What are they interested in?', required: false },
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
    reminderInterval: 'none' as ReminderInterval,
    reminderDate: undefined,
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
        reminderInterval: customer.reminderInterval || 'none',
        reminderDate: customer.reminderDate,
      });
    }
  }, [customer]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const stepConfig = STEP_CONFIG[currentStep];

  const validateCurrentStep = (): boolean => {
    setError('');

    if (currentStep === 'name' && !formData.fullName.trim()) {
      setError('Please enter the customer name');
      return false;
    }

    if (currentStep === 'phone') {
      const digits = formData.mobileNumber.replace(/\D/g, '');
      if (digits.length !== 10) {
        setError('Mobile number must be exactly 10 digits');
        return false;
      }
    }

    return true;
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, mobileNumber: digitsOnly }));
  };

  const handleSubmit = () => {
    if (isEditing && customer) {
      updateCustomer(customer.id, formData);
      toast({ title: 'Customer updated', description: `${formData.fullName} updated successfully.` });
      navigate(`/customer/${customer.id}`);
    } else {
      addCustomer(formData);
      toast({ title: 'Customer added', description: `${formData.fullName} added successfully.` });
      navigate('/');
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) setCurrentStep(STEPS[currentStepIndex - 1]);
  };

  const handleSkip = () => {
    if (isLastStep) handleSubmit();
    else setCurrentStep(STEPS[currentStepIndex + 1]);
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
    switch (currentStep) {
      case 'name':
        return (
          <Input
            autoFocus
            value={formData.fullName}
            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
            placeholder="Enter full name"
            className={cn("h-14 text-lg", error && 'border-destructive')}
          />
        );

      case 'phone':
        return (
          <Input
            type="tel"
            inputMode="numeric"
            value={formData.mobileNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="10-digit mobile number"
            className={cn("h-14 text-lg", error && 'border-destructive')}
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

      case 'reminder':
        return (
          <div className="flex flex-wrap gap-3 justify-center">
            {REMINDER_INTERVALS.map((interval) => (
              <button
                key={interval.value}
                type="button"
                onClick={() => {
                  const reminderDate = calculateReminderDate(formData.visitingDate, interval.value);
                  setFormData(prev => ({ ...prev, reminderInterval: interval.value, reminderDate }));
                }}
                className={cn(
                  "px-5 py-3 rounded-full text-base font-medium",
                  formData.reminderInterval === interval.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {formData.reminderInterval === interval.value && <Bell className="w-4 h-4 inline mr-1" />}
                {interval.label}
              </button>
            ))}
          </div>
        );

      case 'interests':
        return (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3 justify-center">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={cn(
                    "px-5 py-3 rounded-full text-base font-medium",
                    formData.interest.includes(interest)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {formData.interest.includes(interest) && <Check className="w-4 h-4 inline mr-1" />}
                  {interest}
                </button>
              ))}
            </div>

            <textarea
              value={formData.preferences}
              onChange={(e) => setFormData(prev => ({ ...prev, preferences: e.target.value }))}
              placeholder="Any note? (optional)"
              rows={3}
              className="w-full rounded-xl border px-4 py-3 text-base"
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {!isFirstStep && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <span className="text-sm opacity-70">{isEditing ? 'Edit Customer' : 'New Customer'}</span>
          </div>

          {!stepConfig.required && (
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              <SkipForward className="w-4 h-4 mr-1" /> Skip
            </Button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="flex justify-center gap-2 pt-4 pb-2">
        {STEPS.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-2 rounded-full transition-all",
              index === currentStepIndex ? "w-8 bg-primary" : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 pb-32 space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">{stepConfig.title}</h2>
          <p className="text-muted-foreground text-sm">{stepConfig.subtitle}</p>
        </div>

        {renderStepContent()}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 text-white rounded-xl"
        >
          {isLastStep ? <><Save className="w-5 h-5 mr-2" /> Save Customer</> : <>Next <ArrowRight className="w-5 h-5 ml-2" /></>}
        </Button>
      </div>
    </div>
  );
};

export default CustomerFormPage;
