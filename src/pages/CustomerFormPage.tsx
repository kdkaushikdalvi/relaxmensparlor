import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, Save, Check } from "lucide-react";
import { CustomerFormData, ReminderInterval } from "@/types/customer";
import { useCustomers } from "@/hooks/useCustomers";
import { useServices } from "@/contexts/ServicesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

type FormStep = "basic" | "interests";

const STEPS: FormStep[] = ["basic", "interests"];

const STEP_CONFIG: Record<
  FormStep,
  { title: string; subtitle: string; required: boolean }
> = {
  basic: {
    title: "Details",
    subtitle: "Name & mobile",
    required: true,
  },
  interests: {
    title: "Services",
    subtitle: "What services?",
    required: false,
  },
};

const CustomerFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getCustomer, addCustomer, updateCustomer } = useCustomers();
  const { getServiceNames } = useServices();
  const { toast } = useToast();

  const customer = id ? getCustomer(id) : undefined;
  const isEditing = !!customer;

  // Get active service names for the form
  const serviceNames = getServiceNames();

  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [customerId, setCustomerId] = useState<string>("");
  const [formData, setFormData] = useState<CustomerFormData>({
    fullName: "",
    mobileNumber: "",
    interest: [],
    preferences: "",
    visitingDate: new Date().toISOString().split("T")[0], // Always today
    reminderInterval: "none" as ReminderInterval,
    reminderDate: undefined,
  });

  const [error, setError] = useState("");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (customer) {
      setCustomerId(customer.customerId?.toString() || "");
      setFormData({
        fullName: customer.fullName,
        mobileNumber: customer.mobileNumber,
        interest: customer.interest,
        preferences: customer.preferences,
        visitingDate: customer.visitingDate,
        reminderInterval: customer.reminderInterval || "none",
        reminderDate: customer.reminderDate,
      });
    }
  }, [customer]);

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;
  const stepConfig = STEP_CONFIG[currentStep];

  const validateCurrentStep = (): boolean => {
    setError("");

    if (currentStep === "basic") {
      if (!formData.fullName.trim()) {
        setError("Please enter the customer name");
        return false;
      }

      const digits = formData.mobileNumber.replace(/\D/g, "");
      if (digits.length !== 10) {
        setError("Mobile number must be exactly 10 digits");
        return false;
      }
    }

    return true;
  };

  // Handle customer ID input (max 4 digits, numeric only)
  const handleCustomerIdChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 4);
    setCustomerId(digitsOnly);
  };

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, mobileNumber: digitsOnly }));
  };

  const handleSubmit = () => {
    if (isEditing && customer) {
      // Include customerId in update if provided
      const updateData: any = { ...formData };
      if (customerId) {
        updateData.customerId = parseInt(customerId, 10);
      }
      updateCustomer(customer.id, updateData);
      toast({
        title: "Customer updated",
        description: `${formData.fullName} updated successfully.`,
      });
      navigate(`/customer/${customer.id}`);
    } else {
      // For new customers, pass customerId if provided
      const newCustomer = addCustomer(formData);
      // Update with custom ID if provided
      if (customerId) {
        updateCustomer(newCustomer.id, { customerId: parseInt(customerId, 10) });
      }
      toast({
        title: "Customer added",
        description: `${formData.fullName} added successfully.`,
      });
      navigate("/");
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (isLastStep) handleSubmit();
    else setCurrentStep(STEPS[currentStepIndex + 1]);
  };

  const handleBack = () => {
    if (!isFirstStep) setCurrentStep(STEPS[currentStepIndex - 1]);
  };

  const handleSkip = () => {
    if (isLastStep) handleSubmit();
    else setCurrentStep(STEPS[currentStepIndex + 1]);
  };

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interest: prev.interest.includes(interest)
        ? prev.interest.filter((i) => i !== interest)
        : [...prev.interest, interest],
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return (
          <div className="space-y-4">
            {/* Customer ID - Editable, max 4 digits */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-14 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={customerId}
                  onChange={(e) => handleCustomerIdChange(e.target.value)}
                  placeholder="#"
                  maxLength={4}
                  className="h-12 text-lg font-bold text-center border-0 bg-transparent p-0 w-full"
                />
              </div>
              <span className="text-sm text-muted-foreground">Customer ID (optional, max 4 digits)</span>
            </div>

            <Input
              autoFocus
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Full Name"
              className={cn("h-14 text-lg", error && "border-destructive")}
            />

            <Input
              type="tel"
              inputMode="numeric"
              value={formData.mobileNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="10-digit Mobile Number"
              className={cn("h-14 text-lg", error && "border-destructive")}
            />
          </div>
        );

      case "interests":
        return (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-3 justify-center">
              {serviceNames.map((serviceName) => (
                <button
                  key={serviceName}
                  type="button"
                  onClick={() => toggleInterest(serviceName)}
                  className={cn(
                    "px-5 py-3 rounded-full text-base font-app",
                    formData.interest.includes(serviceName)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {formData.interest.includes(serviceName) && (
                    <Check className="w-4 h-4 inline mr-1" />
                  )}
                  {serviceName}
                </button>
              ))}
            </div>
            
            {serviceNames.length === 0 && (
              <p className="text-center text-muted-foreground">
                No active services available. Enable services in Settings → Services.
              </p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[hsl(var(--header-bg))] border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            {/* Back/Close Button - Always visible */}
            <Button
              variant="ghost"
              size="icon"
              onClick={isFirstStep ? () => navigate(-1) : handleBack}
              className="h-12 w-12 rounded-full bg-primary/20 hover:bg-primary/20"
            >
              {isFirstStep ? (
                <ArrowLeft className="w-5 h-5 text-white" />
              ) : (
                <ArrowLeft className="w-6 h-6 text-white" />
              )}
            </Button>
            <span className="text-xl font-app flex justify-center items-center w-full text-[18px] font-app text-purple-600">
              {isEditing ? "Edit" : "Add"} {stepConfig.title}
            </span>
          </div>

          {!stepConfig.required && (
            <Button variant="ghost" size="sm" onClick={handleSkip} className="h-12 w-12 rounded-full bg-primary/20 hover:bg-primary/20 text-white">
              Skip
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
      <div className="flex-1 p-6 space-y-6">
        {renderStepContent()}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        {/* Action Button */}
        <Button
          onClick={handleNext}
          className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 text-white rounded-xl mt-6"
        >
          {isLastStep ? (
            <>
              <Save className="w-5 h-5 mr-2" /> Save Customer
            </>
          ) : (
            <>
              Next <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CustomerFormPage;
