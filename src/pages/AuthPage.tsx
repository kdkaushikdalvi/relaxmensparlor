import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Phone,
  LogIn,
  UserPlus,
  Loader2,
  User,
  Store,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ForgotPasswordDialog } from "@/components/ForgotPasswordDialog";
import brandLogo from "@/assets/brand-logo-transparent.png";

const AuthPage = () => {
  const { user, isLoading: authLoading, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [mobile, setMobile] = useState("");
  const [pin, setPin] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const toEmail = (phone: string) =>
    `${phone.replace(/\D/g, "")}@relaxsalon.app`;

  const toPassword = (p: string) => `${p}##`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleaned = mobile.replace(/\D/g, "");

    if (!cleaned || cleaned.length < 10) {
      toast({
        title: "Please enter a valid mobile number (min 10 digits)",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      toast({ title: "PIN must be exactly 4 digits", variant: "destructive" });
      return;
    }

    if (!isLogin) {
      if (!ownerName.trim()) {
        toast({ title: "Please enter your name", variant: "destructive" });
        return;
      }
      if (!businessName.trim()) {
        toast({ title: "Please enter your shop name", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);
    const email = toEmail(cleaned);

    try {
      if (isLogin) {
        const { error } = await signIn(email, toPassword(pin));
        if (error) {
          toast({
            title: error.message?.includes("Invalid login")
              ? "Invalid mobile number or PIN"
              : error.message || "Login failed",
            variant: "destructive",
          });
        }
      } else {
        const { error } = await signUp(email, toPassword(pin));
        if (error) {
          toast({
            title: error.message?.includes("already registered")
              ? "This mobile number is already registered. Please sign in."
              : error.message || "Signup failed",
            variant: "destructive",
          });
        } else {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            await supabase.from("profiles").insert({
              user_id: session.user.id,
              owner_name: ownerName.trim(),
              business_name: businessName.trim(),
              mobile_number: cleaned,
              is_setup_complete: true,
            });
          }

          toast({ title: "Account created! You are now signed in." });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceRefresh = async () => {
    await new Promise((res) => setTimeout(res, 500));
    if ("caches" in window) {
      const names = await caches.keys();
      await Promise.all(names.map((name) => caches.delete(name)));
    }
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((r) => r.unregister()));
    }
    window.location.reload();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary/10 px-4">
      {/* Floating Background Blobs */}
      <div className="absolute w-72 h-72 bg-primary/20 rounded-full blur-3xl top-[-80px] left-[-80px] animate-pulse" />
      <div className="absolute w-72 h-72 bg-pink-300/20 rounded-full blur-3xl bottom-[-80px] right-[-80px] animate-pulse" />

      <div className="w-full max-w-md z-10">
        {/* Glass Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl p-8 space-y-8 transition-all duration-500 hover:shadow-primary/20 hover:shadow-2xl">
          {/* Logo */}
          <div
            onClick={handleForceRefresh}
            className=" 
    w-8 h-8 rounded-lg
    flex items-center justify-center
    bg-violet-600 hover:bg-violet-700
    text-white
    transition-all duration-200
    hover:scale-105 active:scale-95
    cursor-pointer
  "
          >
            <RefreshCw className="w-4 h-4" />
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center shadow-inner transition-transform duration-500 hover:rotate-6">
              <img
                src={brandLogo}
                alt="Logo"
                className="w-14 h-14 object-contain"
              />
            </div>

            <div className="text-center transition-all duration-300">
              <h1 className="text-3xl font-app tracking-tight">
                {isLogin ? "Welcome" : "Create Account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isLogin
                  ? "Sign in to manage your salon"
                  : "Set up your salon in seconds"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 transition-all duration-500 ease-in-out"
          >
            {/* Animated Signup Fields */}
            <div
              className={`transition-all duration-500 overflow-hidden ${
                isLogin
                  ? "max-h-0 opacity-0 -translate-y-2"
                  : "max-h-40 opacity-100 translate-y-0"
              }`}
            >
              {!isLogin && (
                <>
                  <div className="relative mb-4">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Your name"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="h-12 pl-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/40 focus:scale-[1.02]"
                    />
                  </div>

                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Shop name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="h-12 pl-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/40 focus:scale-[1.02]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Mobile */}
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="h-12 pl-12 rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/40 focus:scale-[1.02]"
                maxLength={10}
              />
            </div>

            {/* PIN */}
            <Input
              type="password"
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) =>
                setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              className="h-12 text-center tracking-[0.6em] text-xl rounded-xl transition-all duration-300 focus:ring-2 focus:ring-primary/40 focus:scale-[1.02]"
              maxLength={4}
            />

            {/* Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base font-medium rounded-xl shadow-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.95]"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up
                </>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center space-y-3 pt-2">
            {isLogin && <ForgotPasswordDialog />}

            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-semibold text-primary hover:underline transition-all duration-300 hover:tracking-wide"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
