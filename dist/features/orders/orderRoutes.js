"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("./orderController");
const authMiddleware_1 = require("../../middlewares/authMiddleware");
const roleMiddleware_1 = require("../../middlewares/roleMiddleware");
const router = (0, express_1.Router)();
// Rutas públicas 
router.post('/checkout', orderController_1.orderController.checkout); // Crear orden desde carrito
router.post('/checkout-complete', orderController_1.orderController.checkoutComplete); // Checkout + preferencia MP
router.post('/test-checkout', orderController_1.orderController.testCheckout); // Test sin validaciones
router.post('/verify-cart', orderController_1.orderController.verifyCart); // Verificar stock del carrito
router.get('/:id', orderController_1.orderController.getById); // Ver orden específica (pública para tracking)
// Rutas de pagos 
router.post('/:id/create-payment', orderController_1.orderController.createPayment); // Crear preferencia de MercadoPago
// Rutas protegidas 
router.use(authMiddleware_1.authMiddleware); // Aplicar middleware a todas las rutas siguientes
// Rutas del usuario autenticado
router.get('/user/my-orders', orderController_1.orderController.getUserOrders); // Órdenes del usuario autenticado
// Rutas solo para administradores
router.get('/', roleMiddleware_1.adminOnly, orderController_1.orderController.getAll); // Todas las órdenes (admin)
router.patch('/:id/status', roleMiddleware_1.adminOnly, orderController_1.orderController.updateStatus); // Actualizar estado (admin)
exports.default = router;
