import { CreateProductInput } from "./productTypes";
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
      throw new error(`Error al crear el producto: ${error.message}`);
    }
  }
};