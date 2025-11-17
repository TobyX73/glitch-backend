"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("./userController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
router.post('/register', userController_1.userController.register);
router.post('/login', userController_1.userController.login);
router.use(authMiddleware_1.authMiddleware); // Aplicar middleware a todas las rutas siguientes
// Rutas del usuario autenticado
router.get('/profile', userController_1.userController.getProfile);
router.put('/profile', userController_1.userController.updateProfile);
router.patch('/change-password', userController_1.userController.changePassword);
router.delete('/account', userController_1.userController.deleteAccount);
router.get('/', roleMiddleware_1.adminOnly, userController_1.userController.getAllUsers);
router.get('/:id', roleMiddleware_1.adminOnly, userController_1.userController.getUserById);
router.delete('/:id', roleMiddleware_1.adminOnly, userController_1.userController.deleteUserById);
exports.default = router;
