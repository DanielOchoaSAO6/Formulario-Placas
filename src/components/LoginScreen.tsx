
import { useState, useEffect } from "react";
import { User, Lock, LogIn, Sparkles, Shield, Zap, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import AnimatedLogo from "./AnimatedLogo";
import { useAuth } from "@/contexts/AuthContext";

interface LoginScreenProps {
  onSuccess?: () => void; // Callback opcional para cuando el login es exitoso
}

const LoginScreen = ({ onSuccess }: LoginScreenProps = {}) => {
  const [cedula, setCedula] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showCedulaExamples, setShowCedulaExamples] = useState(false);
  const { toast } = useToast();

  // Ejemplos de cédulas reales de la base de datos
  const cedulaExamples = [
    { id: "1152464977", password: "1152464977", name: "SANMARTIN HENAO BRYAN" },
    { id: "15506018", password: "15506018", name: "BEDOYA JIMENEZ JAIME ALBERTO" },
    { id: "92256533", password: "92256533", name: "GARCIA MARTINEZ JUAN DE JESUS" },
    { id: "1003395739", password: "1003395739", name: "MORALES PRADA MANUEL DAVID" }
  ];

  // Usar el contexto de autenticación
  const { login, isLoading: authLoading, error: authError } = useAuth();

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

  const handleExampleSelect = (example: typeof cedulaExamples[0]) => {
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
          <div className="mb-5 sm:mb-6">
            <AnimatedLogo />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-clip-text text-transparent mb-2 sm:mb-3 text-shadow">
            VehíCar
          </h1>
          <p className="text-gray-600 text-base sm:text-lg font-medium px-6">
            Plataforma inteligente de gestión vehicular
          </p>
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
              <span>Seguro</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
              <span>Rápido</span>
            </div>
            <div className="flex items-center space-x-1">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary-500" />
              <span>Intuitivo</span>
            </div>
          </div>
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
              
              {/* Botón de ayuda para mostrar ejemplos */}
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 bg-primary-50/70 rounded-full flex items-center justify-center text-primary-600 hover:bg-primary-100/80 transition-colors"
                onClick={() => setShowCedulaExamples(!showCedulaExamples)}
              >
                <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </button>
              
              {/* Ejemplos de cédulas flotantes */}
              {showCedulaExamples && (
                <div className="absolute z-10 top-full mt-2 left-0 right-0 bg-white/90 backdrop-blur-md rounded-2xl p-3 border border-primary-200 shadow-lg animate-scale-in">
                  <p className="text-xs text-gray-500 mb-2 flex items-center justify-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    <span>Selecciona un ejemplo para probar:</span>
                  </p>
                  <div className="space-y-2">
                    {cedulaExamples.map((example) => (
                      <div 
                        key={example.id}
                        className="flex items-center justify-between bg-primary-50/50 hover:bg-primary-100/60 p-2 rounded-xl cursor-pointer transition-colors"
                        onClick={() => handleExampleSelect(example)}
                      >
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-800">{example.name}</p>
                          <p className="text-xs text-gray-500">Cédula: {example.id}</p>
                        </div>
                        <button className="text-primary-600 h-6 w-6 rounded-full hover:bg-white/70 flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

          {/* Información de prueba mejorada */}
          <div className="mt-6 sm:mt-8 glass rounded-[16px] sm:rounded-[20px] p-3 sm:p-4 border border-primary-200/30 relative overflow-hidden">
            <div className="absolute top-0 left-1/2 w-16 h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent transform -translate-x-1/2"></div>
            <p className="text-xs font-semibold mb-2 flex items-center justify-center space-x-2 text-gray-600">
              <Sparkles className="h-3 w-3 text-primary-500" />
              <span>Presiona el botón <Info className="h-3 w-3 text-primary-500 inline-block mx-1" /> para ver credenciales de prueba</span>
              <Sparkles className="h-3 w-3 text-primary-500" />
            </p>
          </div>
        </div>
        
        {/* Footer con información adicional - nuevo para móvil */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            © 2024 VehíCar - Versión 1.0.0
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
