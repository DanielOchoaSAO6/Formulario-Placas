import { PrismaClient } from '@prisma/client';
import { UserInputError } from 'apollo-server-express';
import { format } from 'date-fns';
import { googleSheetsService } from '../../services/googleSheets.service';

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
        // Obtener vehículos con paginación usando SQL directo
        const vehicles = await prisma.$queryRaw`
          SELECT v.*, u.name as conductorName, u.email as conductorEmail 
          FROM Vehicle v 
          LEFT JOIN User u ON v.conductorId = u.id 
          ORDER BY v.placa ASC 
          LIMIT ${take} OFFSET ${skip}
        `;
        
        // Contar el total de vehículos
        const countResult = await prisma.$queryRaw`SELECT COUNT(*) as total FROM Vehicle`;
        const totalVehicles = Array.isArray(countResult) && countResult.length > 0 ? 
          Number(countResult[0].total) : 0;
        
        // Formatear los resultados
        const formattedVehicles = Array.isArray(vehicles) ? vehicles.map(vehicle => ({
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
        })) : [];
        
        return {
          vehicles: formattedVehicles,
          totalCount: totalVehicles
        };
      } catch (error) {
        console.error('Error al listar vehículos:', error);
        throw error;
      }
    }
  },
  
  Mutation: {
    // Crear un nuevo vehículo
    createVehicle: async (_: any, { input }: { input: any }) => {
      try {
        const { placa, conductorId = null, estado = 'ACTIVO', tipoVehiculo = 'AUTOMOVIL', origen = 'REGISTRO', cargo = '', area = '' } = input;
        
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
        
        // Guardar en Google Sheets (proceso asíncrono que no bloquea la respuesta)
        saveToGoogleSheets(normalizedPlaca, conductorId)
          .then(success => {
            if (success) {
              console.log(`Vehículo ${normalizedPlaca} guardado en Google Sheets`);
            } else {
              console.error(`Error al guardar vehículo ${normalizedPlaca} en Google Sheets`);
            }
          })
          .catch(error => {
            console.error('Error en el proceso de guardado en Google Sheets:', error);
          });
        
        return vehicle;
      } catch (error) {
        console.error('Error al crear vehículo:', error);
        throw error;
      }
    }
  }
};
