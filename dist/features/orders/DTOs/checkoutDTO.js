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
exports.CheckoutDTO = exports.ShippingAddressDTO = exports.CartItemDTO = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CartItemDTO {
}
exports.CartItemDTO = CartItemDTO;
__decorate([
    (0, class_validator_1.IsInt)({ message: 'productId debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'productId debe ser mayor a 0' }),
    __metadata("design:type", Number)
], CartItemDTO.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsInt)({ message: 'quantity debe ser un número entero' }),
    (0, class_validator_1.Min)(1, { message: 'quantity debe ser mayor a 0' }),
    __metadata("design:type", Number)
], CartItemDTO.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'variantId debe ser un número entero' }),
    __metadata("design:type", Number)
], CartItemDTO.prototype, "variantId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'size debe ser un string' }),
    __metadata("design:type", String)
], CartItemDTO.prototype, "size", void 0);
class ShippingAddressDTO {
}
exports.ShippingAddressDTO = ShippingAddressDTO;
__decorate([
    (0, class_validator_1.IsString)({ message: 'street debe ser un string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'street es requerido' }),
    __metadata("design:type", String)
], ShippingAddressDTO.prototype, "street", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'city debe ser un string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'city es requerido' }),
    __metadata("design:type", String)
], ShippingAddressDTO.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'state debe ser un string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'state es requerido' }),
    __metadata("design:type", String)
], ShippingAddressDTO.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'zipCode debe ser un string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'zipCode es requerido' }),
    __metadata("design:type", String)
], ShippingAddressDTO.prototype, "zipCode", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'country debe ser un string' }),
    __metadata("design:type", String)
], ShippingAddressDTO.prototype, "country", void 0);
class CheckoutDTO {
}
exports.CheckoutDTO = CheckoutDTO;
__decorate([
    (0, class_validator_1.IsArray)({ message: 'items debe ser un array' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CartItemDTO),
    __metadata("design:type", Array)
], CheckoutDTO.prototype, "items", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)({ message: 'userId debe ser un número entero' }),
    __metadata("design:type", Number)
], CheckoutDTO.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => !o.userId),
    (0, class_validator_1.IsNotEmpty)({ message: 'guestEmail es requerido para clientes sin cuenta' }),
    (0, class_validator_1.IsEmail)({}, { message: 'guestEmail debe ser un email válido' }),
    __metadata("design:type", String)
], CheckoutDTO.prototype, "guestEmail", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)(o => !o.userId),
    (0, class_validator_1.IsNotEmpty)({ message: 'guestName es requerido para clientes sin cuenta' }),
    (0, class_validator_1.IsString)({ message: 'guestName debe ser un string' }),
    __metadata("design:type", String)
], CheckoutDTO.prototype, "guestName", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ShippingAddressDTO),
    __metadata("design:type", ShippingAddressDTO)
], CheckoutDTO.prototype, "shippingAddress", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'notes debe ser un string' }),
    __metadata("design:type", String)
], CheckoutDTO.prototype, "notes", void 0);
