import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Datos del administrador
const adminUser = {
  id: 'administrador_jorge', // Usando el nombre de usuario como ID
  name: 'Jorge Administrador',
  email: 'administrador_jorge@vehicar.com',
  password: 'Sao62025*',
  role: 'ADMIN' as const
};

async function insertAdmin() {
  console.log('🚀 Insertando usuario administrador...');
  
  try {
    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { id: adminUser.id }
    });
    
    if (existingUser) {
      console.log(`⚠️ El usuario administrador ${adminUser.id} ya existe.`);
      console.log('🔄 Actualizando contraseña...');
      
      // Actualizar la contraseña
      const hashedPassword = await bcrypt.hash(adminUser.password, 10);
      
      await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN'
        }
      });
      
      console.log(`✅ Contraseña del administrador ${adminUser.name} actualizada exitosamente`);
      return;
    }
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);
    
    // Crear el usuario administrador
    await prisma.user.create({
      data: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        password: hashedPassword,
        role: adminUser.role
      }
    });
    
    console.log(`✅ Usuario administrador creado exitosamente:`);
    console.log(`   - ID: ${adminUser.id}`);
    console.log(`   - Nombre: ${adminUser.name}`);
    console.log(`   - Email: ${adminUser.email}`);
    console.log(`   - Rol: ${adminUser.role}`);
    
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
insertAdmin()
  .then(() => console.log('✨ Proceso de creación de administrador finalizado'))
  .catch((error) => {
    console.error('Error inesperado:', error);
    process.exit(1);
  }); 