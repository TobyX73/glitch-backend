"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryController = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const deliveryService_1 = require("./deliveryService");
const deliveryDTO_1 = require("./DTOs/deliveryDTO");
exports.deliveryController = {
    // Cotizar envío
    async quoteDelivery(req, res) {
        try {
            console.log('Solicitud de cotización recibida:', req.body);
            // Validar datos de entrada con DTO
            const quoteDTO = (0, class_transformer_1.plainToClass)(deliveryDTO_1.DeliveryQuoteDTO, req.body);
            const errors = await (0, class_validator_1.validate)(quoteDTO);
            if (errors.length > 0) {
                const errorMessages = errors.map(error => Object.values(error.constraints || {}).join(', ')).join('; ');
                return res.status(400).json({
                    success: false,
                    message: 'Datos de entrada inválidos',
                    errors: errorMessages
                });
            }
            // Convertir DTO a formato del servicio
            const quoteRequest = {
                items: req.body.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    categoryId: item.categoryId || undefined
                })),
                postalCode: req.body.postalCode
            };
            // Obtener cotización
            const quote = await deliveryService_1.deliveryService.quoteDelivery(quoteRequest);
            res.status(200).json({
                success: true,
                message: 'Cotización obtenida exitosamente',
                data: quote
            });
        }
        catch (error) {
            console.error('Error en cotización:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno al cotizar envío',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },
    // Obtener sucursales por provincia
    async getBranches(req, res) {
        try {
            const provincia = req.params.provincia || req.query.provincia;
            if (!provincia) {
                return res.status(400).json({
                    success: false,
                    message: 'Provincia es requerida',
                    example: 'GET /api/delivery/branches/Buenos Aires'
                });
            }
            console.log(`Obteniendo sucursales para provincia: ${provincia}`);
            const branches = await deliveryService_1.deliveryService.getBranchesFromAPI(provincia);
            res.status(200).json({
                success: true,
                message: `Sucursales encontradas para ${provincia}`,
                data: branches
            });
        }
        catch (error) {
            console.error('Error obteniendo sucursales:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno al obtener sucursales',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },
    // Estadísticas de cache
    async getCacheStats(req, res) {
        try {
            const cacheStats = deliveryService_1.deliveryService.getCacheStats();
            res.status(200).json({
                success: true,
                message: 'Estadísticas de cache obtenidas',
                data: cacheStats
            });
        }
        catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Error obteniendo estadísticas de cache',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },
    // Limpiar cache manualmente
    async clearCache(req, res) {
        try {
            deliveryService_1.deliveryService.clearExpiredCache();
            res.status(200).json({
                success: true,
                message: 'Cache limpiado exitosamente'
            });
        }
        catch (error) {
            console.error('Error limpiando cache:', error);
            res.status(500).json({
                success: false,
                message: 'Error limpiando cache',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    },
    // Calcular precio de envío por código postal
    async calculateShippingPrice(req, res) {
        try {
            const { cpDestino, peso, alto, ancho, largo } = req.body;
            if (!cpDestino || !peso) {
                return res.status(400).json({
                    success: false,
                    message: 'cpDestino y peso son requeridos',
                    example: {
                        "cpDestino": "1000",
                        "peso": "2.5",
                        "alto": "10",
                        "ancho": "30",
                        "largo": "35"
                    }
                });
            }
            console.log(`Calculando precio para CP: ${cpDestino}, Peso: ${peso}kg, Dimensiones: ${alto}×${ancho}×${largo}`);
            // Mapear código postal a provincia automáticamente
            const provinciaDestino = deliveryService_1.deliveryService.mapPostalCodeToProvinceCode(cpDestino);
            // Preparar dimensiones (opcionales)
            const dimensiones = (alto && ancho && largo) ? {
                alto: parseFloat(alto),
                ancho: parseFloat(ancho),
                largo: parseFloat(largo)
            } : undefined;
            const result = await deliveryService_1.deliveryService.quoteWithRapidAPI(cpDestino, provinciaDestino, parseFloat(peso), dimensiones);
            res.status(200).json({
                success: true,
                message: `Precio calculado para CP ${cpDestino}`,
                input: {
                    cpDestino,
                    peso: `${peso}kg`,
                    dimensiones: dimensiones ? `${dimensiones.alto}×${dimensiones.ancho}×${dimensiones.largo} cm` : 'No especificadas',
                    provinciaDetectada: provinciaDestino
                },
                data: result
            });
        }
        catch (error) {
            console.error('Error calculando precio:', error);
            res.status(500).json({
                success: false,
                message: 'Error calculando precio de envío',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
};
