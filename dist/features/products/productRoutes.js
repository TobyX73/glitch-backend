"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("./productController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Rutas públicas (lectura)
router.get('/', productController_1.productController.getAll);
router.get('/:id', productController_1.productController.getById);
// Rutas protegidas - Solo administradores
router.post('/', authMiddleware_1.authMiddleware, roleMiddleware_1.adminOnly, productController_1.productController.create);
router.put('/:id', authMiddleware_1.authMiddleware, roleMiddleware_1.adminOnly, productController_1.productController.update);
router.patch('/:id/stock', authMiddleware_1.authMiddleware, roleMiddleware_1.adminOnly, productController_1.productController.updateStock);
router.delete('/:id', authMiddleware_1.authMiddleware, roleMiddleware_1.adminOnly, productController_1.productController.delete);
exports.default = router;
