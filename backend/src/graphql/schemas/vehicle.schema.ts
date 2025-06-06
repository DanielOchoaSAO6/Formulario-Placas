import { gql } from 'apollo-server-express';

export const vehicleSchema = gql`
  type Vehicle {
    id: ID!
    placa: String!
    estado: String!
    tipoVehiculo: String!
    origen: String!
    conductorId: String!
    conductor: User
    cargo: String!
    area: String!
    createdAt: String!
    updatedAt: String!
  }
  
  type VehicleConnection {
    vehicles: [Vehicle!]!
    totalCount: Int!
  }
  
  extend type Query {
    getVehicleByPlaca(placa: String!): Vehicle!
    getAllVehicles(skip: Int, take: Int): VehicleConnection!
  }
`;
