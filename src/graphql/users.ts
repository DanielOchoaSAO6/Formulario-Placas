import { gql } from '@apollo/client';

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    users {
      id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_USER = gql`
  mutation Signup($input: CreateUserInput!) {
    signup(input: $input) {
      user {
        id
        name
        email
        role
      }
      token
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      name
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $name: String, $email: String, $role: Role) {
    updateUser(id: $id, name: $name, email: $email, role: $role) {
      id
      name
      email
      role
    }
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($id: ID!, $currentPassword: String!, $newPassword: String!) {
    changePassword(id: $id, currentPassword: $currentPassword, newPassword: $newPassword) {
      id
      name
    }
  }
`;

export const BULK_INSERT_VEHICLES = gql`
  mutation BulkInsertVehicles($vehicles: [BulkVehicleInput!]!) {
    bulkInsertVehicles(vehicles: $vehicles) {
      success
      insertedCount
      errors
      message
    }
  }
`;

export const GET_VEHICLES_BY_PLACAS = gql`
  query GetVehiclesByPlacas($placas: [String!]!) {
    getVehiclesByPlacas(placas: $placas) {
      id
      placa
      cedula
      estado
      tipoVehiculo
      origen
      nombre
      cargo
      area
      createdAt
      conductor {
        id
        name
      }
    }
  }
`;

export const UPDATE_VEHICLE_CEDULA = gql`
  mutation UpdateVehicleCedula($placa: String!, $cedula: String!) {
    updateVehicleCedula(placa: $placa, cedula: $cedula) {
      id
      placa
      cedula
      estado
      tipoVehiculo
      origen
      nombre
      cargo
      area
      conductor {
        id
        name
      }
    }
  }
`;
