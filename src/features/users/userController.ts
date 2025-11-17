import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { userService } from './userService';
import { CreateUserDTO, LoginDTO, ChangePasswordDTO } from './DTOs/createUsersDTO';
import { UpdateUserDTO } from './DTOs/updateUsersDTO';

export const userController = {
  // Registrar nuevo usuario
  async register(req: Request, res: Response) {
    try {
      // Validar datos de entrada con DTO
      const createUserDTO = plainToClass(CreateUserDTO, req.body);
      const errors = await validate(createUserDTO);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errorMessages
        });
      }

      // Registrar usuario
      const result = await userService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al registrar usuario'
      });
    }
  },

  // Iniciar sesión
  async login(req: Request, res: Response) {
    try {
      // Validar datos de entrada con DTO
      const loginDTO = plainToClass(LoginDTO, req.body);
      const errors = await validate(loginDTO);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errorMessages
        });
      }

      // Iniciar sesión
      const result = await userService.login(req.body);

      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al iniciar sesión'
      });
    }
  },

  // Obtener perfil del usuario autenticado
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: 'Perfil obtenido exitosamente',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener perfil'
      });
    }
  },

  // Actualizar perfil del usuario autenticado
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Validar datos de entrada con DTO
      const updateUserDTO = plainToClass(UpdateUserDTO, req.body);
      const errors = await validate(updateUserDTO);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errorMessages
        });
      }

      const updatedUser = await userService.updateProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedUser
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar perfil'
      });
    }
  },

  // Cambiar contraseña
  async changePassword(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Validar datos de entrada con DTO
      const changePasswordDTO = plainToClass(ChangePasswordDTO, req.body);
      const errors = await validate(changePasswordDTO);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errorMessages
        });
      }

      const result = await userService.changePassword(userId, req.body);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al cambiar contraseña'
      });
    }
  },

  // Eliminar cuenta del usuario autenticado
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const result = await userService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar cuenta'
      });
    }
  },

  // Obtener usuario por ID (solo para admin)
  async getUserById(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;

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

      const user = await userService.getUserById(userId);

      res.status(200).json({
        success: true,
        message: 'Usuario obtenido exitosamente',
        data: user
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener usuario'
      });
    }
  },

  // Obtener todos los usuarios 
  async getAllUsers(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;

      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores'
        });
      }

      const search = req.query.search as string | undefined;

      const users = await userService.getAllUsers({ search });

      res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos exitosamente',
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener usuarios'
      });
    }
  },

  // Eliminar usuario por ID 
  async deleteUserById(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;
      const currentUserId = (req as any).user?.userId;

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

      const result = await userService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al eliminar usuario'
      });
    }
  }
};
