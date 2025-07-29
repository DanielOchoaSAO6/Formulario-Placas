import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// URL del backend GraphQL
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Configuración para incluir el token JWT en cada solicitud
const authLink = setContext((_, { headers }) => {
  // Obtener el token del almacenamiento local
  const token = localStorage.getItem('authToken');
  
  // Devolver los headers con el token si existe
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Crear el cliente Apollo
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
