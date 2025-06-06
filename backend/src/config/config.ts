import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  }
};
