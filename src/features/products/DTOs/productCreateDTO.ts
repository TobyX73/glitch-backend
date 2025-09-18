import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl, Min, MinLength, MaxLength, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(1, { message: 'El nombre es requerido' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  description?: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  price!: number;

  @IsOptional()
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock?: number;

  @IsOptional()
  @IsString({ message: 'La URL de imagen debe ser un texto' })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  imageUrl?: string;

  @IsNumber({}, { message: 'La categoría debe ser un número' })
  @IsPositive({ message: 'ID de categoría inválido' })
  categoryId!: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser verdadero o falso' })
  isActive?: boolean;
}
