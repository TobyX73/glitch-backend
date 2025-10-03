export interface MercadoPagoWebhookData {
  id?: string;
  type?: string;
  data?: {
    id?: string;
  };
  external_reference?: string;
  status?: string;
  status_detail?: string;
  payment_type_id?: string;
  installments?: number;
  [key: string]: any;
}

export interface WebhookProcessResult {
  success: boolean;
  orderId?: number;
  status?: string;
  message?: string;
}

export interface PaymentStatusMapping {
  [key: string]: string;
}