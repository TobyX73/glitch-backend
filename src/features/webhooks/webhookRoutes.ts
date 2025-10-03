import { Router } from "express";
import { webhookController } from "./webhookController";

const router = Router();

// Webhooks (sin autenticación - para servicios externos)
router.post('/mercadopago', webhookController.mercadoPago);    // Webhook de MercadoPago
router.get('/test', webhookController.test);                  // Test webhook
router.post('/test', webhookController.test);                 // Test webhook

export default router;