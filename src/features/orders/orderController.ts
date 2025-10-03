import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { prisma } from '../../config/database';
import { orderService } from './orderService';
import { CheckoutDTO } from './DTOs/checkoutDTO';
import { UpdateOrderStatusDTO } from './DTOs/updateOrderDTO';

export const orderController = {
  // Crear orden desde carrito (checkout)
  async checkout(req: Request, res: Response) {
    try {
      console.log('📦 Datos recibidos en checkout:', JSON.stringify(req.body, null, 2));
      
      // Validar datos de entrada con DTO
      const checkoutDTO = plainToClass(CheckoutDTO, req.body);
      console.log('🔄 DTO transformado:', JSON.stringify(checkoutDTO, null, 2));
      
      const errors = await validate(checkoutDTO);
      console.log('🚨 Errores de validación:', errors.length);

      if (errors.length > 0) {
        console.log('❌ Detalles de errores:', errors.map(error => ({
          property: error.property,
          value: error.value,
          constraints: error.constraints,
          children: error.children
        })));

        const errorMessages = errors.map(error => {
          const constraints = error.constraints || {};
          const childErrors = error.children?.map(child => 
            Object.values(child.constraints || {}).join(', ')
          ).join(', ') || '';
          
          return `${error.property}: ${Object.values(constraints).join(', ')}${childErrors ? ` | ${childErrors}` : ''}`;
        }).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errorMessages,
          details: errors
        });
      }

      // Crear orden
      const order = await orderService.createOrderFromCart(req.body);

      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente',
        data: order
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear orden'
      });
    }
  },

  // Crear preferencia de MercadoPago para una orden
  async createPayment(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de orden inválido'
        });
      }

      const paymentPreference = await orderService.createMercadoPagoPreference(orderId);

      res.status(200).json({
        success: true,
        message: 'Preferencia de pago creada exitosamente',
        data: {
          orderId,
          preferenceId: paymentPreference.preferenceId,
          paymentUrl: paymentPreference.initPoint,
          sandboxPaymentUrl: paymentPreference.sandboxInitPoint
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al crear preferencia de pago'
      });
    }
  },

  // Obtener orden por ID
  async getById(req: Request, res: Response) {
    try {
      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de orden inválido'
        });
      }

      const order = await orderService.getOrderById(orderId);

      res.status(200).json({
        success: true,
        message: 'Orden obtenida exitosamente',
        data: order
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener orden'
      });
    }
  },

  // Obtener órdenes con filtros (admin o usuario específico)
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const userRole = (req as any).user?.role;

      // Construir parámetros de consulta
      const queryParams: any = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
        status: req.query.status as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      };

      // Si no es admin, solo puede ver sus propias órdenes
      if (userRole !== 'admin') {
        queryParams.userId = userId;
      } else if (req.query.userId) {
        queryParams.userId = parseInt(req.query.userId as string);
      }

      const result = await orderService.getOrders(queryParams);

      res.status(200).json({
        success: true,
        message: 'Órdenes obtenidas exitosamente',
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener órdenes'
      });
    }
  },

  // Obtener órdenes de un usuario específico (para usuarios autenticados)
  async getUserOrders(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      const queryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
        status: req.query.status as string,
        userId: userId
      };

      const result = await orderService.getOrders(queryParams);

      res.status(200).json({
        success: true,
        message: 'Órdenes del usuario obtenidas exitosamente',
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al obtener órdenes del usuario'
      });
    }
  },

  // Actualizar estado de orden (solo admin)
  async updateStatus(req: Request, res: Response) {
    try {
      const userRole = (req as any).user?.role;

      if (userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acceso denegado. Solo administradores'
        });
      }

      const orderId = parseInt(req.params.id);

      if (isNaN(orderId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de orden inválido'
        });
      }

      // Validar datos de entrada con DTO
      const updateStatusDTO = plainToClass(UpdateOrderStatusDTO, req.body);
      const errors = await validate(updateStatusDTO);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errorMessages
        });
      }

      const updatedOrder = await orderService.updateOrderStatus(
        orderId, 
        req.body.status, 
        req.body.notes
      );

      res.status(200).json({
        success: true,
        message: 'Estado de orden actualizado exitosamente',
        data: updatedOrder
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al actualizar estado de orden'
      });
    }
  },

  // Verificar stock antes del checkout
  async verifyCart(req: Request, res: Response) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Items del carrito son requeridos'
        });
      }

      const productIds = items.map((item: any) => item.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          isActive: true
        }
      });

      const verification = items.map((item: any) => {
        const product = products.find(p => p.id === item.productId);
        
        if (!product) {
          return {
            productId: item.productId,
            available: false,
            message: 'Producto no encontrado o inactivo'
          };
        }

        if (product.stock < item.quantity) {
          return {
            productId: item.productId,
            available: false,
            message: `Stock insuficiente. Disponible: ${product.stock}`,
            availableStock: product.stock
          };
        }

        return {
          productId: item.productId,
          available: true,
          message: 'Disponible',
          currentPrice: Number(product.price),
          availableStock: product.stock
        };
      });

      const allAvailable = verification.every(v => v.available);

      res.status(200).json({
        success: true,
        message: allAvailable ? 'Todos los productos están disponibles' : 'Algunos productos no están disponibles',
        data: {
          allAvailable,
          items: verification
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error al verificar carrito'
      });
    }
  },

  // Endpoint para checkout completo (crear orden + preferencia MP)
  async checkoutComplete(req: Request, res: Response) {
    try {
      // Validar datos de entrada con DTO
      const checkoutDTO = plainToClass(CheckoutDTO, req.body);
      const errors = await validate(checkoutDTO);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errorMessages
        });
      }

      // Crear orden
      const order = await orderService.createOrderFromCart(req.body);

      // Crear preferencia de MercadoPago
      const paymentPreference = await orderService.createMercadoPagoPreference(order.id);

      res.status(201).json({
        success: true,
        message: 'Orden creada y preferencia de pago generada exitosamente',
        data: {
          order,
          payment: {
            preferenceId: paymentPreference.preferenceId,
            paymentUrl: paymentPreference.initPoint,
            sandboxPaymentUrl: paymentPreference.sandboxInitPoint
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Error en checkout completo'
      });
    }
  },

  // Test checkout sin validaciones (para debugging)
  async testCheckout(req: Request, res: Response) {
    try {
      console.log('🧪 TEST CHECKOUT - Datos recibidos:', JSON.stringify(req.body, null, 2));
      
      res.status(200).json({
        success: true,
        message: 'Test exitoso - datos recibidos correctamente',
        receivedData: req.body
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en test checkout',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};