'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/layout/layout';
import AuthGuard from '@/components/auth/auth-guard';
import { formatCurrency, getErrorMessage } from '@/lib/utils';
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { api } from '@/lib/api';
import { StockLevelResponse, BranchResponse, DashboardSummaryResponse } from '@/types';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toaster';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

export default function InventoryPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatus, setStockStatus] = useState('All');
  const [inventory, setInventory] = useState<StockLevelResponse[]>([]);
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState('all-low-stock');
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stock adjustment dialog state
  const [adjustmentOpen, setAdjustmentOpen] = useState(false);
  const [adjustmentItem, setAdjustmentItem] = useState<StockLevelResponse | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchBranches = async () => {
    try {
      const response = await api.branches.getAll();
      if (response.success) {
        setBranches(response.data || []);
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setError(getErrorMessage(err));
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, branchesRes] = await Promise.all([
        api.dashboard.getSummary(),
        api.branches.getAll()
      ]);

      if (summaryRes.success && summaryRes.data) {
        setDashboardSummary(summaryRes.data);
      }

      let inventoryRes;
      if (selectedBranchId === 'all-low-stock') {
        inventoryRes = await api.stock.getLowStock();
      } else if (selectedBranchId === 'all') {
        // Fetch all branch stock
        if (branchesRes.success && branchesRes.data) {
          const promises = branchesRes.data.map(b => api.stock.getByBranch(b.id));
          const results = await Promise.all(promises);
          const allItems = results.flatMap(res => res.success ? (res.data || []) : []);
          inventoryRes = { success: true, data: allItems };
        } else {
          inventoryRes = { success: false, message: 'Failed to fetch branches for full inventory' };
        }
      } else {
        inventoryRes = await api.stock.getByBranch(selectedBranchId);
      }

      if (inventoryRes.success) {
        const items = inventoryRes.data || [];
        setInventory(items);

        // Standardized categories
        const dataCategories = new Set(items.map(item => item.category).filter(Boolean) as string[]);
        const allCategories = ['All', ...PRODUCT_CATEGORIES];
        dataCategories.forEach(cat => {
          if (!PRODUCT_CATEGORIES.includes(cat as any)) {
            allCategories.push(cat);
          }
        });

        setCategories(allCategories);
      } else {
        setError(inventoryRes.message || 'Failed to load inventory data');
      }
    } catch (err: any) {
      console.error('Inventory fetch error:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedBranchId]);

  const getStockStatus = (item: StockLevelResponse) => {
    if (!item.stockStatus) return 'Unknown';
    return item.stockStatus
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getStockStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (status.toLowerCase()) {
      case 'in stock': return 'success';
      case 'low stock': return 'warning';
      case 'out of stock': return 'error';
      default: return 'default';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.productSku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesStatus = stockStatus === 'All' || getStockStatus(item) === stockStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = inventory.filter(item => item.quantityOnHand > 0 && item.quantityOnHand <= item.minimumStockThreshold);
  const outOfStockItems = inventory.filter(item => item.quantityOnHand <= 0);

  // Unique product count helper for dashboard consistency
  const calculateUniqueProducts = () => {
    const isFiltered = searchTerm !== '' || selectedCategory !== 'All' || stockStatus !== 'All';

    // If viewing all branches and not filtered
    if (!isFiltered && selectedBranchId === 'all' && dashboardSummary) {
      return dashboardSummary.totalProducts;
    }

    // Otherwise, count unique products in the current inventory list
    const uniqueIds = new Set(filteredInventory.map(item => item.productId));
    return uniqueIds.size;
  };

  // Local calculation helper for valuation
  const calculateInventoryValue = () => {
    const isFiltered = searchTerm !== '' || selectedCategory !== 'All' || stockStatus !== 'All';

    // Primary source of truth for branch/global totals 
    if (!isFiltered && dashboardSummary) {
      if (selectedBranchId === 'all') {
        return dashboardSummary.totalInventoryValue;
      } else if (selectedBranchId !== 'all-low-stock') {
        const branchSum = dashboardSummary.branchSummaries.find(b => b.branchId === selectedBranchId);
        if (branchSum) return branchSum.totalStockValue;
      }
    }

    return filteredInventory.reduce((sum, item) => sum + (item.quantityOnHand * (item.sellingPrice || 0)), 0);
  };

  const openAdjustmentDialog = (item: StockLevelResponse) => {
    setAdjustmentItem(item);
    setAdjustmentType('INCREASE');
    setAdjustmentQuantity('');
    setAdjustmentReason('');
    setAdjustmentOpen(true);
  };

  const handleStockAdjustment = async () => {
    if (!adjustmentItem || !adjustmentQuantity || parseInt(adjustmentQuantity) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAdjusting(true);
      const adjustmentData = {
        productId: adjustmentItem.productId,
        branchId: adjustmentItem.branchId,
        adjustmentType: adjustmentType,
        quantity: parseInt(adjustmentQuantity),
        reason: adjustmentReason.trim() || 'Manual adjustment'
      };

      const response = await api.stock.adjust(adjustmentData);

      if (response.success) {
        toast({
          title: 'Success',
          description: `Stock ${adjustmentType === 'INCREASE' ? 'increased' : 'decreased'} successfully`,
        });

        setAdjustmentOpen(false);
        setAdjustmentItem(null);
        fetchData();
      } else {
        throw new Error(response.message || 'Failed to adjust stock');
      }
    } catch (err: any) {
      console.error('Stock adjustment error:', err);
      toast({
        title: 'Error',
        description: getErrorMessage(err),
        variant: 'destructive',
      });
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <AuthGuard>
      <Layout>
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Inventory Management</h1>
              <p className="text-sm text-text-secondary">Track and manage stock levels across all products</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => window.location.href = '/products'}>
                Manage Products
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <AdjustmentsHorizontalIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Products</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-primary">{calculateUniqueProducts()}</p>
                    {selectedBranchId === 'all' && dashboardSummary && calculateUniqueProducts() < dashboardSummary.totalProducts && (
                      <div className="flex flex-col">
                        <p className="text-xs font-bold text-error">/ {dashboardSummary.totalProducts} total</p>
                        <p className="text-[10px] text-text-secondary leading-tight mt-1">({dashboardSummary.totalProducts - calculateUniqueProducts()} products missing stock records)</p>
                      </div>
                    )}
                    {selectedBranchId === 'all' && dashboardSummary && calculateUniqueProducts() === dashboardSummary.totalProducts && (
                      <p className="text-xs font-bold text-text-secondary">/ total</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-warning">
              <div className="flex items-center">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Low Stock</p>
                  <p className="text-2xl font-black text-warning">{lowStockItems.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-error">
              <div className="flex items-center">
                <div className="p-3 bg-error/10 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-error" />
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Out of Stock</p>
                  <p className="text-2xl font-black text-error">{outOfStockItems.length}</p>
                </div>
              </div>
            </div>

            <div className="card p-6 border-l-4 border-info col-span-1 md:col-span-3">
              <div className="flex items-center">
                <div className="p-3 bg-info/10 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div className="ml-4">
                  <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">Inventory Value ({selectedBranchId === 'all-low-stock' ? 'Global Low Stock' : selectedBranchId === 'all' ? 'All Branches' : branches.find(b => b.id === selectedBranchId)?.name || 'Branch'})</p>
                  <p className="text-2xl font-black text-info">
                    {formatCurrency(calculateInventoryValue())}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-secondary" />
                  <Input
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="!pl-12"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                  <SelectTrigger className="w-[200px] font-bold">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    <SelectItem value="all-low-stock">Global Low Stock</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-surface border border-divider rounded-lg px-3 py-2 text-sm font-bold text-primary focus:ring-1 focus:ring-primary h-10"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="bg-surface border border-divider rounded-lg px-3 py-2 text-sm font-bold text-primary focus:ring-1 focus:ring-primary h-10"
                >
                  <option value="All">All Statuses</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-error-light border border-error/20 rounded-lg p-4 flex items-center justify-between">
              <p className="text-error text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchData}>Retry</Button>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full divide-y divide-divider">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-text-secondary uppercase tracking-wider">In Stock</th>
                    <th className="px-6 py-3 text-center text-xs font-bold text-text-secondary uppercase tracking-wider">Min Level</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-divider">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-6 py-4"><div className="h-10 bg-surface rounded w-full"></div></td>
                      </tr>
                    ))
                  ) : filteredInventory.length > 0 ? (
                    filteredInventory.map(item => {
                      const status = getStockStatus(item);
                      return (
                        <tr key={item.id} className="hover:bg-surface transition-colors cursor-pointer">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">{item.productSku}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-medium">{item.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary uppercase font-bold text-[10px]">{item.category}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-center text-primary">{item.quantityOnHand}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary text-center">{item.minimumStockThreshold}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">{formatCurrency(item.sellingPrice)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Badge variant={getStockStatusVariant(status)}>{status}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button variant="outline" size="sm" onClick={() => openAdjustmentDialog(item)} className="h-8 w-8 p-0">
                              <AdjustmentsHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-text-secondary bg-surface/30">
                        <AdjustmentsHorizontalIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No inventory items found matching your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Adjust Stock</DialogTitle>
              <DialogDescription>
                Adjust stock levels for {adjustmentItem?.productName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="bg-surface p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <AdjustmentsHorizontalIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-secondary">Current Stock</p>
                      <p className="text-2xl font-black text-primary">{adjustmentItem?.quantityOnHand || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-semibold text-primary mb-3">Adjustment Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('INCREASE')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${adjustmentType === 'INCREASE' ? 'border-success bg-success/10 text-success' : 'border-divider'
                      }`}
                  >
                    <ArrowUpTrayIcon className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Increase</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('DECREASE')}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${adjustmentType === 'DECREASE' ? 'border-error bg-error/10 text-error' : 'border-divider'
                      }`}
                  >
                    <ArrowDownTrayIcon className="h-6 w-6 mx-auto mb-2" />
                    <div className="text-sm font-medium">Decrease</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={adjustmentQuantity}
                  onChange={(e) => setAdjustmentQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input
                  id="reason"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  placeholder="Enter reason..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustmentOpen(false)}>Cancel</Button>
              <Button
                onClick={handleStockAdjustment}
                disabled={isAdjusting || !adjustmentQuantity || parseInt(adjustmentQuantity) <= 0}
              >
                {isAdjusting ? 'Processing...' : 'Adjust Stock'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Layout>
    </AuthGuard>
  );
}
