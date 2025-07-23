import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { readFileSync } from 'fs';
import { join } from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import { config } from './config/config';
import { resolvers } from './graphql/resolvers';
import { authMiddleware } from './middleware/auth';
import prisma from './lib/prisma';
import { json } from 'body-parser';
// Importar el middleware de Express para raw body que ayuda con Apollo
import { createRawBodyMiddleware } from './middleware/rawBody';

async function startServer() {
  try {
    // Conectar a la base de datos
    await prisma.$connect();
    console.log('🚀 Conexión a la base de datos establecida con éxito');
    
    // Crear la aplicación Express
    const app = express();
    
    // Configurar CORS - debe estar antes que cualquier otro middleware
    app.use(cors({
      origin: ['http://vehicar.sao6.com.co', 'www.vehicar.sao6.com.co'],
      credentials: true
    }));

    // Middleware esencial y en orden correcto
    app.use(morgan('dev'));
    
    // Middleware especializado para preservar raw body para GraphQL
    // esto evita el error "stream is not readable" en Express 5
    app.use(createRawBodyMiddleware());
    
    // Configurar body parser para todas las rutas excepto GraphQL
    app.use(/\/((?!graphql).)*$/, json({ limit: '1mb' }));
    app.use(/\/((?!graphql).)*$/, bodyParser.urlencoded({ extended: true, limit: '1mb' }));

    // Helmet después del body-parser
    app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false
    }));
    
    // Middleware de autenticación
    app.use(authMiddleware);
    
    // Ruta para verificar que el API REST está funcionando
    app.get('/api/health', (_, res) => {
      res.json({ status: 'ok', time: new Date().toISOString() });
    });
    
    // Leer el esquema GraphQL
    const typeDefs = readFileSync(join(__dirname, 'graphql/schemas/schema.graphql'), 'utf-8');
    
    // Crear el servidor Apollo
    const apolloServer = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({
        user: req.user,
        prisma
      }),
      // Deshabilitar reportar errores en producción
      debug: process.env.NODE_ENV !== 'production',
      // Formatear errores para evitar información sensible
      formatError: (err) => {
        console.error('Error GraphQL:', err);
        return {
          message: err.message,
          locations: err.locations,
          path: err.path,
        };
      },
    });
    
    // Iniciar el servidor Apollo
    await apolloServer.start();
    
    // Aplicar el middleware de Apollo con opciones simplificadas
    // y configuraciones explícitas para mejorar la compatibilidad con Express 5
    apolloServer.applyMiddleware({
      app: app as any, // Type assertion para evitar problemas de compatibilidad con Express 5
      path: '/graphql',
      cors: false,
      bodyParserConfig: false // Deshabilitar el bodyParser interno para evitar duplicación
    });
    
    // Ruta especial para graphql que maneja el raw body almacenado por nuestro middleware
    app.use('/graphql', (req, res, next) => {
      if (req.rawBody) {
        req.body = JSON.parse(req.rawBody.toString('utf8'));
      }
      next();
    });
    
    // Ruta de prueba para verificar que el servidor está funcionando
    app.get('/', (_req: express.Request, res: express.Response) => {
      res.send('Backend API con Express, GraphQL y Prisma');
    });
    
    // Iniciar el servidor
    const port = config.server.port;
    app.listen(port, () => {
      console.log(`🚀 Servidor ejecutándose en http://localhost:${port}`);
      console.log(`🚀 GraphQL disponible en http://localhost:${port}${apolloServer.graphqlPath}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on('unhandledRejection', error => {
  console.error('❌ Error no controlado:', error);
});

// Iniciar el servidor
startServer();
