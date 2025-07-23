import { apolloClient } from '../lib/apolloClient';
import { LOGIN_MUTATION, CURRENT_USER_QUERY } from '../graphql/auth';
import { User } from '../contexts/AuthContext';

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

export const userService = {
  /**
   * Realiza el inicio de sesión con el backend
   * @param id Cédula del usuario
   * @param password Contraseña del usuario
   * @returns Respuesta con el resultado del login
   */
  login: async (id: string, password: string): Promise<LoginResponse> => {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { id, password }
      });
      
      if (data?.login?.token && data?.login?.user) {
        return {
          success: true,
          token: data.login.token,
          user: data.login.user
        };
      } else {
        return {
          success: false,
          error: 'Respuesta de autenticación inválida'
        };
      }
    } catch (error: any) {
      // Extraer el mensaje de error de GraphQL
      const errorMessage = error.graphQLErrors?.[0]?.message || 
                          error.networkError?.message || 
                          'Error al conectar con el servidor';
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Obtiene los datos del usuario actual
   * @returns Datos del usuario o null si no está autenticado
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data } = await apolloClient.query({
        query: CURRENT_USER_QUERY,
        fetchPolicy: 'network-only' // Forzar consulta al servidor
      });
      
      return data?.me || null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  }
};
