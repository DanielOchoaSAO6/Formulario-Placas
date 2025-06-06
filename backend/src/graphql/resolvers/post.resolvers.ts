import prisma from '../../lib/prisma';
import { AuthenticationError, ForbiddenError } from 'apollo-server-express';



export const postResolvers = {
  Query: {
    posts: async () => {
      return prisma.post.findMany({
        where: { published: true },
        include: { author: true },
      });
    },
    
    post: async (_: any, { id }: { id: string }) => {
      const post = await prisma.post.findUnique({
        where: { id },
        include: { author: true },
      });
      
      if (!post || (!post.published)) {
        throw new Error('Post no encontrado');
      }
      
      return post;
    },
    
    postsByUser: async (_: any, { userId }: { userId: string }, context: any) => {
      // Verificar si el usuario está autenticado
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      
      // Si no es admin y no es el dueño de los posts, solo puede ver los publicados
      if (context.user.role !== 'ADMIN' && context.user.id !== userId) {
        return prisma.post.findMany({
          where: {
            authorId: userId,
            published: true
          },
          include: { author: true }
        });
      }
      
      // Si es admin o dueño de los posts, puede ver todos
      return prisma.post.findMany({
        where: { authorId: userId },
        include: { author: true }
      });
    }
  },
  
  Mutation: {
    createPost: async (_: any, { input }: { input: { title: string; content?: string; published?: boolean } }, context: any) => {
      // Verificar si el usuario está autenticado
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      
      const { title, content, published = false } = input;
      
      return prisma.post.create({
        data: {
          title,
          content,
          published,
          authorId: context.user.id
        },
        include: { author: true }
      });
    },
    
    updatePost: async (_: any, { input }: { input: { id: string; title?: string; content?: string; published?: boolean } }, context: any) => {
      // Verificar si el usuario está autenticado
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      
      const { id, ...postData } = input;
      
      // Verificar que el post exista y pertenezca al usuario
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new Error('Post no encontrado');
      }
      
      // Solo el autor o un admin pueden actualizar un post
      if (post.authorId !== context.user.id && context.user.role !== 'ADMIN') {
        throw new ForbiddenError('No tienes permiso para editar este post');
      }
      
      return prisma.post.update({
        where: { id },
        data: postData,
        include: { author: true }
      });
    },
    
    deletePost: async (_: any, { id }: { id: string }, context: any) => {
      // Verificar si el usuario está autenticado
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      
      // Verificar que el post exista y pertenezca al usuario
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new Error('Post no encontrado');
      }
      
      // Solo el autor o un admin pueden eliminar un post
      if (post.authorId !== context.user.id && context.user.role !== 'ADMIN') {
        throw new ForbiddenError('No tienes permiso para eliminar este post');
      }
      
      return prisma.post.delete({
        where: { id },
        include: { author: true }
      });
    },
    
    publishPost: async (_: any, { id }: { id: string }, context: any) => {
      // Verificar si el usuario está autenticado
      if (!context.user) {
        throw new AuthenticationError('No estás autenticado');
      }
      
      // Verificar que el post exista y pertenezca al usuario
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new Error('Post no encontrado');
      }
      
      // Solo el autor o un admin pueden publicar un post
      if (post.authorId !== context.user.id && context.user.role !== 'ADMIN') {
        throw new ForbiddenError('No tienes permiso para publicar este post');
      }
      
      return prisma.post.update({
        where: { id },
        data: { published: true },
        include: { author: true }
      });
    }
  },
  
  Post: {
    // Resolver para el campo author de Post
    author: async (parent: any) => {
      return prisma.user.findUnique({
        where: { id: parent.authorId }
      });
    }
  }
};
