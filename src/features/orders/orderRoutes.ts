import { Router } from "express";
import { orderController } from "./orderController";
import { webhookController } from "../webhooks/webhookController";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminOnly } from "../../middlewares/roleMiddleware";

const router = Router();

// Rutas públicas 
router.post('/checkout', orderController.checkout);                    // Crear orden desde carrito
router.post('/checkout-complete', orderController.checkoutComplete);   // Checkout + preferencia MP
router.post('/test-checkout', orderController.testCheckout);           // Test sin validaciones
router.post('/verify-cart', orderController.verifyCart);               // Verificar stock del carrito
router.get('/:id', orderController.getById);                           // Ver orden específica (pública para tracking)

// Rutas de pagos 
router.post('/:id/create-payment', orderController.createPayment);     // Crear preferencia de MercadoPago

// Rutas protegidas 
router.use(authMiddleware); // Aplicar middleware a todas las rutas siguientes

// Rutas del usuario autenticado
router.get('/user/my-orders', orderController.getUserOrders);          // Órdenes del usuario autenticado

// Rutas solo para administradores
router.get('/', adminOnly, orderController.getAll);                    // Todas las órdenes (admin)
router.patch('/:id/status', adminOnly, orderController.updateStatus);  // Actualizar estado (admin)

export default router;