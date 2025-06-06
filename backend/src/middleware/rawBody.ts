import { Request, Response, NextFunction } from 'express';
import { json, urlencoded } from 'body-parser';
import { IncomingMessage } from 'http';

// Extender la interfaz de Request para incluir el rawBody
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

/**
 * Crea un middleware que captura el body raw de las solicitudes
 * Esto es necesario para la compatibilidad entre Express 5 y Apollo Server
 */
export const createRawBodyMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Solo procesar el raw body para solicitudes a /graphql
    if (req.path === '/graphql' && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const chunks: Buffer[] = [];
      
      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });
      
      req.on('end', () => {
        if (chunks.length) {
          const buffer = Buffer.concat(chunks);
          (req as any).rawBody = buffer;
          
          // Para solicitudes con Content-Type application/json, también parseamos el body
          if (req.headers['content-type']?.includes('application/json')) {
            try {
              req.body = JSON.parse(buffer.toString('utf8'));
            } catch (err) {
              // Si hay un error en el parsing, lo manejamos en el siguiente middleware
            }
          }
        }
        next();
      });
      
      req.on('error', (err) => {
        console.error('Error al leer el raw body:', err);
        next(err);
      });
    } else {
      // Para otras rutas, simplemente continuar
      next();
    }
  };
};
