"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const userService_1 = require("../features/users/userService");
const authMiddleware = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }
        // Verificar formato "Bearer token"
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }
        // Verificar el token usando el servicio
        const decoded = userService_1.userService.verifyToken(token);
        // Agregar información del usuario al request
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};
exports.authMiddleware = authMiddleware;
