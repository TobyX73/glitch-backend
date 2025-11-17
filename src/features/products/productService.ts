import { CreateProductInput, ProductsQueryParams, UpdateProductInput, ProductResponse } from "./productTypes";
import { prisma } from "../../config/database";

export const productService = {
  // Crear producto con imágenes y variantes
  async createProduct(data: CreateProductInput): Promise<ProductResponse> {
    try {
      // Verificar que la categoría existe
      const categoryExists = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });

      if (!categoryExists) {
        throw new Error('La categoría especificada no existe');
      }

      // Validar que solo haya una imagen principal
      const mainImages = data.images.filter(img => img.isMain);
      if (mainImages.length > 1) {
        throw new Error('Solo puede haber una imagen principal');
      }

      // Si no hay imagen principal, marcar la primera como principal
      if (mainImages.length === 0 && data.images.length > 0) {
        data.images[0].isMain = true;
      }

      // Validar que no haya tallas duplicadas
      const sizes = data.variants.map(v => v.size);
      const uniqueSizes = new Set(sizes);
      if (sizes.length !== uniqueSizes.size) {
        throw new Error('No puede haber tallas duplicadas');
      }

      // Crear el producto con imágenes y variantes
      const product = await prisma.product.create({
        data: {
          name: data.name,
          description: data.description,
          basePrice: data.basePrice,
          categoryId: data.categoryId,
          isActive: data.isActive ?? true,
          images: {
            create: data.images.map((img, index) => ({
              url: img.url,
              order: img.order ?? index,
              isMain: img.isMain ?? false
            }))
          },
          variants: {
            create: data.variants.map(variant => ({
              size: variant.size,
              stock: variant.stock,
              sku: variant.sku
            }))
          }
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            orderBy: {
              order: 'asc'
            }
          },
          variants: {
            orderBy: {
              size: 'asc'
            }
          }
        }
      });

      return this.formatProductResponse(product);
    } catch (error) {
      throw new Error(`Error al crear el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Obtener producto por ID
  async getProductById(id: number): Promise<ProductResponse | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            orderBy: {
              order: 'asc'
            }
          },
          variants: {
            orderBy: {
              size: 'asc'
            }
          }
        }
      });

      if (!product) {
        return null;
      }

      return this.formatProductResponse(product);
    } catch (error) {
      throw new Error(`Error al obtener producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Obtener todos los productos con filtros
  async getProducts(params: ProductsQueryParams) {
    try {
      const {
        page = 1,
        limit = 12,
        categoryId,
        search,
        minPrice,
        maxPrice,
        isActive = true,
        size
      } = params;

      const skip = (page - 1) * limit;

      // Construir filtros
      const where: any = {
        isActive: isActive
      };

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.basePrice = {};
        if (minPrice !== undefined) {
          where.basePrice.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.basePrice.lte = maxPrice;
        }
      }

      // Si se filtra por talla, buscar productos que tengan esa talla
      if (size) {
        where.variants = {
          some: {
            size: size,
            stock: { gt: 0 } // Solo variantes con stock
          }
        };
      }

      // Obtener productos
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            },
            images: {
              orderBy: {
                order: 'asc'
              }
            },
            variants: {
              orderBy: {
                size: 'asc'
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }),
        prisma.product.count({ where })
      ]);

      const formattedProducts = products.map(product => this.formatProductResponse(product));

      return {
        products: formattedProducts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Actualizar producto
  async updateProduct(id: number, data: UpdateProductInput): Promise<ProductResponse> {
    try {
      const productExists = await prisma.product.findUnique({
        where: { id },
        include: {
          images: true,
          variants: true
        }
      });

      if (!productExists) {
        throw new Error('Producto no encontrado');
      }

      // Si se actualiza la categoría, verificar que existe
      if (data.categoryId && data.categoryId !== productExists.categoryId) {
        const categoryExists = await prisma.category.findUnique({
          where: { id: data.categoryId }
        });

        if (!categoryExists) {
          throw new Error('La categoría especificada no existe');
        }
      }

      // Si se actualizan imágenes, validar imagen principal
      if (data.images) {
        const mainImages = data.images.filter(img => img.isMain);
        if (mainImages.length > 1) {
          throw new Error('Solo puede haber una imagen principal');
        }
        if (mainImages.length === 0 && data.images.length > 0) {
          data.images[0].isMain = true;
        }
      }

      // Si se actualizan variantes, validar tallas duplicadas
      if (data.variants) {
        const sizes = data.variants.map(v => v.size);
        const uniqueSizes = new Set(sizes);
        if (sizes.length !== uniqueSizes.size) {
          throw new Error('No puede haber tallas duplicadas');
        }
      }

      // Actualizar producto
      const product = await prisma.product.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.basePrice && { basePrice: data.basePrice }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          // Si se envían imágenes, eliminar las anteriores y crear las nuevas
          ...(data.images && {
            images: {
              deleteMany: {},
              create: data.images.map((img, index) => ({
                url: img.url,
                order: img.order ?? index,
                isMain: img.isMain ?? false
              }))
            }
          }),
          // Si se envían variantes, eliminar las anteriores y crear las nuevas
          ...(data.variants && {
            variants: {
              deleteMany: {},
              create: data.variants.map(variant => ({
                size: variant.size,
                stock: variant.stock,
                sku: variant.sku
              }))
            }
          })
        },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          images: {
            orderBy: {
              order: 'asc'
            }
          },
          variants: {
            orderBy: {
              size: 'asc'
            }
          }
        }
      });

      return this.formatProductResponse(product);
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Eliminar producto (soft delete)
  async deleteProduct(id: number) {
    try {
      const productExists = await prisma.product.findUnique({
        where: { id }
      });

      if (!productExists) {
        throw new Error('Producto no encontrado');
      }

      await prisma.product.update({
        where: { id },
        data: {
          isActive: false
        }
      });

      return { message: 'Producto eliminado exitosamente' };
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Actualizar stock de una variante específica
  async updateVariantStock(productId: number, size: string, stock: number) {
    try {
      const variant = await prisma.productVariant.findFirst({
        where: {
          productId,
          size
        }
      });

      if (!variant) {
        throw new Error(`Variante con talla ${size} no encontrada`);
      }

      const updatedVariant = await prisma.productVariant.update({
        where: { id: variant.id },
        data: { stock }
      });

      return updatedVariant;
    } catch (error) {
      throw new Error(`Error al actualizar stock: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  },

  // Formatear respuesta del producto
  formatProductResponse(product: any): ProductResponse {
    const totalStock = product.variants?.reduce((sum: number, variant: any) => sum + variant.stock, 0) || 0;
    const mainImage = product.images?.find((img: any) => img.isMain)?.url || product.images?.[0]?.url;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      basePrice: Number(product.basePrice),
      categoryId: product.categoryId,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      category: product.category,
      images: product.images || [],
      variants: product.variants || [],
      totalStock,
      mainImage
    };
  }
};
