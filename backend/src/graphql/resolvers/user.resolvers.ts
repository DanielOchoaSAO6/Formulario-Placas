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
    }
  },
  
  Mutation: {
    signup: async (_: any, { input }: { input: { email: string; password: string; name?: string } }) => {
      const { email, password, name } = input;
      
      // Verificar si el usuario ya existe
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new UserInputError('El email ya está en uso');
      }
      
      // Encriptar la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Crear nuevo usuario
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name
        }
      });
      
      // Generar token JWT
      const token = generateToken(newUser);
      
      return {
        token,
        user: newUser
      };
    },
    
    login: async (_: any, { id, password }: { id: string; password: string }) => {
      // Buscar el usuario por id (cédula)
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new UserInputError('Credenciales inválidas');
      }
      
      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new UserInputError('Credenciales inválidas');
      }
      
      // Generar token JWT
      const token = generateToken(user);
      
      return {
        token,
        user
      };
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
