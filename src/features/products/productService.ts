import { CreateProductInput, ProductsQueryParams, UpdateProductInput } from "./productTypes";
import { prisma } from "../../config/database";

export const productService = {
  async createProduct(data: CreateProductInput) {
    try {
      // Verificar que la categoría existe
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!categoryExists) {
        throw new Error('La categoría especificada no existe');
      }

      // Crear el producto
      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      return product;
    } catch (error) {
      throw new Error(`Error al crear el producto:`);
    }
  },

  
 //  Actualizar producto 
  async updateProduct(id: number, data: UpdateProductInput) {
    try {
      const productExists = await prisma.product.findUnique({
        where: { id }
      });

      if (!productExists) {
        throw new Error('Producto no encontrado');
      }

      if (data.categoryId && data.categoryId !== productExists.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: data.categoryId }
        });

        if (!categoryExists) {
          throw new Error('La categoría especificada no existe');
        }
      }

      const product = await prisma.product.update({
        where: { id },
        data,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      return {
        ...product,
        price: Number(product.price)
      };
    } catch (error) {
      throw new Error(`Error al actualizar producto`);
    }
  },

  //Eliminar el producto
  async deleteProduct(id: number) {
    try {
      const productExists = await prisma.product.findUnique({
        where: { id }
      });

      if (!productExists) {
        throw new Error('Producto no encontrado');
      }

      const product = await prisma.product.update({
        where: { id },
        data: { 
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      return {
        ...product,
        price: Number(product.price)
      };
    } catch (error) {
      throw new Error(`Error al eliminar producto:`);
    }
  },

  // Actualizar stock
  async updateStock(id: number, newStock: number) {
    try {
      if (newStock < 0) {
        throw new Error('El stock no puede ser negativo');
      }

      const productExists = await prisma.product.findUnique({
        where: { id }
      });

      if (!productExists) {
        throw new Error('Producto no encontrado');
      }

      const product = await prisma.product.update({
        where: { id },
        data: { 
          stock: newStock,
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          stock: true,
          updatedAt: true
        }
      });

      return product;
    } catch (error) {
      throw new Error(`Error al actualizar stock:`);
    }
  },

  // Obtener productos con paginacion y filtros
   async getProducts(params: ProductsQueryParams = {}) {
    try {
      const page = params.page || 1;
      const limit = params.limit || 12;
      const skip = (page - 1) * limit;

      const where: any = {};

      // Filtros que tu frontend puede usar
      if (params.categoryId) {
        where.categoryId = params.categoryId;
      }

      //Filtro para que encuentre por nombre cercano o descripcion
      if (params.search) {
        where.OR = [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } }
        ];
      }

      //Filtro para precio minimo y maximo
      if (params.minPrice || params.maxPrice) {
        where.price = {};
        if (params.minPrice) where.price.gte = params.minPrice;
        if (params.maxPrice) where.price.lte = params.maxPrice;
      }

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: {
              select: {
                id: true,
                name: true,
              }
            }
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.product.count({ where })
      ]);

      const productsFormatted = products.map(product => ({
        ...product,
        price: Number(product.price)
      }));

      return {
        products: productsFormatted,
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
      throw new Error('Error al obtener productos');
    }
  },

  // Obtener producto por ID
  async getProductById(id: number) {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      if (!product) {
        throw new Error('Producto no encontrado');
      }

      return {
        ...product,
        price: Number(product.price)
      };
    } catch (error) {
      throw new Error('Error al obtener producto');
    }
  },
};