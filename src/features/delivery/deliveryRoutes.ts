import { Router } from "express";
import { deliveryController } from "./deliveryController";

const router = Router();

// Cotizar envío
router.post('/quote', deliveryController.quoteDelivery);

// Obtener sucursales por provincia (usando service actualizado)
router.get('/branches/:provincia', deliveryController.getBranches);
router.get('/branches', deliveryController.getBranches);


// Test de packaging 
router.post('/test/packaging', deliveryController.testPackaging);

// Estadísticas de cache 
router.get('/stats/cache', deliveryController.getCacheStats);

// Limpiar cache manualmente
router.post('/cache/clear', deliveryController.clearCache);

// Test de configuración RapidAPI (debug)
router.get('/rapidapi/config', deliveryController.testRapidAPIConfig);

// Test de RapidAPI completo (debug)
router.post('/rapidapi/test', deliveryController.testRapidAPI);

// Test básico de RapidAPI (debug)
router.get('/rapidapi/test-basic', deliveryController.testRapidAPIBasic);

export default router;