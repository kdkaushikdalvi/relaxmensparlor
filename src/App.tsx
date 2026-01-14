import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PinProtection } from "@/components/PinProtection";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SetupProvider, useSetup } from "@/contexts/SetupContext";
import { MessageTemplateProvider } from "@/contexts/MessageTemplateContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { FirstTimeSetup } from "@/components/FirstTimeSetup";
import Index from "./pages/Index";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import CustomerFormPage from "./pages/CustomerFormPage";
import ReminderHistoryPage from "./pages/ReminderHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isSetupComplete } = useSetup();

  if (!isSetupComplete) {
    return <FirstTimeSetup />;
  }

  return (
    <BrowserRouter>
      <SidebarProvider defaultOpen={false}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1">
            <PinProtection>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/customer/new" element={<CustomerFormPage />} />
                <Route path="/customer/:id" element={<CustomerDetailPage />} />
                <Route path="/customer/:id/edit" element={<CustomerFormPage />} />
                <Route path="/reminder-history" element={<ReminderHistoryPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PinProtection>
          </main>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <SetupProvider>
          <ProfileProvider>
            <CustomerProvider>
              <MessageTemplateProvider>
                <Toaster />
                <Sonner />
                <AppContent />
              </MessageTemplateProvider>
            </CustomerProvider>
          </ProfileProvider>
        </SetupProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
