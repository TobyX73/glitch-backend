import { IsString, IsOptional, IsBoolean, MinLength, MaxLength, IsNumber, Min } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(500, { message: 'La descripción no puede exceder 500 caracteres' })
  description?: string;

  // Campos de envío
  @IsOptional()
  @IsNumber({}, { message: 'El peso base debe ser un número' })
  @Min(0, { message: 'El peso base no puede ser negativo' })
  baseWeight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El ancho del paquete debe ser un número' })
  @Min(0, { message: 'El ancho del paquete no puede ser negativo' })
  packageWidth?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El alto del paquete debe ser un número' })
  @Min(0, { message: 'El alto del paquete no puede ser negativo' })
  packageHeight?: number;

  @IsOptional()
  @IsNumber({}, { message: 'el largo del paquete debe ser un número' })
  @Min(0, { message: 'El largo del paquete no puede ser negativo' })
  packageLength?: number;
}