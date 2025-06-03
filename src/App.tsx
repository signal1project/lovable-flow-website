
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleProtectedRoute from "@/components/auth/RoleProtectedRoute";
import ErrorLogger from "@/components/ErrorLogger";
import Index from "./pages/Index";
import About from "./pages/About";
import Brokers from "./pages/Brokers";
import Lenders from "./pages/Lenders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import DashboardPage from "./pages/DashboardPage";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import DashboardRouter from "./components/dashboard/DashboardRouter";
import LenderDashboardPage from "./pages/LenderDashboardPage";
import BrokerDashboardPage from "./pages/BrokerDashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import ProfileCompletion from "./pages/ProfileCompletion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ErrorLogger />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/brokers" element={<Brokers />} />
            <Route path="/lenders" element={<Lenders />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile-completion" 
              element={
                <ProtectedRoute>
                  <ProfileCompletion />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/lender" 
              element={
                <RoleProtectedRoute allowedRole="lender">
                  <LenderDashboardPage />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/broker" 
              element={
                <RoleProtectedRoute allowedRole="broker">
                  <BrokerDashboardPage />
                </RoleProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/admin" 
              element={
                <RoleProtectedRoute allowedRole="admin">
                  <AdminDashboardPage />
                </RoleProtectedRoute>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
