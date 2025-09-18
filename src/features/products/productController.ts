import { productService } from "./productService";
import { CreateProductInput, ProductsQueryParams, UpdateProductInput } from "./productTypes";
import { CreateProductDto } from "./DTOs/productCreateDTO";
import { UpdateProductDto } from "./DTOs/productUpdateDTO";
import { UpdateStockDto } from "./DTOs/updateStockDTO";
import { Request, Response } from "express";

export const productController = {

    //Crear producto
    async create(req: Request, res: Response) {
    try {
      // Los datos ya están validados por el middleware DTO
      const data: CreateProductDto = req.body;
      
      // Convertir DTO a formato del servicio
      const productData: CreateProductInput = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock || 0,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId
      };

      const product = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: product
      });

    } catch (error) {
      console.error('Error en create:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  },


    //Trae todos los productos
    async getAll(req: Request, res: Response) {
    try {
      const params: ProductsQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      };

      const result = await productService.getProducts(params);

      res.json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

  // Trae por ID un producto
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      // En caso de que el "id" que traiga no sea un numero, la funcion NaN devuelve un false diciendo que el id no es valido
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID de producto inválido'
        });
      }

      const product = await productService.getProductById(id);

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

    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  },

    // Actualizar producto
    async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID de producto inválido'
        });
      }

      // Los datos ya están validados por el middleware DTO
      const data: UpdateProductDto = req.body;
      
      // Convertir DTO a formato del servicio
      const updateData: UpdateProductInput = {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        imageUrl: data.imageUrl,
        categoryId: data.categoryId
      };

      const product = await productService.updateProduct(id, updateData);

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente',
        data: product
      });

    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  },

  // Eliminar producto
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID de producto inválido'
        });
      }

      await productService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  },

  // Actualizar stock
  async updateStock(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID de producto inválido'
        });
      }

      // Los datos ya están validados por el middleware DTO
      const { stock }: UpdateStockDto = req.body;

      const product = await productService.updateStock(id, stock);

      res.json({
        success: true,
        message: 'Stock actualizado exitosamente',
        data: product
      });

    } catch (error) {
      console.error('Error en updateStock:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error interno del servidor'
      });
    }
  }
};

