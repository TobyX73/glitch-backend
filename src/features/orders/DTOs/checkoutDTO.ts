import { IsArray, IsString, IsEmail, IsOptional, IsInt, Min, ValidateNested, IsNotEmpty, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class CartItemDTO {
  @IsInt({ message: 'productId debe ser un número entero' })
  @Min(1, { message: 'productId debe ser mayor a 0' })
  productId!: number;

  @IsInt({ message: 'quantity debe ser un número entero' })
  @Min(1, { message: 'quantity debe ser mayor a 0' })
  quantity!: number;

  // Se puede enviar `variantId` (id de ProductVariant) o `size` (S,M,L,XL,XXL)
  @IsOptional()
  @IsInt({ message: 'variantId debe ser un número entero' })
  variantId?: number;

  @IsOptional()
  @IsString({ message: 'size debe ser un string' })
  size?: string;

  // Nota: El precio se obtiene de la base de datos por seguridad
  // No se debe confiar en el precio enviado desde el frontend
}

export class ShippingAddressDTO {
  @IsString({ message: 'street debe ser un string' })
  @IsNotEmpty({ message: 'street es requerido' })
  street!: string;

  @IsString({ message: 'city debe ser un string' })
  @IsNotEmpty({ message: 'city es requerido' })
  city!: string;

  @IsString({ message: 'state debe ser un string' })
  @IsNotEmpty({ message: 'state es requerido' })
  state!: string;

  @IsString({ message: 'zipCode debe ser un string' })
  @IsNotEmpty({ message: 'zipCode es requerido' })
  zipCode!: string;

  @IsOptional()
  @IsString({ message: 'country debe ser un string' })
  country?: string;
}

export class CheckoutDTO {
  @IsArray({ message: 'items debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => CartItemDTO)
  items!: CartItemDTO[];

  // Usuario registrado (opcional)
  @IsOptional()
  @IsInt({ message: 'userId debe ser un número entero' })
  userId?: number;

  // Cliente sin cuenta (requerido si no hay userId)
  @ValidateIf(o => !o.userId)
  @IsNotEmpty({ message: 'guestEmail es requerido para clientes sin cuenta' })
  @IsEmail({}, { message: 'guestEmail debe ser un email válido' })
  guestEmail?: string;

  @ValidateIf(o => !o.userId)
  @IsNotEmpty({ message: 'guestName es requerido para clientes sin cuenta' })
  @IsString({ message: 'guestName debe ser un string' })
  guestName?: string;

  @ValidateNested()
  @Type(() => ShippingAddressDTO)
  shippingAddress!: ShippingAddressDTO;

  @IsOptional()
  @IsString({ message: 'notes debe ser un string' })
  notes?: string;
}