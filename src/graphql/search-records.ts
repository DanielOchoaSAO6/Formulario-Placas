import { gql } from '@apollo/client';

export const GET_VEHICLE_VERIFICATION_LOGS = gql`
  query GetVehicleVerificationLogs($skip: Int, $take: Int) {
    getVehicleVerificationLogs(skip: $skip, take: $take) {
      logs {
        id
        placa
        encontrado
        userId
        user {
          id
          name
        }
        startTime
        endTime
        createdAt
      }
      totalCount
    }
  }
`;

export const LOG_VEHICLE_VERIFICATION = gql`
  mutation LogVehicleVerification($input: VehicleVerificationInput!) {
    logVehicleVerification(input: $input) {
      id
      placa
      encontrado
      userId
      startTime
      endTime
      createdAt
    }
  }
`;
