
import { useState, useEffect } from "react";
import LoginScreen from "@/components/LoginScreen";
import VehicleVerificationScreen from "@/components/VehicleVerificationScreen";
import AdminDashboard from "@/components/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showContent, setShowContent] = useState(true);
  
  // Usar el contexto de autenticación real
  const { user, logout } = useAuth();
  
  // Determinar si el usuario está autenticado
  const isLoggedIn = !!user;
  
  // Preparar los datos del usuario en el formato esperado por los componentes
  const userData = user ? {
    cedula: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isAdmin: user.role === 'ADMIN'
  } : null;

  const handleLogout = () => {
    // Iniciar transición suave
    setIsTransitioning(true);
    
    // Ocultar el contenido actual
    setShowContent(false);
    
    // Después de un breve retraso, cerrar sesión
    setTimeout(() => {
      // Usar el método de logout del contexto de autenticación
      logout();
      
      // Breve retraso antes de mostrar el nuevo contenido para animación suave
      setTimeout(() => {
        setShowContent(true);
        setIsTransitioning(false);
      }, 100);
    }, 400);
  };

  // Efecto para manejar el desplazamiento cuando cambia la página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen font-poppins relative overflow-hidden">
      {/* Fondo mejorado con gradiente dinámico */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Malla de puntos sutil */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(58, 181, 112, 0.4) 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        ></div>
        
        {/* Elementos flotantes mejorados */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-primary-300 to-primary-400 rounded-full blur-xl opacity-40 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full blur-2xl opacity-30 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-cyan-300 to-primary-400 rounded-full blur-lg opacity-35 animate-float-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-br from-teal-300 to-emerald-400 rounded-full blur-md opacity-25 animate-float"></div>
        
        {/* Efectos de luz adicionales */}
        <div className="absolute top-10 right-10 w-2 h-2 bg-primary-400 rounded-full animate-pulse-gentle opacity-60"></div>
        <div className="absolute bottom-32 left-32 w-1 h-1 bg-emerald-400 rounded-full animate-pulse-gentle opacity-70" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse-gentle opacity-50" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Contenido principal con transición suave */}
      <div className="relative z-10">
        <div 
          className={`transition-all duration-700 ease-in-out ${
            isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          } ${
            showContent 
              ? isLoggedIn 
                ? 'animate-slide-in-right' 
                : 'animate-fade-in-up'
              : ''
          }`}
        >
          {!isLoggedIn ? (
            <LoginScreen />
          ) : userData?.isAdmin ? (
            <AdminDashboard 
              userData={userData} 
              onLogout={handleLogout}
            />
          ) : (
            <VehicleVerificationScreen 
              userData={userData} 
              onLogout={handleLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
