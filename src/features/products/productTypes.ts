// Los datos que se reciben del formulario para crear un producto y actualizarlo

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: number;
}

export interface UpdateProductInput {
  name?: string;     
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  categoryId?: number;
}

// Es lo que devuelve el back al front al crear, actualizar o traer productos

export interface ProductResponse {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
  };
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;        
  categoryId?: number;   
  search?: string;       
  minPrice?: number;     
  maxPrice?: number;     
  isActive?: boolean;   
}