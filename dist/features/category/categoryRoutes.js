"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("./categoryController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Rutas públicas (lectura)
router.get('/', categoryController_1.categoryController.getAll);
router.get('/:id', categoryController_1.categoryController.getById);
// Rutas protegidas - Solo administradores
router.post('/', authMiddleware_1.authMiddleware, roleMiddleware_1.adminOnly, categoryController_1.categoryController.create);
router.put('/:id', authMiddleware_1.authMiddleware, roleMiddleware_1.adminOnly, categoryController_1.categoryController.update);
router.delete('/:id', authMiddleware_1.authMiddleware, roleMiddleware_1.adminOnly, categoryController_1.categoryController.delete);
exports.default = router;
