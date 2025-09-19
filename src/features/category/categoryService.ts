import { prisma } from "../../config/database";
import { CreateCategoryInput, UpdateCategoryInput, CategoriesQueryParams } from "./categoryTypes";

//Se crea la Categoria
export const categoryService = {
    async createCategory(data: CreateCategoryInput) {
        try {
            // Verificar que no exista una categoría con el mismo nombre
            const existingCategory = await prisma.category.findFirst({
                where: { 
                    name: {
                        equals: data.name,
                        mode: 'insensitive'
                    }
                }
            });

            if (existingCategory) {
                throw new Error('Ya existe una categoría con ese nombre');
            }

            const category = await prisma.category.create({
                data: {
                    name: data.name,
                    description: data.description,
                }
            });

            return category;

        } catch (error) {
            throw new Error(`Error al crear la categoría:`);
        }
    },

    async getCategories(params: CategoriesQueryParams = {}) {
        try {
            const where: any = {
                isActive: true  // Por defecto solo mostrar categorías activas
            };

            // Solo filtro por búsqueda si se proporciona
            if (params.search) {
                where.OR = [
                    { name: { contains: params.search, mode: 'insensitive' } },
                    { description: { contains: params.search, mode: 'insensitive' } }
                ];
            }

            // Permitir override del filtro isActive si se especifica explícitamente
            if (params.isActive !== undefined) {
                where.isActive = params.isActive;
            }

            const categories = await prisma.category.findMany({
                where,
                include: {
                    _count: {
                        select: { 
                            products: {
                                where: {
                                    isActive: true  // Solo contar productos activos
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    name: 'asc'
                }
            });

            return categories;
        } catch (error) {
            throw new Error('Error al obtener categorías');
        }
    },

    async getCategoryById(id: number) {
        try {
            const category = await prisma.category.findUnique({
                where: { id }
            });

            return category;
        } catch (error) {
            throw new Error('Error al obtener categoría');
        }
    },

    async updateCategory(id: number, data: UpdateCategoryInput) {
        try {
            const categoryExists = await prisma.category.findUnique({
                where: { id }
            });

            if (!categoryExists) {
                throw new Error('Categoría no encontrada');
            }

            // Si se está actualizando el nombre, verificar que no exista otro con el mismo nombre
            if (data.name) {
                const existingCategory = await prisma.category.findFirst({
                    where: { 
                        name: {
                            equals: data.name,
                            mode: 'insensitive'
                        },
                        NOT: { id }
                    }
                });

                if (existingCategory) {
                    throw new Error('Ya existe una categoría con ese nombre');
                }
            }

            const category = await prisma.category.update({
                where: { id },
                data,
                include: {
                    _count: {
                        select: { products: true }
                    }
                }
            });

            return category;
        } catch (error) {
            throw new Error(`Error al actualizar categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    },

    async deleteCategory(id: number) {
        try {
            const categoryExists = await prisma.category.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: { 
                            products: {
                                where: {
                                    isActive: true  // Solo contar productos activos
                                }
                            }
                        }
                    }
                }
            });

            if (!categoryExists) {
                throw new Error('Categoría no encontrada');
            }

            // Verificar si tiene productos ACTIVOS asociados
            if (categoryExists._count.products > 0) {
                throw new Error('No se puede eliminar una categoría que tiene productos activos asociados. Primero elimina todos los productos activos de esta categoría.');
            }

            // Soft delete - marcar como inactiva
            const category = await prisma.category.update({
                where: { id },
                data: { 
                    isActive: false,
                    updatedAt: new Date()
                }
            });

            return category;
        } catch (error) {
            console.error('Error en deleteCategory:', error);
            throw new Error(`Error al eliminar categoría: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }
};