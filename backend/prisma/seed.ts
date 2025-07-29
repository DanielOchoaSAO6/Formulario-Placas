import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Verificar si el usuario administrador ya existe
  const existingAdmin = await prisma.user.findUnique({
    where: { id: 'administrador_jorge' }
  });

  if (!existingAdmin) {
    // Crear el usuario administrador
    const hashedPassword = await bcrypt.hash('Sao62025*', 10);
    
    await prisma.user.create({
      data: {
        id: 'administrador_jorge',
        name: 'Administrador Jorge',
        email: 'admin@sistema.com',
        password: hashedPassword,
        role: Role.ADMIN
      }
    });
    
    console.log('Usuario administrador creado exitosamente');
  } else {
    console.log('El usuario administrador ya existe');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
