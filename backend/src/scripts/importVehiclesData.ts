import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import bcrypt from 'bcryptjs';

// Función para eliminar el BOM (Byte Order Mark) si existe
function removeBOM(content: string): string {
  if (content.charCodeAt(0) === 0xFEFF) {
    return content.slice(1);
  }
  return content;
}

// Inicializar el cliente de Prisma
const prisma = new PrismaClient();

interface VehicleData {
  cedula: string;
  placa: string;
  estado: string;
  tipoVehiculo: string;
  origen: string;
  nombre: string;
  cargo: string;
  area: string;
}

async function importVehicles() {
  try {
    console.log('🚀 Iniciando importación de vehículos desde CSV...');
    
    // Ruta al archivo CSV
    const csvFilePath = path.join(__dirname, '../../public/CSV.csv');
    
    if (!fs.existsSync(csvFilePath)) {
      console.error(`❌ El archivo CSV no existe en la ruta: ${csvFilePath}`);
      return;
    }
    
    // Leer el archivo CSV y eliminar el BOM si existe
    let fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });
    fileContent = removeBOM(fileContent);
    
    // Configurar el parser para usar punto y coma como delimitador
    const records = parse(fileContent, {
      delimiter: ';',
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    
    console.log(`📊 Se encontraron ${records.length} registros en el CSV`);
    
    // Contador para estadísticas
    let stats = {
      processed: 0,
      usersCreated: 0,
      vehiclesCreated: 0,
      errors: 0
    };
    
    // Procesar cada registro
    for (const record of records) {
      try {
        stats.processed++;
        
        // Mapear los campos del CSV a nuestra estructura
        // Normalizar los nombres de las columnas para manejar posibles variaciones
        const normalizedRecord = Object.keys(record).reduce((acc, key) => {
          // Eliminar posibles caracteres BOM y normalizar nombres de columnas
          const normalizedKey = key.replace(/^\ufeff/, '').trim();
          acc[normalizedKey] = record[key];
          return acc;
        }, {} as Record<string, string>);
        
        const vehicleData: VehicleData = {
          cedula: normalizedRecord['CÉDULA'] || normalizedRecord['CEDULA'],
          placa: normalizedRecord['PLACA'],
          estado: normalizedRecord['Estado'],
          tipoVehiculo: normalizedRecord['Tipo de vehiculo'],
          origen: normalizedRecord['Origen'],
          nombre: normalizedRecord['Nombre'],
          cargo: normalizedRecord['Cargo'],
          area: normalizedRecord['Area']
        };
        
        // Verificar que tenemos una cédula válida
        if (!vehicleData.cedula) {
          console.log('⚠️ Registro sin cédula válida:', normalizedRecord);
          stats.errors++;
          continue;
        }
        
        // Verificar si el usuario (conductor) ya existe
        let user = await prisma.user.findUnique({
          where: { id: vehicleData.cedula }
        });
        
        // Si el usuario no existe, crearlo
        if (!user) {
          try {
            // Generar un email basado en el nombre y cédula para garantizar unicidad
            const email = `${vehicleData.nombre.toLowerCase().replace(/\s+/g, '.')}.${vehicleData.cedula}@vehicar.com`;
            
            // Verificar si ya existe un usuario con ese email
            const userWithEmail = await prisma.user.findUnique({
              where: { email }
            });
            
            // Si ya existe un usuario con ese email, modificar el email para hacerlo único
            const finalEmail = userWithEmail ? 
              `${vehicleData.nombre.toLowerCase().replace(/\s+/g, '.')}.${vehicleData.cedula}.${Date.now()}@vehicar.com` : 
              email;
            
            // Crear el usuario con un email único
            user = await prisma.user.create({
              data: {
                id: vehicleData.cedula,
                name: vehicleData.nombre,
                email: finalEmail,
                // Usar la cédula como contraseña por defecto (hasheada)
                password: await bcrypt.hash(vehicleData.cedula, 10),
                role: 'USER'
              }
            });
            
            stats.usersCreated++;
            console.log(`👤 Usuario creado: ${user.name} (${user.id})`);
          } catch (userError) {
            // Si falla la creación del usuario, intentar encontrarlo nuevamente
            // Puede que se haya creado en una iteración anterior con otro vehículo
            user = await prisma.user.findUnique({
              where: { id: vehicleData.cedula }
            });
            
            // Si aún no existe, crear un usuario con datos genéricos pero únicos
            if (!user) {
              const timestamp = Date.now();
              user = await prisma.user.create({
                data: {
                  id: vehicleData.cedula,
                  name: `${vehicleData.nombre} (${timestamp})`,
                  email: `usuario.${vehicleData.cedula}.${timestamp}@vehicar.com`,
                  password: await bcrypt.hash(vehicleData.cedula, 10),
                  role: 'USER'
                }
              });
              stats.usersCreated++;
              console.log(`👤 Usuario creado (alternativo): ${user.name} (${user.id})`);
            }
          }
        }
        
        // Verificar si el vehículo ya existe usando consultas SQL directas
        // Esto es necesario porque puede haber problemas con los tipos generados por Prisma
        const existingVehicles = await prisma.$queryRaw`
          SELECT * FROM Vehicle WHERE placa = ${vehicleData.placa}
        `;
        
        const existingVehicle = Array.isArray(existingVehicles) && existingVehicles.length > 0 ? existingVehicles[0] : null;
        
        if (!existingVehicle) {
          // Crear el vehículo usando consultas SQL directas
          await prisma.$executeRaw`
            INSERT INTO Vehicle (id, placa, estado, tipoVehiculo, origen, conductorId, cargo, area, createdAt, updatedAt)
            VALUES (
              UUID(),
              ${vehicleData.placa},
              ${vehicleData.estado},
              ${vehicleData.tipoVehiculo},
              ${vehicleData.origen},
              ${vehicleData.cedula},
              ${vehicleData.cargo},
              ${vehicleData.area},
              NOW(),
              NOW()
            )
          `;
          
          stats.vehiclesCreated++;
          console.log(`🚗 Vehículo creado: ${vehicleData.placa} asignado a ${user.name}`);
        } else {
          console.log(`⚠️ El vehículo con placa ${vehicleData.placa} ya existe, se omitirá`);
        }
      } catch (error) {
        stats.errors++;
        console.error(`❌ Error procesando registro: ${JSON.stringify(record)}`, error);
      }
    }
    
    // Mostrar estadísticas finales
    console.log('\n📈 Estadísticas de importación:');
    console.log(`   - Registros procesados: ${stats.processed}`);
    console.log(`   - Usuarios creados: ${stats.usersCreated}`);
    console.log(`   - Vehículos creados: ${stats.vehiclesCreated}`);
    console.log(`   - Errores: ${stats.errors}`);
    console.log('\n✅ Importación completada');
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await prisma.$disconnect();
  }
}

// Ejecutar la función de importación
importVehicles();
