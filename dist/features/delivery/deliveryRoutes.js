"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deliveryController_1 = require("./deliveryController");
const router = (0, express_1.Router)();
// Cotizar envío
router.post('/quote', deliveryController_1.deliveryController.quoteDelivery);
// Obtener sucursales por provincia
router.get('/branches/:provincia', deliveryController_1.deliveryController.getBranches);
router.get('/branches', deliveryController_1.deliveryController.getBranches);
// Estadísticas de cache
router.get('/stats/cache', deliveryController_1.deliveryController.getCacheStats);
// Limpiar cache manualmente
router.post('/cache/clear', deliveryController_1.deliveryController.clearCache);
// Calcular precio de envío por código postal
router.post('/calculate-price', deliveryController_1.deliveryController.calculateShippingPrice);
exports.default = router;
