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
exports.CreateCategoryDto = void 0;
const class_validator_1 = require("class-validator");
class CreateCategoryDto {
}
exports.CreateCategoryDto = CreateCategoryDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser un texto' }),
    (0, class_validator_1.MinLength)(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    (0, class_validator_1.MaxLength)(100, { message: 'El nombre no puede exceder 100 caracteres' }),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser un texto' }),
    (0, class_validator_1.MaxLength)(500, { message: 'La descripción no puede exceder 500 caracteres' }),
    __metadata("design:type", String)
], CreateCategoryDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El peso base debe ser un número' }),
    (0, class_validator_1.Min)(0, { message: 'El peso base no puede ser negativo' }),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "baseWeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El ancho del paquete debe ser un número' }),
    (0, class_validator_1.Min)(0, { message: 'El ancho del paquete no puede ser negativo' }),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "packageWidth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El alto del paquete debe ser un número' }),
    (0, class_validator_1.Min)(0, { message: 'El alto del paquete no puede ser negativo' }),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "packageHeight", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'el largo del paquete debe ser un número' }),
    (0, class_validator_1.Min)(0, { message: 'El largo del paquete no puede ser negativo' }),
    __metadata("design:type", Number)
], CreateCategoryDto.prototype, "packageLength", void 0);
