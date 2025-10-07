import { prisma } from '../../config/database';
import {
  DeliveryQuoteRequest,     
  DeliveryQuoteResponse,
  MiCorreoQuoteRequest,
  MiCorreoQuoteResponse,
  MiCorreoBranchRequest,
  MiCorreoBranchResponse,
  DeliveryCache,
  CacheEntry
} from './deliveryTypes';

// RapidAPI Configuration for Correo Argentino
const RAPIDAPI_BASE_URL = 'https://correo-argentino1.p.rapidapi.com';
const RAPIDAPI_HOST = 'correo-argentino1.p.rapidapi.com';
const RAPIDAPI_KEY = process.env.RAPID_API_KEY;
const ORIGIN_POSTAL_CODE = process.env.ORIGIN_POSTAL_CODE; 

const CACHE_TTL_QUOTES = 15 * 60 * 1000; // 15 minutos para pedidos
const CACHE_TTL_BRANCHES = 60 * 60 * 1000; // 1 hora para sucursales

class DeliveryServiceClass {
  private cache: DeliveryCache = {
    quotes: new Map(),
    branches: new Map()
  };

  // Headers para RapidAPI
  private getRapidAPIHeaders() {
    return {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'correo-argentino1.p.rapidapi.com',
      'Accept': 'application/json'
    };
  }

  // Implementar endpoint de sucursales usando RapidAPI
  async getBranches(provincia?: string): Promise<any[]> {
    try {
      console.log('Obteniendo sucursales de Correo Argentino via RapidAPI...');
      
      // Construir URL base
      let url = `${RAPIDAPI_BASE_URL}/obtenerSucursales`;
      
      // Si se proporciona provincia, agregar filtro por provincia
      if (provincia) {
        url += `?provincia=${provincia}`;
        console.log(`Filtrando por provincia ${provincia}`);
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getRapidAPIHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const branches = await response.json() as any[];
      console.log(`Obtenidas ${branches.length} sucursales`);
      
      return branches;
      
    } catch (error) {
      console.error('Error obteniendo sucursales:', error);
      throw new Error(`Error obteniendo sucursales: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  // Lógica de packaging inteligente
  async calculatePackaging(items: Array<{ productId: number; quantity: number }>) {
    const productIds = items.map(item => item.productId);
    
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true
      },
      include: {
        category: true
      }
    });

    if (products.length !== productIds.length) {
      throw new Error('Algunos productos no están disponibles');
    }

    let totalWeight = 0;
    let maxCategory = null;
    let maxVolume = 0;

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }

      const category = product.category;
      
      // Verificar que la categoría tenga datos de envío
      if (!category.baseWeight || !category.packageWidth || 
          !category.packageHeight || !category.packageLength) {
        throw new Error(
          `La categoría "${category.name}" no tiene configurados los datos de envío`
        );
      }

      // Sumar peso total
      totalWeight += category.baseWeight * item.quantity;

      // Encontrar la categoría con mayor volumen para las dimensiones del paquete
      const volume = category.packageWidth * category.packageHeight * category.packageLength;
      if (volume > maxVolume) {
        maxVolume = volume;
        maxCategory = category;
      }
    }

    if (!maxCategory) {
      throw new Error('No se pudieron calcular las dimensiones del paquete');
    }

    return {
      peso: Math.round(totalWeight * 100) / 100, 
      alto: maxCategory.packageHeight!,
      ancho: maxCategory.packageWidth!,
      largo: maxCategory.packageLength!
    };
  }

  // Mapear código postal a código de provincia
  private mapPostalCodeToProvinceCode(postalCode: string): string {
    const cp = parseInt(postalCode);
    
    // Mapeo básico de códigos postales argentinos a códigos de provincia
    if (cp >= 1000 && cp <= 1999) return 'AR-B'; // Buenos Aires
    if (cp >= 2000 && cp <= 2999) return 'AR-S'; // Santa Fe
    if (cp >= 3000 && cp <= 3999) return 'AR-N'; // Misiones/Entre Ríos/Corrientes
    if (cp >= 4000 && cp <= 4999) return 'AR-T'; // Tucumán/Salta/Jujuy
    if (cp >= 5000 && cp <= 5999) return 'AR-X'; // Córdoba
    if (cp >= 6000 && cp <= 6999) return 'AR-L'; // La Pampa
    if (cp >= 7000 && cp <= 7999) return 'AR-B'; // Buenos Aires interior
    if (cp >= 8000 && cp <= 8999) return 'AR-U'; // Chubut/Río Negro
    if (cp >= 9000 && cp <= 9999) return 'AR-Z'; // Santa Cruz/Tierra del Fuego
    
    return 'AR-B'; // Default Buenos Aires
  }

  // Cotizar con RapidAPI de Correo Argentino (usando endpoint calcularPrecio)
  async quoteWithRapidAPI(
    cpDestino: string,
    provinciaDestino: string,
    peso: number
  ) {
    console.log(`Cotizando envío con RapidAPI:`, {
      origen: ORIGIN_POSTAL_CODE,
      destino: cpDestino,
      provinciaDestino,
      peso
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
    } catch (error) {
      console.error('Error llamando a RapidAPI Correo Argentino:', error);
      throw new Error(`Error de conexión con RapidAPI: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }







  // Cotizar envío completo
  async quoteDelivery(request: DeliveryQuoteRequest): Promise<DeliveryQuoteResponse> {
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

    // Cotizar con el nuevo endpoint
    const quotationResult = await this.quoteWithRapidAPI(
      request.postalCode, 
      provinciaDestino, 
      packaging.peso
    );

    // Parsear respuesta de la API
    const apiResponse = quotationResult as any;
    
    const response: DeliveryQuoteResponse = {
      success: true,
      postalCode: request.postalCode,
      packaging,
      options: {
        domicilio: {
          precio: apiResponse.precio || apiResponse.total || 0,
          tiempoEntrega: apiResponse.tiempoEntrega || apiResponse.dias || 0,
          servicio: apiResponse.servicio || 'Correo Argentino',
          modalidad: 'domicilio'
        }
      }
    };

    // Guardar en cache
    this.setCache(this.cache.quotes, cacheKey, response, CACHE_TTL_QUOTES);

    return response;
  }

  // Utilidades de cache
  private getFromCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.timestamp + entry.expiresIn) {
      cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, data: T, ttl: number): void {
    cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn: ttl
    });
  }

