// Los datos que se reciben del formulario para crear y actualizar categorías

export interface CreateCategoryInput {
  name: string;
  description?: string;
  baseWeight?: number;
  packageWidth?: number;
  packageHeight?: number;
  packageLength?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  baseWeight?: number;
  packageWidth?: number;
  packageHeight?: number;
  packageLength?: number;
}

// Es lo que devuelve el back al front al crear, actualizar o traer categorías

export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    products: number;
  };
}

export interface CategoriesQueryParams {
  search?: string;
  isActive?: boolean;
}

