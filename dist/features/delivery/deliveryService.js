"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.deliveryService = void 0;
const database_1 = require("../../config/database");
const postalCodeMappingData = __importStar(require("./data/postalCodeMapping.json"));
const mappingData = postalCodeMappingData;
// RapidAPI Configuration for Correo Argentino
const RAPIDAPI_BASE_URL = 'https://correo-argentino1.p.rapidapi.com';
const RAPIDAPI_HOST = 'correo-argentino1.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPID_API_KEY;
const ORIGIN_POSTAL_CODE = process.env.ORIGIN_POSTAL_CODE;
const CACHE_TTL_QUOTES = 15 * 60 * 1000; // 15 minutos para pedidos
const CACHE_TTL_BRANCHES = 60 * 60 * 1000; // 1 hora para sucursales
class DeliveryServiceClass {
    constructor() {
        this.cache = {
            quotes: new Map(),
            branches: new Map()
        };
    }
    // Headers para RapidAPI
    getRapidAPIHeaders() {
        return {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST
        };
    }
    // Obtener sucursales desde API
    async getBranchesFromAPI(provincia) {
        const cacheKey = `branches_${provincia}`;
        const cached = this.getFromCache(this.cache.branches, cacheKey);
        if (cached) {
            console.log('Sucursales obtenidas del cache');
            return cached;
        }
        console.log(`Obteniendo sucursales para provincia: ${provincia}`);
        try {
            const url = `${RAPIDAPI_BASE_URL}/sucursales`;
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getRapidAPIHeaders()
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const branchResponse = await response.json();
            // Filtrar sucursales por provincia si se especifica y si existen
            if (provincia && branchResponse.sucursales) {
                branchResponse.sucursales = branchResponse.sucursales.filter((sucursal) => sucursal.provincia?.toLowerCase().includes(provincia.toLowerCase()));
            }
            // Guardar en cache
            this.cache.branches.set(cacheKey, {
                data: branchResponse,
                timestamp: Date.now(),
                expiresIn: CACHE_TTL_BRANCHES
            });
            console.log(`Sucursales obtenidas: ${branchResponse.sucursales?.length || 0}`);
            return branchResponse;
        }
        catch (error) {
            console.error('Error obteniendo sucursales:', error);
            throw new Error(`Error de conexión con API de sucursales: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
    // Calcular packaging basado en dimensiones de categorías
    async calculatePackaging(items) {
        console.log('Calculando packaging para items:', items);
        try {
            const products = await database_1.prisma.product.findMany({
                where: {
                    id: { in: items.map(item => item.productId) }
                },
                include: {
                    category: true
                }
            });
            let totalWeight = 0;
            let totalQuantity = 0;
            const heights = [];
            const widths = [];
            const lengths = [];
            for (const item of items) {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    console.warn(`Producto no encontrado: ${item.productId}`);
                    continue;
                }
                const category = product.category;
                // Peso desde categoría (requerido por admin)
                const baseWeight = category?.baseWeight;
                if (!baseWeight) {
                    console.error(`Categoría "${category?.name}" sin baseWeight configurado`);
                    throw new Error(`La categoría "${category?.name}" debe tener peso (baseWeight) configurado`);
                }
                const itemWeight = baseWeight * item.quantity;
                totalWeight += itemWeight;
                totalQuantity += item.quantity;
                // Dimensiones desde categoría (requeridas por admin)
                if (!category?.packageHeight || !category?.packageWidth || !category?.packageLength) {
                    console.error(`Categoría "${category?.name}" sin dimensiones completas`);
                    throw new Error(`La categoría "${category?.name}" debe tener dimensiones (packageHeight, packageWidth, packageLength) configuradas`);
                }
                heights.push(category.packageHeight);
                widths.push(category.packageWidth);
                lengths.push(category.packageLength);
                console.log(`${product.name} x${item.quantity}: ${itemWeight}kg, dimensiones: ${category.packageWidth}×${category.packageHeight}×${category.packageLength}`);
            }
            // Dimensiones máximas (caja que contiene todo)
            let alto = Math.max(...heights, 5); // Mínimo 5cm
            const ancho = Math.max(...widths, 5);
            const largo = Math.max(...lengths, 10);
            // Ajuste inteligente para múltiples items (ropa se apila pero comprime)
            if (totalQuantity > 3) {
                const factor = 1 + (totalQuantity * 0.08); // 8% por item adicional
                alto = Math.ceil(alto * factor);
                // Límite máximo razonable para ropa comprimida
                if (alto > 30) {
                    alto = 30;
                    console.log('Altura ajustada al máximo de 30cm (ropa comprimida)');
                }
            }
            // Packaging adicional (5% del peso para empaque - bolsa/cinta)
            const packagingWeight = totalWeight * 0.05;
            const finalWeight = Math.max(totalWeight + packagingWeight, 0.1); // Mínimo 100g
            const volumen = alto * ancho * largo;
            const result = {
                peso: finalWeight,
                alto,
                ancho,
                largo,
                volumen,
                totalItems: totalQuantity
            };
            console.log('Packaging calculado:', result);
            return result;
        }
        catch (error) {
            console.error('Error calculando packaging:', error);
            // Fallback con valores por defecto
            return {
                peso: 1,
                alto: 10,
                ancho: 30,
                largo: 35,
                volumen: 10500,
                totalItems: 1
            };
        }
    }
    // Mapear código postal a código de provincia usando JSON
    mapPostalCodeToProvinceCode(postalCode) {
        const cp = parseInt(postalCode);
        // Buscar la provincia correspondiente en el archivo de mapeo
        for (const provinceMapping of mappingData.mappings) {
            for (const range of provinceMapping.ranges) {
                if (cp >= range.start && cp <= range.end) {
                    return provinceMapping.code;
                }
            }
        }
        // Si no se encuentra, usar el código por defecto
        console.warn(`Código postal ${postalCode} no reconocido, usando ${mappingData.defaultProvince.code} por defecto`);
        return mappingData.defaultProvince.code;
    }
    // Cotizar con RapidAPI de Correo Argentino (usando endpoint calcularPrecio)
    async quoteWithRapidAPI(cpDestino, provinciaDestino, peso, dimensiones) {
        console.log(`Cotizando envío con RapidAPI:`, {
            origen: ORIGIN_POSTAL_CODE,
            destino: cpDestino,
            provinciaDestino,
            peso,
            dimensiones
        });
        try {
            const url = `${RAPIDAPI_BASE_URL}/calcularPrecio`;
            const requestBody = {
                cpOrigen: ORIGIN_POSTAL_CODE,
                cpDestino: cpDestino,
                provinciaOrigen: 'AR-N', // Asumiendo Misiones como origen por defecto
                provinciaDestino: provinciaDestino,
                peso: peso.toString()
            };
            // Agregar dimensiones si están disponibles
            if (dimensiones) {
                requestBody.alto = dimensiones.alto.toString();
                requestBody.ancho = dimensiones.ancho.toString();
                requestBody.largo = dimensiones.largo.toString();
            }
            console.log('Enviando solicitud de cotización:', requestBody);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    ...this.getRapidAPIHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error HTTP:', response.status, errorText);
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            const quotationData = await response.json();
            console.log('Cotización obtenida exitosamente:', quotationData);
            return quotationData;
        }
        catch (error) {
            console.error('Error llamando a RapidAPI Correo Argentino:', error);
            throw new Error(`Error de conexión con RapidAPI: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
    // Cotizar envío completo
    async quoteDelivery(request) {
        // Verificar cache
        const cacheKey = `quote_${JSON.stringify(request)}`;
        const cached = this.getFromCache(this.cache.quotes, cacheKey);
        if (cached) {
            console.log('Cotización obtenida del cache');
            return cached;
        }
        console.log('Nueva cotización de envío:', request);
        // Calcular packaging
        const packaging = await this.calculatePackaging(request.items);
        // Mapear código postal a provincia
        const provinciaDestino = this.mapPostalCodeToProvinceCode(request.postalCode);
        // UNA SOLA llamada a la API con todos los datos
        const quotationResult = await this.quoteWithRapidAPI(request.postalCode, provinciaDestino, packaging.peso, {
            alto: packaging.alto,
            ancho: packaging.ancho,
            largo: packaging.largo
        });
        const quotationData = quotationResult;
        // La API devuelve la respuesta completa directamente
        const quote = {
            success: true,
            postalCode: request.postalCode,
            packaging,
            // Enviar opciones según lo que devuelva la API
            options: {
                domicilio: quotationData.precioDomicilio ? {
                    precio: quotationData.precioDomicilio,
                    tiempoEntrega: quotationData.diasEstimadosDomicilio || quotationData.diasEstimados || 5,
                    servicio: 'Correo Argentino',
                    modalidad: 'domicilio'
                } : undefined,
                sucursal: quotationData.precioSucursal ? {
                    precio: quotationData.precioSucursal,
                    tiempoEntrega: quotationData.diasEstimadosSucursal || quotationData.diasEstimados || 3,
                    servicio: 'Correo Argentino',
                    modalidad: 'sucursal'
                } : undefined
            },
            // Incluir respuesta completa de la API para debugging
            rawApiResponse: quotationData,
            error: undefined
        };
        // Guardar en cache
        this.cache.quotes.set(cacheKey, {
            data: quote,
            timestamp: Date.now(),
            expiresIn: CACHE_TTL_QUOTES
        });
        console.log('Cotización completada:', quote);
        return quote;
    }
    // Obtener desde cache con verificación de expiración
    getFromCache(cache, key) {
        const entry = cache.get(key);
        if (!entry)
            return null;
        const now = Date.now();
        if (now > entry.timestamp + entry.expiresIn) {
            cache.delete(key);
            return null;
        }
        return entry.data;
    }
    // Limpiar cache expirado
    clearExpiredCache() {
        const now = Date.now();
        for (const [key, entry] of this.cache.quotes.entries()) {
            if (now > entry.timestamp + entry.expiresIn) {
                this.cache.quotes.delete(key);
            }
        }
        for (const [key, entry] of this.cache.branches.entries()) {
            if (now > entry.timestamp + entry.expiresIn) {
                this.cache.branches.delete(key);
            }
        }
    }
    // Estadísticas de cache
    getCacheStats() {
        return {
            quotes: {
                size: this.cache.quotes.size,
                keys: Array.from(this.cache.quotes.keys())
            },
            branches: {
                size: this.cache.branches.size,
                keys: Array.from(this.cache.branches.keys())
            },
            auth: {
                provider: 'RapidAPI',
                configured: !!RAPIDAPI_KEY
            }
        };
    }
}
// Instancia singleton
exports.deliveryService = new DeliveryServiceClass();
// Limpiar cache cada 30 minutos
setInterval(() => {
    exports.deliveryService.clearExpiredCache();
}, 30 * 60 * 1000);