  // Limpiar cache expirado
  public clearExpiredCache(): void {
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
  public getCacheStats() {
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

  // Test de configuración RapidAPI
  public testRapidAPIConfig(): void {
    console.log('Configuración RapidAPI:');
    console.log('- RAPIDAPI_KEY:', RAPIDAPI_KEY ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
    console.log('- RAPIDAPI_BASE_URL:', RAPIDAPI_BASE_URL);
    console.log('- RAPIDAPI_HOST:', RAPIDAPI_HOST);
  }

  // Test de RapidAPI completo (para debugging)
  public async testRapidAPI(): Promise<any> {
    const results: any[] = [];
    
    console.log('=== TEST COMPLETO DE RAPIDAPI ===');
    console.log('Variables de entorno:');
    console.log('- RAPIDAPI_KEY:', RAPIDAPI_KEY ? '[CONFIGURADO]' : '[NO CONFIGURADO]');
    console.log('- RAPIDAPI_BASE_URL:', RAPIDAPI_BASE_URL);
    console.log('- ORIGIN_POSTAL_CODE:', ORIGIN_POSTAL_CODE);
    
    // Probar diferentes endpoints
    const testEndpoints = [
      { path: '/sucursales', description: 'Obtener sucursales' },
      { path: '/cotizar?origen=1000&destino=2000&peso=0.5&alto=10&ancho=10&largo=10&modalidad=domicilio', description: 'Cotizar envío' }
    ];
    
    for (const endpoint of testEndpoints) {
      console.log(`\nProbando endpoint: ${endpoint.description}`);
      const fullUrl = `${RAPIDAPI_BASE_URL}${endpoint.path}`;
      console.log(`URL: ${fullUrl}`);
      
      try {
        const response = await fetch(fullUrl, {
          method: 'GET',
          headers: this.getRapidAPIHeaders()
        });
        
        console.log(`Respuesta: ${response.status} ${response.statusText}`);
        
        let responseBody = '';
        try {
          responseBody = await response.text();
          console.log(`Body (primeros 200 chars): ${responseBody.substring(0, 200)}`);
        } catch (e) {
          console.log('No se pudo leer el body');
        }
        
        results.push({
          endpoint: endpoint.description,
          url: fullUrl,
          status: response.status,
          statusText: response.statusText,
          body: responseBody.substring(0, 200),
          success: response.status === 200
        });
        
        if (response.status === 200) {
          console.log('¡ÉXITO! Este endpoint funciona');
        }
        
      } catch (error) {
        console.log(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        results.push({
          endpoint: endpoint.description,
          url: fullUrl,
          error: error instanceof Error ? error.message : 'Error desconocido'
        });
      }
    }
    
    return {
      success: results.some(r => r.success),
      results,
      recommendations: this.getRapidAPIRecommendations(results)
    };
  }
  
  private getRapidAPIRecommendations(results: any[]): string[] {
    const recommendations: string[] = [];
    
    const has401 = results.some(r => r.status === 401);
    const has403 = results.some(r => r.status === 403);
    const has404 = results.some(r => r.status === 404);
    const hasConnError = results.some(r => r.error);
    
    if (has401 || has403) {
      recommendations.push('Clave de RapidAPI incorrecta o sin acceso');
      recommendations.push('Verifica tu X-RapidAPI-Key en el dashboard de RapidAPI');
      recommendations.push('Asegúrate de estar suscrito al API de Correo Argentino');
    }
    
    if (has404) {
      recommendations.push('URL de API incorrecta o endpoint no encontrado');
      recommendations.push('Revisa la documentación de RapidAPI para los endpoints correctos');
    }
    
    if (hasConnError) {
      recommendations.push('Problemas de conectividad');
      recommendations.push('Verifica tu conexión a internet');
    }
    
    if (!RAPIDAPI_KEY) {
      recommendations.push('RAPIDAPI_KEY no está configurada');
      recommendations.push('Agrega RAPIDAPI_KEY a tus variables de entorno');
    }
    
    return recommendations;
  }

  // Test básico de RapidAPI (para debugging)
  public async testRapidAPIBasic(): Promise<any> {
    console.log('=== TEST BÁSICO DE RAPIDAPI ===');
    this.testRapidAPIConfig();
    
    // Primero probar si la API responde
    try {
      console.log('Probando conectividad básica...');
      const testUrl = `${RAPIDAPI_BASE_URL}/sucursales`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: this.getRapidAPIHeaders()
      });
      
      console.log('Respuesta de conectividad:', response.status, response.statusText);
      
      // Intentar leer el body para más información
      const body = await response.text();
      console.log('Body de respuesta (primeros 200 chars):', body.substring(0, 200));
      
      if (response.ok) {
        return {
          success: true,
          status: response.status,
          provider: 'RapidAPI',
          endpoint: testUrl
        };
      } else {
        return {
          success: false,
          status: response.status,
          error: `HTTP ${response.status}: ${response.statusText}`,
          body: body.substring(0, 200)
        };
      }
      
    } catch (error) {
      console.log('Error de conectividad:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }
}

// Instancia singleton
export const deliveryService = new DeliveryServiceClass();

// Limpiar cache cada 30 minutos
setInterval(() => {
  deliveryService.clearExpiredCache();
}, 30 * 60 * 1000);