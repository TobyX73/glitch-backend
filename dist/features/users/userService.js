"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../../config/database");
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const SALT_ROUNDS = 10;
exports.userService = {
    // Registrar nuevo usuario
    async register(data) {
        try {
            // Verificar si el email ya existe
            const existingUser = await database_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (existingUser) {
                throw new Error('El email ya está registrado');
            }
            // Hashear la contraseña
            const hashedPassword = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
            // Crear el usuario
            const user = await database_1.prisma.user.create({
                data: {
                    email: data.email,
                    password: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone,
                    role: data.role || 'user'
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    isActive: true,
                    emailVerified: true
                }
            });
            // Generar token JWT
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                role: user.role
            }, JWT_SECRET, { expiresIn: '24h' });
            return {
                user,
                token
            };
        }
        catch (error) {
            throw new Error(`Error al registrar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },
    // Iniciar sesión
    async login(data) {
        try {
            // Buscar el usuario por email
            const user = await database_1.prisma.user.findUnique({
                where: { email: data.email }
            });
            if (!user) {
                throw new Error('Credenciales inválidas');
            }
            // Verificar si el usuario está activo
            if (!user.isActive) {
                throw new Error('La cuenta ha sido desactivada');
            }
            // Verificar la contraseña
            const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password);
            if (!isPasswordValid) {
                throw new Error('Credenciales inválidas');
            }
            // Generar token JWT
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
                role: user.role
            }, JWT_SECRET, { expiresIn: '1h' });
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isActive: user.isActive,
                    emailVerified: user.emailVerified
                },
                token
            };
        }
        catch (error) {
            throw new Error(`Error al iniciar sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },
    // Obtener usuario por ID
    async getUserById(id) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            if (!user.isActive) {
                throw new Error('La cuenta ha sido desactivada');
            }
            // Obtener estadísticas de órdenes
            const [totalOrders, completedOrders] = await Promise.all([
                database_1.prisma.order.count({
                    where: { userId: id }
                }),
                database_1.prisma.order.count({
                    where: {
                        userId: id,
                        status: 'PAID'
                    }
                })
            ]);
            // Obtener dirección de la última orden
            const lastOrder = await database_1.prisma.order.findFirst({
                where: { userId: id },
                orderBy: { createdAt: 'desc' },
                select: {
                    shippingInfo: true
                }
            });
            // Obtener historial de órdenes
            const orders = await database_1.prisma.order.findMany({
                where: { userId: id },
                include: {
                    items: {
                        select: {
                            productName: true,
                            quantity: true,
                            size: true,
                            price: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            // Formatear historial de órdenes
            const orderHistory = orders.map(order => ({
                id: order.id,
                orderNumber: `ORD-2024-${String(order.id).padStart(3, '0')}`,
                date: order.createdAt,
                status: order.status,
                total: Number(order.total),
                items: order.items.map(item => ({
                    productName: item.productName,
                    quantity: item.quantity,
                    size: item.size || undefined,
                    price: Number(item.price)
                }))
            }));
            return {
                ...user,
                statistics: {
                    totalOrders,
                    completedOrders
                },
                address: lastOrder?.shippingInfo ? {
                    street: lastOrder.shippingInfo.street,
                    city: lastOrder.shippingInfo.city,
                    state: lastOrder.shippingInfo.state,
                    zipCode: lastOrder.shippingInfo.zipCode,
                    country: lastOrder.shippingInfo.country || 'Argentina'
                } : undefined,
                orderHistory
            };
        }
        catch (error) {
            throw new Error(`Error al obtener usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },
    // Actualizar perfil de usuario
    async updateProfile(id, data) {
        try {
            // Verificar que el usuario existe
            const existingUser = await database_1.prisma.user.findUnique({
                where: { id }
            });
            if (!existingUser) {
                throw new Error('Usuario no encontrado');
            }
            if (!existingUser.isActive) {
                throw new Error('La cuenta ha sido desactivada');
            }
            // Si se está actualizando el email, verificar que no esté en uso
            if (data.email && data.email !== existingUser.email) {
                const emailExists = await database_1.prisma.user.findUnique({
                    where: { email: data.email }
                });
                if (emailExists) {
                    throw new Error('El email ya está en uso');
                }
            }
            // Actualizar el usuario
            const updatedUser = await database_1.prisma.user.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date()
                },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return updatedUser;
        }
        catch (error) {
            throw new Error(`Error al actualizar perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },
    // Cambiar contraseña
    async changePassword(id, data) {
        try {
            // Buscar el usuario
            const user = await database_1.prisma.user.findUnique({
                where: { id }
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            if (!user.isActive) {
                throw new Error('La cuenta ha sido desactivada');
            }
            // Verificar la contraseña actual
            const isCurrentPasswordValid = await bcrypt_1.default.compare(data.currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                throw new Error('La contraseña actual es incorrecta');
            }
            // Hashear la nueva contraseña
            const hashedNewPassword = await bcrypt_1.default.hash(data.newPassword, SALT_ROUNDS);
            // Actualizar la contraseña
            await database_1.prisma.user.update({
                where: { id },
                data: {
                    password: hashedNewPassword,
                    updatedAt: new Date()
                }
            });
            return { message: 'Contraseña actualizada exitosamente' };
        }
        catch (error) {
            throw new Error(`Error al cambiar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },
    // Eliminar usuario (soft delete)
    async deleteUser(id) {
        try {
            const user = await database_1.prisma.user.findUnique({
                where: { id }
            });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            // Soft delete - marcar como inactivo
            await database_1.prisma.user.update({
                where: { id },
                data: {
                    isActive: false,
                    updatedAt: new Date()
                }
            });
            return { message: 'Usuario eliminado exitosamente' };
        }
        catch (error) {
            throw new Error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },
    // Obtener todos los usuarios 
    async getAllUsers(params = {}) {
        try {
            const where = {
                isActive: true
            };
            // Agregar filtro de búsqueda si existe
            if (params.search) {
                where.OR = [
                    { firstName: { contains: params.search, mode: 'insensitive' } },
                    { lastName: { contains: params.search, mode: 'insensitive' } },
                    { email: { contains: params.search, mode: 'insensitive' } }
                ];
            }
            const users = await database_1.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    role: true,
                    isActive: true,
                    emailVerified: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return users;
        }
        catch (error) {
            throw new Error(`Error al obtener usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },
    // Verificar token JWT
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        }
        catch (error) {
            throw new Error('Token inválido');
        }
    }
};
