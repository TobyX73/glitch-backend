"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhookController_1 = require("./webhookController");
const router = (0, express_1.Router)();
// Webhooks (sin autenticación - para servicios externos)
router.post('/mercadopago', webhookController_1.webhookController.mercadoPago); // Webhook de MercadoPago
router.get('/test', webhookController_1.webhookController.test); // Test webhook
router.post('/test', webhookController_1.webhookController.test); // Test webhook
exports.default = router;
