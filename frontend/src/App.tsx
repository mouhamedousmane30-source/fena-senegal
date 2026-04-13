
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index.tsx";
import Listings from "./pages/Listings.tsx";
import Declare from "./pages/Declare.tsx";
import Detail from "./pages/Detail.tsx";
import Auth from "./pages/Auth.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import Account from "./pages/Account.tsx";
import Help from "./pages/Help.tsx";
import About from "./pages/About.tsx";
import Terms from "./pages/Terms.tsx";
import AdminDashboard from "./pages/admin/Dashboard.tsx";
import AdminAnnouncements from "./pages/admin/Announcements.tsx";
import AdminUsers from "./pages/admin/Users.tsx";
import AdminReports from "./pages/admin/Reports.tsx";
import NotFound from "./pages/NotFound.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";

// 1. Ton import est correct ici
import Annonces from './pages/Annonces'; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* 2. J'ai remplacé 'Listings' par ta page 'Annonces' connectée au Backend */}
            <Route path="/annonces" element={<Annonces />} />
            
            <Route
              path="/declarer"
              element={
                <ProtectedRoute>
                  <Declare />
                </ProtectedRoute>
              }
            />
            <Route path="/annonce/:id" element={<Detail />} />
            <Route
              path="/account"
              element={
                <ProtectedRoute>
                  <Account />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/announcements"
              element={
                <AdminRoute>
                  <AdminAnnouncements />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              }
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/aide" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* 3. SURTOUT PAS DE ROUTE ICI (L'ERREUR VENAIT DE LÀ) */}
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;