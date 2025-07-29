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
  },
  sqlServer: {
    server: process.env.SQL_SERVER_HOST || 'localhost',
    database: process.env.SQL_SERVER_DATABASE || 'BI_W0550',
    user: process.env.SQL_SERVER_USER || '',
    password: process.env.SQL_SERVER_PASSWORD || '',
    port: parseInt(process.env.SQL_SERVER_PORT || '1433'),
    options: {
      encrypt: process.env.SQL_SERVER_ENCRYPT === 'true',
      trustServerCertificate: process.env.SQL_SERVER_TRUST_CERT === 'true'
    }
  }
};
