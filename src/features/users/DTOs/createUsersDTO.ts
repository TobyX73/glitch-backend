import { IsEmail, IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDTO {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser un string' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsString({ message: 'El nombre debe ser un string' })
  firstName!: string;

  @IsString({ message: 'El apellido debe ser un string' })
  lastName!: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  phone?: string;

  @IsOptional()
  @IsIn(['user', 'admin'], { message: 'El rol debe ser "user" o "admin"' })
  role?: string;
}

export class LoginDTO {
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email!: string;

  @IsString({ message: 'La contraseña es requerida' })
  password!: string;
}

export class ChangePasswordDTO {
  @IsString({ message: 'La contraseña actual es requerida' })
  currentPassword!: string;

  @IsString({ message: 'La nueva contraseña debe ser un string' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  newPassword!: string;
}
