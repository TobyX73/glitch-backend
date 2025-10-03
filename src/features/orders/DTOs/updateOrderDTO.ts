import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateOrderStatusDTO {
  @IsString({ message: 'status debe ser un string' })
  @IsIn(['PENDING', 'PAYMENT_PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'], {
    message: 'status debe ser un valor válido'
  })
  status!: string;

  @IsOptional()
  @IsString({ message: 'notes debe ser un string' })
  notes?: string;
}