// Interfaces para imágenes de producto
export interface ProductImageInput {
  url: string;
  order?: number;
  isMain?: boolean;
}

export interface ProductImageResponse {
  id: number;
  url: string;
  order: number;
  isMain: boolean;
}

// Interfaces para variantes (tallas)
export interface ProductVariantInput {
  size: string; // "S", "M", "L", "XL", "XXL"
  stock: number;
  sku?: string;
}

export interface ProductVariantResponse {
  id: number;
  size: string;
  stock: number;
  sku: string | null;
}

// Los datos que se reciben del formulario para crear un producto
export interface CreateProductInput {
  name: string;
  description?: string;
  basePrice: number;
  categoryId: number;
  isActive?: boolean;
  images: ProductImageInput[];
  variants: ProductVariantInput[];
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  basePrice?: number;
  categoryId?: number;
  isActive?: boolean;
  images?: ProductImageInput[];
  variants?: ProductVariantInput[];
}

// Es lo que devuelve el back al front al crear, actualizar o traer productos
export interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  categoryId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
  };
  images: ProductImageResponse[];
  variants: ProductVariantResponse[];
  // Campos calculados
  totalStock?: number;
  mainImage?: string;
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  categoryId?: number;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  size?: string; // Filtrar por talla disponible
}