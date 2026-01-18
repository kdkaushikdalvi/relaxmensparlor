import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight, ArrowLeft, Save, Check, X, Plus, Pencil, Trash2 } from "lucide-react";
import { CustomerFormData, ReminderInterval } from "@/types/customer";
import { useCustomers } from "@/hooks/useCustomers";
import { useServices } from "@/contexts/ServicesContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const { services, addService, updateService, deleteService } = useServices();
  const { toast } = useToast();

  const customer = id ? getCustomer(id) : undefined;
  const isEditing = !!customer;

  // Service management state
  const [showAddService, setShowAddService] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [editingService, setEditingService] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState("");

  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
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

  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
    setFormData((prev) => ({ ...prev, mobileNumber: digitsOnly }));
  };

  const handleSubmit = () => {
    if (isEditing && customer) {
      updateCustomer(customer.id, formData);
      toast({
        title: "Customer updated",
        description: `${formData.fullName} updated successfully.`,
      });
      navigate(`/customer/${customer.id}`);
    } else {
      addCustomer(formData);
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

  const handleAddService = () => {
    if (newServiceName.trim()) {
      addService(newServiceName.trim());
      setNewServiceName("");
      setShowAddService(false);
      toast({ title: "Service added" });
    }
  };

  const handleEditService = () => {
    if (editingService && editServiceName.trim()) {
      updateService(editingService, editServiceName.trim());
      setEditingService(null);
      setEditServiceName("");
      toast({ title: "Service updated" });
    }
  };

  const handleDeleteService = (service: string) => {
    deleteService(service);
    // Also remove from selected interests
    setFormData((prev) => ({
      ...prev,
      interest: prev.interest.filter((i) => i !== service),
    }));
    toast({ title: "Service deleted" });
  };

  const startEditService = (service: string) => {
    setEditingService(service);
    setEditServiceName(service);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "basic":
        return (
          <div className="space-y-4">
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
              {services.map((interest) => (
                <div key={interest} className="relative group">
                  <button
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={cn(
                      "px-5 py-3 rounded-full text-base font-app pr-16",
                      formData.interest.includes(interest)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {formData.interest.includes(interest) && (
                      <Check className="w-4 h-4 inline mr-1" />
                    )}
                    {interest}
                  </button>
                  {/* Edit/Delete buttons */}
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditService(interest);
                      }}
                      className="p-1.5 rounded-full hover:bg-primary/20"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteService(interest);
                      }}
                      className="p-1.5 rounded-full hover:bg-destructive/20 text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Add new service button */}
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddService(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add New Service
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen  flex flex-col">
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
              {isEditing ? "Edit" : "Add"}  {stepConfig.title}
            </span>
          </div>

          {!stepConfig.required && (
            <Button variant="ghost" size="sm" onClick={handleSkip}  className="h-12 w-12 rounded-full bg-primary/20 hover:bg-primary/20 text-white">
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

      {/* Add Service Dialog */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <Input
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
            placeholder="Service name"
            className="h-12"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddService(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddService}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <Input
            value={editServiceName}
            onChange={(e) => setEditServiceName(e.target.value)}
            placeholder="Service name"
            className="h-12"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingService(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditService}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerFormPage;
