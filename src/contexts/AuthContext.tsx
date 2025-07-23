import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useApolloClient } from '@apollo/client';
import { userService } from '@/services/userService';
import { LOGIN_MUTATION } from '@/graphql/auth'; // Corrected import path

// Definir la interfaz para el usuario
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isAdmin?: boolean;
  isRRHH?: boolean;
}

// Definir la interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  login: (id: string, password: string) => Promise<{success: boolean; error?: string; user?: User}>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

// Crear el contexto de autenticación
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apolloClient = useApolloClient();

  // Verificar si hay un token guardado al cargar la página
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Función para iniciar sesión
  const login = async (cedula: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Usuario especial para RRHH que accede al panel de Excel
      if (cedula === "RRHH" && password === "Sao62025*") {
        const userData: User = {
          id: "RRHH",
          name: "Recursos Humanos",
          email: "rrhh@empresa.com",
          role: "RRHH",
          isAdmin: false,
          isRRHH: true // Marcador especial para el usuario de RRHH
        };
        
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('token', 'rrhh-special-token');
        setIsLoading(false);
        
        return { success: true, user: userData };
      }

      // Autenticación normal con el backend
      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { id: cedula, password }
      });

      if (data?.login?.token && data?.login?.user) {
        const userData = {
          ...data.login.user,
          isAdmin: data.login.user.role === 'ADMIN'
        };
        
        setUser(userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('token', data.login.token);
        setIsLoading(false);
        
        return { success: true, user: userData };
      } else {
        const errorMsg = data?.login?.error || 'No se recibió token de autenticación';
        setError(errorMsg);
        setIsLoading(false);
        return { success: false, error: errorMsg };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Error de conexión';
      setError(errorMessage);
      setIsLoading(false);
      return { success: false, error: errorMessage };
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    
    // Limpiar la caché de Apollo Client
    apolloClient.resetStore();
  };

  // Proporcionar el contexto
  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
