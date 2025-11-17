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
exports.UpdateOrderStatusDTO = void 0;
const class_validator_1 = require("class-validator");
class UpdateOrderStatusDTO {
}
exports.UpdateOrderStatusDTO = UpdateOrderStatusDTO;
__decorate([
    (0, class_validator_1.IsString)({ message: 'status debe ser un string' }),
    (0, class_validator_1.IsIn)(['PENDING', 'PAYMENT_PENDING', 'PAID', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'], {
        message: 'status debe ser un valor válido'
    }),
    __metadata("design:type", String)
], UpdateOrderStatusDTO.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'notes debe ser un string' }),
    __metadata("design:type", String)
], UpdateOrderStatusDTO.prototype, "notes", void 0);
