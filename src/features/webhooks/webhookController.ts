import { Request, Response } from 'express';
import { webhookService } from './webhookService';

export const webhookController = {
  async mercadoPago(req: Request, res: Response) {
    try {
      console.log('Webhook de MercadoPago recibido:', {
        body: req.body,
        query: req.query,
        headers: req.headers
      });

      // Verificar que es una notificación de payment
      if (req.query.type !== 'payment' && req.body.type !== 'payment') {
        console.log('Webhook ignorado - no es de tipo payment');
        return res.status(200).json({ message: 'Webhook procesado - tipo no relevante' });
      }

      const result = await webhookService.processWebhook(req.body);

      console.log('Webhook procesado exitosamente:', result);

      res.status(200).json({
        success: true,
        message: 'Webhook procesado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error procesando webhook de MercadoPago:', error);
      
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error procesando webhook'
      });
    }
  },

  // Endpoint de prueba para webhooks
  async test(req: Request, res: Response) {
    try {
      console.log('Test webhook recibido:', {
        method: req.method,
        url: req.url,
        body: req.body,
        query: req.query,
        headers: req.headers
      });

      res.status(200).json({
        success: true,
        message: 'Test webhook recibido correctamente',
        data: {
          method: req.method,
          body: req.body,
          query: req.query,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en test webhook'
      });
    }
  }
};