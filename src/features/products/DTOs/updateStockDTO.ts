import { IsNumber, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  stock!: number;
}
