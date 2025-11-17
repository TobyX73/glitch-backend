"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../../config/database");
const orderService_1 = require("./orderService");
const checkoutDTO_1 = require("./DTOs/checkoutDTO");
const updateOrderDTO_1 = require("./DTOs/updateOrderDTO");
exports.orderController = {
    // Crear orden desde carrito (checkout)
    async checkout(req, res) {
        try {
            console.log('Datos recibidos en checkout:', JSON.stringify(req.body, null, 2));
            // Validar datos de entrada con DTO
            const checkoutDTO = (0, class_transformer_1.plainToClass)(checkoutDTO_1.CheckoutDTO, req.body);
            console.log('DTO transformado:', JSON.stringify(checkoutDTO, null, 2));
            const errors = await (0, class_validator_1.validate)(checkoutDTO);
            console.log('Errores de validación:', errors.length);
            if (errors.length > 0) {
                console.log('Detalles de errores:', errors.map(error => ({
                    property: error.property,
                    value: error.value,
                    constraints: error.constraints,
                    children: error.children
                })));
                const errorMessages = errors.map(error => {
                    const constraints = error.constraints || {};
                    const childErrors = error.children?.map(child => Object.values(child.constraints || {}).join(', ')).join(', ') || '';
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
            const order = await orderService_1.orderService.createOrderFromCart(req.body);
            res.status(201).json({
                success: true,
                message: 'Orden creada exitosamente',
                data: order
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear orden'
            });
        }
    },
    // Crear preferencia de MercadoPago para una orden
    async createPayment(req, res) {
        try {
            const orderId = parseInt(req.params.id);
            if (isNaN(orderId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de orden inválido'
                });
            }
            const paymentPreference = await orderService_1.orderService.createMercadoPagoPreference(orderId);
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al crear preferencia de pago'
            });
        }
    },
    // Obtener orden por ID
    async getById(req, res) {
        try {
            const orderId = parseInt(req.params.id);
            if (isNaN(orderId)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de orden inválido'
                });
            }
            const order = await orderService_1.orderService.getOrderById(orderId);
            res.status(200).json({
                success: true,
                message: 'Orden obtenida exitosamente',
                data: order
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener orden'
            });
        }
    },
    // Obtener órdenes con filtros (admin o usuario específico)
    async getAll(req, res) {
        try {
            const userId = req.user?.userId;
            const userRole = req.user?.role;
            // Construir parámetros de consulta
            const queryParams = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 12,
                status: req.query.status,
                startDate: req.query.startDate,
                endDate: req.query.endDate
            };
            // Si no es admin, solo puede ver sus propias órdenes
            if (userRole !== 'admin') {
                queryParams.userId = userId;
            }
            else if (req.query.userId) {
                queryParams.userId = parseInt(req.query.userId);
            }
            const result = await orderService_1.orderService.getOrders(queryParams);
            res.status(200).json({
                success: true,
                message: 'Órdenes obtenidas exitosamente',
                data: result.orders,
                pagination: result.pagination
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener órdenes'
            });
        }
    },
    // Obtener órdenes de un usuario específico (para usuarios autenticados)
    async getUserOrders(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            const queryParams = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 12,
                status: req.query.status,
                userId: userId
            };
            const result = await orderService_1.orderService.getOrders(queryParams);
            res.status(200).json({
                success: true,
                message: 'Órdenes del usuario obtenidas exitosamente',
                data: result.orders,
                pagination: result.pagination
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al obtener órdenes del usuario'
            });
        }
    },
    // Actualizar estado de orden (solo admin)
    async updateStatus(req, res) {
        try {
            const userRole = req.user?.role;
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
            const updateStatusDTO = (0, class_transformer_1.plainToClass)(updateOrderDTO_1.UpdateOrderStatusDTO, req.body);
            const errors = await (0, class_validator_1.validate)(updateStatusDTO);
            if (errors.length > 0) {
                const errorMessages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errorMessages
                });
            }
            const updatedOrder = await orderService_1.orderService.updateOrderStatus(orderId, req.body.status, req.body.notes);
            res.status(200).json({
                success: true,
                message: 'Estado de orden actualizado exitosamente',
                data: updatedOrder
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al actualizar estado de orden'
            });
        }
    },
    // Verificar stock antes del checkout
    async verifyCart(req, res) {
        try {
            const { items } = req.body;
            if (!items || !Array.isArray(items)) {
                return res.status(400).json({
                    success: false,
                    message: 'Items del carrito son requeridos'
                });
            }
            const productIds = items.map((item) => item.productId);
            const products = await database_1.prisma.product.findMany({
                where: {
                    id: { in: productIds },
                    isActive: true
                },
                include: {
                    variants: true
                }
            });
            const verification = items.map((item) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    return {
                        productId: item.productId,
                        available: false,
                        message: 'Producto no encontrado o inactivo'
                    };
                }
                // Si se indicó variante (variantId o size), verificar stock de la variante
                let variant = null;
                if (item.variantId) {
                    variant = product.variants.find((v) => v.id === item.variantId);
                }
                else if (item.size) {
                    variant = product.variants.find((v) => v.size === item.size);
                }
                if (variant) {
                    if (variant.stock < item.quantity) {
                        return {
                            productId: item.productId,
                            variantId: variant.id,
                            size: variant.size,
                            available: false,
                            message: `Stock insuficiente. Disponible: ${variant.stock}`,
                            availableStock: variant.stock
                        };
                    }
                    return {
                        productId: item.productId,
                        variantId: variant.id,
                        size: variant.size,
                        available: true,
                        message: 'Disponible',
                        currentPrice: Number(product.basePrice),
                        availableStock: variant.stock
                    };
                }
                // Si no hay variante indicada, mostramos stock total sumando variantes
                const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                if (totalStock < item.quantity) {
                    return {
                        productId: item.productId,
                        available: false,
                        message: `Stock insuficiente. Total disponible (todas las variantes): ${totalStock}`,
                        availableStock: totalStock
                    };
                }
                return {
                    productId: item.productId,
                    available: true,
                    message: 'Disponible (por variantes)',
                    currentPrice: Number(product.basePrice),
                    availableStock: totalStock
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error al verificar carrito'
            });
        }
    },
    // Endpoint para checkout completo (crear orden + preferencia MP)
    async checkoutComplete(req, res) {
        try {
            // Validar datos de entrada con DTO
            const checkoutDTO = (0, class_transformer_1.plainToClass)(checkoutDTO_1.CheckoutDTO, req.body);
            const errors = await (0, class_validator_1.validate)(checkoutDTO);
            if (errors.length > 0) {
                const errorMessages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errorMessages
                });
            }
            // Crear orden
            const order = await orderService_1.orderService.createOrderFromCart(req.body);
            // Crear preferencia de MercadoPago
            const paymentPreference = await orderService_1.orderService.createMercadoPagoPreference(order.id);
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
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Error en checkout completo'
            });
        }
    },
    // Test checkout sin validaciones (para debugging)
    async testCheckout(req, res) {
        try {
            console.log('TEST CHECKOUT - Datos recibidos:', JSON.stringify(req.body, null, 2));
            res.status(200).json({
                success: true,
                message: 'Test exitoso - datos recibidos correctamente',
                receivedData: req.body
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error en test checkout',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
};
