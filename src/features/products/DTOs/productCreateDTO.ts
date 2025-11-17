import { IsString, IsNumber, IsOptional, IsBoolean, IsUrl, Min, MinLength, MaxLength, IsPositive, IsArray, ValidateNested, IsIn, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

// DTO para imágenes
export class ProductImageDto {
  @IsString({ message: 'La URL de la imagen debe ser un texto' })
  @IsUrl({}, { message: 'Debe ser una URL válida' })
  url!: string;

  @IsOptional()
  @IsNumber({}, { message: 'El orden debe ser un número' })
  @Min(0, { message: 'El orden debe ser mayor o igual a 0' })
  order?: number;

  @IsOptional()
  @IsBoolean({ message: 'isMain debe ser verdadero o falso' })
  isMain?: boolean;
}

// DTO para variantes (tallas)
export class ProductVariantDto {
  @IsIn(['S', 'M', 'L', 'XL', 'XXL'], { message: 'La talla debe ser S, M, L, XL o XXL' })
  size!: string;

  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock!: number;

  @IsOptional()
  @IsString({ message: 'El SKU debe ser un texto' })
  sku?: string;
}

// DTO principal para crear producto
export class CreateProductDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @MinLength(1, { message: 'El nombre es requerido' })
  @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  description?: string;

  @IsNumber({}, { message: 'El precio base debe ser un número' })
  @IsPositive({ message: 'El precio base debe ser mayor a 0' })
  basePrice!: number;

  @IsNumber({}, { message: 'La categoría debe ser un número' })
  @IsPositive({ message: 'ID de categoría inválido' })
  categoryId!: number;

  @IsOptional()
  @IsBoolean({ message: 'isActive debe ser verdadero o falso' })
  isActive?: boolean;

  @IsArray({ message: 'Las imágenes deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe haber al menos una imagen' })
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images!: ProductImageDto[];

  @IsArray({ message: 'Las variantes deben ser un array' })
  @ArrayMinSize(1, { message: 'Debe haber al menos una variante (talla)' })
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants!: ProductVariantDto[];
}
