import { Request, Response, NextFunction } from 'express';

export const roleMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Verificar que el usuario esté autenticado
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Verificar que el usuario tenga el rol necesario
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Permisos insuficientes'
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en la verificación de permisos'
      });
    }
  };
};

// Middlewares específicos para facilitar su uso
export const adminOnly = roleMiddleware(['admin']);
export const userOrAdmin = roleMiddleware(['user', 'admin']);
