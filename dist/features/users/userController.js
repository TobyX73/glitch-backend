"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const userService_1 = require("./userService");
const createUsersDTO_1 = require("./DTOs/createUsersDTO");
const updateUsersDTO_1 = require("./DTOs/updateUsersDTO");
exports.userController = {
    // Registrar nuevo usuario
    async register(req, res) {
        try {
            // Validar datos de entrada con DTO
            const createUserDTO = (0, class_transformer_1.plainToClass)(createUsersDTO_1.CreateUserDTO, req.body);
            const errors = await (0, class_validator_1.validate)(createUserDTO);
            if (errors.length > 0) {
                const errorMessages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errorMessages
                });
            }
            // Registrar usuario
            const result = await userService_1.userService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al registrar usuario'
            });
        }
    },
    // Iniciar sesión
    async login(req, res) {
        try {
            // Validar datos de entrada con DTO
            const loginDTO = (0, class_transformer_1.plainToClass)(createUsersDTO_1.LoginDTO, req.body);
            const errors = await (0, class_validator_1.validate)(loginDTO);
            if (errors.length > 0) {
                const errorMessages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errorMessages
                });
            }
            // Iniciar sesión
            const result = await userService_1.userService.login(req.body);
            res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al iniciar sesión'
            });
        }
    },
    // Obtener perfil del usuario autenticado
    async getProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            const user = await userService_1.userService.getUserById(userId);
            res.status(200).json({
                success: true,
                message: 'Perfil obtenido exitosamente',
                data: user
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener perfil'
            });
        }
    },
    // Actualizar perfil del usuario autenticado
    async updateProfile(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            // Validar datos de entrada con DTO
            const updateUserDTO = (0, class_transformer_1.plainToClass)(updateUsersDTO_1.UpdateUserDTO, req.body);
            const errors = await (0, class_validator_1.validate)(updateUserDTO);
            if (errors.length > 0) {
                const errorMessages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errorMessages
                });
            }
            const updatedUser = await userService_1.userService.updateProfile(userId, req.body);
            res.status(200).json({
                success: true,
                message: 'Perfil actualizado exitosamente',
                data: updatedUser
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al actualizar perfil'
            });
        }
    },
    // Cambiar contraseña
    async changePassword(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            // Validar datos de entrada con DTO
            const changePasswordDTO = (0, class_transformer_1.plainToClass)(createUsersDTO_1.ChangePasswordDTO, req.body);
            const errors = await (0, class_validator_1.validate)(changePasswordDTO);
            if (errors.length > 0) {
                const errorMessages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errorMessages
                });
            }
            const result = await userService_1.userService.changePassword(userId, req.body);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al cambiar contraseña'
            });
        }
    },
    // Eliminar cuenta del usuario autenticado
    async deleteAccount(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            const result = await userService_1.userService.deleteUser(userId);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al eliminar cuenta'
            });
        }
    },
    // Obtener usuario por ID (solo para admin)
    async getUserById(req, res) {
        try {
            const userRole = req.user?.role;
            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Solo administradores'
                });
            }
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }
            const user = await userService_1.userService.getUserById(userId);
            res.status(200).json({
                success: true,
                message: 'Usuario obtenido exitosamente',
                data: user
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener usuario'
            });
        }
    },
    // Obtener todos los usuarios 
    async getAllUsers(req, res) {
        try {
            const userRole = req.user?.role;
            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Solo administradores'
                });
            }
            const search = req.query.search;
            const users = await userService_1.userService.getAllUsers({ search });
            res.status(200).json({
                success: true,
                message: 'Usuarios obtenidos exitosamente',
                data: users
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener usuarios'
            });
        }
    },
    // Eliminar usuario por ID 
    async deleteUserById(req, res) {
        try {
            const userRole = req.user?.role;
            const currentUserId = req.user?.userId;
            if (userRole !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Acceso denegado. Solo administradores'
                });
            }
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }
            // Evitar que el admin se elimine a sí mismo
            if (userId === currentUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes eliminar tu propia cuenta'
                });
            }
            const result = await userService_1.userService.deleteUser(userId);
            res.status(200).json({
                success: true,
                message: result.message
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al eliminar usuario'
            });
        }
    }
};
