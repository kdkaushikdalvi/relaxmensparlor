import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { PinProtection } from "@/components/PinProtection";
import { CustomerProvider } from "@/contexts/CustomerContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import Index from "./pages/Index";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import CustomerFormPage from "./pages/CustomerFormPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <ProfileProvider>
          <CustomerProvider>
            <Toaster />
            <Sonner />
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
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </PinProtection>
                  </main>
                </div>
              </SidebarProvider>
            </BrowserRouter>
          </CustomerProvider>
        </ProfileProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
