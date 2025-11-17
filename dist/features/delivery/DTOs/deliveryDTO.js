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
exports.BranchesParamsDTO = exports.DeliveryQuoteDTO = exports.CartItemForDeliveryDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CartItemForDeliveryDTO {
}
exports.CartItemForDeliveryDTO = CartItemForDeliveryDTO;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'productId debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'productId debe ser mayor a 0' }),
    __metadata("design:type", Number)
], CartItemForDeliveryDTO.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'quantity debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'quantity debe ser mayor a 0' }),
    __metadata("design:type", Number)
], CartItemForDeliveryDTO.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'categoryId debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'categoryId debe ser mayor a 0' }),
    __metadata("design:type", Number)
], CartItemForDeliveryDTO.prototype, "categoryId", void 0);
class DeliveryQuoteDTO {
}
exports.DeliveryQuoteDTO = DeliveryQuoteDTO;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'items debe ser un array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CartItemForDeliveryDTO),
    __metadata("design:type", Array)
], DeliveryQuoteDTO.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'postalCode debe ser un string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'postalCode es requerido' }),
    (0, class_validator_1.Matches)(/^\d{4}$/, { message: 'postalCode debe ser un código postal argentino válido (4 dígitos)' }),
    __metadata("design:type", String)
], DeliveryQuoteDTO.prototype, "postalCode", void 0);
class BranchesParamsDTO {
}
exports.BranchesParamsDTO = BranchesParamsDTO;
__decorate([
    (0, class_validator_1.IsString)({ message: 'postalCode debe ser un string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'postalCode es requerido' }),
    (0, class_validator_1.Matches)(/^\d{4}$/, { message: 'postalCode debe ser un código postal argentino válido (4 dígitos)' }),
    __metadata("design:type", String)
], BranchesParamsDTO.prototype, "postalCode", void 0);
