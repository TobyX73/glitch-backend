import { IsString, IsOptional, IsEmail } from 'class-validator';

export class UpdateUserDTO {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un string' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'El apellido debe ser un string' })
  lastName?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un email válido' })
  email?: string;
}
