"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userOrAdmin = exports.adminOnly = exports.roleMiddleware = void 0;
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error en la verificación de permisos'
            });
        }
    };
};
exports.roleMiddleware = roleMiddleware;
// Middlewares específicos para facilitar su uso
exports.adminOnly = (0, exports.roleMiddleware)(['admin']);
exports.userOrAdmin = (0, exports.roleMiddleware)(['user', 'admin']);
