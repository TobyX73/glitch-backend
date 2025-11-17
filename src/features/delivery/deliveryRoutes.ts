import { Router } from "express";
import { deliveryController } from "./deliveryController";

const router = Router();

// Cotizar envío
router.post('/quote', deliveryController.quoteDelivery);

// Obtener sucursales por provincia
router.get('/branches/:provincia', deliveryController.getBranches);
router.get('/branches', deliveryController.getBranches);

// Estadísticas de cache
router.get('/stats/cache', deliveryController.getCacheStats);

// Limpiar cache manualmente
router.post('/cache/clear', deliveryController.clearCache);

// Calcular precio de envío por código postal
router.post('/calculate-price', deliveryController.calculateShippingPrice);

export default router;