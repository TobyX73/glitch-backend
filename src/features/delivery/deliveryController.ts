import { Request, Response } from 'express';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { deliveryService } from './deliveryService';
import { DeliveryQuoteDTO, BranchesParamsDTO } from './DTOs/deliveryDTO';

export const deliveryController = {

  // Cotizar envío
  async quoteDelivery(req: Request, res: Response) {
    try {
      console.log('Solicitud de cotización recibida:', req.body);

      // Validar datos de entrada con DTO
      const quoteDTO = plainToClass(DeliveryQuoteDTO, req.body);
      const errors = await validate(quoteDTO);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Datos de entrada inválidos',
          errors: errorMessages
        });
      }

      // Convertir DTO a formato del servicio
      const quoteRequest = {
        items: req.body.items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          categoryId: item.categoryId || undefined 
        })),
        postalCode: req.body.postalCode
      };

      // Obtener cotización
      const quote = await deliveryService.quoteDelivery(quoteRequest);

      res.status(200).json({
        success: true,
        message: 'Cotización obtenida exitosamente',
        data: quote
      });
    } catch (error) {
      console.error('Error en cotización:', error);

      res.status(500).json({
        success: false,
        message: 'Error interno al cotizar envío',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Obtener sucursales por código postal
  async getBranches(req: Request, res: Response) {
    try {
      console.log('Solicitud de sucursales para CP:', req.params.postalCode);

      // Validar parámetros
      const paramsDTO = plainToClass(BranchesParamsDTO, req.params);
      const errors = await validate(paramsDTO);

      if (errors.length > 0) {
        const errorMessages = errors.map(error => 
          Object.values(error.constraints || {}).join(', ')
        ).join('; ');
        
        return res.status(400).json({
          success: false,
          message: 'Código postal inválido',
          errors: errorMessages
        });
      }

      const postalCode = req.params.postalCode;

      // Obtener sucursales
      const branches = await deliveryService.getBranches(postalCode);

      res.status(200).json({
        success: true,
        message: `Sucursales encontradas para CP ${postalCode}`,
        data: branches
      });
    } catch (error) {
      console.error('Error obteniendo sucursales:', error);

      res.status(500).json({
        success: false,
        message: 'Error interno al obtener sucursales',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Endpoint de prueba para verificar packaging
  async testPackaging(req: Request, res: Response) {
    try {
      console.log('Test de packaging:', req.body);

      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Items requeridos para test de packaging'
        });
      }

      const packaging = await deliveryService.calculatePackaging(items);

      res.status(200).json({
        success: true,
        message: 'Packaging calculado exitosamente',
        data: {
          items,
          packaging,
          summary: {
            totalWeight: `${packaging.peso} kg`,
            dimensions: `${packaging.ancho} x ${packaging.alto} x ${packaging.largo} cm`,
            volume: `${(packaging.ancho * packaging.alto * packaging.largo / 1000)} litros`
          }
        }
      });
    } catch (error) {
      console.error('Error en test de packaging:', error);

      res.status(500).json({
        success: false,
        message: 'Error en test de packaging',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Estadísticas de cache 
  async getCacheStats(req: Request, res: Response) {
    try {
      const stats = deliveryService.getCacheStats();

      res.status(200).json({
        success: true,
        message: 'Estadísticas de cache obtenidas',
        data: {
          ...stats,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas de cache',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Limpiar cache manualmente
  async clearCache(req: Request, res: Response) {
    try {
      deliveryService.clearExpiredCache();

      res.status(200).json({
        success: true,
        message: 'Cache limpiado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error limpiando cache',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Test de configuración RapidAPI (debug)
  async testRapidAPIConfig(req: Request, res: Response) {
    try {
      deliveryService.testRapidAPIConfig();

      res.status(200).json({
        success: true,
        message: 'Configuración RapidAPI mostrada en consola'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error mostrando configuración',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Test de RapidAPI completo (debug)
  async testRapidAPI(req: Request, res: Response) {
    try {
      // Intentar conectar con RapidAPI
      const result = await deliveryService.testRapidAPI();

      res.status(200).json({
        success: true,
        message: 'Test de RapidAPI completado',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en test de RapidAPI',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Test básico de RapidAPI (debug)
  async testRapidAPIBasic(req: Request, res: Response) {
    try {
      const result = await deliveryService.testRapidAPIBasic();

      res.status(200).json({
        success: true,
        message: 'Test básico de RapidAPI completado',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error en test básico de RapidAPI',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  },

  // Obtener sucursales por provincia (directo)
  async getBranchesByProvince(req: Request, res: Response) {
    try {
      const RAPIDAPI_KEY = process.env.RAPID_API_KEY || '1557f620a2msh3dff353e22c05e0p1ae3acjsnf751e97c7296';
      const provincia = req.params.provincia || 'AR-B';
      
      console.log(`📍 Solicitando sucursales para provincia: ${provincia}`);
      
      const url = `https://correo-argentino1.p.rapidapi.com/obtenerSucursales?provincia=${provincia}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-rapidapi-key': RAPIDAPI_KEY,
          'x-rapidapi-host': 'correo-argentino1.p.rapidapi.com',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const branches = await response.json();
      
      res.status(200).json({
        success: true,
        message: `Sucursales encontradas para provincia ${provincia}`,
        data: branches,
        count: Array.isArray(branches) ? branches.length : 1
      });
      
    } catch (error) {
      console.error('Error obteniendo sucursales por provincia:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno al obtener sucursales',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }
};