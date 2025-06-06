import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  // Obtener el token del encabezado Authorization
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    // Formato típico: "Bearer [token]"
    const token = authHeader.split(' ')[1];
    
    if (token) {
      try {
        // Verificar y decodificar el token
        const user = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        
        // Añadir el usuario decodificado al objeto req
        req.user = user;
      } catch (error) {
        // Token inválido o expirado, no establecemos req.user
        console.error('Error al verificar token:', error);
      }
    }
  }
  
  // Continuar con la siguiente función de middleware o ruta
  next();
};
