
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { ApolloProvider } from "@apollo/client";
import { apolloClient } from "./lib/apolloClient";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import VehicleVerification from "./components/VehicleVerification";
import VehicleVerificationScreen from "./components/VehicleVerificationScreen";
import AdminDashboard from "./components/AdminDashboard";
import ExcelDataLoader from "./components/excel/ExcelDataLoader";
import { AuthProvider } from "@/contexts/AuthContext"; 

const App = () => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: false,
      },
    },
  }));
  
  // Estado para manejar la autenticación del usuario
  const [userData, setUserData] = useState<{ cedula?: string; id?: string; name: string; isAdmin?: boolean; isRRHH?: boolean } | null>(null);
  
  // Efecto para cargar los datos del usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('userData');
      }
    }
  }, []);
  
  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    // Redirigir al inicio
    window.location.href = '/';
  };

  return (
    <ApolloProvider client={apolloClient}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <HotToaster position="top-right" toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
                borderRadius: '8px',
              },
              success: {
                style: {
                  background: '#10B981',
                },
              },
              error: {
                style: {
                  background: '#EF4444',
                },
              },
            }} />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/verificar-vehiculo" element={<VehicleVerification />} />
                <Route path="/verificacion" element={
                  userData ? (
                    <VehicleVerificationScreen userData={{cedula: userData.id || userData.cedula || '', name: userData.name}} onLogout={handleLogout} />
                  ) : (
                    <Index />
                  )
                } />
                <Route path="/admin" element={
                  userData?.isAdmin ? (
                    <AdminDashboard userData={userData} onLogout={handleLogout} />
                  ) : (
                    <Index />
                  )
                } />
                <Route path="/rrhh" element={
                  userData?.isRRHH ? (
                    <ExcelDataLoader />
                  ) : (
                    <Index />
                  )
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ApolloProvider>
  );
};

export default App;
