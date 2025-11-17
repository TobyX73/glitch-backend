"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductDto = exports.ProductVariantDto = exports.ProductImageDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// DTO para imágenes
class ProductImageDto {
}
exports.ProductImageDto = ProductImageDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'La URL de la imagen debe ser un texto' }),
    (0, class_validator_1.IsUrl)({}, { message: 'Debe ser una URL válida' }),
    __metadata("design:type", String)
], ProductImageDto.prototype, "url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El orden debe ser un número' }),
    (0, class_validator_1.Min)(0, { message: 'El orden debe ser mayor o igual a 0' }),
    __metadata("design:type", Number)
], ProductImageDto.prototype, "order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isMain debe ser verdadero o falso' }),
    __metadata("design:type", Boolean)
], ProductImageDto.prototype, "isMain", void 0);
// DTO para variantes (tallas)
class ProductVariantDto {
}
exports.ProductVariantDto = ProductVariantDto;
__decorate([
    (0, class_validator_1.IsIn)(['S', 'M', 'L', 'XL', 'XXL'], { message: 'La talla debe ser S, M, L, XL o XXL' }),
    __metadata("design:type", String)
], ProductVariantDto.prototype, "size", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El stock debe ser un número' }),
    (0, class_validator_1.Min)(0, { message: 'El stock no puede ser negativo' }),
    __metadata("design:type", Number)
], ProductVariantDto.prototype, "stock", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El SKU debe ser un texto' }),
    __metadata("design:type", String)
], ProductVariantDto.prototype, "sku", void 0);
// DTO principal para crear producto
class CreateProductDto {
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser un texto' }),
    (0, class_validator_1.MinLength)(1, { message: 'El nombre es requerido' }),
    (0, class_validator_1.MaxLength)(255, { message: 'El nombre no puede exceder 255 caracteres' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser un texto' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'La descripción no puede exceder 1000 caracteres' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El precio base debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'El precio base debe ser mayor a 0' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "basePrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'La categoría debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'ID de categoría inválido' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'isActive debe ser verdadero o falso' }),
    __metadata("design:type", Boolean)
], CreateProductDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Las imágenes deben ser un array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Debe haber al menos una imagen' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProductImageDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "images", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Las variantes deben ser un array' }),
    (0, class_validator_1.ArrayMinSize)(1, { message: 'Debe haber al menos una variante (talla)' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProductVariantDto),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "variants", void 0);
