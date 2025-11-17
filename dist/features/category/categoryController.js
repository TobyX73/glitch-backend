"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const categoryService_1 = require("./categoryService");
exports.categoryController = {
    // Crear categoría
    async create(req, res) {
        try {
            // Los datos ya están validados por el middleware DTO
            const data = req.body;
            // Convertir DTO a formato del servicio
            const categoryData = {
                name: data.name,
                description: data.description,
                baseWeight: data.baseWeight,
                packageWidth: data.packageWidth,
                packageHeight: data.packageHeight,
                packageLength: data.packageLength
            };
            const category = await categoryService_1.categoryService.createCategory(categoryData);
            res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente',
                data: category
            });
        }
        catch (error) {
            console.error('Error en create category:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    },
    // Trae todas las categorías
    async getAll(req, res) {
        try {
            const params = {
                search: req.query.search,
                isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
            };
            const categories = await categoryService_1.categoryService.getCategories(params);
            res.json({
                success: true,
                data: categories
            });
        }
        catch (error) {
            console.error('Error en getAll categories:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },
    // Trae por ID una categoría
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de categoría inválido'
                });
            }
            const category = await categoryService_1.categoryService.getCategoryById(id);
            if (!category) {
                return res.status(404).json({
                    success: false,
                    error: 'Categoría no encontrada'
                });
            }
            res.json({
                success: true,
                data: category
            });
        }
        catch (error) {
            console.error('Error en getById category:', error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor'
            });
        }
    },
    // Actualizar categoría
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de categoría inválido'
                });
            }
            // Los datos ya están validados por el middleware DTO
            const data = req.body;
            // Convertir DTO a formato del servicio
            const updateData = {
                name: data.name,
                description: data.description,
                baseWeight: data.baseWeight,
                packageWidth: data.packageWidth,
                packageHeight: data.packageHeight,
                packageLength: data.packageLength
            };
            const category = await categoryService_1.categoryService.updateCategory(id, updateData);
            res.json({
                success: true,
                message: 'Categoría actualizada exitosamente',
                data: category
            });
        }
        catch (error) {
            console.error('Error en update category:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    },
    // Eliminar categoría (hard delete)
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de categoría inválido'
                });
            }
            await categoryService_1.categoryService.deleteCategory(id);
            res.json({
                success: true,
                message: 'Categoría eliminada exitosamente'
            });
        }
        catch (error) {
            console.error('Error en delete category:', error);
            // Manejo específico de errores
            if (error instanceof Error) {
                if (error.message.includes('no encontrada')) {
                    return res.status(404).json({
                        success: false,
                        error: error.message
                    });
                }
                if (error.message.includes('productos asociados')) {
                    return res.status(400).json({
                        success: false,
                        error: error.message
                    });
                }
            }
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Error interno del servidor'
            });
        }
    }
};
