import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Lista completa de usuarios a insertar
const users = [
  { id: '1003395739', name: 'MORALES PRADA MANUEL DAVID', email: '1003395739@vehicar.com' },
  { id: '1216721913', name: 'GARCIA MESA DANIEL', email: '1216721913@vehicar.com' },
  { id: '15506018', name: 'BEDOYA JIMENEZ JAIME ALBERTO', email: '15506018@vehicar.com' },
  { id: '1004347156', name: 'DONADO ARAUJO JOHAN ANDRES', email: '1004347156@vehicar.com' },
  { id: '92256533', name: 'GARCIA MARTINEZ JUAN DE JESUS', email: '92256533@vehicar.com' },
  { id: '1017195077', name: 'ORTIZ CARDONA JONATHAN STIVEN', email: '1017195077@vehicar.com' },
  { id: '15441413', name: 'OSPINA MONTOYA CESAR MARIO', email: '15441413@vehicar.com' },
  { id: '1152464977', name: 'SANMARTIN HENAO BRYAN', email: '1152464977@vehicar.com' },
  { id: '1033372050', name: 'TORRES WUETO YEISON ALBERTO', email: '1033372050@vehicar.com' },
  { id: '1214720647', name: 'JORGE MORENO', email: '1214720647@vehicar.com' },
  // También incluir el administrador
  { id: 'administrador_jorge', name: 'Jorge Administrador', email: 'admin@vehicar.com', role: 'ADMIN', password: 'Sao62025*' }
];

async function insertAllUsers() {
  console.log('🚀 Iniciando inserción de todos los usuarios...');
  
  try {
    let createdCount = 0;
    let updatedCount = 0;
    
    // Para cada usuario en la lista
    for (const user of users) {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      
      // Determinar la contraseña (cédula por defecto, excepto para el admin)
      const password = user.password || user.id;
      const role = user.role || 'USER';
      
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      if (existingUser) {
        // Actualizar usuario existente
        await prisma.user.update({
          where: { id: user.id },
          data: {
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: role as any
          }
        });
        
        console.log(`🔄 Usuario actualizado: ${user.name} (${user.id})`);
        updatedCount++;
      } else {
        // Crear nuevo usuario
        await prisma.user.create({
          data: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: hashedPassword,
            role: role as any
          }
        });
        
        console.log(`✅ Usuario creado: ${user.name} (${user.id})`);
        createdCount++;
      }
    }
    
    console.log('\n🎉 Proceso completado:');
    console.log(`   - Usuarios creados: ${createdCount}`);
    console.log(`   - Usuarios actualizados: ${updatedCount}`);
    console.log(`   - Total procesados: ${createdCount + updatedCount}`);
    
    console.log('\n📋 Credenciales de acceso:');
    console.log('   👤 Usuarios normales: Cédula = Contraseña');
    console.log('   👨‍💼 Administrador: administrador_jorge / Sao62025*');
    console.log('   🏢 RRHH: RRHH / Sao62025*');
    
  } catch (error) {
    console.error('❌ Error al insertar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
insertAllUsers(); 