import sql from 'mssql';
import { config } from '../config/config';

// Configuración de la conexión a SQL Server
const sqlConfig: sql.config = {
  server: config.sqlServer.server,
  database: config.sqlServer.database,
  user: config.sqlServer.user,
  password: config.sqlServer.password,
  port: config.sqlServer.port,
  connectionTimeout: 30000, // 30 segundos
  requestTimeout: 30000, // 30 segundos
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    encrypt: config.sqlServer.options.encrypt,
    trustServerCertificate: config.sqlServer.options.trustServerCertificate,
    enableArithAbort: true
  }
};

// Pool de conexiones para reutilizar conexiones
let pool: sql.ConnectionPool | null = null;

/**
 * Obtiene el pool de conexiones a SQL Server
 */
export async function getSqlServerPool(): Promise<sql.ConnectionPool> {
  try {
    // Si no hay pool o está cerrado, crear uno nuevo
    if (!pool || !pool.connected) {
      if (pool) {
        try {
          await pool.close();
        } catch (error) {
          // Ignorar errores al cerrar pool ya cerrado
        }
      }
      
      pool = new sql.ConnectionPool(sqlConfig);
      
      // Manejar eventos del pool
      pool.on('error', (err) => {
        console.error('Error en el pool de SQL Server:', err);
        pool = null; // Resetear el pool para forzar reconexión
      });
      
      await pool.connect();
      console.log('✅ Conexión a SQL Server establecida');
    }
    
    return pool;
  } catch (error) {
    console.error('Error al conectar con SQL Server:', error);
    pool = null;
    throw error;
  }
}

/**
 * Obtiene el nombre de una persona por su cédula desde la base de datos BI_W0550
 * @param cedula - Cédula de la persona
 * @returns Nombre de la persona o null si no se encuentra
 */
export async function getNombreByCedula(cedula: string): Promise<string | null> {
  let retries = 3;
  
  while (retries > 0) {
    try {
      const pool = await getSqlServerPool();
      
      // Consulta para obtener el nombre de la persona
       // Nota: Ajustar el nombre de la tabla según la estructura real de la base de datos
       const result = await pool.request()
         .input('cedula', sql.VarChar, cedula)
         .query(`
           SELECT TOP 1 f200_razon_social 
           FROM dbo.BI_W0550 
           WHERE F200_ID = @cedula
         `);
      
      if (result.recordset.length > 0) {
        return result.recordset[0].f200_razon_social;
      }
      
      return null;
    } catch (error: any) {
      console.error(`Error al consultar nombre por cédula (intentos restantes: ${retries - 1}):`, error);
      
      // Si es un error de conexión, resetear el pool y reintentar
      if (error.code === 'ECONNCLOSED' || error.code === 'ENOTOPEN' || error.code === 'ETIMEOUT') {
        pool = null;
        retries--;
        
        if (retries > 0) {
          console.log('Reintentando conexión a SQL Server...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
          continue;
        }
      }
      
      // Para otros errores, no reintentar
      break;
    }
  }
  
  return null;
}

/**
 * Cierra el pool de conexiones
 */
export async function closeSqlServerPool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('🔒 Conexión a SQL Server cerrada');
  }
}

// Manejar el cierre de la aplicación
process.on('SIGINT', async () => {
  await closeSqlServerPool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeSqlServerPool();
  process.exit(0);
});