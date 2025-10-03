import { MercadoPagoConfig, Payment } from 'mercadopago';
import { prisma } from '../../config/database';
import { productService } from '../products/productService';
import { MercadoPagoWebhookData, WebhookProcessResult, PaymentStatusMapping } from './webhookTypes';

// Configuración de MercadoPago para Payment API
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});

const payment = new Payment(client);

export const webhookService = {
  // Procesar webhook de MercadoPago
  async processWebhook(webhookData: MercadoPagoWebhookData): Promise<WebhookProcessResult> {
    try {
      console.log('Webhook recibido:', JSON.stringify(webhookData, null, 2));

      if (webhookData.type === 'payment') {
        const paymentId = webhookData.data?.id;
        
        if (!paymentId) {
          throw new Error('Payment ID no encontrado en webhook');
        }

        // Obtener detalles del pago desde MercadoPago
        let paymentDetails;
        try {
          paymentDetails = await payment.get({ id: paymentId });
          console.log('Detalles del pago obtenidos:', paymentDetails);

        } catch (mpError) {
          console.error('Error obteniendo detalles del pago de MP:', mpError);
          throw new Error(`Error consultando pago en MercadoPago: ${mpError}`);
        }

        // Usar external_reference para encontrar la orden
        const externalReference = paymentDetails.external_reference || webhookData.external_reference;
        if (!externalReference) {
          throw new Error('External reference no encontrada ni en webhook ni en payment details');
        }

        const order = await prisma.order.findFirst({
          where: { mpExternalReference: externalReference },
          include: { payment: true }
        });

        if (!order) {
          throw new Error(`Orden no encontrada para external reference: ${externalReference}`);
        }

        // Actualizar payment 
        await prisma.payment.update({
          where: { orderId: order.id },
          data: {
            mpPaymentId: paymentDetails.id?.toString(),
            mpStatus: paymentDetails.status || 'unknown',
            mpStatusDetail: paymentDetails.status_detail || undefined,
            mpPaymentType: paymentDetails.payment_type_id || undefined,
            mpInstallments: paymentDetails.installments || undefined,
            webhookData: webhookData,
            status: this.mapMPStatusToPaymentStatus(paymentDetails.status || '') as any,
            updatedAt: new Date()
          }
        });

        // Actualizar orden según el estado del pago
        let newOrderStatus = order.status;
        if (paymentDetails.status === 'approved') {
          newOrderStatus = 'PAID';
          // Reducir stock 
          await productService.reduceStock(order.id);
        } else if (paymentDetails.status === 'rejected' || paymentDetails.status === 'cancelled') {
          newOrderStatus = 'CANCELLED';
        }

        await prisma.order.update({
          where: { id: order.id },
          data: { status: newOrderStatus }
        });

        return { success: true, orderId: order.id, status: newOrderStatus };
      }

      return { success: true, message: 'Webhook procesado' };
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw new Error(`Error procesando webhook: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Mapear estado de MP a estado de pago
  mapMPStatusToPaymentStatus(mpStatus: string): string {
    const statusMap: PaymentStatusMapping = {
      'approved': 'APPROVED',
      'pending': 'PENDING',
      'in_process': 'IN_PROCESS',
      'rejected': 'REJECTED',
      'cancelled': 'CANCELLED',
      'refunded': 'REFUNDED',
      'charged_back': 'CHARGED_BACK',
      'in_mediation': 'IN_MEDIATION'
    };

    return statusMap[mpStatus] || 'PENDING';
  }
};