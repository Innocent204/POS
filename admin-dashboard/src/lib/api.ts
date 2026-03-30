import axios from 'axios';
import {
  LoginRequest,
  AuthResponse,
  ApiResponse,
  DashboardSummaryResponse,
  ProductResponse,
  PagedResponse,
  BranchResponse,
  StockLevelResponse,
  SaleResponse,
  TransferResponse,
  UserResponse,
  AlertResponse,
  TopProductResponse,
  StockMovementReport,
  CreateProductRequest,
  UpdateProductRequest,
  CreateBranchRequest,
  UpdateBranchRequest,
  CreateTransferRequest,
  StockAdjustmentRequest,
  CreateUserRequest,
  BranchStockSummary,
  AuditLogResponse,
  CreateSaleRequest
} from '@/types';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    login: (data: LoginRequest) =>
      apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data).then(res => res.data),
  },

  dashboard: {
    getSummary: () =>
      apiClient.get<ApiResponse<DashboardSummaryResponse>>('/dashboard/summary').then(res => res.data),
    getAlerts: () =>
      apiClient.get<ApiResponse<AlertResponse[]>>('/dashboard/alerts').then(res => res.data),
    getTopProducts: (params?: { branchId?: string; days?: number; limit?: number }) =>
      apiClient.get<ApiResponse<TopProductResponse[]>>('/dashboard/top-products', { params }).then(res => res.data),
    getBranchComparison: () =>
      apiClient.get<ApiResponse<BranchStockSummary[]>>('/dashboard/branch-comparison').then(res => res.data),
  },

  products: {
    getAll: (params?: { search?: string; category?: string; page?: number; size?: number }) =>
      apiClient.get<ApiResponse<PagedResponse<ProductResponse>>>('/products', { params }).then(res => res.data),
    getById: (id: string) =>
      apiClient.get<ApiResponse<ProductResponse>>(`/products/${id}`).then(res => res.data),
    create: (data: CreateProductRequest) =>
      apiClient.post<ApiResponse<ProductResponse>>('/products', data).then(res => res.data),
    update: (id: string, data: UpdateProductRequest) =>
      apiClient.put<ApiResponse<ProductResponse>>(`/products/${id}`, data).then(res => res.data),
    delete: (id: string) =>
      apiClient.delete<ApiResponse<Record<string, never>>>(`/products/${id}`).then(res => res.data),
  },

  branches: {
    getAll: (params?: { type?: 'WAREHOUSE' | 'SHOP' }) =>
      apiClient.get<ApiResponse<BranchResponse[]>>('/branches', { params }).then(res => res.data),
    getById: (id: string) =>
      apiClient.get<ApiResponse<BranchResponse>>(`/branches/${id}`).then(res => res.data),
    create: (data: CreateBranchRequest) =>
      apiClient.post<ApiResponse<BranchResponse>>('/branches', data).then(res => res.data),
    update: (id: string, data: UpdateBranchRequest) =>
      apiClient.put<ApiResponse<BranchResponse>>(`/branches/${id}`, data).then(res => res.data),
    delete: (id: string) =>
      apiClient.delete<ApiResponse<Record<string, never>>>(`/branches/${id}`).then(res => res.data),
  },

  stock: {
    getByBranch: (branchId: string) =>
      apiClient.get<ApiResponse<StockLevelResponse[]>>(`/stock/branch/${branchId}`).then(res => res.data),
    getByProduct: (productId: string) =>
      apiClient.get<ApiResponse<StockLevelResponse[]>>(`/stock/product/${productId}`).then(res => res.data),
    adjust: (data: StockAdjustmentRequest) =>
      apiClient.post<ApiResponse<StockLevelResponse>>('/stock/adjust', data).then(res => res.data),
    initialize: (params: { branchId: string; productId: string; initialQuantity: number }) =>
      apiClient.post<ApiResponse<StockLevelResponse>>('/stock/initialize', null, { params }).then(res => res.data),
    getLowStock: () =>
      apiClient.get<ApiResponse<StockLevelResponse[]>>('/stock/low-stock').then(res => res.data),
    getOutOfStock: () =>
      apiClient.get<ApiResponse<StockLevelResponse[]>>('/stock/out-of-stock').then(res => res.data),
  },

  sales: {
    getAll: (params?: { branchId?: string; cashierId?: string; from?: string; to?: string; page?: number; size?: number }) =>
      apiClient.get<ApiResponse<PagedResponse<SaleResponse>>>('/sales', { params }).then(res => res.data),
    getById: (id: string) =>
      apiClient.get<ApiResponse<SaleResponse>>(`/sales/${id}`).then(res => res.data),
    getByReceipt: (receiptNumber: string) =>
      apiClient.get<ApiResponse<SaleResponse>>(`/sales/receipt/${receiptNumber}`).then(res => res.data),
    getReturns: (id: string) =>
      apiClient.get<ApiResponse<any[]>>(`/sales/${id}/returns`).then(res => res.data),
    create: (data: CreateSaleRequest) =>
      apiClient.post<ApiResponse<SaleResponse>>('/sales', data).then(res => res.data),
  },

  transfers: {
    getAll: (params?: { status?: string; branchId?: string; page?: number; size?: number }) =>
      apiClient.get<ApiResponse<PagedResponse<TransferResponse>>>('/transfers', { params }).then(res => res.data),
    getById: (id: string) =>
      apiClient.get<ApiResponse<TransferResponse>>(`/transfers/${id}`).then(res => res.data),
    create: (data: CreateTransferRequest) =>
      apiClient.post<ApiResponse<TransferResponse>>('/transfers', data).then(res => res.data),
    dispatch: (id: string) =>
      apiClient.put<ApiResponse<TransferResponse>>(`/transfers/${id}/dispatch`).then(res => res.data),
    receive: (id: string, data: { items: { transferItemId: string; quantityReceived: number }[]; notes?: string }) =>
      apiClient.put<ApiResponse<TransferResponse>>(`/transfers/${id}/receive`, data).then(res => res.data),
    cancel: (id: string) =>
      apiClient.put<ApiResponse<TransferResponse>>(`/transfers/${id}/cancel`).then(res => res.data),
  },

  reports: {
    getStockSnapshot: (params?: { branchId?: string; from?: string; to?: string }) =>
      apiClient.get<ApiResponse<StockMovementReport[]>>('/reports/stock-snapshot', { params }).then(res => res.data),
    getLowStock: (params?: { branchId?: string }) =>
      apiClient.get<ApiResponse<StockMovementReport[]>>('/reports/low-stock', { params }).then(res => res.data),
    getSalesReport: (params?: { branchId?: string; from?: string; to?: string; page?: number; size?: number }) =>
      apiClient.get<ApiResponse<PagedResponse<SaleResponse>>>('/sales', { params: { ...params, size: 500 } }).then(res => {
        const apiRes = res.data;
        if (apiRes.success && apiRes.data) {
          return { ...apiRes, data: apiRes.data.content || [] } as any;
        }
        return apiRes as any;
      }),
  },

  users: {
    getAll: () =>
      apiClient.get<ApiResponse<UserResponse[]>>('/users').then(res => res.data),
    getById: (id: string) =>
      apiClient.get<ApiResponse<UserResponse>>(`/users/${id}`).then(res => res.data),
    create: (data: CreateUserRequest) =>
      apiClient.post<ApiResponse<UserResponse>>('/users', data).then(res => res.data),
    delete: (id: string) =>
      apiClient.delete<ApiResponse<Record<string, never>>>(`/users/${id}`).then(res => res.data),
  },

  audit: {
    getLogs: (params?: { userId?: string; action?: string; entityType?: string; from?: string; to?: string; page?: number; size?: number }) =>
      apiClient.get<ApiResponse<PagedResponse<AuditLogResponse>>>('/audit/logs', { params }).then(res => res.data),
  }
};

export default api;
