import { useState } from "react";
import { Store, User, Sparkles, ArrowRight, Check, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSetup } from "@/contexts/SetupContext";
import { useProfile } from "@/contexts/ProfileContext";
import { cn } from "@/lib/utils";
import brandLogo from "@/assets/brand-logo-transparent.png";

type SetupStep = "welcome" | "owner" | "mobile" | "business" | "complete";

export function FirstTimeSetup() {
  const { completeSetup } = useSetup();
  const { updateProfile } = useProfile();

  const [step, setStep] = useState<SetupStep>("welcome");
  const [ownerName, setOwnerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [error, setError] = useState("");

  const handleNext = () => {
    setError("");

    if (step === "welcome") {
      setStep("owner");
    } else if (step === "owner") {
      if (!ownerName.trim()) {
        setError("Please enter your name");
        return;
      }
      setStep("mobile");
    } else if (step === "mobile") {
      if (!mobileNumber.trim() || mobileNumber.length < 10) {
        setError("Please enter a valid mobile number");
        return;
      }
      setStep("business");
    } else if (step === "business") {
      if (!businessName.trim()) {
        setError("Please enter your business name");
        return;
      }
      setStep("complete");
    } else if (step === "complete") {
      // Save to both contexts
      completeSetup({ ownerName, businessName, mobileNumber });
      updateProfile({ ownerName, businessName });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shadow-xl animate-float">
            <img
              src={brandLogo}
              alt="Logo"
              className="w-[80%] h-[80%] object-contain"
            />
          </div>
        </div>

        {/* Content Card */}
        <div className="glass rounded-3xl p-8 border border-primary/20 shadow-2xl animate-scale-in">
          {step === "welcome" && (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-app text-primary">Welcome</span>
              </div>

              <h1 className="text-3xl font-display font-bold">Let's Start!</h1>

              <p className="text-muted-foreground">
                Quick setup. Manage customers & send reminders.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-2xl mb-1">👥</div>
                  <p className="text-[10px] text-muted-foreground">Customers</p>
                </div>
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-2xl mb-1">📱</div>
                  <p className="text-[10px] text-muted-foreground">Reminders</p>
                </div>
                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
                  <div className="text-2xl mb-1">📊</div>
                  <p className="text-[10px] text-muted-foreground">Tracking</p>
                </div>
              </div>
            </div>
          )}

          {step === "owner" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold">Your Name</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Shown in profile
                </p>
              </div>

              <Input
                autoFocus
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Full name"
                className={cn(
                  "h-14 text-lg text-center",
                  error && "border-destructive"
                )}
              />
            </div>
          )}

          {step === "mobile" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold">
                  Mobile Number
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  For test customer
                </p>
              </div>

              <Input
                autoFocus
                type="tel"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="10-digit number"
                className={cn(
                  "h-14 text-lg text-center",
                  error && "border-destructive"
                )}
                maxLength={10}
              />
            </div>
          )}

          {step === "business" && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Store className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold">
                  Business Name
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  For messages & headers
                </p>
              </div>

              <Input
                autoFocus
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Shop name"
                className={cn(
                  "h-14 text-lg text-center",
                  error && "border-destructive"
                )}
              />
            </div>
          )}

          {step === "complete" && (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center animate-scale-in">
                <Check className="w-8 h-8 text-green-500" />
              </div>

              <h2 className="text-xl font-display font-bold">All Set!</h2>

              <div className="space-y-2 text-left p-3 rounded-2xl bg-muted/50 text-sm">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-app">{ownerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Store className="w-4 h-4 text-primary" />
                  <span className="font-app">{businessName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="font-app">{mobileNumber}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Change anytime in Settings
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive text-center mt-4">{error}</p>
          )}

          {/* Action Button */}
          <Button
            onClick={handleNext}
            className="w-full h-14 text-lg mt-6 rounded-2xl"
          >
            {step === "complete" ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" /> Start Managing
              </>
            ) : (
              <>
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {["welcome", "owner", "mobile", "business", "complete"].map(
              (s, i) => (
                <div
                  key={s}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    s === step ? "w-8 bg-primary" : "w-2 bg-muted"
                  )}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
