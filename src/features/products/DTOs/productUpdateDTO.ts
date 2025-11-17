import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl, Min, MinLength, MaxLength, IsPositive, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductImageDto, ProductVariantDto } from './productCreateDTO';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(1, { message: 'El nombre no puede estar vacío' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El precio base debe ser un número' })
  @IsPositive({ message: 'El precio base debe ser mayor a 0' })
  basePrice?: number;

  @IsOptional()
  @IsNumber({}, { message: 'La categoría debe ser un número' })
  @IsPositive({ message: 'ID de categoría inválido' })
  categoryId?: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser verdadero o falso' })
  isActive?: boolean;

  @IsOptional()
  @IsArray({ message: 'Las imágenes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsOptional()
  @IsArray({ message: 'Las variantes deben ser un array' })
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];
}
