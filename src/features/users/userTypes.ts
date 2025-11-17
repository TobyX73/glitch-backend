export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
  };
  token: string;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStatistics {
  totalOrders: number;
  completedOrders: number;
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UserOrderItem {
  productName: string;
  quantity: number;
  size?: string;
  price: number;
}

export interface UserOrderHistory {
  id: number;
  orderNumber: string;
  date: Date;
  status: string;
  total: number;
  items: UserOrderItem[];
}

export interface UserDetailResponse extends UserProfile {
  statistics: UserStatistics;
  address?: UserAddress;
  orderHistory: UserOrderHistory[];
}

export interface GetAllUsersParams {
  search?: string;
}
