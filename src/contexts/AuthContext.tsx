import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useApolloClient, ApolloError } from '@apollo/client';
import { LOGIN_MUTATION } from '@/graphql/auth';

// Definir la interfaz para el usuario
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// Definir la interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  login: (id: string, password: string) => Promise<{success: boolean; error?: string}>;
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
  
  // Mutación para iniciar sesión
  const [loginMutation] = useMutation(LOGIN_MUTATION);

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
  const login = async (id: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await loginMutation({
        variables: {
          id,
          password
        }
      });
      
      if (data?.login?.token) {
        localStorage.setItem('authToken', data.login.token);
        localStorage.setItem('user', JSON.stringify(data.login.user));
        setUser(data.login.user);
        setIsLoading(false);
        return { success: true };
      } else {
        setError('No se recibió token de autenticación');
        setIsLoading(false);
        return { success: false, error: 'No se recibió token de autenticación' };
      }
    } catch (error) {
      const errorMessage = error instanceof ApolloError 
        ? error.message 
        : 'Error al iniciar sesión';
      
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
