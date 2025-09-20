import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { CreateUserInput, UpdateUserInput, LoginInput, ChangePasswordInput, AuthResponse, UserProfile } from './userTypes';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const SALT_ROUNDS = 10;

export const userService = {
  // Registrar nuevo usuario
  async register(data: CreateUserInput): Promise<AuthResponse> {
    try {
      // Verificar si el email ya existe
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

      // Crear el usuario
      const user = await prisma.user.create({
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
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        user,
        token
      };
    } catch (error) {
      throw new Error(`Error al registrar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Iniciar sesión
  async login(data: LoginInput): Promise<AuthResponse> {
    try {
      // Buscar el usuario por email
      const user = await prisma.user.findUnique({
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
      const isPasswordValid = await bcrypt.compare(data.password, user.password);

      if (!isPasswordValid) {
        throw new Error('Credenciales inválidas');
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

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
    } catch (error) {
      throw new Error(`Error al iniciar sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Obtener usuario por ID
  async getUserById(id: number): Promise<UserProfile> {
    try {
      const user = await prisma.user.findUnique({
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

      return user;
    } catch (error) {
      throw new Error(`Error al obtener usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Actualizar perfil de usuario
  async updateProfile(id: number, data: UpdateUserInput): Promise<UserProfile> {
    try {
      // Verificar que el usuario existe
      const existingUser = await prisma.user.findUnique({
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
        const emailExists = await prisma.user.findUnique({
          where: { email: data.email }
        });

        if (emailExists) {
          throw new Error('El email ya está en uso');
        }
      }

      // Actualizar el usuario
      const updatedUser = await prisma.user.update({
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
    } catch (error) {
      throw new Error(`Error al actualizar perfil: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Cambiar contraseña
  async changePassword(id: number, data: ChangePasswordInput): Promise<{ message: string }> {
    try {
      // Buscar el usuario
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      if (!user.isActive) {
        throw new Error('La cuenta ha sido desactivada');
      }

      // Verificar la contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

      if (!isCurrentPasswordValid) {
        throw new Error('La contraseña actual es incorrecta');
      }

      // Hashear la nueva contraseña
      const hashedNewPassword = await bcrypt.hash(data.newPassword, SALT_ROUNDS);

      // Actualizar la contraseña
      await prisma.user.update({
        where: { id },
        data: {
          password: hashedNewPassword,
          updatedAt: new Date()
        }
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (error) {
      throw new Error(`Error al cambiar contraseña: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Eliminar usuario (soft delete)
  async deleteUser(id: number): Promise<{ message: string }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Soft delete - marcar como inactivo
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      return { message: 'Usuario eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar usuario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Obtener todos los usuarios (solo para admin)
  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          isActive: true
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return users;
    } catch (error) {
      throw new Error(`Error al obtener usuarios: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Verificar token JWT
  verifyToken(token: string): { userId: number; email: string; role: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      };
    } catch (error) {
      throw new Error('Token inválido');
    }
  }
};
