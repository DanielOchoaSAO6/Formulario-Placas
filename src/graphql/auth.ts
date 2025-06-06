import { gql } from '@apollo/client';

// Mutación para iniciar sesión con cédula y contraseña
export const LOGIN_MUTATION = gql`
  mutation Login($id: String!, $password: String!) {
    login(id: $id, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

// Query para obtener datos del usuario actual (autenticado)
export const CURRENT_USER_QUERY = gql`
  query GetCurrentUser {
    me {
      id
      name
      email
      role
    }
  }
`;
