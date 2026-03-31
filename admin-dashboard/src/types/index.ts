// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  email: string;
  fullName: string;
  role: string;
}

// User Types
export interface UserResponse {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  assignedBranchId?: string;
  assignedBranchName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// Branch Types
export interface BranchResponse {
  id: string;
  name: string;
  branchType: 'WAREHOUSE' | 'SHOP';
  location?: string;
  managerName?: string;
  contactNumber?: string;
  isActive: boolean;
  createdAt: string;
}

// Product Types
export interface ProductResponse {
  id: string;
  name: string;
  sku: string;
  category?: string;
  unitOfMeasure?: string;
  costPrice: number;
  sellingPrice: number;
  minimumStockThreshold: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// Stock Types
export interface StockLevelResponse {
  id: string;
  branchId: string;
  branchName: string;
  branchType: string;
  productId: string;
  productName: string;
  productSku: string;
  category?: string;
  quantityOnHand: number;
  quantityReserved: number;
  minimumStockThreshold: number;
  costPrice: number;
  sellingPrice: number;
  stockStatus: string;
  updatedAt: string;
}

// Transfer Types
export interface TransferItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityRequested: number;
  quantityDispatched: number;
  quantityReceived: number;
}

export interface TransferResponse {
  id: string;
  referenceNumber: string;
  sourceBranchId: string;
  sourceBranchName: string;
  destinationBranchId: string;
  destinationBranchName: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'RECEIVED' | 'CANCELLED';
  notes?: string;
  items: TransferItemResponse[];
  createdAt: string;
  updatedAt: string;
}

// Sales Types
export interface SaleLineItemResponse {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
}

export interface SaleResponse {
  id: string;
  receiptNumber: string;
  branchId: string;
  branchName: string;
  cashierId: string;
  cashierName: string;
  paymentMethod: 'CASH' | 'ECOCASH' | 'ONEMONEY' | 'PAYNOW' | 'CARD' | 'BANK_TRANSFER';
  totalAmount: number;
  isReturned: boolean;
  lineItems: SaleLineItemResponse[];
  createdAt: string;
}

// Dashboard Types
export interface BranchStockSummary {
  branchId: string;
  branchName: string;
  branchType: string;
  totalProducts: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockValue: number;
}

export interface AlertResponse {
  stockLevelId: string;
  branchId: string;
  branchName: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityOnHand: number;
  minimumThreshold: number;
  alertType: string;
}

export interface DashboardSummaryResponse {
  totalProducts: number;
  totalBranches: number;
  totalUsers: number;
  totalLowStockItems: number;
  totalOutOfStockItems: number;
  totalInventoryValue: number;
  todaySalesTotal: number;
  todaySalesCount: number;
  branchSummaries: BranchStockSummary[];
  activeAlerts: AlertResponse[];
}

export interface TopProductResponse {
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

// Report Types
export interface StockMovementReport {
  productId: string;
  productName: string;
  productSku: string;
  category: string;
  branchId: string;
  branchName: string;
  openingStock: number;
  stockIn: number;
  stockOut: number;
  adjustments: number;
  closingStock: number;
  totalSalesValue: number;
  periodFrom: string;
  periodTo: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface AuditLogResponse {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Request Types
export interface CreateUserRequest {
  fullName: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER';
  assignedBranchId?: string;
}

export interface CreateBranchRequest {
  name: string;
  branchType: 'WAREHOUSE' | 'SHOP';
  location?: string;
  managerName?: string;
  contactNumber?: string;
}

export interface UpdateBranchRequest {
  name?: string;
  location?: string;
  managerName?: string;
  contactNumber?: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  category?: string;
  unitOfMeasure?: string;
  costPrice: number;
  sellingPrice: number;
  minimumStockThreshold: number;
  description?: string;
}

export interface UpdateProductRequest {
  name?: string;
  category?: string;
  unitOfMeasure?: string;
  costPrice?: number;
  sellingPrice?: number;
  minimumStockThreshold?: number;
  description?: string;
}

export interface TransferItemRequest {
  productId: string;
  quantityRequested: number;
}

export interface CreateTransferRequest {
  sourceBranchId: string;
  destinationBranchId: string;
  items: TransferItemRequest[];
  notes?: string;
}

export interface StockAdjustmentRequest {
  branchId: string;
  productId: string;
  adjustmentType: 'INCREASE' | 'DECREASE';
  quantity: number;
  reason: string;
}

export interface CreateSaleLineItemRequest {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface CreateSaleRequest {
  branchId: string;
  paymentMethod: string;
  items: CreateSaleLineItemRequest[];
  totalAmount: number;
}
