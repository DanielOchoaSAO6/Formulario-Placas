import { createRoot } from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import App from './App.tsx'
import './index.css'
import apolloClient from './lib/apollo-client'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById("root")!).render(
  <ApolloProvider client={apolloClient}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ApolloProvider>
);
