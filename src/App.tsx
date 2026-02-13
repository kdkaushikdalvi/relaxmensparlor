import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import { MessageTemplateProvider } from "@/contexts/MessageTemplateContext";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalLoader } from "@/components/GlobalLoader";
import Index from "./pages/Index";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import CustomerFormPage from "./pages/CustomerFormPage";
import ReminderHistoryPage from "./pages/ReminderHistoryPage";
import MessageTemplatesPage from "./pages/MessageTemplatesPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import ServicesPage from "./pages/ServicesPage";
import SharePage from "./pages/SharePage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, isLoading } = useAuth();
  const { isLoading: setupLoading } = useSetup();

  if (isLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/customer/new" element={<CustomerFormPage />} />
            <Route path="/customer/:id" element={<CustomerDetailPage />} />
            <Route path="/customer/:id/edit" element={<CustomerFormPage />} />
            <Route path="/reminder-history" element={<ReminderHistoryPage />} />
            <Route path="/message-templates" element={<MessageTemplatesPage />} />
            <Route path="/profile" element={<ProfileSettingsPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/share" element={<SharePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <AuthProvider>
          <SetupProvider>
            <ProfileProvider>
              <ServicesProvider>
                <CustomerProvider>
                  <MessageTemplateProvider>
                    <GlobalLoader />
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <Routes>
                        <Route path="/auth" element={<AuthPage />} />
                        <Route path="/*" element={<ProtectedRoutes />} />
                      </Routes>
                    </BrowserRouter>
                  </MessageTemplateProvider>
                </CustomerProvider>
              </ServicesProvider>
            </ProfileProvider>
          </SetupProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
