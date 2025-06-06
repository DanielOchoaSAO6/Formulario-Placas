import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Lista de usuarios a insertar
const users = [
  { id: '1152464977', name: 'SANMARTIN HENAO BRYAN', email: '1152464977@user.com' },
  { id: '15506018', name: 'BEDOYA JIMENEZ JAIME ALBERTO', email: '15506018@user.com' },
  { id: '92256533', name: 'GARCIA MARTINEZ JUAN DE JESUS', email: '92256533@user.com' },
  { id: '1003395739', name: 'MORALES PRADA MANUEL DAVID', email: '1003395739@user.com' },
  { id: '1017195077', name: 'ORTIZ CARDONA JONATHAN STIVEN', email: '1017195077@user.com' },
  { id: '15441413', name: 'OSPINA MONTOYA CESAR MARIO', email: '15441413@user.com' },
  { id: '1033372050', name: 'TORRES WUETO YEISON ALBERTO', email: '1033372050@user.com' },
  { id: '1067854059', name: 'BOLAÑO PAEZ PEDRO RAFAEL', email: '1067854059@user.com' },
  { id: '1004347156', name: 'DONADO ARAUJO JOHAN ANDRES', email: '1004347156@user.com' }
];

async function insertUsers() {
  console.log('🚀 Iniciando inserción de usuarios...');
  
  try {
    // Para cada usuario en la lista
    for (const user of users) {
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      });
      
      if (existingUser) {
        console.log(`⚠️ Usuario con cédula ${user.id} ya existe. Omitiendo...`);
        continue;
      }
      
      // Hashear la contraseña (la contraseña es la misma cédula)
      const hashedPassword = await bcrypt.hash(user.id, 10);
      
      // Crear el usuario
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: 'USER'
        }
      });
      
      console.log(`✅ Usuario creado: ${user.name} (${user.id})`);
    }
    
    console.log('✅ Inserción de usuarios completada con éxito');
  } catch (error) {
    console.error('❌ Error al insertar usuarios:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar la función
insertUsers()
  .then(() => console.log('✨ Proceso finalizado'))
  .catch((error) => {
    console.error('Error inesperado:', error);
    process.exit(1);
  });
