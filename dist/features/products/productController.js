"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = void 0;
const productService_1 = require("./productService");
exports.productController = {
    //Crear producto
    async create(req, res) {
        try {
            // Los datos ya están validados por el middleware DTO
            const data = req.body;
            // Convertir DTO a formato del servicio
            const productData = {
                name: data.name,
                description: data.description,
                basePrice: data.basePrice,
                categoryId: data.categoryId,
                isActive: data.isActive,
                images: data.images,
                variants: data.variants
            };
            const product = await productService_1.productService.createProduct(productData);
            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: product
            });
        }
        catch (error) {
            console.error('Error en create:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    },
    //Trae todos los productos
    async getAll(req, res) {
        try {
            const params = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 12,
                categoryId: req.query.categoryId ? parseInt(req.query.categoryId) : undefined,
                search: req.query.search,
                minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
                maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
            };
            const result = await productService_1.productService.getProducts(params);
            res.json({
                success: true,
                data: result.products,
                pagination: result.pagination
            });
        }
        catch (error) {
            console.error('Error en getAll:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },
    // Trae por ID un producto
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            // En caso de que el "id" que traiga no sea un numero, la funcion NaN devuelve un false diciendo que el id no es valido
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de producto inválido'
                });
            }
            const product = await productService_1.productService.getProductById(id);
            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Producto no encontrado'
                });
            }
            res.json({
                success: true,
                data: product
            });
        }
        catch (error) {
            console.error('Error en getById:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },
    // Actualizar producto
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de producto inválido'
                });
            }
            // Los datos ya están validados por el middleware DTO
            const data = req.body;
            // Convertir DTO a formato del servicio
            const updateData = {
                name: data.name,
                description: data.description,
                basePrice: data.basePrice,
                categoryId: data.categoryId,
                isActive: data.isActive,
                images: data.images,
                variants: data.variants
            };
            const product = await productService_1.productService.updateProduct(id, updateData);
            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: product
            });
        }
        catch (error) {
            console.error('Error en update:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    },
    // Eliminar producto
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de producto inválido'
                });
            }
            await productService_1.productService.deleteProduct(id);
            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });
        }
        catch (error) {
            console.error('Error en delete:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    },
    // Actualizar stock
    async updateStock(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { size, stock } = req.body;
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de producto inválido'
                });
            }
            if (!size || stock === undefined) {
                return res.status(400).json({
                    success: false,
                    error: 'Se requiere talla (size) y stock'
                });
            }
            const variant = await productService_1.productService.updateVariantStock(id, size, stock);
            res.json({
                success: true,
                message: 'Stock actualizado exitosamente',
                data: variant
            });
        }
        catch (error) {
            console.error('Error en updateStock:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
};
