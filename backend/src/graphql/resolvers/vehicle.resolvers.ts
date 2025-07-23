import { PrismaClient } from '@prisma/client';
import { UserInputError } from 'apollo-server-express';
import { format } from 'date-fns';
import { googleSheetsService } from '../../services/googleSheets.service';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Función para guardar datos en Google Sheets
async function saveToGoogleSheets(placa: string, cedula: string) {
  try {
    // Usar el servicio de Google Sheets para guardar los datos
    const result = await googleSheetsService.addVehicleRecord(placa, cedula);
    return result;
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    // No lanzamos el error para que no afecte al flujo principal
    return false;
  }
}

export const vehicleResolvers = {
  Query: {
    // Buscar un vehículo por su placa
    getVehicleByPlaca: async (_: any, { placa }: { placa: string }) => {
      try {
        // Normalizar la placa (convertir a mayúsculas y eliminar espacios)
        const normalizedPlaca = placa.toUpperCase().trim();
        
        // Buscar el vehículo en la base de datos usando SQL directo
        const vehicles = await prisma.$queryRaw`
          SELECT v.*, u.name as conductorName, u.email as conductorEmail 
          FROM Vehicle v 
          LEFT JOIN User u ON v.conductorId = u.id 
          WHERE v.placa = ${normalizedPlaca}
        `;
        
        // Convertir el resultado a un array
        const vehiclesArray = Array.isArray(vehicles) ? vehicles : [vehicles];
        
        // Si no se encuentra el vehículo, lanzar un error
        if (vehiclesArray.length === 0) {
          throw new UserInputError(`No se encontró ningún vehículo con la placa ${normalizedPlaca}`);
        }
        
        const vehicle = vehiclesArray[0];
        
        // Formatear el resultado para que coincida con el esquema GraphQL
        return {
          id: vehicle.id,
          placa: vehicle.placa,
          estado: vehicle.estado,
          tipoVehiculo: vehicle.tipoVehiculo,
          origen: vehicle.origen,
          conductorId: vehicle.conductorId,
          cargo: vehicle.cargo,
          area: vehicle.area,
          createdAt: vehicle.createdAt,
          updatedAt: vehicle.updatedAt,
          conductor: vehicle.conductorId ? {
            id: vehicle.conductorId,
            name: vehicle.conductorName,
            email: vehicle.conductorEmail
          } : null
        };
      } catch (error) {
        console.error('Error al buscar vehículo:', error);
        throw error;
      }
    },
    
    // Listar todos los vehículos (con paginación opcional)
    getAllVehicles: async (_: any, { skip = 0, take = 10 }: { skip?: number; take?: number }) => {
      try {
        const vehicles = await prisma.vehicle.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { conductor: true }
        });
        
        const totalCount = await prisma.vehicle.count();
        
        return {
          vehicles,
          totalCount
        };
      } catch (error) {
        console.error('Error al obtener vehículos:', error);
        throw error;
      }
    },

    // Obtener vehículos por múltiples placas (para comparación con Excel)
    getVehiclesByPlacas: async (_: any, { placas }: { placas: string[] }) => {
      try {
        // Normalizar las placas
        const normalizedPlacas = placas.map(placa => placa.toUpperCase().trim());
        
        const vehicles = await prisma.vehicle.findMany({
          where: {
            placa: {
              in: normalizedPlacas
            }
          },
          include: { conductor: true }
        });
        
        return vehicles;
      } catch (error) {
        console.error('Error al obtener vehículos por placas:', error);
        throw error;
      }
    }
  },
  
  Mutation: {
    // Crear un nuevo vehículo
    createVehicle: async (_: any, { input }: { input: any }) => {
      try {
        const { placa, cedula, conductorId = null, estado = 'ACTIVO', tipoVehiculo = 'AUTOMOVIL', origen = 'REGISTRO', cargo = '', area = '' } = input;
        
        // Normalizar la placa
        const normalizedPlaca = placa.toUpperCase().trim();
        
        // Verificar si ya existe un vehículo con esa placa
        const existingVehicle = await prisma.vehicle.findUnique({
          where: { placa: normalizedPlaca }
        });
        
        if (existingVehicle) {
          throw new UserInputError(`Ya existe un vehículo con la placa ${normalizedPlaca}`);
        }
        
        // Preparar los datos para crear el vehículo
        const vehicleData: any = {
          placa: normalizedPlaca,
          cedula: cedula.trim(),
          estado,
          tipoVehiculo,
          origen,
          cargo: cargo || 'NO ESPECIFICADO',
          area: area || 'GENERAL'
        };
        
        // Solo incluir conductorId si existe y no es null
        if (conductorId) {
          // Verificar si existe el conductor
          const conductor = await prisma.user.findUnique({
            where: { id: conductorId }
          });
          
          if (conductor) {
            vehicleData.conductorId = conductorId;
          }
        }
        
        // Crear el vehículo en la base de datos
        const vehicle = await prisma.vehicle.create({
          data: vehicleData,
          include: {
            conductor: true
          }
        });
        
        // Guardar también en Google Sheets si es necesario
        // Temporalmente desactivado hasta configurar credenciales correctas
        /*
        try {
          await saveToGoogleSheets(vehicle.placa, vehicle.cedula);
        } catch (error) {
          console.error('Error al guardar en Google Sheets:', error);
          // No interrumpir el flujo si hay error en Google Sheets
        }
        */
        
        return vehicle;
      } catch (error) {
        console.error('Error al crear vehículo:', error);
        throw error;
      }
    },

    // Inserción masiva de vehículos desde Excel (optimizada)
    bulkInsertVehicles: async (_: any, { vehicles }: { vehicles: any[] }) => {
      const errors: string[] = [];
      let insertedCount = 0;
      let updatedCount = 0;
      let skippedCount = 0;
      
      try {
        // Normalizar y preparar todos los datos de una vez
        const normalizedVehicles = vehicles.map(vehicleData => ({
          ...vehicleData,
          placa: vehicleData.placa.toUpperCase().trim(),
          cedula: vehicleData.cedula ? vehicleData.cedula.trim() : '',
          estado: vehicleData.estado || 'ACTIVO',
          tipoVehiculo: vehicleData.tipoVehiculo || 'AUTOMOVIL',
          origen: vehicleData.origen || 'EXCEL',
          cargo: vehicleData.cargo || '',
          area: vehicleData.area || ''
        }));

        // Obtener todas las placas para verificar duplicados de una vez
        const placas = normalizedVehicles.map(v => v.placa);
        const existingVehicles = await prisma.vehicle.findMany({
          where: { placa: { in: placas } },
          select: { placa: true }
        });
        
        const existingPlacas = new Set(existingVehicles.map(v => v.placa));
        
        // Obtener todas las cédulas para verificar usuarios de una vez
        const cedulas = normalizedVehicles
          .map(v => v.cedula)
          .filter(cedula => cedula && cedula.trim());
        
        const existingUsers = await prisma.user.findMany({
          where: { id: { in: cedulas } },
          select: { id: true }
        });
        
        const existingUserIds = new Set(existingUsers.map(u => u.id));
        
        // Separar vehículos nuevos de los existentes
        const newVehicles = normalizedVehicles.filter(v => !existingPlacas.has(v.placa));
        const existingVehiclesToUpdate = normalizedVehicles.filter(v => existingPlacas.has(v.placa));
        
        // Procesar vehículos nuevos en lotes
        if (newVehicles.length > 0) {
          const BATCH_SIZE = 50;
          for (let i = 0; i < newVehicles.length; i += BATCH_SIZE) {
            const batch = newVehicles.slice(i, i + BATCH_SIZE);
            
            const vehiclesToCreate = batch.map(vehicleData => ({
              placa: vehicleData.placa,
              cedula: vehicleData.cedula,
              estado: vehicleData.estado,
              tipoVehiculo: vehicleData.tipoVehiculo,
              origen: vehicleData.origen,
              conductorId: existingUserIds.has(vehicleData.cedula) ? vehicleData.cedula : null,
              cargo: vehicleData.cargo,
              area: vehicleData.area
            }));
            
            try {
              await prisma.vehicle.createMany({
                data: vehiclesToCreate,
                skipDuplicates: true
              });
              
              insertedCount += batch.length;
            } catch (batchError: any) {
              console.error(`Error en lote ${i / BATCH_SIZE + 1}:`, batchError);
              errors.push(`Error en lote ${i / BATCH_SIZE + 1}: ${batchError.message}`);
            }
          }
        }
        
        // Procesar vehículos existentes (actualizaciones)
        if (existingVehiclesToUpdate.length > 0) {
          for (const vehicleData of existingVehiclesToUpdate) {
            try {
              await prisma.vehicle.update({
                where: { placa: vehicleData.placa },
                data: {
                  cedula: vehicleData.cedula,
                  estado: vehicleData.estado,
                  tipoVehiculo: vehicleData.tipoVehiculo,
                  origen: vehicleData.origen,
                  conductorId: existingUserIds.has(vehicleData.cedula) ? vehicleData.cedula : null,
                  cargo: vehicleData.cargo,
                  area: vehicleData.area
                }
              });
              updatedCount++;
            } catch (updateError: any) {
              console.error(`Error al actualizar ${vehicleData.placa}:`, updateError);
              errors.push(`Error al actualizar ${vehicleData.placa}: ${updateError.message}`);
            }
          }
        }
        
        // Contar vehículos omitidos (duplicados que no se procesaron)
        skippedCount = existingVehiclesToUpdate.length - updatedCount;
        
        // Construir mensaje de resultado
        let message = `Proceso completado: `;
        if (insertedCount > 0) message += `${insertedCount} insertados, `;
        if (updatedCount > 0) message += `${updatedCount} actualizados, `;
        if (skippedCount > 0) message += `${skippedCount} omitidos`;
        
        return {
          success: insertedCount > 0 || updatedCount > 0,
          insertedCount,
          updatedCount,
          skippedCount,
          errors: errors.slice(0, 10), // Limitar errores para no saturar
          message
        };
        
      } catch (error: any) {
        console.error('Error en inserción masiva:', error);
        return {
          success: false,
          insertedCount,
          updatedCount: 0,
          skippedCount: 0,
          errors: [...errors.slice(0, 5), `Error general: ${error.message}`],
          message: 'Error en la inserción masiva de vehículos'
        };
      }
    },

    // Actualizar cédula de un vehículo específico
    updateVehicleCedula: async (_: any, { placa, cedula }: { placa: string; cedula: string }) => {
      try {
        const normalizedPlaca = placa.toUpperCase().trim();
        const normalizedCedula = cedula.trim();
        
        // Verificar si el vehículo existe
        const existingVehicle = await prisma.vehicle.findUnique({
          where: { placa: normalizedPlaca }
        });
        
        if (!existingVehicle) {
          throw new UserInputError(`No se encontró vehículo con placa ${normalizedPlaca}`);
        }
        
        // Verificar si existe un usuario con esa cédula
        let conductorId = null;
        if (normalizedCedula) {
          const conductor = await prisma.user.findUnique({
            where: { id: normalizedCedula }
          });
          
          if (conductor) {
            conductorId = conductor.id;
          }
        }
        
        // Actualizar el vehículo
        const updatedVehicle = await prisma.vehicle.update({
          where: { placa: normalizedPlaca },
          data: {
            cedula: normalizedCedula,
            conductorId
          },
          include: {
            conductor: true
          }
        });
        
        return updatedVehicle;
        
      } catch (error) {
        console.error('Error al actualizar cédula:', error);
        throw error;
      }
    }
  }
};
