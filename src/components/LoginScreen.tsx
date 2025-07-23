
import { useState, useEffect } from "react";
import { User, Lock, LogIn, Sparkles, Shield, Zap, Check, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AnimatedLogo from "./AnimatedLogo";
import { useAuth } from "@/contexts/AuthContext";
import { apolloClient } from "@/lib/apolloClient";
import { gql } from "@apollo/client";

interface LoginScreenProps {
  onSuccess?: () => void; // Callback opcional para cuando el login es exitoso
}

const LoginScreen = ({ onSuccess }: LoginScreenProps = {}) => {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showCedulaExamples, setShowCedulaExamples] = useState(false);
  const [testUsers, setTestUsers] = useState<Array<{id: string, name: string, password: string}>>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const { toast } = useToast();

  // Usar el contexto de autenticación
  const { login, isLoading: authLoading, error: authError } = useAuth();
  
  // Consulta para obtener usuarios de prueba
  const TEST_USERS_QUERY = gql`
    query GetTestUsers {
      testUsers {
        id
        name
        testPassword
      }
    }
  `;

  // Sincronizar el estado local de isLoading con el del contexto
  useEffect(() => {
    setIsLoading(authLoading);
  }, [authLoading]);

  // Mostrar errores de autenticación
  useEffect(() => {
    if (authError) {
      toast({
        title: "Error de autenticación",
        description: authError,
        variant: "destructive",
      });
    }
  }, [authError, toast]);
  
  // Cargar usuarios reales desde el backend
  const loadTestUsers = async () => {
    setLoadingUsers(true);
    try {
      // Obtener usuarios reales del backend
      const { data } = await apolloClient.query({
        query: TEST_USERS_QUERY,
        fetchPolicy: 'network-only' // No usar caché
      });
      
      if (data?.testUsers?.length > 0) {
        setTestUsers(data.testUsers.map((user: any) => ({
          id: user.id,
          name: user.name,
          password: user.testPassword || user.id // Si no hay contraseña de prueba, usar la cédula
        })));
      } else {
        // Si no hay usuarios en el backend, mostrar mensaje
        toast({
          title: "No hay usuarios disponibles",
          description: "No se encontraron usuarios en la base de datos",
          variant: "destructive"
        });
        setTestUsers([]);
        setShowCedulaExamples(false);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      toast({
        title: "Error de conexión",
        description: "No se pudieron cargar los usuarios. Intente más tarde.",
        variant: "destructive"
      });
      setTestUsers([]);
      setShowCedulaExamples(false);
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Cargar usuarios de prueba al mostrar los ejemplos
  useEffect(() => {
    if (showCedulaExamples && testUsers.length === 0) {
      loadTestUsers();
    }
  }, [showCedulaExamples]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Usar el login real con el backend GraphQL
      const result = await login(cedula, password);
      
      if (result.success) {
        toast({
          title: "¡Bienvenido! 🎉",
          description: "Acceso concedido exitosamente",
        });
        
        // Redirigir según el tipo de usuario
        if (result.user?.isRRHH) {
          window.location.href = '/rrhh';
        } else if (result.user?.isAdmin) {
          window.location.href = '/admin';
        } else {
          window.location.href = '/verificacion';
        }
        
        // Si hay un callback de éxito, llamarlo
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Acceso denegado ❌",
          description: result.error || "Credenciales incorrectas. Verifica e intenta nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Ha ocurrido un error al conectar con el servidor.",
        variant: "destructive",
      });
    }
  };

  const handleExampleSelect = (example: {id: string, password: string, name: string}) => {
    setCedula(example.id);
    setPassword(example.password);
    setShowCedulaExamples(false);
    toast({
      title: "Credenciales cargadas",
      description: `Usuario: ${example.name}`,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Efectos de fondo adicionales */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-gradient-to-r from-primary-200/20 to-emerald-200/20 rounded-full blur-3xl animate-pulse-gentle"></div>
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-gradient-to-r from-teal-200/20 to-cyan-200/20 rounded-full blur-2xl animate-pulse-gentle" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header mejorado - optimizado para móvil */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in-up">
          <div className="mb-5 sm:mb-6 login-logo">
            <AnimatedLogo />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-2 sm:mb-3 text-shadow">
            VehíCar
          </h1>
          <p className="text-gray-600 text-base sm:text-lg font-medium px-6">
            Plataforma para la busqueda de vehículos
          </p>
        </div>

        {/* Tarjeta de login mejorada - optimizada para móvil */}
        <div className="glass-strong rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 animate-slide-up relative overflow-hidden">
          {/* Efecto de brillo sutil */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600 text-sm sm:text-base">Accede a tu cuenta de forma segura</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Campo Cédula mejorado */}
            <div className="relative group">
              <div className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                focusedField === 'cedula' ? 'text-primary-600' : 'text-primary-500'
              }`}>
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input
                type="text"
                placeholder="Número de cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                onFocus={() => setFocusedField('cedula')}
                onBlur={() => setFocusedField(null)}
                className={`pl-10 sm:pl-12 h-14 sm:h-16 rounded-[20px] sm:rounded-[24px] border-0 glass text-gray-800 placeholder:text-gray-500 text-sm sm:text-base font-medium transition-all duration-300 ${
                  focusedField === 'cedula' 
                    ? 'glass-strong shadow-2xl scale-[1.02] ring-2 ring-primary-400/50' 
                    : 'shadow-lg hover:shadow-xl'
                }`}
                required
              />
              <label className={`absolute left-10 sm:left-12 -top-2 px-2 sm:px-3 text-xs font-semibold glass rounded-full transition-all duration-300 ${
                focusedField === 'cedula' ? 'text-primary-600 scale-105' : 'text-primary-500'
              }`}>
                Cédula de Identidad
              </label> 
            </div>

            {/* Campo Contraseña mejorado */}
            <div className="relative group">
              <div className={`absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none transition-colors duration-300 ${
                focusedField === 'password' ? 'text-primary-600' : 'text-primary-500'
              }`}>
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Input
                type="password"
                placeholder="Contraseña segura"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`pl-10 sm:pl-12 h-14 sm:h-16 rounded-[20px] sm:rounded-[24px] border-0 glass text-gray-800 placeholder:text-gray-500 text-sm sm:text-base font-medium transition-all duration-300 ${
                  focusedField === 'password' 
                    ? 'glass-strong shadow-2xl scale-[1.02] ring-2 ring-primary-400/50' 
                    : 'shadow-lg hover:shadow-xl'
                }`}
                required
              />
              <label className={`absolute left-10 sm:left-12 -top-2 px-2 sm:px-3 text-xs font-semibold glass rounded-full transition-all duration-300 ${
                focusedField === 'password' ? 'text-primary-600 scale-105' : 'text-primary-500'
              }`}>
                Contraseña
              </label>
            </div>

            {/* Botón de inicio mejorado */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-14 sm:h-16 rounded-[20px] sm:rounded-[24px] bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-bold shadow-2xl hover:shadow-primary-500/25 border-0 relative overflow-hidden group transition-all duration-500 ${
                isLoading ? 'scale-95' : 'hover:scale-[1.02]'
              }`}
            >
              {/* Efecto shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verificando acceso...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3 relative z-10">
                  <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Acceder al Sistema</span>
                </div>
              )}
            </Button>
          </form>
        </div>
        
        {/* Footer con información adicional - nuevo para móvil */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2025 VehíCar - Versión 1.0.0
          </p>
          <div className="mt-2 flex justify-center space-x-3">
            <button className="text-xs text-primary-600 hover:text-primary-700">Ayuda</button>
            <span className="text-gray-400">|</span>
            <button className="text-xs text-primary-600 hover:text-primary-700">Términos</button>
            <span className="text-gray-400">|</span>
            <button className="text-xs text-primary-600 hover:text-primary-700">Privacidad</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
