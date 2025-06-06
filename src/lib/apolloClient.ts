import { ApolloClient, InMemoryCache, createHttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// Crear el enlace HTTP
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql', // Ajusta esta URL según tu configuración
});

// Configurar el enlace de autenticación
const authLink = setContext((_, { headers }) => {
  // Obtener el token de autenticación del almacenamiento local
  const token = localStorage.getItem('token');
  
  // Devolver los encabezados al contexto para que se puedan pasar al enlace HTTP
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Configurar el enlace de error para manejo de errores y reintentos
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Configurar el enlace de reintento para solicitudes fallidas
const retryLink = new RetryLink({
  delay: {
    initial: 300, // ms
    max: 3000,    // máximo retraso entre reintentos
    jitter: true  // aleatorizar retrasos
  },
  attempts: {
    max: 3,       // máximo número de reintentos
    retryIf: (error, _operation) => !!error // reintentar en caso de error
  }
});

// Crear el cliente Apollo con configuración avanzada de caché
export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, retryLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Política de caché para getVehicleByPlaca
          getVehicleByPlaca: {
            // Función para determinar si dos resultados son iguales
            // Esto ayuda a Apollo a identificar cuándo actualizar el caché
            keyArgs: ['placa'],
            // Tiempo de vida en caché: 1 hora (en milisegundos)
            read(existing, { args, toReference }) {
              return existing;
            },
            merge(existing, incoming) {
              return incoming;
            }
          },
          // Política para getAllVehicles
          getAllVehicles: {
            keyArgs: false, // No usar argumentos como clave
            merge(existing = { vehicles: [], totalCount: 0 }, incoming) {
              return {
                vehicles: [...incoming.vehicles],
                totalCount: incoming.totalCount
              };
            }
          }
        }
      },
      Vehicle: {
        // Identificar vehículos por su placa para facilitar actualizaciones
        keyFields: ['placa'],
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      // Usar caché primero, luego red para mantener UI responsiva
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
      // Refrescar caché cada 5 minutos
      pollInterval: 5 * 60 * 1000,
    },
    query: {
      // Usar caché primero para consultas individuales
      fetchPolicy: 'cache-first',
      // Tiempo máximo para considerar una respuesta como válida
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  // Habilitar persistencia de caché entre recargas
  assumeImmutableResults: true,
  connectToDevTools: process.env.NODE_ENV !== 'production',
});
