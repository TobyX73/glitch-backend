import { MercadoPagoConfig, Preference } from 'mercadopago';
import { prisma } from '../../config/database';
import { CreateOrderInput, OrderResponse, OrdersQueryParams } from './orderTypes';

// Configuración de MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  options: { timeout: 5000 }
});

// URLs separadas para frontend y backend
const frontendURL = process.env.FRONTEND_URL || 'https://www.google.com'; // URL temporal para testing
const backendURL = process.env.BACKEND_URL || 'http://localhost:3000';

const preference = new Preference(client);

export const orderService = {
  // Crear orden desde carrito
  async createOrderFromCart(data: CreateOrderInput): Promise<OrderResponse> {
    try {
      // Verificar stock y obtener productos
      const productIds = data.items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true
        }
      });

      if (products.length !== productIds.length) {
        throw new Error('Algunos productos no están disponibles');
      }

      // Verificar stock
      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Producto con ID ${item.productId} no encontrado`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}. Disponible: ${product.stock}`);
        }
      }

      // Calcular total
      let total = 0;
      for (const item of data.items) {
        const product = products.find(p => p.id === item.productId);
        total += Number(product!.price) * item.quantity;
      }

      // Generar referencia externa única
      const mpExternalReference = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Crear orden en una transacción
      const order = await prisma.$transaction(async (tx) => {
        // Crear la orden con shippingInfo como JSON
        const newOrder = await tx.order.create({
          data: {
            userId: data.userId,
            guestEmail: data.guestEmail,
            guestName: data.guestName,
            total: total,
            status: 'PENDING',
            mpExternalReference,
            notes: data.notes,
            shippingInfo: {
              street: data.shippingAddress.street,
              city: data.shippingAddress.city,
              state: data.shippingAddress.state,
              zipCode: data.shippingAddress.zipCode,
              country: data.shippingAddress.country || 'Argentina'
            }
          }
        });

        // Crear los items de la orden
        const orderItems = await Promise.all(
          data.items.map(item => {
            const product = products.find(p => p.id === item.productId)!;
            return tx.orderItem.create({
              data: {
                orderId: newOrder.id,
                productId: item.productId,
                quantity: item.quantity,
                price: Number(product.price),
                productName: product.name,
                productImage: product.imageUrl
              }
            });
          })
        );

        // Crear registro de pago
        await tx.payment.create({
          data: {
            orderId: newOrder.id,
            amount: total,
            status: 'PENDING'
          }
        });

        return { ...newOrder, items: orderItems };
      });

      return this.formatOrderResponse(order);
    } catch (error) {
      throw new Error(`Error al crear orden: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Crear preferencia de MercadoPago
  async createMercadoPagoPreference(orderId: number) {
    try {
      console.log('🔍 Buscando orden con ID:', orderId);
      
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true
            }
          },
          payment: true,
          user: true
        }
      });

      console.log('📦 Orden encontrada:', order ? 'SÍ' : 'NO');
      if (order) {
        console.log('📊 Detalles de la orden:', {
          id: order.id,
          status: order.status,
          itemsCount: order.items?.length || 0,
          hasUser: !!order.user,
          guestEmail: order.guestEmail
        });
      }

      if (!order) {
        throw new Error('Orden no encontrada');
      }

      if (order.status !== 'PENDING') {
        throw new Error(`La orden no está en estado válido para crear pago. Estado actual: ${order.status}`);
      }

      // Crear items para MercadoPago
      console.log('🛍️ Items de la orden:', order.items);
      
      const items = order.items.map(item => ({
        id: item.productId.toString(),
        title: item.productName,
        quantity: item.quantity,
        unit_price: Number(item.price),
        currency_id: 'ARS',
        picture_url: item.productImage || undefined
      }));

      console.log('💳 Items para MercadoPago:', items);

      // Configurar preferencia
      const preferenceData = {
        items,
        payer: {
          name: order.guestName || `${order.user?.firstName} ${order.user?.lastName}`,
          email: order.guestEmail || order.user?.email
        },
        back_urls: {
          success: `${frontendURL}/orders/${order.id}/success`,
          failure: `${frontendURL}/orders/${order.id}/failure`,
          pending: `${frontendURL}/orders/${order.id}/pending`
        },
        external_reference: order.mpExternalReference!,
        notification_url: `${backendURL}/api/webhooks/mercadopago`,
        statement_descriptor: 'GLITCH-STORE',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      };

      console.log('Configuración de preferencia:', JSON.stringify(preferenceData, null, 2));
      console.log('MP_ACCESS_TOKEN configurado:', !!process.env.MP_ACCESS_TOKEN);
      
      const mpPreference = await preference.create({ body: preferenceData });

      // Actualizar payment con preference ID
      await prisma.payment.update({
        where: { orderId },
        data: {
          mpPreferenceId: mpPreference.id,
          status: 'PENDING'
        }
      });

      // Actualizar orden status
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAYMENT_PENDING' }
      });

      return {
        preferenceId: mpPreference.id,
        initPoint: mpPreference.init_point,
        sandboxInitPoint: mpPreference.sandbox_init_point
      };
    } catch (error) {
      console.error('Error detallado al crear preferencia:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available');
      
      if (error instanceof Error) {
        throw new Error(`Error al crear preferencia de MercadoPago: ${error.message}`);
      }
      
      throw new Error(`Error al crear preferencia de MercadoPago: ${JSON.stringify(error)}`);
    }
  },

  // Obtener orden por ID
  async getOrderById(id: number): Promise<OrderResponse> {
    try {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: {
            include: {
              product: true
            }
          },
          payment: true,
          user: true
        }
      });

      if (!order) {
        throw new Error('Orden no encontrada');
      }

      return this.formatOrderResponse(order);
    } catch (error) {
      throw new Error(`Error al obtener orden: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Obtener órdenes con filtros
  async getOrders(params: OrdersQueryParams = {}) {
    try {
      const page = params.page || 1;
      const limit = params.limit || 12;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (params.status) {
        where.status = params.status;
      }

      if (params.userId) {
        where.userId = params.userId;
      }

      if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) where.createdAt.gte = new Date(params.startDate);
        if (params.endDate) where.createdAt.lte = new Date(params.endDate);
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            items: {
              include: {
                product: true
              }
            },
            payment: true,
            user: true
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.order.count({ where })
      ]);

      const ordersFormatted = orders.map(order => this.formatOrderResponse(order));

      return {
        orders: ordersFormatted,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener órdenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Actualizar estado de orden
  async updateOrderStatus(id: number, status: string, notes?: string) {
    try {
      const order = await prisma.order.update({
        where: { id },
        data: {
          status: status as any,
          notes: notes || undefined,
          updatedAt: new Date()
        },
        include: {
          items: {
            include: {
              product: true
            }
          },
          payment: true,
          user: true
        }
      });

      return this.formatOrderResponse(order);
    } catch (error) {
      throw new Error(`Error al actualizar orden: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Formatear respuesta de orden
  formatOrderResponse(order: any): OrderResponse {
    return {
      id: order.id,
      userId: order.userId,
      guestEmail: order.guestEmail,
      guestName: order.guestName,
      total: Number(order.total),
      status: order.status,
      mpExternalReference: order.mpExternalReference,
      notes: order.notes,
      shippingInfo: order.shippingInfo,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: Number(item.price),
        productName: item.productName,
        productImage: item.productImage
      })) || [],
      payment: order.payment ? {
        id: order.payment.id,
        amount: Number(order.payment.amount),
        status: order.payment.status,
        paymentMethod: order.payment.paymentMethod,
        mpPaymentId: order.payment.mpPaymentId,
        mpPreferenceId: order.payment.mpPreferenceId,
        mpStatus: order.payment.mpStatus,
        createdAt: order.payment.createdAt
      } : undefined
    };
  }
};