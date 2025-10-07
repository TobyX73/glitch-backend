
export interface CartItemForDelivery {
  productId: number;
  quantity: number;
  categoryId: number;
}

export interface DeliveryQuoteRequest {
  items: CartItemForDelivery[];
  postalCode: string;
}

export interface DeliveryQuoteResponse {
  success: boolean;
  postalCode: string;
  packaging: {
    peso: number;     // en kg
    alto: number;     // en cm
    ancho: number;    // en cm
    largo: number;    // en cm
  };
  options: {
    domicilio?: {
      precio: number;
      tiempoEntrega: number;
      servicio: string;
      modalidad: string;
    };
    sucursal?: {
      precio: number;
      tiempoEntrega: number;
      servicio: string;
      modalidad: string;
    };
  };
  error?: string;
}

export interface MiCorreoQuoteRequest {
  origen: {
    codigoPostal: string;
    localidad?: string;
  };
  destino: {
    codigoPostal: string;
    localidad?: string;
  };
  paquete: {
    peso: number;        
    alto: number;        
    ancho: number;       
    largo: number;      
    valor?: number;     
  };
  modalidad: 'DOMICILIO' | 'SUCURSAL';
}

export interface MiCorreoQuoteResponse {
  success: boolean;
  cotizacion?: {
    precio: number;
    moneda: string;
    servicio: string;
    tiempoEntrega: number; 
    modalidad: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface MiCorreoBranchRequest {
  codigoPostal: string;
  localidad?: string;
}

export interface MiCorreoBranchResponse {
  success: boolean;
  sucursales?: Array<{
    id: string;
    nombre: string;
    direccion: string;
    localidad: string;
    provincia: string;
    codigoPostal: string;
    telefono?: string;
    horarios?: string;
    latitud?: number;
    longitud?: number;
  }>;
  error?: {
    code: string;
    message: string;
  };
}

// Cache interfaces
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

export interface DeliveryCache {
  quotes: Map<string, CacheEntry<DeliveryQuoteResponse>>;
  branches: Map<string, CacheEntry<MiCorreoBranchResponse>>;
}

export type DeliveryErrorType = 'PACKAGING_ERROR' | 'MICORREO_API_ERROR' | 'VALIDATION_ERROR';