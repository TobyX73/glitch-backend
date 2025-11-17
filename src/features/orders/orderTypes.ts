export interface CreateOrderInput {
  items: CartItemInput[];
  userId?: number;
  guestEmail?: string;
  guestName?: string;
  shippingAddress: ShippingAddressInput;
  notes?: string;
}

export interface CartItemInput {
  productId: number;
  variantId?: number; // ID de la variante (talla)
  size?: string; // Talla seleccionada
  quantity: number;
  // Nota: El precio se obtiene de la base de datos por seguridad
}

export interface ShippingAddressInput {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface OrderResponse {
  id: number;
  userId?: number;
  guestEmail?: string;
  guestName?: string;
  total: number;
  status: string;
  mpExternalReference?: string;
  notes?: string;
  shippingInfo: any;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItemResponse[];
  payment?: PaymentResponse;
}

export interface OrderItemResponse {
  id: number;
  productId: number;
  variantId?: number;
  size?: string; // Talla del producto comprado
  quantity: number;
  price: number;
  productName: string;
  productImage?: string;
}

export interface PaymentResponse {
  id: number;
  amount: number;
  status: string;
  paymentMethod?: string;
  mpPaymentId?: string;
  mpPreferenceId?: string;
  mpStatus?: string;
  createdAt: Date;
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer?: {
    name?: string;
    email?: string;
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: string;
  external_reference?: string;
  notification_url?: string;
}

export interface MercadoPagoItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
  picture_url?: string;
}

export interface OrdersQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: number;
  startDate?: string;
  endDate?: string;
}