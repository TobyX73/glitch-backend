import { IsArray, IsString, IsInt, Min, ValidateNested, IsNotEmpty, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemForDeliveryDTO {
  @IsInt({ message: 'productId debe ser un número entero' })
  @Min(1, { message: 'productId debe ser mayor a 0' })
  productId!: number;

  @IsInt({ message: 'quantity debe ser un número entero' })
  @Min(1, { message: 'quantity debe ser mayor a 0' })
  quantity!: number;

  @IsOptional()
  @IsInt({ message: 'categoryId debe ser un número entero' })
  @Min(1, { message: 'categoryId debe ser mayor a 0' })
  categoryId?: number;
}

export class DeliveryQuoteDTO {
  @IsArray({ message: 'items debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CartItemForDeliveryDTO)
  items!: CartItemForDeliveryDTO[];

  @IsString({ message: 'postalCode debe ser un string' })
  @IsNotEmpty({ message: 'postalCode es requerido' })
  @Matches(/^\d{4}$/, { message: 'postalCode debe ser un código postal argentino válido (4 dígitos)' })
  postalCode!: string;
}

export class BranchesParamsDTO {
  @IsString({ message: 'postalCode debe ser un string' })
  @IsNotEmpty({ message: 'postalCode es requerido' })
  @Matches(/^\d{4}$/, { message: 'postalCode debe ser un código postal argentino válido (4 dígitos)' })
  postalCode!: string;
}