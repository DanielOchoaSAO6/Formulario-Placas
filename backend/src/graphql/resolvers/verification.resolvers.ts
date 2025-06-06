import { PrismaClient } from '@prisma/client';
import { UserInputError } from 'apollo-server-express';

const prisma = new PrismaClient();

export const verificationResolvers = {
  Query: {
    // Obtener logs de verificación de vehículos con paginación
    getVehicleVerificationLogs: async (_: any, { skip = 0, take = 10 }: { skip?: number; take?: number }) => {
      try {
        // Obtener logs con paginación
        const logs = await prisma.vehicleVerificationLog.findMany({
          skip,
          take,
          orderBy: { startTime: 'desc' },
          include: { user: true }
        });
        
        // Contar el total de logs
        const totalCount = await prisma.vehicleVerificationLog.count();
        
        return {
          logs,
          totalCount
        };
      } catch (error) {
        console.error('Error al obtener logs de verificación:', error);
        throw error;
      }
    }
  },
  
  Mutation: {
    // Registrar una verificación de vehículo
    logVehicleVerification: async (_: any, { input }: { input: any }) => {
      try {
        const { placa, encontrado, userId, startTime, endTime } = input;
        
        // Validar los datos de entrada
        if (!placa) {
          throw new UserInputError('La placa es obligatoria');
        }
        
        if (typeof encontrado !== 'boolean') {
          throw new UserInputError('El campo encontrado debe ser un booleano');
        }
        
        if (!endTime) {
          throw new UserInputError('La hora de finalización es obligatoria');
        }
        
        // Crear el registro de verificación
        const log = await prisma.vehicleVerificationLog.create({
          data: {
            placa: placa.toUpperCase().trim(),
            encontrado,
            userId: userId || null,
            startTime: startTime ? new Date(startTime) : new Date(),
            endTime: new Date(endTime),
          },
          include: {
            user: true
          }
        });
        
        return log;
      } catch (error) {
        console.error('Error al registrar verificación de vehículo:', error);
        throw error;
      }
    }
  },
  
  VehicleVerificationLog: {
    // Resolver para formatear fechas como strings
    startTime: (parent: any) => parent.startTime.toISOString(),
    endTime: (parent: any) => parent.endTime.toISOString(),
    createdAt: (parent: any) => parent.createdAt.toISOString(),
  }
};
