import { productService } from "./productService";
import { CreateProductInput, ProductsQueryParams } from "./productTypes";
import { Request, Response } from "express";

export const productController = {

    //Crear producto
    async create(req: Request, res: Response) {
    try {
      const data: CreateProductInput = req.body;

      // Validaciones básicas
      if (!data.name || !data.price || !data.categoryId) {
        return res.status(400).json({
          success: false,
          error: 'Nombre, precio y categoría son requeridos'
        });
      }

      if (data.price <= 0) {
        return res.status(400).json({
          success: false,
          error: 'El precio debe ser mayor a 0'
        });
      }

      if (data.stock < 0) {
        return res.status(400).json({
          success: false,
          error: 'El stock no puede ser negativo'
        });
      }

      const product = await productService.createProduct(data);

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



}