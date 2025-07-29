import prisma from '../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthenticationError, UserInputError } from 'apollo-server-express';



// Función para generar un token JWT
const generateToken = (user: any) => {
  const secret = process.env.JWT_SECRET || 'default_secret';
  // Usando objeto literal directamente evita problemas de tipado
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRATION || '1d' } as SignOptions
  );

};

export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      
      return prisma.user.findUnique({
        where: { id: context.user.id },
        include: { posts: true }
      });
    },
    
    users: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new AuthenticationError('No tienes permisos para realizar esta acción');
      }
      
      return prisma.user.findMany({
        include: { posts: true }
      });
    },
    
    user: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      
      // Los usuarios normales solo pueden ver su propio perfil
      if (context.user.role !== 'ADMIN' && context.user.id !== id) {
        throw new AuthenticationError('No tienes permisos para realizar esta acción');
      }
      
      return prisma.user.findUnique({
        where: { id },
        include: { posts: true }
      });
    },
    
    testUsers: async (_: any, __: any, context: any) => {
      // Verificar si hay un usuario autenticado (opcional, depende de tus requisitos de seguridad)
      // Si quieres que solo usuarios autenticados puedan ver esta información, descomenta estas líneas
      /*
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      */
      
      // Obtener usuarios reales de la base de datos (limitado a 10 usuarios)
      const users = await prisma.user.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc' // Ordenar por fecha de creación (más recientes primero)
        },
        select: {
          id: true,
          name: true,
          role: true,
          email: true,
          createdAt: true
        }
      });
      
      // Definir la interfaz para el usuario de la base de datos
      interface DbUser {
        id: string;
        name: string | null;
        role: string;
        email: string;
        createdAt: Date;
      }

      // Transformar los datos para el formato de TestUser
      // Solo devolvemos información segura (sin contraseñas reales)
      return users.map((user: DbUser) => ({
        id: user.id,
        name: user.name || `Usuario ${user.id.substring(0, 4)}`,
        testPassword: user.id // Usamos la cédula como contraseña de prueba
      }));
    }
  },
  
  Mutation: {
    signup: async (_: any, { input }: { input: any }) => {
      const { email, password, name } = input;
      
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (existingUser) {
        throw new UserInputError('El usuario ya existe');
      }
      
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear el usuario
      const user = await prisma.user.create({
        data: {
          id: Math.random().toString(36).substring(2, 11), // Generar un ID aleatorio
          email,
          password: hashedPassword,
          name,
        }
      });
      
      // Generar token JWT
      const token = generateToken(user);
      
      return {
        token,
        user,
      };
    },
    
    updateUser: async (_: any, { id, name, email, role }: { id: string; name?: string; email?: string; role?: string }, context: any) => {
      // Verificar autenticación y permisos
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new AuthenticationError('No tienes permisos para realizar esta acción');
      }
      
      // Verificar si el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!existingUser) {
        throw new UserInputError('Usuario no encontrado');
      }
      
      // Actualizar el usuario
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),
        }
      });
      
      return updatedUser;
    },
    
    deleteUser: async (_: any, { id }: { id: string }, context: any) => {
      // Verificar autenticación y permisos
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new AuthenticationError('No tienes permisos para realizar esta acción');
      }
      
      // Verificar si el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });
      
      if (!existingUser) {
        throw new UserInputError('Usuario no encontrado');
      }
      
      // No permitir eliminar al usuario administrador principal
      if (id === 'administrador_jorge') {
        throw new UserInputError('No se puede eliminar al administrador principal');
      }
      
      // Eliminar el usuario
      const deletedUser = await prisma.user.delete({
        where: { id }
      });
      
      return deletedUser;
    },
    
    login: async (_: any, { id, password }: { id: string; password: string }) => {
      // Buscar al usuario en la base de datos (tanto administrador como usuarios normales)
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new AuthenticationError('Credenciales inválidas');
      }

      // Verificar contraseña
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        throw new AuthenticationError('Credenciales inválidas');
      }

      // Generar token JWT
      const token = generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    },
    
    changePassword: async (_: any, { id, currentPassword, newPassword }: { id: string; currentPassword: string; newPassword: string }, context: any) => {
      // Verificar autenticación
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      
      // Solo permitir cambiar la contraseña propia o si es administrador
      if (context.user.id !== id && context.user.role !== 'ADMIN') {
        throw new AuthenticationError('No tienes permisos para cambiar la contraseña de otro usuario');
      }
      
      // Buscar al usuario en la base de datos
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new UserInputError('Usuario no encontrado');
      }

      // Verificar la contraseña actual
      const isValid = await bcrypt.compare(currentPassword, user.password);

      if (!isValid) {
        throw new AuthenticationError('La contraseña actual es incorrecta');
      }
      
      // Encriptar la nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Actualizar la contraseña del usuario
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword
        }
      });
      
      return updatedUser;
    }
  },
  
  User: {
    // Resolver para el campo posts de User
    posts: async (parent: any) => {
      return prisma.post.findMany({
        where: { authorId: parent.id }
      });
    }
  }
};
